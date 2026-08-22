import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

const indianShops = [
  // Electronics
  { name: "QuickFix Electronics", category: "electronics", address: "MG Road, Delhi", phone: "+91-9876543210", rating: 4.8, specialties: ["Laptops", "Phones", "Tablets", "AC Repair"], priceRange: "\u20b9\u20b9" },
  { name: "TechCare Solutions", category: "electronics", address: "Andheri West, Mumbai", phone: "+91-9876543211", rating: 4.5, specialties: ["TV Repair", "Washing Machine", "Refrigerator"], priceRange: "\u20b9\u20b9\u20b9" },
  { name: "Digital Doctor", category: "electronics", address: "Koramangala, Bangalore", phone: "+91-9876543212", rating: 4.7, specialties: ["iPhone Repair", "Laptop Screen", "Data Recovery"], priceRange: "\u20b9\u20b9" },
  { name: "Smart Service Center", category: "electronics", address: "T Nagar, Chennai", phone: "+91-9876543213", rating: 4.3, specialties: ["All Electronics", "CCTV", "Networking"], priceRange: "\u20b9" },
  
  // Furniture
  { name: "WoodCraft Repairs", category: "furniture", address: "Lajpat Nagar, Delhi", phone: "+91-9876543220", rating: 4.6, specialties: ["Wooden Furniture", "Sofa Repair", "Chair Fixing"], priceRange: "\u20b9\u20b9" },
  { name: "Furniture Care", category: "furniture", address: "Bandra, Mumbai", phone: "+91-9876543221", rating: 4.4, specialties: ["Upholstery", "Table Repair", "Bed Frame"], priceRange: "\u20b9\u20b9" },
  { name: "Home Fix Pro", category: "furniture", address: "HSR Layout, Bangalore", phone: "+91-9876543222", rating: 4.7, specialties: ["Modular Kitchen", "Wardrobe", "Shelf Installation"], priceRange: "\u20b9\u20b9\u20b9" },
  
  // Bicycle
  { name: "CycleWorld Service", category: "bicycle", address: "Connaught Place, Delhi", phone: "+91-9876543230", rating: 4.9, specialties: ["All Bicycle Repairs", "Gear Tuning", "Brake Service"], priceRange: "\u20b9" },
  { name: "PedalPerfect", category: "bicycle", address: "Powai, Mumbai", phone: "+91-9876543231", rating: 4.5, specialties: ["Electric Bikes", "Tire Replacement", "Full Service"], priceRange: "\u20b9\u20b9" },
  { name: "BikeZone Service", category: "bicycle", address: "Indiranagar, Bangalore", phone: "+91-9876543232", rating: 4.6, specialties: ["MTB Repair", "Suspension Service", "Wheel Truing"], priceRange: "\u20b9" },
  
  // Appliance
  { name: "ApplianceMantri", category: "appliance", address: "Janakpuri, Delhi", phone: "+91-9876543240", rating: 4.7, specialties: ["Washing Machine", "Dryer", "Dishwasher"], priceRange: "\u20b9\u20b9" },
  { name: "CoolCare AC Repair", category: "appliance", address: "Thane, Mumbai", phone: "+91-9876543241", rating: 4.4, specialties: ["AC Repair", "Refrigerator", "Freezer"], priceRange: "\u20b9\u20b9" },
  { name: "HomeAppliance Hub", category: "appliance", address: "Whitefield, Bangalore", phone: "+91-9876543242", rating: 4.6, specialties: ["Microwave", "Water Purifier", "Gas Stove"], priceRange: "\u20b9" },
  
  // General
  { name: "FixIt All", category: "other", address: "Sector 18, Noida", phone: "+91-9876543250", rating: 4.3, specialties: ["General Repairs", "Key Making", "Lock Repair"], priceRange: "\u20b9" },
  { name: "HandyMan Services", category: "other", address: "Salt Lake, Kolkata", phone: "+91-9876543251", rating: 4.5, specialties: ["Plumbing", "Electrical", "Carpentry"], priceRange: "\u20b9\u20b9" },
];

export async function POST() {
  try {
    await connectToDatabase();
    await ServiceProvider.deleteMany({});
    const services = await ServiceProvider.insertMany(indianShops);
    return NextResponse.json({ message: "Seeded", count: services.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
