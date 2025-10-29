import { NextResponse } from "next/server";
import { z } from "zod";
import { createCardsFromPrompt } from "@/server/services/cardService";
import { storeCards } from "@/server/services/conversationService";
import { log } from "@/lib/observability/logger";

const requestSchema = z.object({
  prompt: z.string().min(3),
  sessionId: z.string().uuid().optional()
});

const saveCardsSchema = z.object({
  sessionId: z.string().uuid(),
  cards: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    category: z.string(),
    createdAt: z.string()
  }))
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, sessionId } = requestSchema.parse(body);

    const cards = await createCardsFromPrompt(prompt);

    if (sessionId) {
      await storeCards(sessionId, cards as Parameters<typeof storeCards>[1]);
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, cards } = saveCardsSchema.parse(body);

    // Save all cards to database
    await storeCards(sessionId, cards as Parameters<typeof storeCards>[1]);

    return NextResponse.json({ success: true, saved: cards.length });
  } catch (error) {
    log({
      level: "error",
      message: "Card save failed",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ error: "Unable to save cards" }, { status: 400 });
  }
}
