"use client";

import Image from "next/image";
import { VisualCard } from "@/lib/constants/presets";

interface CardBoardProps {
  cards: VisualCard[];
  onSelect?: (card: VisualCard) => void;
}

export function CardBoard({ cards, onSelect }: CardBoardProps) {
  if (!cards.length) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-sm text-slate-500">
        No cards yet. Generate one with a prompt to see suggestions.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <button
          key={`${card.id}-${index}`}
          onClick={() => onSelect?.(card)}
          className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-brand/80 hover:shadow-md"
        >
          {card.imageUrl ? (
            <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-gradient-to-br from-brand/10 to-brand/20 text-brand">
              {card.category.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{card.category}</p>
            <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
            {card.description && <p className="mt-1 text-sm text-slate-600">{card.description}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}
