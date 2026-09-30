/*
 * GET /api/services - Nearby Repair Shops API
 * 
 * Returns a list of repair shops, optionally filtered by location and category.
 * 
 * Query Parameters:
 * - category: Filter by shop type (electronics, furniture, bicycle, etc.)
 * - lat: User's latitude (from browser Geolocation API)
 * - lng: User's longitude (from browser Geolocation API)
 * 
 * How location sorting works:
 * 1. If lat/lng are provided, calculate distance to each shop using Haversine formula
 * 2. Sort shops so same-city shops (< 50km) appear first
 * 3. Within same-city group, sort by distance (closest first)
 * 4. If no location provided, sort by rating (highest first)
 * 
 * Auto-seeding:
 * If the database has no shops (fresh Vercel deployment), this endpoint
 * automatically seeds 20 repair shops across 6 Indian cities.
 * This means the services page works immediately without manual seeding.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Haversine formula: calculates distance between two points on Earth
// Returns distance in kilometers
// Used to sort shops by proximity to the user
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

const autoSeedData = [
  { name: "Digital Doctor", category: "electronics", address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9352, lng: 77.6245, phone: "+91-9876543212", rating: 4.7, specialties: ["iPhone Repair", "Laptop Screen", "Data Recovery"], price_range: "₹₹" },
  { name: "TechFix Hub", category: "electronics", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9784, lng: 77.6408, phone: "+91-9876543100", rating: 4.6, specialties: ["All Electronics", "Printer Repair", "Projector"], price_range: "₹₹" },
  { name: "Bangalore Bike Works", category: "bicycle", address: "HSR Layout, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9116, lng: 77.6389, phone: "+91-9876543101", rating: 4.8, specialties: ["MTB Repair", "Suspension Service", "Wheel Truing"], price_range: "₹" },
  { name: "PedalPerfect Bangalore", category: "bicycle", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9784, lng: 77.6408, phone: "+91-9876543232", rating: 4.6, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], price_range: "₹" },
  { name: "Home Fix Pro", category: "furniture", address: "HSR Layout, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9116, lng: 77.6389, phone: "+91-9876543222", rating: 4.7, specialties: ["Modular Kitchen", "Wardrobe", "Shelf Installation"], price_range: "₹₹₹" },
  { name: "HomeAppliance Hub", category: "appliance", address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9698, lng: 77.7500, phone: "+91-9876543242", rating: 4.6, specialties: ["Microwave", "Water Purifier", "Gas Stove"], price_range: "₹" },
  { name: "FixIt Bangalore", category: "other", address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9352, lng: 77.6245, phone: "+91-9876543102", rating: 4.4, specialties: ["General Repairs", "Plumbing", "Electrical"], price_range: "₹" },
  { name: "AC Care Bangalore", category: "appliance", address: "JP Nagar, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.8880, lng: 77.5960, phone: "+91-9876543103", rating: 4.5, specialties: ["AC Repair", "Refrigerator", "Washing Machine"], price_range: "₹₹" },
  { name: "QuickFix Electronics", category: "electronics", address: "MG Road, Delhi", city: "Delhi", state: "Delhi", lat: 28.6304, lng: 77.2187, phone: "+91-9876543210", rating: 4.8, specialties: ["Laptops", "Phones", "Tablets", "AC Repair"], price_range: "₹₹" },
  { name: "WoodCraft Repairs", category: "furniture", address: "Lajpat Nagar, Delhi", city: "Delhi", state: "Delhi", lat: 28.5678, lng: 77.2400, phone: "+91-9876543220", rating: 4.6, specialties: ["Wooden Furniture", "Sofa Repair", "Chair Fixing"], price_range: "₹₹" },
  { name: "CycleWorld Service", category: "bicycle", address: "Connaught Place, Delhi", city: "Delhi", state: "Delhi", lat: 28.6315, lng: 77.2167, phone: "+91-9876543230", rating: 4.9, specialties: ["All Bicycle Repairs", "Gear Tuning", "Brake Service"], price_range: "₹" },
  { name: "ApplianceMantri", category: "appliance", address: "Janakpuri, Delhi", city: "Delhi", state: "Delhi", lat: 28.6217, lng: 77.0816, phone: "+91-9876543240", rating: 4.7, specialties: ["Washing Machine", "Dryer", "Dishwasher"], price_range: "₹₹" },
  { name: "TechCare Solutions", category: "electronics", address: "Andheri West, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.1364, lng: 72.8296, phone: "+91-9876543211", rating: 4.5, specialties: ["TV Repair", "Washing Machine", "Refrigerator"], price_range: "₹₹₹" },
  { name: "Furniture Care", category: "furniture", address: "Bandra, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.0596, lng: 72.8295, phone: "+91-9876543221", rating: 4.4, specialties: ["Upholstery", "Table Repair", "Bed Frame"], price_range: "₹₹" },
  { name: "PedalPerfect Mumbai", category: "bicycle", address: "Powai, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.1176, lng: 72.9060, phone: "+91-9876543231", rating: 4.5, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], price_range: "₹₹" },
  { name: "CoolCare AC Repair", category: "appliance", address: "Thane, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.2183, lng: 72.9781, phone: "+91-9876543241", rating: 4.4, specialties: ["AC Repair", "Refrigerator", "Freezer"], price_range: "₹₹" },
  { name: "Smart Service Center", category: "electronics", address: "T Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", lat: 13.0408, lng: 80.2340, phone: "+91-9876543213", rating: 4.3, specialties: ["All Electronics", "CCTV", "Networking"], price_range: "₹" },
  { name: "Chennai Cycle Hub", category: "bicycle", address: "Adyar, Chennai", city: "Chennai", state: "Tamil Nadu", lat: 13.0067, lng: 80.2570, phone: "+91-9876543104", rating: 4.5, specialties: ["Bicycle Repair", "Accessories", "Full Service"], price_range: "₹" },
  { name: "HandyMan Services", category: "other", address: "Salt Lake, Kolkata", city: "Kolkata", state: "West Bengal", lat: 22.5804, lng: 88.4540, phone: "+91-9876543251", rating: 4.5, specialties: ["Plumbing", "Electrical", "Carpentry"], price_range: "₹₹" },
  { name: "FixIt All", category: "other", address: "Sector 18, Noida", city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, phone: "+91-9876543250", rating: 4.3, specialties: ["General Repairs", "Key Making", "Lock Repair"], price_range: "₹" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Auto-seed if empty (for fresh Vercel deployments)
    // Auto-seed: if no shops exist in the database, seed them now
    // This handles fresh Vercel deployments where the DB starts empty
    const { count } = await supabase
      .from("service_providers")
      .select("*", { count: "exact", head: true });

    if (count === 0) {
      await supabase.from("service_providers").insert(autoSeedData);
    }

    // Build the query with optional category filter
    let query = supabase
      .from("service_providers")
      .select("*")
      .order("rating", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: services, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }

    // Transform DB rows to match the frontend's expected shape
    let result = (services || []).map((s: any) => ({
      ...s,
      _id: s.id,
      location: { lat: parseFloat(s.lat), lng: parseFloat(s.lng) },
      priceRange: s.price_range,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    // If user provided their location, sort by proximity
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      result = result.map((shop: any) => {
        shop._distance = haversineDistance(userLat, userLng, shop.location.lat, shop.location.lng);
        return shop;
      });

      result.sort((a: any, b: any) => {
        const aSameCity = a._distance < 50;
        const bSameCity = b._distance < 50;
        if (aSameCity && !bSameCity) return -1;
        if (!aSameCity && bSameCity) return 1;
        return a._distance - b._distance;
      });

      result = result.map((s: any) => {
        delete s._distance;
        return s;
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
