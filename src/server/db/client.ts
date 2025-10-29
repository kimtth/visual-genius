import { Pool } from "pg";
import { log } from "@/lib/observability/logger";
import { env, ENV_KEYS } from "@/lib/env";

const connectionString = env(ENV_KEYS.POSTGRES_URL) || env(ENV_KEYS.DATABASE_URL);

if (!connectionString) {
  log({
    level: "warn",
    message: "POSTGRES_URL is not configured; database calls will fail"
  });
}

// Validate connection string format
if (connectionString) {
  try {
    const url = new URL(connectionString);
    if (!url.password || typeof url.password !== 'string') {
      log({
        level: "error",
        message: "Invalid POSTGRES_URL: password must be a non-empty string. Ensure special characters in the password are URL-encoded."
      });
    }
  } catch (error) {
    log({
      level: "error",
      message: "Invalid POSTGRES_URL format",
      diagnostics: error instanceof Error ? error.message : String(error)
    });
  }
}

let pool: Pool | undefined;

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, max: 5 });

    pool.on("error", (error: Error) => {
      log({
        level: "error",
        message: "Unexpected database error",
        diagnostics: error.stack
      });
    });
  }

  return pool;
}

export async function withClient<T>(callback: (client: Pool) => Promise<T>) {
  const activePool = getPool();
  return callback(activePool);
}
