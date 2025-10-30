export const createTablesSql = `
-- User Authentication and Profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'child', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profile Mapping (parent to children relationships)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INTEGER,
  child_preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  parent_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_card (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES conversation_session(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utterance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES conversation_session(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  card_id UUID REFERENCES visual_card(id),
  transcript TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Card Collections for teaching mode
CREATE TABLE IF NOT EXISTS card_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Card Order within a collection
CREATE TABLE IF NOT EXISTS card_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES card_collection(id) ON DELETE CASCADE,
  card_id UUID NOT NULL,
  card_data JSONB NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, position)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_card_order_collection ON card_order(collection_id, position);
CREATE INDEX IF NOT EXISTS idx_conversation_parent_user ON conversation_session(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_status ON conversation_session(status);
CREATE INDEX IF NOT EXISTS idx_conversation_started_at ON conversation_session(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_parent ON user_profiles(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_visual_card_session ON visual_card(session_id);
CREATE INDEX IF NOT EXISTS idx_utterance_session ON utterance(session_id);

-- Insert default user (for development/demo purposes)
-- UUID: 00000000-0000-0000-0000-000000000001
INSERT INTO users (id, email, password_hash, full_name, role) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'default@visualgenius.local', 'not-used', 'Default User', 'parent')
ON CONFLICT (id) DO NOTHING;

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

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversation_session_updated_at ON conversation_session;
CREATE TRIGGER update_conversation_session_updated_at BEFORE UPDATE ON conversation_session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_collection_updated_at ON card_collection;
CREATE TRIGGER update_card_collection_updated_at BEFORE UPDATE ON card_collection
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;
