import { randomUUID } from "crypto";
import { VisualCard } from "@/lib/constants/presets";
import { withClient } from "./client";
import type { QueryResult } from "pg";

export interface CardCollection {
  id: string;
  name: string;
  cards: VisualCard[];
  createdAt: string;
  updatedAt: string;
}

type CollectionRow = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

type CardOrderRow = {
  card_id: string;
  card_data: VisualCard;
  position: number;
};

/**
 * Create a new card collection
 */
export async function createCollection(
  name: string,
  cards: VisualCard[],
  userId: string = "default-user"
): Promise<string> {
  const collectionId = randomUUID();

  await withClient(async (pool) => {
    // Create collection
    await pool.query(
      `INSERT INTO card_collection (id, name, user_id) VALUES ($1, $2, $3)`,
      [collectionId, name, userId]
    );

    // Insert cards with their positions
    if (cards.length > 0) {
      const values = cards.map((card, index) => [
        randomUUID(),
        collectionId,
        card.id,
        JSON.stringify(card),
        index
      ]);

      const query = `
        INSERT INTO card_order (id, collection_id, card_id, card_data, position)
        VALUES ${values.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(",")}
      `;

      await pool.query(query, values.flat());
    }
  });

  return collectionId;
}

/**
 * Get all collections for a user
 */
export async function listCollections(userId: string = "default-user"): Promise<CardCollection[]> {
  const result = await withClient<QueryResult<CollectionRow>>((pool) =>
    pool.query<CollectionRow>(
      `SELECT id, name, created_at, updated_at
       FROM card_collection
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )
  );

  const collections: CardCollection[] = [];

  for (const row of result.rows) {
    const cardsResult = await withClient<QueryResult<CardOrderRow>>((pool) =>
      pool.query<CardOrderRow>(
        `SELECT card_id, card_data, position
         FROM card_order
         WHERE collection_id = $1
         ORDER BY position ASC`,
        [row.id]
      )
    );

    collections.push({
      id: row.id,
      name: row.name,
      cards: cardsResult.rows.map((cardRow) => cardRow.card_data),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    });
  }

  return collections;
}

/**
 * Get a single collection by ID
 */
export async function getCollection(collectionId: string): Promise<CardCollection | null> {
  const collectionResult = await withClient<QueryResult<CollectionRow>>((pool) =>
    pool.query<CollectionRow>(
      `SELECT id, name, created_at, updated_at
       FROM card_collection
       WHERE id = $1`,
      [collectionId]
    )
  );

  if (collectionResult.rows.length === 0) {
    return null;
  }

  const row = collectionResult.rows[0];

  const cardsResult = await withClient<QueryResult<CardOrderRow>>((pool) =>
    pool.query<CardOrderRow>(
      `SELECT card_id, card_data, position
       FROM card_order
       WHERE collection_id = $1
       ORDER BY position ASC`,
      [collectionId]
    )
  );

  return {
    id: row.id,
    name: row.name,
    cards: cardsResult.rows.map((cardRow) => cardRow.card_data),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

/**
 * Update card order within a collection
 */
export async function updateCardOrder(
  collectionId: string,
  cards: VisualCard[]
): Promise<void> {
  await withClient(async (pool) => {
    // Delete existing card orders
    await pool.query(
      `DELETE FROM card_order WHERE collection_id = $1`,
      [collectionId]
    );

    // Insert new card order
    if (cards.length > 0) {
      const values = cards.map((card, index) => [
        randomUUID(),
        collectionId,
        card.id,
        JSON.stringify(card),
        index
      ]);

      const query = `
        INSERT INTO card_order (id, collection_id, card_id, card_data, position)
        VALUES ${values.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(",")}
      `;

      await pool.query(query, values.flat());
    }

    // Update collection's updated_at timestamp
    await pool.query(
      `UPDATE card_collection SET updated_at = NOW() WHERE id = $1`,
      [collectionId]
    );
  });
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  await withClient(async (pool) => {
    await pool.query(
      `DELETE FROM card_collection WHERE id = $1`,
      [collectionId]
    );
  });
}

/**
 * Update collection name
 */
export async function updateCollectionName(
  collectionId: string,
  name: string
): Promise<void> {
  await withClient(async (pool) => {
    await pool.query(
      `UPDATE card_collection SET name = $1, updated_at = NOW() WHERE id = $2`,
      [name, collectionId]
    );
  });
}
