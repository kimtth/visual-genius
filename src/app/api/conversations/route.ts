import { NextResponse } from "next/server";
import { z } from "zod";
import { bootstrapSession, getTimeline } from "@/server/services/conversationService";
import { log } from "@/lib/observability/logger";

const createSchema = z.object({
  parentId: z.string().min(1),
  childId: z.string().min(1),
  parentUserId: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parentId, childId, parentUserId } = createSchema.parse(body);
    
    if (!parentUserId) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }
    
    const sessionId = await bootstrapSession(parentId, childId, parentUserId);
    return NextResponse.json({ sessionId });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to start session",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ error: "Unable to start session" }, { status: 400 });
  }
}

const listSchema = z.object({ sessionId: z.string().uuid() });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  try {
    const { sessionId: id } = listSchema.parse({ sessionId });
    const entries = await getTimeline(id);
    return NextResponse.json({ entries });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to fetch timeline",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ error: "Unable to fetch timeline" }, { status: 400 });
  }
}
