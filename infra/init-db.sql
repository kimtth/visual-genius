-- Database initialization script for Visual Genius
-- This script is automatically executed when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversation_session table
CREATE TABLE IF NOT EXISTS conversation_session (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create visual_card table
CREATE TABLE IF NOT EXISTS visual_card (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES conversation_session(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create utterance table
CREATE TABLE IF NOT EXISTS utterance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES conversation_session(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  card_id UUID REFERENCES visual_card(id),
  transcript TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create card_collection table
CREATE TABLE IF NOT EXISTS card_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'default-user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create card_order table
CREATE TABLE IF NOT EXISTS card_order (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES card_collection(id) ON DELETE CASCADE,
  card_id UUID NOT NULL,
  card_data JSONB NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visual_card_session ON visual_card(session_id);
CREATE INDEX IF NOT EXISTS idx_utterance_session ON utterance(session_id);
CREATE INDEX IF NOT EXISTS idx_card_order_collection ON card_order(collection_id, position);

-- Insert default settings
INSERT INTO app_settings (key, description) 
VALUES 
  ('POSTGRES_URL', 'PostgreSQL connection string'),
  ('AZURE_OPENAI_ENDPOINT', 'Azure OpenAI endpoint URL'),
  ('AZURE_OPENAI_API_KEY', 'Azure OpenAI API key (optional if using managed identity)'),
  ('AZURE_OPENAI_DEPLOYMENT_NAME', 'Azure OpenAI deployment name'),
  ('UNSPLASH_ACCESS_KEY', 'Unsplash API access key for image search')
ON CONFLICT (key) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_collection_updated_at BEFORE UPDATE ON card_collection
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your security requirements)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO visualgenius;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO visualgenius;
