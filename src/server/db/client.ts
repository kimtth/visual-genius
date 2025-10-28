import { Pool } from "pg";
import { log } from "@/lib/observability/logger";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  log({
    level: "warn",
    message: "POSTGRES_URL is not configured; database calls will fail"
  });
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
