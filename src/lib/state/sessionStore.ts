"use client";

import { create } from "zustand";
import { VisualCard } from "@/lib/constants/presets";
// ConversationEntry is not exported from ConversationTimeline; provide a local fallback type.
// Replace 'any' with a concrete interface when the real type is available.
type ConversationEntry = any;

interface SessionState {
  activeSessionId?: string;
  selectedCards: VisualCard[];
  timeline: ConversationEntry[];
  currentSpeaker: "parent" | "child";
  setSession: (sessionId: string) => void;
  addCard: (card: VisualCard) => void;
  addEntry: (entry: ConversationEntry) => void;
  clearTimeline: () => void;
  setCurrentSpeaker: (speaker: "parent" | "child") => void;
  reset: () => void;
}

type SetState = (
  partial: Partial<SessionState> | ((state: SessionState) => Partial<SessionState>)
) => void;

const creator = (set: SetState): SessionState => ({
  selectedCards: [],
  timeline: [],
  currentSpeaker: "parent",
  setSession: (activeSessionId: string) => set({ activeSessionId, selectedCards: [], timeline: [] }),
  addCard: (card: VisualCard) =>
    set((state: SessionState) => ({
      selectedCards: state.selectedCards.concat(card)
    })),
  addEntry: (entry: ConversationEntry) =>
    set((state: SessionState) => ({
      timeline: state.timeline.concat(entry)
    })),
  clearTimeline: () => set({ timeline: [] }),
  setCurrentSpeaker: (speaker: "parent" | "child") => set({ currentSpeaker: speaker }),
  reset: () => set({ activeSessionId: undefined, selectedCards: [], timeline: [], currentSpeaker: "parent" })
});

export const useSessionStore = create<SessionState>(
  (
    set: (
      partial: Partial<SessionState> | ((state: SessionState) => Partial<SessionState>)
    ) => void
  ) => creator(set as SetState)
);
