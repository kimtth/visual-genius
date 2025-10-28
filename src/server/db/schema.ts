export const createTablesSql = `
CREATE TABLE IF NOT EXISTS conversation_session (
  id UUID PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_card (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES conversation_session(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utterance (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES conversation_session(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  card_id UUID REFERENCES visual_card(id),
  transcript TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
