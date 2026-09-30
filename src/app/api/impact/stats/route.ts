/*
 * GET /api/impact/stats - Environmental Impact Statistics
 * 
 * Aggregates environmental impact data across all of a user's repair requests.
 * 
 * Returns:
 * - totalItems: Number of repairs completed
 * - totalCO2: Total CO2 saved in kg
 * - totalWater: Total water saved in liters
 * - totalWaste: Total waste prevented in kg
 * - totalMoneySaved: Total money saved by repairing vs replacing (in INR)
 * - badges: Array of earned achievement badges
 * 
 * Badge thresholds:
 * - "First Fix": 1+ repairs
 * - "DIY Master": 5+ repairs
 * - "Eco Warrior": 10+ repairs
 * - "Carbon Cutter": 50+ kg CO2 saved
 * - "Money Saver": 500+ INR saved
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all repair requests for this user
    const { data: requests, error } = await supabase
      .from("repair_requests")
      .select("diagnosis, impact")
      .eq("user_id", (session.user as any).id);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const items = requests || [];
    const totalItems = items.length;
    const totalCO2 = items.reduce((sum: number, r: any) => sum + (r.impact?.co2Saved || 0), 0);
    const totalWater = items.reduce((sum: number, r: any) => sum + (r.impact?.waterSaved || 0), 0);
    const totalWaste = items.reduce((sum: number, r: any) => sum + (r.impact?.wastePrevented || 0), 0);
    // Calculate money saved = replacement cost - repair cost for each item
    const totalMoneySaved = items.reduce(
      (sum: number, r: any) => sum + ((r.diagnosis?.estimatedReplaceCost || 0) - (r.diagnosis?.estimatedRepairCost || 0)),
      0
    );

    // Calculate badges
    const badges: string[] = [];
    if (totalItems >= 1) badges.push("First Fix");
    if (totalItems >= 5) badges.push("DIY Master");
    if (totalItems >= 10) badges.push("Eco Warrior");
    if (totalCO2 >= 50) badges.push("Carbon Cutter");
    if (totalMoneySaved >= 500) badges.push("Money Saver");

    return NextResponse.json({
      totalItems,
      totalCO2: Math.round(totalCO2 * 100) / 100,
      totalWater: Math.round(totalWater * 100) / 100,
      totalWaste: Math.round(totalWaste * 100) / 100,
      totalMoneySaved: Math.round(totalMoneySaved),
      badges,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
