import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RepairRequest from "@/models/RepairRequest";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id).trim();
    console.log("[DETAIL] Fetching:", cleanId);
    
    let repairRequest;
    try {
      repairRequest = await RepairRequest.findById(cleanId);
    } catch {
      // ID might be invalid ObjectId, try string match
      const all = await RepairRequest.find({});
      repairRequest = all.find((r: any) => r._id.toString() === cleanId);
    }
    
    if (!repairRequest) {
      console.log("[DETAIL] Not found");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    console.log("[DETAIL] Found:", repairRequest._id);
    return NextResponse.json(repairRequest);
  } catch (error: any) {
    console.error("[DETAIL] Error:", error?.message);
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const deleted = await RepairRequest.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
