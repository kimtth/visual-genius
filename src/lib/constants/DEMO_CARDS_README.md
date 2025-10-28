# Demo Cards - Migration Guide

## Current Implementation (Demo Mode)

The child board currently uses **demo cards** from `src/lib/constants/demoCards.ts` for testing and demonstration purposes.

### Demo Cards Include:

- **5 Topic Cards**: School, Home, Food, Playtime, Friends
- **7 Action Cards**: Play, Eat, Sleep, Help, Read, Draw, Go Outside
- **8 Emotion Cards**: Happy, Sad, Angry, Excited, Tired, Scared, Confused, Calm

## Migration to API (When Backend is Ready)

### Step 1: Create API Service

Create a new file: `src/lib/api/cards.ts`

```typescript
import { VisualCard } from "@/lib/constants/presets";

export async function fetchCards(sessionId: string): Promise<VisualCard[]> {
  const response = await fetch(`/api/cards?sessionId=${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }
  
  const data = await response.json();
  return data.cards;
}
```

### Step 2: Update Child Page

In `src/app/(routes)/child/page.tsx`:

**Current (Demo):**
```typescript
import { getDemoCards } from "@/lib/constants/demoCards";
// ...
const [availableCards] = useState<VisualCard[]>(getDemoCards());
```

**Replace with (API):**
```typescript
import { fetchCards } from "@/lib/api/cards";
// ...
const [availableCards, setAvailableCards] = useState<VisualCard[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function loadCards() {
    if (activeSessionId) {
      try {
        setIsLoading(true);
        const cards = await fetchCards(activeSessionId);
        setAvailableCards(cards);
      } catch (error) {
        console.error("Failed to load cards:", error);
        setStatus("Failed to load cards");
      } finally {
        setIsLoading(false);
      }
    }
  }
  loadCards();
}, [activeSessionId]);
```

### Step 3: Add Loading State (Optional)

Add a loading indicator while fetching:

```typescript
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="text-slate-500">Loading cards...</div>
  </div>
) : (
  // ... existing card rendering
)}
```

### Step 4: Delete Demo Files (Optional)

Once API is working, you can safely delete:
- `src/lib/constants/demoCards.ts`
- `src/lib/constants/DEMO_CARDS_README.md` (this file)

## Testing Checklist

- [ ] API endpoint `/api/cards` returns cards in correct format
- [ ] Cards include all required fields: `id`, `title`, `category`, `createdAt`
- [ ] Cards are properly categorized: `topic`, `action`, `emotion`
- [ ] Error handling works when API fails
- [ ] Loading state displays correctly
- [ ] Selected cards persist during session
- [ ] Remove selection functionality works with API cards

## Card Data Structure

Ensure your API returns cards matching this structure:

```typescript
interface VisualCard {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: "topic" | "action" | "emotion" | "response";
  createdAt: string;
}
```

## Notes

- Demo cards are currently hardcoded and always available
- API cards should be session-specific
- Consider implementing card caching for better performance
- Add refresh functionality to reload cards from API
