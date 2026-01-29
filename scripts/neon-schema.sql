-- Run this in the Neon Console (SQL Editor) to create the cards table.
-- One-time setup per Neon project.

CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_name TEXT NOT NULL DEFAULT '',
  to_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: index for listing by newest first
CREATE INDEX IF NOT EXISTS cards_created_at_desc ON cards (created_at DESC);
