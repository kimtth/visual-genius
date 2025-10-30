import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateLastLogin } from "@/server/db/users";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await updateLastLogin(user.id);

    // Return user data (excluding password_hash)
    const { password_hash, ...userData } = user;

    return NextResponse.json({
      user: userData,
      message: "Sign in successful"
    });

  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
