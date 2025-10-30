import { NextRequest, NextResponse } from "next/server";
import { createUser, isEmailRegistered } from "@/server/db/users";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    // Validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const emailExists = await isEmailRegistered(email.toLowerCase().trim());

    if (emailExists) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await createUser({
      email: email.toLowerCase().trim(),
      password_hash,
      full_name: full_name.trim(),
      role: "parent"
    });

    // Return user data (excluding password_hash)
    const { password_hash: _, ...userData } = user;

    return NextResponse.json({
      user: userData,
      message: "Account created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign up" },
      { status: 500 }
    );
  }
}
