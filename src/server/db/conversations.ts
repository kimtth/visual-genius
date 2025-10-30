import { randomUUID } from "crypto";
import { VisualCard } from "@/lib/constants/presets";
import { DEFAULT_USER_ID } from "@/lib/constants/presets";

type ConversationEntry = {
  id?: string;
  speaker: "user" | "assistant" | string;
  transcript?: string | null;
  recordingUrl?: string | null;
  card?: { id: string } | null;
  createdAt: string;
};

import { withClient } from "./client";
import type { QueryResult } from "pg";
import { createTablesSql } from "./schema";

export interface ConversationSession {
  id: string;
  parentId: string;
  childId: string;
  startedAt: string;
}

export async function ensureSchema() {
  await withClient(async (pool) => {
    await pool.query(createTablesSql);
  });
}

export async function startSession(parentId: string, childId: string, parentUserId: string) {
  const id = randomUUID();
  await withClient(async (pool) => {
    await pool.query(
      `INSERT INTO conversation_session (id, parent_id, child_id, parent_user_id, status) 
       VALUES ($1, $2, $3, $4, $5)`
    , [id, parentId, childId, parentUserId, 'active']);
  });
  return id;
}

export async function persistCards(sessionId: string, cards: VisualCard[]) {
  if (!cards.length) return;

  await withClient(async (pool) => {
    const values = cards.map((card) => [
      card.id,
      sessionId,
      card.title,
      card.description ?? null,
      card.imageUrl ?? null,
      card.category,
      card.createdAt
    ]);

    const query = `
      INSERT INTO visual_card (id, session_id, title, description, image_url, category, created_at)
      VALUES ${values.map((_, index) => `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`).join(",")}
      ON CONFLICT (id) DO UPDATE SET
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        category = EXCLUDED.category,
        created_at = EXCLUDED.created_at
    `;

    await pool.query(query, values.flat());
  });
}

export async function logUtterance(sessionId: string, entry: ConversationEntry) {
  const id = entry.id ?? randomUUID();

  await withClient(async (pool) => {
    await pool.query(
      `
        INSERT INTO utterance (id, session_id, speaker, card_id, transcript, recording_url, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id,
        sessionId,
        entry.speaker,
        entry.card?.id ?? null,
        entry.transcript ?? null,
        entry.recordingUrl ?? null,
        entry.createdAt
      ]
    );
  });
}

type TimelineRow = {
  id: string;
  speaker: string;
  transcript: string | null;
  recording_url: string | null;
  created_at: Date;
  card_id: string | null;
  card_title: string | null;
  card_description: string | null;
  image_url: string | null;
  category: VisualCard["category"] | null;
};

export async function listTimeline(sessionId: string) {
  const result = await withClient<QueryResult<TimelineRow>>((pool) =>
    pool.query<TimelineRow>(
      `
        SELECT u.id,
               u.speaker,
               u.transcript,
               u.recording_url,
               u.created_at,
               c.id as card_id,
               c.title as card_title,
               c.description as card_description,
               c.image_url,
               c.category
        FROM utterance u
        LEFT JOIN visual_card c ON c.id = u.card_id
        WHERE u.session_id = $1
        ORDER BY u.created_at ASC
      `,
      [sessionId]
    )
  );

  const rows = result.rows as TimelineRow[];

  return rows.map((row: TimelineRow) => ({
    id: row.id,
    speaker: row.speaker as ConversationEntry["speaker"],
    transcript: row.transcript ?? undefined,
    recordingUrl: row.recording_url ?? undefined,
    createdAt: row.created_at.toISOString(),
    card: row.card_id
      ? {
          id: row.card_id,
          title: row.card_title ?? "",
          description: row.card_description ?? undefined,
          imageUrl: row.image_url ?? undefined,
          category: row.category ?? "response",
          createdAt: row.created_at.toISOString()
        }
      : undefined
  }));
}
