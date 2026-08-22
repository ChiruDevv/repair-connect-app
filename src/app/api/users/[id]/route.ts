import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/users/:id — get a single user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/:id — update a user
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id — delete a user
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
