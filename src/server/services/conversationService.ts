import { VisualCard } from "@/lib/constants/presets";
import {
  ensureSchema,
  logUtterance,
  persistCards,
  startSession,
  listTimeline
} from "@/server/db/conversations";

type ConversationEntry = {
  id?: string;
  speaker: "parent" | "child" | "system" | string;
  text: string;
  timestamp?: string;
  [key: string]: any;
};

export async function bootstrapSession(parentId: string, childId: string, parentUserId: string) {
  await ensureSchema();
  return startSession(parentId, childId, parentUserId);
}

export async function storeCards(sessionId: string, cards: VisualCard[]) {
  await persistCards(sessionId, cards);
}

export async function appendEntry(sessionId: string, entry: ConversationEntry) {
  // Map the local entry shape to the DB shape expected by logUtterance.
  // - transcript in DB maps to text in the service
  // - createdAt is required by the DB API; use provided timestamp or now
  await logUtterance(sessionId, {
    id: entry.id,
    speaker: entry.speaker,
    transcript: entry.text,
    recordingUrl: (entry as any).recordingUrl ?? null,
    card: (entry as any).card ?? null,
    createdAt: entry.timestamp ?? new Date().toISOString()
  });
}

export async function getTimeline(sessionId: string) {
  return listTimeline(sessionId);
}
