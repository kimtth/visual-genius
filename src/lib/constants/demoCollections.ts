import { VisualCard } from "./presets";

/**
 * Demo card collections for testing and demonstration purposes.
 * Replace this file with API calls when backend is ready.
 * 
 * To replace with API:
 * 1. Create a new file: src/lib/api/collections.ts
 * 2. Add async functions for CRUD operations
 * 3. Update imports in teach/page.tsx
 */

export interface CardCollection {
  id: string;
  name: string;
  cards: VisualCard[];
  createdAt: string;
}

export const demoCollections: CardCollection[] = [
  {
    id: "demo-collection-1",
    name: "Morning Routine",
    createdAt: new Date("2024-01-15").toISOString(),
    cards: [
      {
        id: "morning-1",
        title: "Wake Up",
        description: "Time to wake up and start the day",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "morning-2",
        title: "Brush Teeth",
        description: "Brush your teeth for 2 minutes",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "morning-3",
        title: "Get Dressed",
        description: "Put on clean clothes for the day",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "morning-4",
        title: "Eat Breakfast",
        description: "Have a healthy breakfast",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "morning-5",
        title: "Pack Backpack",
        description: "Get your school bag ready",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: "demo-collection-2",
    name: "Washing Hands",
    createdAt: new Date("2024-01-20").toISOString(),
    cards: [
      {
        id: "wash-1",
        title: "Turn on Water",
        description: "Turn on the faucet with warm water",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "wash-2",
        title: "Wet Hands",
        description: "Put your hands under the water",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "wash-3",
        title: "Apply Soap",
        description: "Put soap on your hands",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "wash-4",
        title: "Scrub Hands",
        description: "Rub your hands together for 20 seconds",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "wash-5",
        title: "Rinse Hands",
        description: "Rinse all the soap off",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "wash-6",
        title: "Dry Hands",
        description: "Dry your hands with a clean towel",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: "demo-collection-3",
    name: "Bedtime Routine",
    createdAt: new Date("2024-01-25").toISOString(),
    cards: [
      {
        id: "bedtime-1",
        title: "Put on Pajamas",
        description: "Change into comfortable sleepwear",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "bedtime-2",
        title: "Brush Teeth",
        description: "Brush teeth before bed",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "bedtime-3",
        title: "Read a Story",
        description: "Enjoy a bedtime story",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "bedtime-4",
        title: "Turn Off Lights",
        description: "Make the room dark and quiet",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "bedtime-5",
        title: "Go to Sleep",
        description: "Close your eyes and rest",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: "demo-collection-4",
    name: "Making a Sandwich",
    createdAt: new Date("2024-01-28").toISOString(),
    cards: [
      {
        id: "sandwich-1",
        title: "Wash Hands",
        description: "Clean your hands before cooking",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "sandwich-2",
        title: "Get Ingredients",
        description: "Take out bread, spread, and fillings",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "sandwich-3",
        title: "Spread on Bread",
        description: "Put butter or spread on one slice",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "sandwich-4",
        title: "Add Fillings",
        description: "Place your favorite ingredients",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "sandwich-5",
        title: "Close Sandwich",
        description: "Put the second slice on top",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "sandwich-6",
        title: "Cut and Serve",
        description: "Cut the sandwich and enjoy",
        category: "action",
        imageUrl: "",
        createdAt: new Date().toISOString()
      }
    ]
  }
];

/**
 * Get demo collections for demonstration.
 * This function simulates an API call.
 */
export function getDemoCollections(): CardCollection[] {
  return demoCollections;
}

/**
 * Merge demo collections with user-saved collections.
 * Demo collections are marked with a special prefix and cannot be deleted.
 */
export function getAllCollections(userCollections: CardCollection[]): CardCollection[] {
  return [...demoCollections, ...userCollections];
}

/**
 * Check if a collection is a demo collection (read-only).
 */
export function isDemoCollection(collectionId: string): boolean {
  return collectionId.startsWith("demo-collection-");
}
