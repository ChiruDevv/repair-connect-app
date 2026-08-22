/*
 * /api/requests/[id] - Single Repair Request API
 * 
 * GET    /api/requests/[id] - Get full details of a repair request
 * PATCH  /api/requests/[id] - Update the status of a repair request
 * DELETE /api/requests/[id] - Delete a repair request permanently
 * 
 * All three operations require authentication (JWT session).
 * The [id] in the URL is the MongoDB ObjectId of the repair request.
 */import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RepairRequest from "@/models/RepairRequest";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    // Extract and clean the request ID from the URL
    // decodeURIComponent handles cases where the ID might be URL-encoded
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id).trim();
    
    // Look up the repair request by its MongoDB ObjectId
    const repairRequest = await RepairRequest.findById(cleanId);
    
    if (!repairRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(repairRequest);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();
    const allowed: Record<string, any> = {};
    if (body.status) allowed.status = body.status;
    
    const updated = await RepairRequest.findByIdAndUpdate(id, allowed, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const { id } = await context.params;
    // Permanently delete the request from MongoDB
    const deleted = await RepairRequest.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
