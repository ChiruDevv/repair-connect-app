import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const filter: any = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    let services = await ServiceProvider.find(filter).sort({ rating: -1 });

    // If location provided, sort by distance and filter
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      services = services.map((s: any) => {
        const shop = s.toObject();
        shop._distance = haversineDistance(userLat, userLng, shop.location.lat, shop.location.lng);
        return shop;
      });

      // Sort by same city first, then same state, then distance
      services.sort((a: any, b: any) => {
        // Priority 1: same city
        const aSameCity = a._distance < 50;
        const bSameCity = b._distance < 50;
        if (aSameCity && !bSameCity) return -1;
        if (!aSameCity && bSameCity) return 1;
        
        // Priority 2: by distance within tier
        return a._distance - b._distance;
      });

      // Remove internal distance field
      services = services.map((s: any) => {
        const obj = typeof s.toObject === "function" ? s.toObject() : s;
        delete obj._distance;
        return obj;
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
