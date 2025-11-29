-- Migration: Add BJP columns to news_articles table
-- This migration adds BJP-specific columns for West Bengal BJP tracking

-- =====================================================
-- 1. ADD BJP COLUMNS TO NEWS_ARTICLES
-- =====================================================

-- Add BJP-specific columns (keep TVK columns for backwards compatibility)
ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS bjp_mentioned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bjp_mention_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bjp_context TEXT,
ADD COLUMN IF NOT EXISTS bjp_sentiment_score FLOAT,
ADD COLUMN IF NOT EXISTS bjp_sentiment_polarity VARCHAR(20);

-- Add index for BJP-mentioned articles
CREATE INDEX IF NOT EXISTS idx_news_articles_bjp_mentioned
ON news_articles(bjp_mentioned) WHERE bjp_mentioned = true;

-- Update default language to Bengali for new articles
ALTER TABLE news_articles ALTER COLUMN language SET DEFAULT 'bn';

-- =====================================================
-- 2. CREATE BJP_SENTIMENT_REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bjp_sentiment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Report Period
  report_date DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Article Statistics
  total_articles INTEGER DEFAULT 0,
  bjp_mentioned_articles INTEGER DEFAULT 0,
  analyzed_articles INTEGER DEFAULT 0,

  -- Overall BJP Sentiment
  overall_sentiment_score FLOAT, -- -1 to 1
  overall_sentiment_polarity VARCHAR(20), -- positive, negative, neutral
  sentiment_confidence FLOAT, -- 0 to 1

  -- Sentiment Distribution
  positive_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,

  positive_percentage FLOAT DEFAULT 0,
  neutral_percentage FLOAT DEFAULT 0,
  negative_percentage FLOAT DEFAULT 0,

  -- Emotion Analysis
  dominant_emotion VARCHAR(50),
  emotion_scores JSONB,

  -- Source Breakdown
  source_distribution JSONB,
  top_sources TEXT[],

  -- Geographic Distribution
  state_distribution JSONB,
  district_distribution JSONB,

  -- Key Topics and Keywords
  trending_topics TEXT[],
  top_keywords TEXT[],
  bjp_contexts TEXT[],

  -- Sentiment Trend
  sentiment_change FLOAT,
  trend_direction VARCHAR(20), -- improving, declining, stable

  -- Alert Indicators
  has_crisis BOOLEAN DEFAULT false,
  has_anomaly BOOLEAN DEFAULT false,
  alert_level VARCHAR(20) DEFAULT 'normal', -- normal, warning, critical
  alert_message TEXT,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for BJP sentiment reports
CREATE INDEX IF NOT EXISTS idx_bjp_reports_org ON bjp_sentiment_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_bjp_reports_date ON bjp_sentiment_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_bjp_reports_period ON bjp_sentiment_reports(period_type, start_time DESC);

-- Enable RLS
ALTER TABLE bjp_sentiment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bjp_sentiment_reports
CREATE POLICY "Users can view BJP reports for their organization"
  ON bjp_sentiment_reports FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can insert BJP reports for their organization"
  ON bjp_sentiment_reports FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can update BJP reports for their organization"
  ON bjp_sentiment_reports FOR UPDATE
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Allow service role to bypass RLS for scrapers
CREATE POLICY "Service role can access all BJP reports"
  ON bjp_sentiment_reports FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all news articles"
  ON news_articles FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 3. UPDATE NEWS_SOURCES WITH WEST BENGAL SOURCES
-- =====================================================

-- Insert West Bengal news sources
INSERT INTO news_sources (organization_id, name, short_name, url, language, region, credibility_score, is_verified)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ABP Ananda', 'ABP Ananda', 'https://bengali.abplive.com', 'bn', 'West Bengal', 0.85, true),
  ('11111111-1111-1111-1111-111111111111', 'Anandabazar Patrika', 'ABP', 'https://www.anandabazar.com', 'bn', 'West Bengal', 0.88, true),
  ('11111111-1111-1111-1111-111111111111', 'Ei Samay', 'Ei Samay', 'https://eisamay.com', 'bn', 'West Bengal', 0.84, true),
  ('11111111-1111-1111-1111-111111111111', 'Sangbad Pratidin', 'Sangbad Pratidin', 'https://www.sangbadpratidin.in', 'bn', 'West Bengal', 0.80, true),
  ('11111111-1111-1111-1111-111111111111', 'Zee 24 Ghanta', 'Zee 24 Ghanta', 'https://zeenews.india.com/bengali', 'bn', 'West Bengal', 0.78, true),
  ('11111111-1111-1111-1111-111111111111', 'The Telegraph', 'Telegraph', 'https://www.telegraphindia.com', 'en', 'West Bengal', 0.86, true),
  ('11111111-1111-1111-1111-111111111111', 'The Statesman', 'Statesman', 'https://www.thestatesman.com', 'en', 'West Bengal', 0.84, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. COMMENTS
-- =====================================================
COMMENT ON TABLE bjp_sentiment_reports IS 'Aggregated sentiment reports for BJP party mentions in West Bengal news';
COMMENT ON COLUMN news_articles.bjp_mentioned IS 'Whether BJP party is mentioned in the article';
COMMENT ON COLUMN news_articles.bjp_sentiment_score IS 'Sentiment score specifically for how BJP is portrayed (-1 to 1)';
