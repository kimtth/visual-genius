import { generateCardIdeas } from "@/server/azure/openai";
import { searchImages } from "@/server/azure/imageSearch";
import { VisualCard } from "@/lib/constants/presets";
import { randomUUID } from "crypto";
import { withClient } from "@/server/db/client";
import type { QueryResult } from "pg";

type CardRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  created_at: Date;
};

/**
 * Retrieve existing cards from database by titles
 */
export async function getExistingCardsByTitles(titles: string[]): Promise<VisualCard[]> {
  if (titles.length === 0) return [];

  const result = await withClient<QueryResult<CardRow>>((pool) =>
    pool.query<CardRow>(
      `
        SELECT DISTINCT ON (title) id, title, description, image_url, category, created_at
        FROM visual_card
        WHERE LOWER(title) = ANY($1::text[])
        ORDER BY title, created_at DESC
      `,
      [titles.map(t => t.toLowerCase())]
    )
  );

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    category: row.category as VisualCard["category"],
    createdAt: row.created_at.toISOString()
  }));
}

export async function createCardsFromPrompt(prompt: string) {
  const ideas = await generateCardIdeas(prompt);

  // Check if we have existing cards with these titles
  const titles = ideas.map(idea => idea.title);
  const existingCards = await getExistingCardsByTitles(titles);
  const existingTitles = new Set(existingCards.map(c => c.title.toLowerCase()));

  const enriched: VisualCard[] = [...existingCards];

  // Only generate new cards for titles we don't have
  for (const idea of ideas) {
    if (!existingTitles.has(idea.title.toLowerCase())) {
      const results = await searchImages(`${idea.title} illustration for children`);
      enriched.push({
        id: randomUUID(),
        title: idea.title,
        description: idea.description,
        category: idea.category,
        imageUrl: results[0]?.contentUrl, // Use contentUrl for higher quality
        createdAt: new Date().toISOString()
      });
    }
  }

  return enriched;
}
