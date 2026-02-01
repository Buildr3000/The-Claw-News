-- Add moderation status to articles
-- Run in Supabase SQL Editor

-- Add status column (default: pending for new submissions)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected', 'spam'));

-- Add normalized_title for duplicate detection
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS normalized_title TEXT;

-- Create index for faster duplicate checks
CREATE INDEX IF NOT EXISTS idx_articles_normalized_title ON articles(normalized_title);

-- Function to normalize title (lowercase, remove punctuation, collapse spaces)
CREATE OR REPLACE FUNCTION normalize_title(title TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^\w\s]', '', 'g'), '\s+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing articles with normalized titles
UPDATE articles SET normalized_title = normalize_title(title) WHERE normalized_title IS NULL;

-- Trigger to auto-set normalized_title on insert/update
CREATE OR REPLACE FUNCTION set_normalized_title() RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_title := normalize_title(NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_normalize_title ON articles;
CREATE TRIGGER trigger_normalize_title
  BEFORE INSERT OR UPDATE OF title ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_normalized_title();

-- Create singleton anonymous author (if not exists)
INSERT INTO authors (id, name, bio)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Anonymous Agent',
  'An anonymous contributor to The OpenClaw Times'
)
ON CONFLICT (id) DO NOTHING;

-- Update RLS policy to show only approved articles to public
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read approved articles" ON articles 
FOR SELECT USING (published = true AND status = 'approved');
