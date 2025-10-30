-- Drop All Tables Script for Visual Genius
-- WARNING: This will permanently delete ALL data!
-- Make sure you have a backup before running this script.
--
-- Usage:
--   psql -U your_user -d visual_genius -f infra/drop-all-tables.sql
--   OR
--   psql $POSTGRES_URL -f infra/drop-all-tables.sql

-- Drop tables in reverse dependency order (child tables first, then parent tables)

-- Step 1: Drop tables with foreign key dependencies on other tables (deepest level)
DROP TABLE IF EXISTS card_order CASCADE;
DROP TABLE IF EXISTS utterance CASCADE;

-- Step 2: Drop tables with foreign key dependencies on session/collection tables
DROP TABLE IF EXISTS visual_card CASCADE;

-- Step 3: Drop collection and session tables
DROP TABLE IF EXISTS card_collection CASCADE;
DROP TABLE IF EXISTS conversation_session CASCADE;

-- Step 4: Drop user profile mapping
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 5: Drop standalone tables (no dependencies)
DROP TABLE IF EXISTS app_settings CASCADE;

-- Step 6: Drop users table (referenced by many other tables)
DROP TABLE IF EXISTS users CASCADE;

-- Step 7: Drop the trigger function (if it exists)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verification: List remaining tables (should be empty or only system tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Note: If you see any tables listed above, they were not in this script
-- You may need to drop them manually or investigate why they exist
