import { getPool } from "./client";

export interface ConversationSession {
  id: string;
  parent_id: string;
  child_id: string;
  parent_user_id: string | null;
  topic: string | null;
  status: "active" | "paused" | "completed";
  notes: string | null;
  started_at: Date;
  ended_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SessionWithStats extends ConversationSession {
  card_count: number;
  utterance_count: number;
}

/**
 * Get all conversation sessions for a user with optional filtering
 */
export async function getConversationSessions(
  parentUserId: string,
  filters?: {
    status?: "active" | "paused" | "completed";
    childId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<SessionWithStats[]> {
  const db = getPool();

  let query = `
    SELECT 
      cs.*,
      COUNT(DISTINCT vc.id) as card_count,
      COUNT(DISTINCT u.id) as utterance_count
    FROM conversation_session cs
    LEFT JOIN visual_card vc ON cs.id = vc.session_id
    LEFT JOIN utterance u ON cs.id = u.session_id
    WHERE cs.parent_user_id = $1
  `;

  const params: any[] = [parentUserId];
  let paramIndex = 2;

  if (filters?.status) {
    query += ` AND cs.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters?.childId) {
    query += ` AND cs.child_id = $${paramIndex}`;
    params.push(filters.childId);
    paramIndex++;
  }

  if (filters?.startDate) {
    query += ` AND cs.started_at >= $${paramIndex}`;
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters?.endDate) {
    query += ` AND cs.started_at <= $${paramIndex}`;
    params.push(filters.endDate);
    paramIndex++;
  }

  query += ` GROUP BY cs.id ORDER BY cs.started_at DESC`;

  if (filters?.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters?.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  const result = await db.query(query, params);
  return result.rows.map((row: any) => ({
    ...row,
    card_count: parseInt(row.card_count),
    utterance_count: parseInt(row.utterance_count),
  }));
}

/**
 * Get a single conversation session by ID
 */
export async function getConversationSessionById(
  sessionId: string
): Promise<ConversationSession | null> {
  const db = getPool();
  const result = await db.query(
    "SELECT * FROM conversation_session WHERE id = $1",
    [sessionId]
  );
  return result.rows[0] || null;
}

/**
 * Create a new conversation session
 */
export async function createConversationSession(data: {
  parent_id: string;
  child_id: string;
  parent_user_id?: string | null;
  topic?: string;
  status?: "active" | "paused" | "completed";
  notes?: string;
}): Promise<ConversationSession> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO conversation_session 
      (parent_id, child_id, parent_user_id, topic, status, notes) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [
      data.parent_id,
      data.child_id,
      data.parent_user_id || null,
      data.topic || null,
      data.status || "active",
      data.notes || null,
    ]
  );
  return result.rows[0];
}

/**
 * Update a conversation session
 */
export async function updateConversationSession(
  sessionId: string,
  data: {
    status?: "active" | "paused" | "completed";
    notes?: string;
    ended_at?: Date | null;
    topic?: string;
  }
): Promise<ConversationSession | null> {
  const db = getPool();

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    values.push(data.status);
    paramIndex++;
  }

  if (data.notes !== undefined) {
    updates.push(`notes = $${paramIndex}`);
    values.push(data.notes);
    paramIndex++;
  }

  if (data.ended_at !== undefined) {
    updates.push(`ended_at = $${paramIndex}`);
    values.push(data.ended_at);
    paramIndex++;
  }

  if (data.topic !== undefined) {
    updates.push(`topic = $${paramIndex}`);
    values.push(data.topic);
    paramIndex++;
  }

  if (updates.length === 0) {
    return getConversationSessionById(sessionId);
  }

  updates.push(`updated_at = NOW()`);
  values.push(sessionId);

  const query = `
    UPDATE conversation_session 
    SET ${updates.join(", ")} 
    WHERE id = $${paramIndex} 
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete a conversation session and all related data
 */
export async function deleteConversationSession(
  sessionId: string
): Promise<boolean> {
  const db = getPool();
  const result = await db.query(
    "DELETE FROM conversation_session WHERE id = $1",
    [sessionId]
  );
  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Get session statistics for a user
 */
export async function getSessionStatistics(parentUserId: string): Promise<{
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  total_cards: number;
  total_utterances: number;
}> {
  const db = getPool();
  const result = await db.query(
    `
    SELECT 
      COUNT(DISTINCT cs.id) as total_sessions,
      COUNT(DISTINCT CASE WHEN cs.status = 'active' THEN cs.id END) as active_sessions,
      COUNT(DISTINCT CASE WHEN cs.status = 'completed' THEN cs.id END) as completed_sessions,
      COUNT(DISTINCT vc.id) as total_cards,
      COUNT(DISTINCT u.id) as total_utterances
    FROM conversation_session cs
    LEFT JOIN visual_card vc ON cs.id = vc.session_id
    LEFT JOIN utterance u ON cs.id = u.session_id
    WHERE cs.parent_user_id = $1
    `,
    [parentUserId]
  );

  return {
    total_sessions: parseInt(result.rows[0].total_sessions),
    active_sessions: parseInt(result.rows[0].active_sessions),
    completed_sessions: parseInt(result.rows[0].completed_sessions),
    total_cards: parseInt(result.rows[0].total_cards),
    total_utterances: parseInt(result.rows[0].total_utterances),
  };
}
