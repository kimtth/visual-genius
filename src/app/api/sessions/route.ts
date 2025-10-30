import { NextRequest, NextResponse } from "next/server";
import {
  getConversationSessions,
  getConversationSessionById,
  createConversationSession,
  updateConversationSession,
  deleteConversationSession,
  getSessionStatistics,
} from "@/server/db/sessions";
import { log } from "@/lib/observability/logger";

/**
 * GET /api/sessions - Get all sessions or statistics for a user
 * Query params:
 *   - parentUserId: string (required)
 *   - stats: boolean (optional, returns statistics instead of sessions)
 *   - status: "active" | "paused" | "completed" (optional filter)
 *   - childId: string (optional filter)
 *   - startDate: ISO date string (optional filter)
 *   - endDate: ISO date string (optional filter)
 *   - limit: number (optional pagination)
 *   - offset: number (optional pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentUserId = searchParams.get("parentUserId");
    const sessionId = searchParams.get("sessionId");
    const getStats = searchParams.get("stats") === "true";

    if (!parentUserId && !sessionId) {
      return NextResponse.json(
        { error: "parentUserId or sessionId is required" },
        { status: 400 }
      );
    }

    // Get single session by ID
    if (sessionId) {
      const session = await getConversationSessionById(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    // Get statistics
    if (getStats && parentUserId) {
      const statistics = await getSessionStatistics(parentUserId);
      return NextResponse.json({ statistics });
    }

    // Get sessions with optional filters
    if (parentUserId) {
      const filters = {
        status: searchParams.get("status") as
          | "active"
          | "paused"
          | "completed"
          | undefined,
        childId: searchParams.get("childId") || undefined,
        startDate: searchParams.get("startDate")
          ? new Date(searchParams.get("startDate")!)
          : undefined,
        endDate: searchParams.get("endDate")
          ? new Date(searchParams.get("endDate")!)
          : undefined,
        limit: searchParams.get("limit")
          ? parseInt(searchParams.get("limit")!)
          : undefined,
        offset: searchParams.get("offset")
          ? parseInt(searchParams.get("offset")!)
          : undefined,
      };

      const sessions = await getConversationSessions(parentUserId, filters);
      return NextResponse.json({ sessions, count: sessions.length });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to fetch conversation sessions",
      diagnostics: error instanceof Error ? error.stack : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions - Create a new conversation session
 * Body: {
 *   parent_id: string,
 *   child_id: string,
 *   parent_user_id?: string,
 *   topic?: string,
 *   status?: "active" | "paused" | "completed",
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.parent_id || !body.child_id) {
      return NextResponse.json(
        { error: "parent_id and child_id are required" },
        { status: 400 }
      );
    }

    const session = await createConversationSession(body);

    log({
      level: "info",
      message: `Created conversation session ${session.id}`,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to create conversation session",
      diagnostics: error instanceof Error ? error.stack : String(error),
    });
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sessions - Update a conversation session
 * Body: {
 *   sessionId: string,
 *   status?: "active" | "paused" | "completed",
 *   notes?: string,
 *   ended_at?: string (ISO date),
 *   topic?: string
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.topic !== undefined) updateData.topic = body.topic;
    if (body.ended_at !== undefined)
      updateData.ended_at = body.ended_at ? new Date(body.ended_at) : null;

    const session = await updateConversationSession(body.sessionId, updateData);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    log({
      level: "info",
      message: `Updated conversation session ${session.id}`,
    });

    return NextResponse.json({ session });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to update conversation session",
      diagnostics: error instanceof Error ? error.stack : String(error),
    });
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions - Delete a conversation session
 * Query params:
 *   - sessionId: string (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteConversationSession(sessionId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    log({
      level: "info",
      message: `Deleted conversation session ${sessionId}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to delete conversation session",
      diagnostics: error instanceof Error ? error.stack : String(error),
    });
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
