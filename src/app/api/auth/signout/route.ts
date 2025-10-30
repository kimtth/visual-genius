import { NextResponse } from "next/server";

export async function POST() {
  try {
    // In a production app, you would clear session cookies or invalidate JWT here
    
    return NextResponse.json({
      message: "Signed out successfully"
    });

  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign out" },
      { status: 500 }
    );
  }
}
