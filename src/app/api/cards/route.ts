import { NextResponse } from "next/server";
import { z } from "zod";
import { createCardsFromPrompt } from "@/server/services/cardService";
import { storeCards } from "@/server/services/conversationService";
import { log } from "@/lib/observability/logger";

const requestSchema = z.object({
  prompt: z.string().min(3),
  sessionId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, sessionId } = requestSchema.parse(body);

    const cards = await createCardsFromPrompt(prompt);

    if (sessionId) {
      await storeCards(sessionId, cards);
    }

    return NextResponse.json({ cards });
  } catch (error) {
    log({
      level: "error",
      message: "Card generation failed",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ error: "Unable to generate cards" }, { status: 400 });
  }
}
