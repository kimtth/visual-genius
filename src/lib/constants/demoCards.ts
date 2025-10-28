import { VisualCard } from "./presets";

/**
 * Demo cards for testing and demonstration purposes.
 * Replace this file with API calls when backend is ready.
 * 
 * To replace with API:
 * 1. Create a new file: src/lib/api/cards.ts
 * 2. Add async function: export async function fetchCards(sessionId: string): Promise<VisualCard[]>
 * 3. Update imports in child/page.tsx from './demoCards' to '@/lib/api/cards'
 * 4. Replace getDemoCards() calls with await fetchCards(sessionId)
 */

export const demoCards: VisualCard[] = [
  // Topic Cards
  {
    id: "topic-1",
    title: "School",
    description: "Talk about school and learning",
    category: "topic",
    createdAt: new Date().toISOString()
  },
  {
    id: "topic-2",
    title: "Home",
    description: "Things at home and family",
    category: "topic",
    createdAt: new Date().toISOString()
  },
  {
    id: "topic-3",
    title: "Food",
    description: "Meals and favorite foods",
    category: "topic",
    createdAt: new Date().toISOString()
  },
  {
    id: "topic-4",
    title: "Playtime",
    description: "Games and fun activities",
    category: "topic",
    createdAt: new Date().toISOString()
  },
  {
    id: "topic-5",
    title: "Friends",
    description: "Talk about friends and friendship",
    category: "topic",
    createdAt: new Date().toISOString()
  },

  // Action Cards
  {
    id: "action-1",
    title: "Play",
    description: "I want to play",
    category: "action",
    createdAt: new Date().toISOString()
  },
  {
    id: "action-2",
    title: "Eat",
    description: "I want to eat",
    category: "action",
    createdAt: new Date().toISOString()
  },
  {
    id: "action-3",
    title: "Sleep",
    description: "I want to sleep or rest",
    category: "action",
    createdAt: new Date().toISOString()
  },
  {
    id: "action-4",
    title: "Help",
    description: "I need help",
    category: "action",
    createdAt: new Date().toISOString()
  },
  {
    id: "action-5",
    title: "Read",
    description: "I want to read a book",
    category: "action",
    createdAt: new Date().toISOString()
  },
  {
    id: "action-6",
    title: "Draw",
    description: "I want to draw or color",
    category: "action",
    createdAt: new Date().toISOString()
  },
  {
    id: "action-7",
    title: "Go Outside",
    description: "I want to go outside",
    category: "action",
    createdAt: new Date().toISOString()
  },

  // Emotion Cards
  {
    id: "emotion-1",
    title: "Happy",
    description: "I feel happy",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-2",
    title: "Sad",
    description: "I feel sad",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-3",
    title: "Angry",
    description: "I feel angry",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-4",
    title: "Excited",
    description: "I feel excited",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-5",
    title: "Tired",
    description: "I feel tired",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-6",
    title: "Scared",
    description: "I feel scared",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-7",
    title: "Confused",
    description: "I feel confused",
    category: "emotion",
    createdAt: new Date().toISOString()
  },
  {
    id: "emotion-8",
    title: "Calm",
    description: "I feel calm and peaceful",
    category: "emotion",
    createdAt: new Date().toISOString()
  }
];

/**
 * Get demo cards for demonstration.
 * This function simulates an API call.
 * Replace with actual API call when backend is ready.
 */
export function getDemoCards(): VisualCard[] {
  return demoCards;
}

/**
 * Placeholder for future API implementation.
 * Uncomment and use this when backend is ready:
 * 
 * export async function fetchCardsFromAPI(sessionId: string): Promise<VisualCard[]> {
 *   const response = await fetch(`/api/cards?sessionId=${sessionId}`);
 *   if (!response.ok) {
 *     throw new Error('Failed to fetch cards');
 *   }
 *   const data = await response.json();
 *   return data.cards;
 * }
 */
