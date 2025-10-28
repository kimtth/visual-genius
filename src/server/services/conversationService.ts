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

export async function bootstrapSession(parentId: string, childId: string) {
  await ensureSchema();
  return startSession(parentId, childId);
}

export async function storeCards(sessionId: string, cards: VisualCard[]) {
  await persistCards(sessionId, cards);
}

export async function appendEntry(sessionId: string, entry: ConversationEntry) {
  await logUtterance(sessionId, entry);
}

export async function getTimeline(sessionId: string) {
  return listTimeline(sessionId);
}
