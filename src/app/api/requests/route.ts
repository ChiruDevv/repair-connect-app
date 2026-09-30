/*
 * /api/requests - Repair Request API
 * 
 * POST /api/requests - Create a new repair request with AI diagnosis
 * GET  /api/requests - List all requests for the logged-in user
 * 
 * POST Flow (the core feature):
 * 1. Verify user is logged in (JWT session check)
 * 2. Accept imageUrl, description, category from the frontend
 * 3. Send a structured prompt to OpenAI asking for JSON-formatted diagnosis
 * 4. Parse the AI response (handle markdown code fences, validate JSON)
 * 5. Normalize cost fields (AI sometimes returns "300-2000 INR" instead of numbers)
 * 6. Save the complete RepairRequest to Supabase (PostgreSQL)
 * 7. Return the saved document to the frontend
 * 
 * The AI prompt asks for a very specific JSON structure with:
 * - Problem description and severity
 * - Repair score (1-100) and whether repair is worth it
 * - Cost estimates for repair vs replacement (in INR)
 * - DIY guide with steps, tools, time estimate, safety notes
 * - Spare parts list with costs and purchase links
 * - Repair options comparison (DIY vs Local Shop vs Authorized Service)
 * - Environmental impact estimates (CO2, water, waste)
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import openai from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is logged in by checking their JWT session
    // We use dynamic import because NextAuth needs to be imported at runtime
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { imageUrl, description, category } = await request.json();
    if (!imageUrl || !description || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Helper: extract a number from strings like "300-2000 INR", "₹500", "500-800"
    // Helper: Extract a number from any cost format the AI might return
    // Examples: "300-2000 INR" -> 300, "₹500" -> 500, 800 -> 800
    function parseCost(val: any): number {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const nums = val.replace(/[₹,INRinr]/g, '').match(/d+/g);
        if (nums && nums.length > 0) return parseInt(nums[0], 10);
      }
      return 0;
    }
    // Helper: parse an object, coercing all numeric string fields
    // Helper: Walk the entire AI response and convert cost fields to numbers
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

    // Step 3: Send the prompt to AI and get the diagnosis
    // This is where the actual AI call happens
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [
        { role: "system", content: 'You are a repair expert. Return only valid JSON: {"problem":"description","severity":"Low|Medium|High|Critical","repairScore":0-100,"worthRepairing":true/false,"estimatedRepairCost":number in INR,"estimatedReplaceCost":number in INR,"impact":{"co2Saved":number,"waterSaved":number,"wastePrevented":number},"diyGuide":{"difficulty":"Beginner|Intermediate|Expert","estimatedTime":"string","tools":["list"],"steps":["step1","step2"],"safetyNotes":"string"},"spareParts":[{"name":"part name","estimatedCost":number in INR,"availableAt":"where to buy","link":"search URL on amazon.in or flipkart.com"}],"repairOptions":[{"option":"DIY|Local Shop|Authorized Service","estimatedCost":number in INR,"timeEstimate":"string","pros":"string","cons":"string"}]}' },
        { role: "user", content: "Category: " + category + " | Issue: " + description },
      ],
      max_tokens: 2500,
    });
    const responseText = completion.choices[0]?.message?.content || "";
    // Step 4: Parse the AI response into a JavaScript object
    // AI sometimes wraps JSON in markdown code fences, so we strip those first
    let diagnosis;
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      diagnosis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
    // Step 5: Normalize cost fields (convert strings like "300-2000 INR" to numbers)
    const normalizedDiagnosis = normalizeCosts(diagnosis);

    // Step 6: Save the complete repair request to Supabase (PostgreSQL)
    const { data: repairRequest, error } = await supabase
      .from("repair_requests")
      .insert({
        user_id: (session.user as any).id,
        image_url: imageUrl,
        description,
        category,
        diagnosis: {
          problem: normalizedDiagnosis.problem,
          severity: normalizedDiagnosis.severity,
          repairScore: normalizedDiagnosis.repairScore,
          worthRepairing: normalizedDiagnosis.worthRepairing,
          estimatedRepairCost: normalizedDiagnosis.estimatedRepairCost,
          estimatedReplaceCost: normalizedDiagnosis.estimatedReplaceCost,
        },
        impact: normalizedDiagnosis.impact,
        diy_guide: normalizedDiagnosis.diyGuide,
        spare_parts: normalizedDiagnosis.spareParts || [],
        repair_options: normalizedDiagnosis.repairOptions || [],
        status: "diagnosed",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
    }

    // Transform snake_case DB columns back to camelCase for the frontend
    const response = {
      ...repairRequest,
      _id: repairRequest.id,
      imageUrl: repairRequest.image_url,
      user: repairRequest.user_id,
      diyGuide: repairRequest.diy_guide,
      spareParts: repairRequest.spare_parts,
      repairOptions: repairRequest.repair_options,
      createdAt: repairRequest.created_at,
      updatedAt: repairRequest.updated_at,
    };

    return NextResponse.json(response, { status: 201 });
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

    // Fetch all requests for this user, sorted by newest first
    const { data: requests, error } = await supabase
      .from("repair_requests")
      .select("*")
      .eq("user_id", (session.user as any).id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    // Transform snake_case DB columns to camelCase for frontend compatibility
    const transformed = (requests || []).map((r: any) => ({
      ...r,
      _id: r.id,
      imageUrl: r.image_url,
      user: r.user_id,
      diyGuide: r.diy_guide,
      spareParts: r.spare_parts,
      repairOptions: r.repair_options,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
