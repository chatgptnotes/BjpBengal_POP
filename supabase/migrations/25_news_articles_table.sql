-- News Articles Table for Press Media Monitoring
-- Run this in Supabase SQL Editor to create the table

-- Drop existing table if needed (comment out in production)
-- DROP TABLE IF EXISTS news_articles CASCADE;

CREATE TABLE IF NOT EXISTS news_articles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization (for multi-tenant support)
  organization_id TEXT DEFAULT 'bjp-bengal-default',

  -- Article Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  image_url TEXT,

  -- Source Information
  source VARCHAR(200) NOT NULL,
  author VARCHAR(200),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Geographic Context
  state_id TEXT,
  district_id TEXT,
  constituency_id TEXT,

  -- Language & Classification
  language VARCHAR(10) DEFAULT 'en',
  category VARCHAR(100),
  tags TEXT[],

  -- Sentiment Analysis Results
  sentiment_score FLOAT,
  sentiment_polarity VARCHAR(20) CHECK (sentiment_polarity IN ('positive', 'negative', 'neutral')),
  emotion VARCHAR(50),
  confidence FLOAT,
  analyzed_at TIMESTAMPTZ,

  -- BJP-Specific Analysis
  bjp_mentioned BOOLEAN DEFAULT false,
  bjp_mention_count INTEGER DEFAULT 0,
  bjp_context TEXT,
  bjp_sentiment_score FLOAT,
  bjp_sentiment_polarity VARCHAR(20),

  -- Article Metadata
  word_count INTEGER,
  reading_time_minutes INTEGER,
  credibility_score FLOAT,
  is_verified BOOLEAN DEFAULT false,
  is_breaking BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Engagement Metrics
  engagement INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_news_articles_org ON news_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment_polarity);
CREATE INDEX IF NOT EXISTS idx_news_articles_bjp_mentioned ON news_articles(bjp_mentioned);
CREATE INDEX IF NOT EXISTS idx_news_articles_priority ON news_articles(priority);
CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_breaking ON news_articles(is_breaking);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_news_articles_search
ON news_articles USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_news_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_news_articles_updated_at ON news_articles;
CREATE TRIGGER trigger_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_news_articles_updated_at();

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (for development - tighten in production)
-- CREATE POLICY "Allow all operations" ON news_articles FOR ALL USING (true);

-- Grant permissions to anon and authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON news_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON news_articles TO authenticated;

-- Comment on table
COMMENT ON TABLE news_articles IS 'Stores news articles for Press Media Monitoring with BJP sentiment analysis';
