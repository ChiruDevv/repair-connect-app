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

const autoSeedData = [
  { name: "Digital Doctor", category: "electronics", address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9352, lng: 77.6245 }, phone: "+91-9876543212", rating: 4.7, specialties: ["iPhone Repair", "Laptop Screen", "Data Recovery"], priceRange: "\u20b9\u20b9" },
  { name: "TechFix Hub", category: "electronics", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9784, lng: 77.6408 }, phone: "+91-9876543100", rating: 4.6, specialties: ["All Electronics", "Printer Repair", "Projector"], priceRange: "\u20b9\u20b9" },
  { name: "Bangalore Bike Works", category: "bicycle", address: "HSR Layout, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9116, lng: 77.6389 }, phone: "+91-9876543101", rating: 4.8, specialties: ["MTB Repair", "Suspension Service", "Wheel Truing"], priceRange: "\u20b9" },
  { name: "PedalPerfect Bangalore", category: "bicycle", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9784, lng: 77.6408 }, phone: "+91-9876543232", rating: 4.6, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], priceRange: "\u20b9" },
  { name: "Home Fix Pro", category: "furniture", address: "HSR Layout, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9116, lng: 77.6389 }, phone: "+91-9876543222", rating: 4.7, specialties: ["Modular Kitchen", "Wardrobe", "Shelf Installation"], priceRange: "\u20b9\u20b9\u20b9" },
  { name: "HomeAppliance Hub", category: "appliance", address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9698, lng: 77.7500 }, phone: "+91-9876543242", rating: 4.6, specialties: ["Microwave", "Water Purifier", "Gas Stove"], priceRange: "\u20b9" },
  { name: "FixIt Bangalore", category: "other", address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.9352, lng: 77.6245 }, phone: "+91-9876543102", rating: 4.4, specialties: ["General Repairs", "Plumbing", "Electrical"], priceRange: "\u20b9" },
  { name: "AC Care Bangalore", category: "appliance", address: "JP Nagar, Bangalore", city: "Bangalore", state: "Karnataka", location: { lat: 12.8880, lng: 77.5960 }, phone: "+91-9876543103", rating: 4.5, specialties: ["AC Repair", "Refrigerator", "Washing Machine"], priceRange: "\u20b9\u20b9" },
  { name: "QuickFix Electronics", category: "electronics", address: "MG Road, Delhi", city: "Delhi", state: "Delhi", location: { lat: 28.6304, lng: 77.2187 }, phone: "+91-9876543210", rating: 4.8, specialties: ["Laptops", "Phones", "Tablets", "AC Repair"], priceRange: "\u20b9\u20b9" },
  { name: "WoodCraft Repairs", category: "furniture", address: "Lajpat Nagar, Delhi", city: "Delhi", state: "Delhi", location: { lat: 28.5678, lng: 77.2400 }, phone: "+91-9876543220", rating: 4.6, specialties: ["Wooden Furniture", "Sofa Repair", "Chair Fixing"], priceRange: "\u20b9\u20b9" },
  { name: "CycleWorld Service", category: "bicycle", address: "Connaught Place, Delhi", city: "Delhi", state: "Delhi", location: { lat: 28.6315, lng: 77.2167 }, phone: "+91-9876543230", rating: 4.9, specialties: ["All Bicycle Repairs", "Gear Tuning", "Brake Service"], priceRange: "\u20b9" },
  { name: "ApplianceMantri", category: "appliance", address: "Janakpuri, Delhi", city: "Delhi", state: "Delhi", location: { lat: 28.6217, lng: 77.0816 }, phone: "+91-9876543240", rating: 4.7, specialties: ["Washing Machine", "Dryer", "Dishwasher"], priceRange: "\u20b9\u20b9" },
  { name: "TechCare Solutions", category: "electronics", address: "Andheri West, Mumbai", city: "Mumbai", state: "Maharashtra", location: { lat: 19.1364, lng: 72.8296 }, phone: "+91-9876543211", rating: 4.5, specialties: ["TV Repair", "Washing Machine", "Refrigerator"], priceRange: "\u20b9\u20b9\u20b9" },
  { name: "Furniture Care", category: "furniture", address: "Bandra, Mumbai", city: "Mumbai", state: "Maharashtra", location: { lat: 19.0596, lng: 72.8295 }, phone: "+91-9876543221", rating: 4.4, specialties: ["Upholstery", "Table Repair", "Bed Frame"], priceRange: "\u20b9\u20b9" },
  { name: "PedalPerfect Mumbai", category: "bicycle", address: "Powai, Mumbai", city: "Mumbai", state: "Maharashtra", location: { lat: 19.1176, lng: 72.9060 }, phone: "+91-9876543231", rating: 4.5, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], priceRange: "\u20b9\u20b9" },
  { name: "CoolCare AC Repair", category: "appliance", address: "Thane, Mumbai", city: "Mumbai", state: "Maharashtra", location: { lat: 19.2183, lng: 72.9781 }, phone: "+91-9876543241", rating: 4.4, specialties: ["AC Repair", "Refrigerator", "Freezer"], priceRange: "\u20b9\u20b9" },
  { name: "Smart Service Center", category: "electronics", address: "T Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", location: { lat: 13.0408, lng: 80.2340 }, phone: "+91-9876543213", rating: 4.3, specialties: ["All Electronics", "CCTV", "Networking"], priceRange: "\u20b9" },
  { name: "Chennai Cycle Hub", category: "bicycle", address: "Adyar, Chennai", city: "Chennai", state: "Tamil Nadu", location: { lat: 13.0067, lng: 80.2570 }, phone: "+91-9876543104", rating: 4.5, specialties: ["Bicycle Repair", "Accessories", "Full Service"], priceRange: "\u20b9" },
  { name: "HandyMan Services", category: "other", address: "Salt Lake, Kolkata", city: "Kolkata", state: "West Bengal", location: { lat: 22.5804, lng: 88.4540 }, phone: "+91-9876543251", rating: 4.5, specialties: ["Plumbing", "Electrical", "Carpentry"], priceRange: "\u20b9\u20b9" },
  { name: "FixIt All", category: "other", address: "Sector 18, Noida", city: "Noida", state: "Uttar Pradesh", location: { lat: 28.5355, lng: 77.3910 }, phone: "+91-9876543250", rating: 4.3, specialties: ["General Repairs", "Key Making", "Lock Repair"], priceRange: "\u20b9" },
];

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Auto-seed if empty (for fresh Vercel deployments)
    const count = await ServiceProvider.countDocuments();
    if (count === 0) {
      await ServiceProvider.insertMany(autoSeedData);
    }

    const filter: any = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    let services = await ServiceProvider.find(filter).sort({ rating: -1 });

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      services = services.map((s: any) => {
        const shop = s.toObject();
        shop._distance = haversineDistance(userLat, userLng, shop.location.lat, shop.location.lng);
        return shop;
      });

      services.sort((a: any, b: any) => {
        const aSameCity = a._distance < 50;
        const bSameCity = b._distance < 50;
        if (aSameCity && !bSameCity) return -1;
        if (!aSameCity && bSameCity) return 1;
        return a._distance - b._distance;
      });

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
