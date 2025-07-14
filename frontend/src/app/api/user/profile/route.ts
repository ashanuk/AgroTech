import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user";
import { NextResponse } from "next/server";

/**
 * GET handler to fetch the current user's full profile
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(session.user.id).select("-password"); // Exclude password from the result

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH handler to update the current user's profile
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username, phone, address, role, location } = body;

    await connectToDatabase();

    // Optional: Add validation for the incoming data here

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        username,
        phone,
        address,
        role,
        location,
      },
      { new: true } // Return the updated document
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    // Handle potential duplicate key errors for username/phone
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
        return NextResponse.json({ message: "Username or phone number is already taken." }, { status: 409 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}