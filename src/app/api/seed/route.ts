/*
 * POST /api/seed - Database Seeding Endpoint
 * 
 * Seeds the database with 20 repair shops across 6 Indian cities.
 * 
 * This endpoint is called manually or automatically:
 * - Manual: curl -X POST /api/seed
 * - Automatic: The services API auto-seeds if the collection is empty
 * 
 * The seed data includes shops in:
 * - Bangalore (8 shops) - closest to most Indian users
 * - Delhi (4 shops)
 * - Mumbai (4 shops)
 * - Chennai (2 shops)
 * - Kolkata (1 shop)
 * - Noida (1 shop)
 * 
 * Each shop has lat/lng coordinates for proximity-based sorting.
 * 
 * Safety: Only seeds if the table is empty (count === 0).
 * This prevents accidentally wiping existing data.
 */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const indianShops = [
  // Bangalore (12.97, 77.59)
  { name: "Digital Doctor", category: "electronics", address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9352, lng: 77.6245, phone: "+91-9876543212", rating: 4.7, specialties: ["iPhone Repair", "Laptop Screen", "Data Recovery"], price_range: "₹₹" },
  { name: "TechFix Hub", category: "electronics", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9784, lng: 77.6408, phone: "+91-9876543100", rating: 4.6, specialties: ["All Electronics", "Printer Repair", "Projector"], price_range: "₹₹" },
  { name: "Bangalore Bike Works", category: "bicycle", address: "HSR Layout, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9116, lng: 77.6389, phone: "+91-9876543101", rating: 4.8, specialties: ["MTB Repair", "Suspension Service", "Wheel Truing"], price_range: "₹" },
  { name: "PedalPerfect Bangalore", category: "bicycle", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9784, lng: 77.6408, phone: "+91-9876543232", rating: 4.6, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], price_range: "₹" },
  { name: "Home Fix Pro", category: "furniture", address: "HSR Layout, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9116, lng: 77.6389, phone: "+91-9876543222", rating: 4.7, specialties: ["Modular Kitchen", "Wardrobe", "Shelf Installation"], price_range: "₹₹₹" },
  { name: "HomeAppliance Hub", category: "appliance", address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9698, lng: 77.7500, phone: "+91-9876543242", rating: 4.6, specialties: ["Microwave", "Water Purifier", "Gas Stove"], price_range: "₹" },
  { name: "FixIt Bangalore", category: "other", address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.9352, lng: 77.6245, phone: "+91-9876543102", rating: 4.4, specialties: ["General Repairs", "Plumbing", "Electrical"], price_range: "₹" },
  { name: "AC Care Bangalore", category: "appliance", address: "JP Nagar, Bangalore", city: "Bangalore", state: "Karnataka", lat: 12.8880, lng: 77.5960, phone: "+91-9876543103", rating: 4.5, specialties: ["AC Repair", "Refrigerator", "Washing Machine"], price_range: "₹₹" },
  // Delhi
  { name: "QuickFix Electronics", category: "electronics", address: "MG Road, Delhi", city: "Delhi", state: "Delhi", lat: 28.6304, lng: 77.2187, phone: "+91-9876543210", rating: 4.8, specialties: ["Laptops", "Phones", "Tablets", "AC Repair"], price_range: "₹₹" },
  { name: "WoodCraft Repairs", category: "furniture", address: "Lajpat Nagar, Delhi", city: "Delhi", state: "Delhi", lat: 28.5678, lng: 77.2400, phone: "+91-9876543220", rating: 4.6, specialties: ["Wooden Furniture", "Sofa Repair", "Chair Fixing"], price_range: "₹₹" },
  { name: "CycleWorld Service", category: "bicycle", address: "Connaught Place, Delhi", city: "Delhi", state: "Delhi", lat: 28.6315, lng: 77.2167, phone: "+91-9876543230", rating: 4.9, specialties: ["All Bicycle Repairs", "Gear Tuning", "Brake Service"], price_range: "₹" },
  { name: "ApplianceMantri", category: "appliance", address: "Janakpuri, Delhi", city: "Delhi", state: "Delhi", lat: 28.6217, lng: 77.0816, phone: "+91-9876543240", rating: 4.7, specialties: ["Washing Machine", "Dryer", "Dishwasher"], price_range: "₹₹" },
  // Mumbai
  { name: "TechCare Solutions", category: "electronics", address: "Andheri West, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.1364, lng: 72.8296, phone: "+91-9876543211", rating: 4.5, specialties: ["TV Repair", "Washing Machine", "Refrigerator"], price_range: "₹₹₹" },
  { name: "Furniture Care", category: "furniture", address: "Bandra, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.0596, lng: 72.8295, phone: "+91-9876543221", rating: 4.4, specialties: ["Upholstery", "Table Repair", "Bed Frame"], price_range: "₹₹" },
  { name: "PedalPerfect Mumbai", category: "bicycle", address: "Powai, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.1176, lng: 72.9060, phone: "+91-9876543231", rating: 4.5, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], price_range: "₹₹" },
  { name: "CoolCare AC Repair", category: "appliance", address: "Thane, Mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.2183, lng: 72.9781, phone: "+91-9876543241", rating: 4.4, specialties: ["AC Repair", "Refrigerator", "Freezer"], price_range: "₹₹" },
  // Chennai
  { name: "Smart Service Center", category: "electronics", address: "T Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", lat: 13.0408, lng: 80.2340, phone: "+91-9876543213", rating: 4.3, specialties: ["All Electronics", "CCTV", "Networking"], price_range: "₹" },
  { name: "Chennai Cycle Hub", category: "bicycle", address: "Adyar, Chennai", city: "Chennai", state: "Tamil Nadu", lat: 13.0067, lng: 80.2570, phone: "+91-9876543104", rating: 4.5, specialties: ["Bicycle Repair", "Accessories", "Full Service"], price_range: "₹" },
  // Kolkata
  { name: "HandyMan Services", category: "other", address: "Salt Lake, Kolkata", city: "Kolkata", state: "West Bengal", lat: 22.5804, lng: 88.4540, phone: "+91-9876543251", rating: 4.5, specialties: ["Plumbing", "Electrical", "Carpentry"], price_range: "₹₹" },
  // Noida
  { name: "FixIt All", category: "other", address: "Sector 18, Noida", city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, phone: "+91-9876543250", rating: 4.3, specialties: ["General Repairs", "Key Making", "Lock Repair"], price_range: "₹" },
];

export async function POST() {
  try {
    // Only seed if the database is empty (prevents accidental data wipe)
    const { count } = await supabase
      .from("service_providers")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return NextResponse.json({ message: "Already seeded", count });
    }

    const { data: services, error } = await supabase
      .from("service_providers")
      .insert(indianShops)
      .select();

    if (error) {
      console.error("Supabase seed error:", error);
      return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
    }

    return NextResponse.json({ message: "Seeded", count: services?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
