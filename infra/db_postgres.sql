-- Ensure the database vgdb is created separately before running this script
-- Manually create the database if it doesn't exist:
-- CREATE DATABASE vgdb;

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
    "user_id" VARCHAR PRIMARY KEY,
    "user_password" VARCHAR,
    "user_name" VARCHAR,
    "deleteFlag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Test Account: sys:sys - To create a hashed password, use "backend\util\hashed_pwd.py":
INSERT INTO "user" (user_id, user_password, user_name, created_at, updated_at)
VALUES ('sys', '<your-hashed-password>', 'sys', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO NOTHING;

-- Create category table
CREATE TABLE IF NOT EXISTS "category" (
    "sid" VARCHAR PRIMARY KEY, 
    "topic" VARCHAR,
    "title" VARCHAR,
    "difficulty" VARCHAR,
    "imgNum" INTEGER,
    "user_id" VARCHAR DEFAULT 'sys',
    "deleteFlag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "user"("user_id")
);

-- Insert into "file_upload" category 
INSERT INTO "category" (sid, topic, title, difficulty, "imgNum", user_id)
VALUES ('file_upload', '-', 'File Upload', 'Easy', 0, 'sys')
ON CONFLICT (sid) DO NOTHING;

-- Create image table
CREATE TABLE IF NOT EXISTS "image" (
    "sid" VARCHAR PRIMARY KEY,
    "categoryId" VARCHAR,
    "title" VARCHAR,
    "imgPath" VARCHAR,
    "user_id" VARCHAR DEFAULT 'sys',
    "deleteFlag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("categoryId") REFERENCES "category"("sid")
);

-- Function to update the modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW; 
END;
$$ LANGUAGE 'plpgsql';

-- Drop existing triggers before creating them to avoid duplication errors
DROP TRIGGER IF EXISTS update_user_modtime ON "user";
DROP TRIGGER IF EXISTS update_category_modtime ON "category";
DROP TRIGGER IF EXISTS update_image_modtime ON "image";

-- Create triggers
CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_category_modtime
BEFORE UPDATE ON "category"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_image_modtime
BEFORE UPDATE ON "image"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
