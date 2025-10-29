"use client";

import { create } from "zustand";
import type { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { VisualCard } from "@/lib/constants/presets";
// ConversationEntry is not exported from ConversationTimeline; provide a local fallback type.
// Replace 'any' with a concrete interface when the real type is available.
type ConversationEntry = any;

type ConversationState = "idle" | "active" | "paused";

interface SessionState {
  activeSessionId?: string;
  selectedCards: VisualCard[];
  timeline: ConversationEntry[];
  currentSpeaker: "parent" | "child";
  conversationState: ConversationState;
  generatedCards: VisualCard[];
  currentTopic: string;
  setSession: (sessionId: string) => void;
  addCard: (card: VisualCard) => void;
  addEntry: (entry: ConversationEntry) => void;
  clearTimeline: () => void;
  setCurrentSpeaker: (speaker: "parent" | "child") => void;
  setConversationState: (state: ConversationState) => void;
  setGeneratedCards: (cards: VisualCard[]) => void;
  setCurrentTopic: (topic: string) => void;
  reset: () => void;
}

type SetState = (
  partial: Partial<SessionState> | ((state: SessionState) => Partial<SessionState>)
) => void;

const creator = (set: SetState): SessionState => ({
  selectedCards: [],
  timeline: [],
  currentSpeaker: "parent",
  conversationState: "idle",
  generatedCards: [],
  currentTopic: "",
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
  setConversationState: (conversationState: ConversationState) => set({ conversationState }),
  setGeneratedCards: (generatedCards: VisualCard[]) => set({ generatedCards }),
  setCurrentTopic: (currentTopic: string) => set({ currentTopic }),
  reset: () => set({
    activeSessionId: undefined,
    selectedCards: [],
    timeline: [],
    currentSpeaker: "parent",
    conversationState: "idle",
    generatedCards: [],
    currentTopic: ""
  })
});

export const useSessionStore = create<SessionState>(
  (
    persist(
      (set: (partial: Partial<SessionState> | ((state: SessionState) => Partial<SessionState>)) => void) =>
        creator(set as SetState),
      {
        name: "visual-genius-session", // localStorage key
        // Only persist the essential state
        partialize: (state) => ({
          activeSessionId: state.activeSessionId,
          selectedCards: state.selectedCards,
          timeline: state.timeline,
          currentSpeaker: state.currentSpeaker,
          conversationState: state.conversationState,
          generatedCards: state.generatedCards,
          currentTopic: state.currentTopic
        })
      }
    ) as unknown as StateCreator<SessionState>
  )
);

