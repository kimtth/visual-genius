import { withClient } from "./client";
import { log } from "@/lib/observability/logger";
import { createTablesSql } from "./schema";

export interface AppSetting {
  id: string;
  key: string;
  value: string | null;
  isEncrypted: boolean;
  description: string | null;
  updatedAt: string;
  createdAt: string;
}

// In-memory cache for settings (refreshed on server restart or manual refresh)
let settingsCache: Map<string, string> | null = null;

/**
 * Ensure settings schema exists (idempotent)
 */
export async function ensureSettingsSchema(): Promise<void> {
  try {
    await withClient(async (pool) => {
      await pool.query(createTablesSql);
    });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to ensure settings schema",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    throw error;
  }
}

/**
 * Get all settings from the database
 */
export async function getAllSettings(): Promise<AppSetting[]> {
  try {
    return await withClient(async (pool) => {
      const result = await pool.query(
        `SELECT id, key, value, is_encrypted as "isEncrypted", description, 
         updated_at as "updatedAt", created_at as "createdAt"
         FROM app_settings 
         ORDER BY key`
      );
      return result.rows;
    });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to fetch settings",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return [];
  }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<string | null> {
  // Check cache first
  if (settingsCache?.has(key)) {
    return settingsCache.get(key) ?? null;
  }

  try {
    return await withClient(async (pool) => {
      const result = await pool.query(
        "SELECT value FROM app_settings WHERE key = $1",
        [key]
      );
      return result.rows[0]?.value ?? null;
    });
  } catch (error) {
    log({
      level: "error",
      message: `Failed to fetch setting: ${key}`,
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return null;
  }
}

/**
 * Update a setting value
 */
export async function updateSetting(
  key: string,
  value: string | null
): Promise<boolean> {
  try {
    await withClient(async (pool) => {
      await pool.query(
        `UPDATE app_settings 
         SET value = $1, updated_at = NOW() 
         WHERE key = $2`,
        [value, key]
      );
    });

    // Invalidate cache
    settingsCache = null;

    return true;
  } catch (error) {
    log({
      level: "error",
      message: `Failed to update setting: ${key}`,
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return false;
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  settings: Record<string, string | null>
): Promise<boolean> {
  try {
    await withClient(async (pool) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (const [key, value] of Object.entries(settings)) {
          await client.query(
            `UPDATE app_settings 
             SET value = $1, updated_at = NOW() 
             WHERE key = $2`,
            [value, key]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    });

    // Invalidate cache
    settingsCache = null;

    return true;
  } catch (error) {
    log({
      level: "error",
      message: "Failed to update settings batch",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return false;
  }
}

/**
 * Load all settings into cache (called on server start or manually)
 */
export async function loadSettingsCache(): Promise<void> {
  try {
    const settings = await getAllSettings();
    settingsCache = new Map(
      settings
        .filter((s) => s.value !== null)
        .map((s) => [s.key, s.value!])
    );
    
    log({
      level: "info",
      message: `Loaded ${settingsCache.size} settings into cache`
    });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to load settings cache",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
  }
}

/**
 * Get environment value: checks settings DB first, falls back to process.env
 */
export async function getEnvValue(key: string): Promise<string | undefined> {
  // Check settings DB first
  const dbValue = await getSetting(key);
  if (dbValue) {
    return dbValue;
  }

  // Fall back to process.env
  return process.env[key];
}

/**
 * Synchronous version using cache (for use in existing code)
 */
export function getEnvValueSync(key: string): string | undefined {
  // Check cache first
  if (settingsCache?.has(key)) {
    return settingsCache.get(key);
  }

  // Fall back to process.env
  return process.env[key];
}

/**
 * Clear the settings cache
 */
export function clearSettingsCache(): void {
  settingsCache = null;
}
