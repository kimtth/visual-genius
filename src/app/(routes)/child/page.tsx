"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/lib/state/sessionStore";
import { QuickResponseTray } from "@/components/cards/QuickResponseTray";
import { quickResponses, VisualCard, CardCategory } from "@/lib/constants/presets";
import { getDemoCards } from "@/lib/constants/demoCards"; // TODO: Replace with API call when backend is ready
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

async function logSelection(
  sessionId: string,
  speaker: "child" | "parent",
  card: VisualCard
) {
  await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      speaker,
      cardId: card.id
    })
  });
}

export default function ChildBoard() {
  const router = useRouter();
  const { 
    activeSessionId, 
    addEntry, 
    currentSpeaker, 
    setCurrentSpeaker,
    generatedCards 
  } = useSessionStore();
  const [status, setStatus] = useState<string | null>(null);
  const [mySelections, setMySelections] = useState<VisualCard[]>([]);
  
  // Use generated cards from session store instead of demo cards
  const [availableCards, setAvailableCards] = useState<VisualCard[]>([]);

  useEffect(() => {
    // Update available cards when generatedCards change
    if (generatedCards && generatedCards.length > 0) {
      setAvailableCards(generatedCards);
    } else {
      // Fallback to demo cards if no cards have been generated yet
      setAvailableCards(getDemoCards());
    }
  }, [generatedCards]);

  const handleCardClick = async (card: VisualCard) => {
    // Add to my selections only if not already selected (prevent duplicates by title)
    setMySelections(prev => {
      const alreadyExists = prev.some(existingCard => existingCard.title === card.title);
      if (alreadyExists) {
        return prev;
      }
      return [...prev, card];
    });

    if (!activeSessionId) {
      setStatus("Session not ready yet");
      return;
    }
  };

  const handleRemoveSelection = (cardId: string) => {
    setMySelections(prev => prev.filter(card => card.id !== cardId));
  };

  const handleSelect = async (card: VisualCard) => {
    // Add to my selections only if not already selected (prevent duplicates by title)
    setMySelections(prev => {
      const alreadyExists = prev.some(existingCard => existingCard.title === card.title);
      if (alreadyExists) {
        return prev;
      }
      return [...prev, card];
    });

    if (!activeSessionId) {
      setStatus("Session not ready yet");
      return;
    }
  };

  const handleNextTurn = async () => {
    // Add all selected cards to timeline at once with same timestamp
    if (mySelections.length > 0) {
      const timestamp = new Date().toISOString();
      mySelections.forEach((card) => {
        addEntry({
          id: crypto.randomUUID(),
          speaker: "child",
          card,
          createdAt: timestamp
        });
      });
    }

    // Send all selected cards before switching turns
    if (mySelections.length > 0 && activeSessionId) {
      try {
        for (const card of mySelections) {
          await logSelection(activeSessionId, "child", card);
        }
        setMySelections([]);
        setCurrentSpeaker("parent");
        router.push("/parent");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to send selections");
      }
    } else {
      setCurrentSpeaker("parent");
      router.push("/parent");
    }
  };

  const categorizeCards = (category: CardCategory) => {
    return availableCards.filter((card: VisualCard) => card.category === category);
  };

  const topicCards = categorizeCards("topic");
  const actionCards = categorizeCards("action");
  const emotionCards = categorizeCards("emotion");

  const hasGeneratedCards = generatedCards && generatedCards.length > 0;

  return (
    <AuthGuard>
    <div className="space-y-6">
      {/* Next Turn Button - Top Right */}
      <div className="fixed top-20 right-6 z-50">
        <Button
          onClick={handleNextTurn}
          size="icon"
          className="h-16 w-16 rounded-full shadow-2xl bg-brand hover:bg-brand-hover"
          title="Next Turn: Parent"
        >
          <ArrowRight className="h-8 w-8" />
        </Button>
      </div>

      {/* No Cards Message */}
      {!hasGeneratedCards && (
        <section className="rounded-2xl border bg-blue-50 border-blue-200 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Waiting for Parent</h2>
          <p className="text-sm text-blue-700">
            Ask your parent to start a conversation first. They will create special cards just for you to use!
          </p>
        </section>
      )}

      {/* Selected Cards Section */}
      <section className="rounded-2xl border bg-white/95 p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">My Selected Cards</h2>
        <div className="flex flex-wrap gap-3 min-h-[60px]">
          {mySelections.length > 0 ? (
            mySelections.map((card) => (
              <div
                key={`selected-${card.id}-${Math.random()}`}
                className="relative flex flex-col items-start gap-2 rounded-lg border border-brand bg-brand/10 px-4 py-2 shadow-sm max-w-xs"
              >
                {card.imageUrl && (
                  <img 
                    src={card.imageUrl} 
                    alt={card.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <span className="text-sm font-medium text-slate-900 whitespace-normal break-words">{card.title}</span>
                <button
                  onClick={() => handleRemoveSelection(card.id)}
                  className="rounded-full p-1 hover:bg-red-100 transition self-start"
                  aria-label="Remove card"
                >
                  <X className="h-3 w-3 text-red-600" />
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full text-sm text-slate-500">
              Select cards below to add them here
            </div>
          )}
        </div>
      </section>

      {/* Three Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Topic Cards */}
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-purple-700 mb-4">Topics</h2>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {topicCards.length > 0 ? (
                topicCards.map((card: VisualCard, index: number) => (
                  <Button
                    key={`topic-${card.id}-${index}`}
                    onClick={() => handleCardClick(card)}
                    variant="outline"
                    className="h-auto flex-col items-center justify-start p-3 text-center transition hover:-translate-y-1 hover:border-purple-500 hover:shadow-md border-purple-200"
                  >
                    {card.imageUrl && (
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 break-words w-full">{card.title}</h3>
                    {card.description && <p className="mt-1 text-xs text-slate-600 line-clamp-2 break-words w-full">{card.description}</p>}
                  </Button>
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 text-center">
                  No topic cards yet
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">Actions</h2>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {actionCards.length > 0 ? (
                actionCards.map((card: VisualCard, index: number) => (
                  <Button
                    key={`action-${card.id}-${index}`}
                    onClick={() => handleCardClick(card)}
                    variant="outline"
                    className="h-auto flex-col items-center justify-start p-3 text-center transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-md border-blue-200"
                  >
                    {card.imageUrl && (
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 break-words w-full">{card.title}</h3>
                    {card.description && <p className="mt-1 text-xs text-slate-600 line-clamp-2 break-words w-full">{card.description}</p>}
                  </Button>
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 text-center">
                  No action cards yet
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Emotion Cards */}
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-green-700 mb-4">Emotions</h2>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {emotionCards.length > 0 ? (
                emotionCards.map((card: VisualCard, index: number) => (
                  <Button
                    key={`emotion-${card.id}-${index}`}
                    onClick={() => handleCardClick(card)}
                    variant="outline"
                    className="h-auto flex-col items-center justify-start p-3 text-center transition hover:-translate-y-1 hover:border-green-500 hover:shadow-md border-green-200"
                  >
                    {card.imageUrl && (
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 break-words w-full">{card.title}</h3>
                    {card.description && <p className="mt-1 text-xs text-slate-600 line-clamp-2 break-words w-full">{card.description}</p>}
                  </Button>
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 text-center">
                  No emotion cards yet
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick answers</h3>
          <QuickResponseTray responses={quickResponses} onSelect={handleSelect} />
        </div>
      </section>
      {status && <p className="text-sm text-red-600 bg-white/95 p-3 rounded-lg">{status}</p>}
    </div>
    </AuthGuard>
  );
}
