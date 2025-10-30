/**
 * Client-side helper to get authenticated user ID from authStore
 */

import { useAuthStore } from "@/lib/state/authStore";

/**
 * Get the authenticated user's ID
 * Returns null if user is not authenticated
 */
export function useAuthUserId(): string | null {
  const user = useAuthStore((state) => state.user);
  return user?.id ?? null;
}

/**
 * Get the authenticated user's ID or throw an error
 * Use this when user authentication is required
 */
export function useRequireAuthUserId(): string {
  const userId = useAuthUserId();
  
  if (!userId) {
    throw new Error("User authentication required");
  }
  
  return userId;
}
