/*
 * /api/requests/[id] - Single Repair Request API
 * 
 * GET    /api/requests/[id] - Get full details of a repair request
 * PATCH  /api/requests/[id] - Update the status of a repair request
 * DELETE /api/requests/[id] - Delete a repair request permanently
 * 
 * All three operations require authentication (JWT session).
 * The [id] in the URL is the PostgreSQL UUID of the repair request.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Transform snake_case DB columns to camelCase for frontend compatibility
function transformRequest(r: any) {
  return {
    ...r,
    _id: r.id,
    imageUrl: r.image_url,
    user: r.user_id,
    diyGuide: r.diy_guide,
    spareParts: r.spare_parts,
    repairOptions: r.repair_options,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

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

    // Extract and clean the request ID from the URL
    // decodeURIComponent handles cases where the ID might be URL-encoded
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id).trim();
    
    // Look up the repair request by its PostgreSQL UUID
    const { data: repairRequest, error } = await supabase
      .from("repair_requests")
      .select("*")
      .eq("id", cleanId)
      .single();
    
    if (error || !repairRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(transformRequest(repairRequest));
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

    const { id } = await context.params;
    const body = await request.json();
    const allowed: Record<string, any> = {};
    if (body.status) allowed.status = body.status;
    
    const { data: updated, error } = await supabase
      .from("repair_requests")
      .update(allowed)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(transformRequest(updated));
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

    const { id } = await context.params;
    // Permanently delete the request from PostgreSQL
    const { error } = await supabase
      .from("repair_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
