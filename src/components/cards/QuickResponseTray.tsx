"use client";

import { VisualCard } from "@/lib/constants/presets";

interface QuickResponseTrayProps {
  responses: VisualCard[];
  onSelect?: (card: VisualCard) => void;
}

export function QuickResponseTray({ responses, onSelect }: QuickResponseTrayProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {responses.map((card) => (
        <button
          key={card.id}
          onClick={() => onSelect?.(card)}
          className="flex items-center gap-2 rounded-full border border-brand/60 bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
        >
          {card.imageUrl && (
            <img 
              src={card.imageUrl} 
              alt={card.title}
              className="w-6 h-6 object-cover rounded-full bg-white"
            />
          )}
          {card.title}
        </button>
      ))}
    </div>
  );
}
