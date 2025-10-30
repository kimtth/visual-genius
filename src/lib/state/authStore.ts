"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: "parent" | "admin";
  is_active: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type SetState = (
  partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)
) => void;

const creator = (set: SetState): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  _hasHydrated: false,
  
  setUser: (user: AuthUser | null) => 
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    }),
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  signOut: () => set({ 
    user: null, 
    isAuthenticated: false,
    isLoading: false 
  }),
  
  setHasHydrated: (_hasHydrated: boolean) => set({ _hasHydrated })
});

export const useAuthStore = create<AuthState>(
  persist(
    (set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void) =>
      creator(set as SetState),
    {
      name: "visual-genius-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  ) as unknown as StateCreator<AuthState>
);
