import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import openai from "@/lib/openai";
import RepairRequest from "@/models/RepairRequest";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, description, category } = await request.json();

    if (!imageUrl || !description || !category) {
      return NextResponse.json(
        { error: "Image, description, and category are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [
        {
          role: "system",
          content: 'You are an expert repair technician. Based on the description, provide a diagnosis. Return ONLY valid JSON (no markdown, no code fences): {"problem":"description","severity":"Low|Medium|High|Critical","repairScore":0-100,"worthRepairing":boolean,"estimatedRepairCost":number,"estimatedReplaceCost":number,"impact":{"co2Saved":number,"waterSaved":number,"wastePrevented":number},"diyGuide":{"difficulty":"Beginner|Intermediate|Expert","estimatedTime":"string","tools":["list"],"steps":["list"],"safetyNotes":"string"}}',
        },
        {
          role: "user",
          content: "Category: " + category + "\nDescription: " + description + "\n\nAnalyze this damaged item and provide diagnosis.",
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let diagnosis;
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      diagnosis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const repairRequest = await RepairRequest.create({
      user: (session.user as any).id,
      imageUrl,
      description,
      category,
      diagnosis: {
        problem: diagnosis.problem,
        severity: diagnosis.severity,
        repairScore: diagnosis.repairScore,
        worthRepairing: diagnosis.worthRepairing,
        estimatedRepairCost: diagnosis.estimatedRepairCost,
        estimatedReplaceCost: diagnosis.estimatedReplaceCost,
      },
      impact: diagnosis.impact,
      diyGuide: diagnosis.diyGuide,
      status: "diagnosed",
    });

    return NextResponse.json(repairRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create repair request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const requests = await RepairRequest.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .populate("suggestedServices");

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
