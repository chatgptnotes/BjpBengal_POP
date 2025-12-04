-- Local News Table for Bengal Local News (NewsAPI data)
-- Stores news articles fetched from NewsAPI.org

CREATE TABLE IF NOT EXISTS local_news (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Article Content
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,

  -- Source Information
  source_id TEXT,
  source_name TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Geographic Context
  region TEXT DEFAULT 'West Bengal',
  constituency TEXT,

  -- Sentiment Analysis
  sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score NUMERIC(4, 3),

  -- Political Mentions
  bjp_mentioned BOOLEAN DEFAULT false,
  tmc_mentioned BOOLEAN DEFAULT false,
  congress_mentioned BOOLEAN DEFAULT false,

  -- Category & Tags
  category TEXT,
  keywords TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_local_news_published ON local_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_news_source ON local_news(source_name);
CREATE INDEX IF NOT EXISTS idx_local_news_sentiment ON local_news(sentiment);
CREATE INDEX IF NOT EXISTS idx_local_news_bjp ON local_news(bjp_mentioned) WHERE bjp_mentioned = true;
CREATE INDEX IF NOT EXISTS idx_local_news_tmc ON local_news(tmc_mentioned) WHERE tmc_mentioned = true;
CREATE INDEX IF NOT EXISTS idx_local_news_region ON local_news(region);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_local_news_search
ON local_news USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_local_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_local_news_updated_at ON local_news;
CREATE TRIGGER trigger_local_news_updated_at
  BEFORE UPDATE ON local_news
  FOR EACH ROW
  EXECUTE FUNCTION update_local_news_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON local_news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON local_news TO authenticated;

-- Comment
COMMENT ON TABLE local_news IS 'Stores Bengal Local News from NewsAPI.org with sentiment analysis';
