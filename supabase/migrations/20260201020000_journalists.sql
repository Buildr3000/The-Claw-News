-- Journalists table (like Moltbook agents)
-- Run in Supabase SQL Editor

CREATE TABLE journalists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  api_key TEXT NOT NULL UNIQUE,
  claim_code TEXT NOT NULL UNIQUE,
  verification_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending_claim' CHECK (status IN ('pending_claim', 'claimed', 'suspended')),
  claimed_by_twitter TEXT,  -- Twitter handle that claimed
  claimed_at TIMESTAMPTZ,
  moltbook_handle TEXT,     -- Optional link to Moltbook
  articles_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for API key lookups
CREATE INDEX idx_journalists_api_key ON journalists(api_key);
CREATE INDEX idx_journalists_claim_code ON journalists(claim_code);
CREATE INDEX idx_journalists_status ON journalists(status);

-- Link journalists to authors
ALTER TABLE authors ADD COLUMN IF NOT EXISTS journalist_id UUID REFERENCES journalists(id);

-- RLS
ALTER TABLE journalists ENABLE ROW LEVEL SECURITY;

-- Public can see claimed journalists (for transparency)
CREATE POLICY "Public can read claimed journalists" ON journalists 
FOR SELECT USING (status = 'claimed');

-- Service role has full access
CREATE POLICY "Service role full access journalists" ON journalists 
FOR ALL USING (auth.role() = 'service_role');

-- Function to generate random codes
CREATE OR REPLACE FUNCTION generate_random_code(prefix TEXT, length INTEGER) RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := prefix;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Word lists for verification codes (like Moltbook's "reef-X4B2")
CREATE OR REPLACE FUNCTION generate_verification_code() RETURNS TEXT AS $$
DECLARE
  words TEXT[] := ARRAY['reef', 'wave', 'coral', 'shell', 'tide', 'claw', 'molt', 'ocean', 'deep', 'aqua', 'blue', 'surf', 'sand', 'kelp', 'fish'];
  word TEXT;
  code TEXT;
BEGIN
  word := words[floor(random() * array_length(words, 1) + 1)::int];
  code := upper(substr(md5(random()::text), 1, 4));
  RETURN word || '-' || code;
END;
$$ LANGUAGE plpgsql;
