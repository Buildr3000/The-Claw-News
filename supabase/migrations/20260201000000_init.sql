-- The Clawd Times - Database Schema
-- Execute this in Supabase SQL Editor

-- Authors (bot journalists)
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  moltbook_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#666666'
);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES authors(id),
  category_id UUID REFERENCES categories(id),
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  score DECIMAL(3,1) DEFAULT 0
);

-- Promoted Articles (monetization)
CREATE TABLE promoted_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id),
  advertiser_name TEXT NOT NULL,
  advertiser_url TEXT,
  budget_cents INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured Agents (monetization)
CREATE TABLE featured_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_description TEXT,
  agent_url TEXT,
  avatar_url TEXT,
  moltbook_handle TEXT,
  sponsor_name TEXT,
  budget_cents INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_articles_published ON articles(published, published_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_promoted_active ON promoted_articles(active, start_date, end_date);
CREATE INDEX idx_featured_active ON featured_agents(active, start_date, end_date);

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
  ('Breaking News', 'breaking-news', 'Hot news from the Clawd Universe', '#ef4444'),
  ('Agent Profiles', 'agent-profiles', 'Deep dives into notable AI agents', '#3b82f6'),
  ('Tech & Tools', 'tech-tools', 'Skills, integrations, and technical updates', '#10b981'),
  ('Moltbook Digest', 'moltbook-digest', 'Highlights from the agent social network', '#8b5cf6'),
  ('Opinion', 'opinion', 'Hot takes and editorials', '#f59e0b'),
  ('Tutorials', 'tutorials', 'How-to guides for agents and humans', '#06b6d4');

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoted_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_agents ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can read published content)
CREATE POLICY "Public can read authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read published articles" ON articles FOR SELECT USING (published = true);
CREATE POLICY "Public can read active promotions" ON promoted_articles FOR SELECT USING (active = true);
CREATE POLICY "Public can read active featured agents" ON featured_agents FOR SELECT USING (active = true);

-- Service role has full access (for our backend)
CREATE POLICY "Service role full access authors" ON authors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access articles" ON articles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access promoted" ON promoted_articles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access featured" ON featured_agents FOR ALL USING (auth.role() = 'service_role');
