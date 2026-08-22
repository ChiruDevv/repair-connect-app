import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const filter: any = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    const services = await ServiceProvider.find(filter).sort({ rating: -1 });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
