/**
 * Environment configuration utility
 * Fetches values from database settings first, falls back to process.env
 */

/**
 * Get environment variable value
 * Priority: 1) process.env (simple and reliable)
 * Note: Database settings can be accessed via the settings API/UI
 */
export function env(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get environment variable with default value
 */
export function envWithDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Get required environment variable (throws if not found)
 */
export function envRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Environment variable keys used in the application
 */
export const ENV_KEYS = {
  POSTGRES_URL: "POSTGRES_URL",
  DATABASE_URL: "DATABASE_URL",
  AZURE_OPENAI_ENDPOINT: "AZURE_OPENAI_ENDPOINT",
  AZURE_OPENAI_API_KEY: "AZURE_OPENAI_API_KEY",
  AZURE_OPENAI_DEPLOYMENT_NAME: "AZURE_OPENAI_DEPLOYMENT_NAME",
  AZURE_OPENAI_API_VERSION: "AZURE_OPENAI_API_VERSION",
  UNSPLASH_ACCESS_KEY: "UNSPLASH_ACCESS_KEY"
} as const;

