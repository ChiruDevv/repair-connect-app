/*
 * POST /api/auth/register
 * 
 * Creates a new user account.
 * 
 * Flow:
 * 1. Validate required fields (name, email, password)
 * 2. Check password length (minimum 6 characters)
 * 3. Check if email is already registered
 * 4. Hash password with bcrypt (12 salt rounds)
 * 5. Save user to MongoDB
 * 6. Return user object (without password)
 * 
 * This is a public endpoint - no authentication required.
 */import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Step 1: Validate that all required fields are provided
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Step 2: Enforce minimum password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Step 3: Check if this email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Step 4: Hash the password with bcrypt (12 salt rounds)
    // The plain text password is NEVER stored in the database
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 5: Save the new user to MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
