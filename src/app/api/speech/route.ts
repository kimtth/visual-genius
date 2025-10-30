import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { appendEntry } from "@/server/services/conversationService";
import { log } from "@/lib/observability/logger";

const schema = z.object({
  sessionId: z.string().uuid(),
  speaker: z.enum(["parent", "child"]),
  transcript: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  cardId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, speaker, transcript, recordingUrl, cardId } = schema.parse(body);

    await appendEntry(sessionId, {
      id: randomUUID(),
      speaker,
      text: transcript || "",
      timestamp: new Date().toISOString(),
      recordingUrl,
      card: cardId
        ? {
            id: cardId,
            title: "",
            category: "response",
            createdAt: new Date().toISOString()
          }
        : undefined
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to log speech entry",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ error: "Unable to log entry" }, { status: 400 });
  }
}
