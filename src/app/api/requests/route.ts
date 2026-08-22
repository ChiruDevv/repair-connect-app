import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import openai from "@/lib/openai";
import RepairRequest from "@/models/RepairRequest";

export async function POST(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { imageUrl, description, category } = await request.json();
    if (!imageUrl || !description || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await connectToDatabase();

    // Helper: extract a number from strings like "300-2000 INR", "₹500", "500-800"
    function parseCost(val: any): number {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const nums = val.replace(/[₹,INRinr]/g, '').match(/d+/g);
        if (nums && nums.length > 0) return parseInt(nums[0], 10);
      }
      return 0;
    }
    // Helper: parse an object, coercing all numeric string fields
    function normalizeCosts(obj: any): any {
      if (Array.isArray(obj)) return obj.map(normalizeCosts);
      if (obj && typeof obj === 'object') {
        const out: any = {};
        for (const [k, v] of Object.entries(obj)) {
          if ((k === 'estimatedCost' || k === 'estimatedRepairCost' || k === 'estimatedReplaceCost') && typeof v === 'string') {
            out[k] = parseCost(v);
          } else {
            out[k] = normalizeCosts(v);
          }
        }
        return out;
      }
      return obj;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [
        { role: "system", content: 'You are a repair expert. Return only valid JSON: {"problem":"description","severity":"Low|Medium|High|Critical","repairScore":0-100,"worthRepairing":true/false,"estimatedRepairCost":number in INR,"estimatedReplaceCost":number in INR,"impact":{"co2Saved":number,"waterSaved":number,"wastePrevented":number},"diyGuide":{"difficulty":"Beginner|Intermediate|Expert","estimatedTime":"string","tools":["list"],"steps":["step1","step2"],"safetyNotes":"string"},"spareParts":[{"name":"part name","estimatedCost":number in INR,"availableAt":"where to buy","link":"search URL on amazon.in or flipkart.com"}],"repairOptions":[{"option":"DIY|Local Shop|Authorized Service","estimatedCost":number in INR,"timeEstimate":"string","pros":"string","cons":"string"}]}' },
        { role: "user", content: "Category: " + category + " | Issue: " + description },
      ],
      max_tokens: 1200,
    });
    const responseText = completion.choices[0]?.message?.content || "";
    let diagnosis;
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      diagnosis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
    const normalizedDiagnosis = normalizeCosts(diagnosis);
    const repairRequest = await RepairRequest.create({
      user: (session.user as any).id,
      imageUrl, description, category,
      diagnosis: {
        problem: normalizedDiagnosis.problem, severity: normalizedDiagnosis.severity, repairScore: normalizedDiagnosis.repairScore,
        worthRepairing: normalizedDiagnosis.worthRepairing, estimatedRepairCost: normalizedDiagnosis.estimatedRepairCost,
        estimatedReplaceCost: normalizedDiagnosis.estimatedReplaceCost,
      },
      impact: normalizedDiagnosis.impact, diyGuide: normalizedDiagnosis.diyGuide,
      spareParts: normalizedDiagnosis.spareParts || [],
      repairOptions: normalizedDiagnosis.repairOptions || [],
      status: "diagnosed",
    });
    return NextResponse.json(repairRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { auth } = await import("@/lib/auth");
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
