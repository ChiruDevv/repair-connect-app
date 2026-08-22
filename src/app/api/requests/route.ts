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
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [
        {
          role: "system",
          content: 'You are a repair expert. Return only valid JSON: {"problem":"description","severity":"Low|Medium|High|Critical","repairScore":0-100,"worthRepairing":true/false,"estimatedRepairCost":number,"estimatedReplaceCost":number,"impact":{"co2Saved":number,"waterSaved":number,"wastePrevented":number},"diyGuide":{"difficulty":"Beginner|Intermediate|Expert","estimatedTime":"string","tools":["list"],"steps":["step1","step2"],"safetyNotes":"string"}}',
        },
        {
          role: "user",
          content: "Category: " + category + " | Issue: " + description,
        },
      ],
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let diagnosis;
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      diagnosis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
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
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const requests = await RepairRequest.find({ user: (session.user as any).id }).sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
