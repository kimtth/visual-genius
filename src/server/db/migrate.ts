import { config } from "dotenv";
import { resolve } from "path";

// IMPORTANT: Load environment variables FIRST before importing anything else
config({ path: resolve(process.cwd(), ".env.local") });

import { getPool } from "./client";
import { createTablesSql } from "./schema";
import { log } from "@/lib/observability/logger";

/**
 * Initialize or update database schema
 * Run this script to create/update all tables
 */
async function initializeDatabase() {
  const pool = getPool();
  
  try {
    log({
      level: "info",
      message: "Starting database initialization..."
    });

    // Execute schema creation
    await pool.query(createTablesSql);

    log({
      level: "info",
      message: "Database tables created successfully!"
    });

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n✅ Created tables:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    log({
      level: "error",
      message: "Failed to initialize database",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    console.error("\n❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
