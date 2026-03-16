-- SyncBoard Database Schema for InsForge (PostgreSQL)

-- The 'notes' table stores all sticky notes and their properties.
-- Real-time updates are handled by InsForge Realtime, and data is persisted here.

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,          -- Unique ID (nanoid generated on client)
  board_id TEXT NOT NULL DEFAULT 'default', -- Room/Board ID for collaboration
  text TEXT DEFAULT '',         -- Content of the sticky note
  x FLOAT NOT NULL,             -- X coordinate on the canvas
  y FLOAT NOT NULL,             -- Y coordinate on the canvas
  width FLOAT DEFAULT 256,      -- Width of the sticky note (px)
  height FLOAT DEFAULT 160,     -- Height of the sticky note (px)
  color TEXT NOT NULL,          -- Background color class (e.g., bg-yellow-200)
  upvotes INTEGER DEFAULT 0,    -- Number of thumbs up
  downvotes INTEGER DEFAULT 0,  -- Number of thumbs down
  upvoted_by TEXT[] DEFAULT '{}', -- Array of user IDs who upvoted
  downvoted_by TEXT[] DEFAULT '{}', -- Array of user IDs who downvoted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster filtering by board_id
CREATE INDEX IF NOT EXISTS idx_notes_board_id ON notes(board_id);

-- Enable Row Level Security (RLS) if needed, or keep it public for this boilerplate.
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public Access" ON notes FOR ALL USING (true);
