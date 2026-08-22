import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

const sampleServices = [
  { name: "TechFix Pro", category: "electronics", address: "123 Main St", phone: "555-0101", rating: 4.8, specialties: ["Laptops", "Phones", "Tablets"], priceRange: "$$" },
  { name: "Screen Masters", category: "electronics", address: "456 Oak Ave", phone: "555-0102", rating: 4.5, specialties: ["Screen Repair", "LCD Replacement"], priceRange: "$" },
  { name: "Wood Workshop", category: "furniture", address: "789 Pine Rd", phone: "555-0201", rating: 4.7, specialties: ["Wooden Furniture", "Chairs", "Tables"], priceRange: "$$" },
  { name: "Upholstery Plus", category: "furniture", address: "321 Elm St", phone: "555-0202", rating: 4.3, specialties: ["Sofas", "Cushions", "Reupholstery"], priceRange: "$$" },
  { name: "Bike Barn", category: "bicycle", address: "654 Bike Ln", phone: "555-0301", rating: 4.9, specialties: ["All bike repairs", "Gear tuning", "Brake repair"], priceRange: "$" },
  { name: "Cycle Hub", category: "bicycle", address: "987 Wheel Way", phone: "555-0302", rating: 4.4, specialties: ["Electric bikes", "Tire replacement"], priceRange: "$$" },
  { name: "Appliance Doctor", category: "appliance", address: "147 Washer St", phone: "555-0401", rating: 4.6, specialties: ["Washing Machines", "Dryers", "Dishwashers"], priceRange: "$$" },
  { name: "CoolBreeze HVAC", category: "appliance", address: "258 Air Ave", phone: "555-0402", rating: 4.2, specialties: ["Refrigerators", "AC Units", "Freezers"], priceRange: "$$" },
];

export async function POST() {
  try {
    await connectToDatabase();
    await ServiceProvider.deleteMany({});
    const services = await ServiceProvider.insertMany(sampleServices);
    return NextResponse.json({ message: "Seeded", count: services.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
