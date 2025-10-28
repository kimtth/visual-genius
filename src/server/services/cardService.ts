import { generateCardIdeas } from "@/server/azure/openai";
import { searchImages } from "@/server/azure/bingImageSearch";
import { VisualCard } from "@/lib/constants/presets";
import { randomUUID } from "crypto";

export async function createCardsFromPrompt(prompt: string) {
  const ideas = await generateCardIdeas(prompt);

  const enriched: VisualCard[] = [];

  for (const idea of ideas) {
    const results = await searchImages(`${idea.title} illustration for children`);
    enriched.push({
      id: randomUUID(),
      title: idea.title,
      description: idea.description,
      category: idea.category,
      imageUrl: results[0]?.thumbnailUrl,
      createdAt: new Date().toISOString()
    });
  }

  return enriched;
}
