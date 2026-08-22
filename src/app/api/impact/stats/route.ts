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
 */import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import RepairRequest from "@/models/RepairRequest";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch all repair requests for this user
    const requests = await RepairRequest.find({ user: (session.user as any).id });

    const totalItems = requests.length;
    const totalCO2 = requests.reduce((sum, r) => sum + (r.impact?.co2Saved || 0), 0);
    const totalWater = requests.reduce((sum, r) => sum + (r.impact?.waterSaved || 0), 0);
    const totalWaste = requests.reduce((sum, r) => sum + (r.impact?.wastePrevented || 0), 0);
    // Calculate money saved = replacement cost - repair cost for each item
    const totalMoneySaved = requests.reduce(
      (sum, r) => sum + ((r.diagnosis?.estimatedReplaceCost || 0) - (r.diagnosis?.estimatedRepairCost || 0)),
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
