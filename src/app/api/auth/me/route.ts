import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/server/db/users";

export async function GET(request: NextRequest) {
  try {
    // In a production app, you would get userId from a session cookie or JWT
    // For now, we'll check if there's a user ID in the request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserById(userId);

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 404 }
      );
    }

    // Return user data (excluding password_hash)
    const { password_hash, ...userData } = user;

    return NextResponse.json(userData);

  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
}
