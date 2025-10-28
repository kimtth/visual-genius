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
          className="rounded-full border border-brand/60 bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
        >
          {card.title}
        </button>
      ))}
    </div>
  );
}
