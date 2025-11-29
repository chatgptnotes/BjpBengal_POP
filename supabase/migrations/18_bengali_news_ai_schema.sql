-- Migration 18: Bengali News and AI-Generated Attack Points Schema
-- Adds support for Bengali language news and AI-powered attack point generation

-- ============================================
-- 1. Add language support to leader_news_intelligence
-- ============================================

-- Add language column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leader_news_intelligence' AND column_name = 'language'
  ) THEN
    ALTER TABLE leader_news_intelligence ADD COLUMN language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Add Bengali headline column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leader_news_intelligence' AND column_name = 'headline_bengali'
  ) THEN
    ALTER TABLE leader_news_intelligence ADD COLUMN headline_bengali TEXT;
  END IF;
END $$;

-- Add AI analysis columns if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leader_news_intelligence' AND column_name = 'ai_sentiment_score'
  ) THEN
    ALTER TABLE leader_news_intelligence ADD COLUMN ai_sentiment_score DECIMAL(4,3);
    ALTER TABLE leader_news_intelligence ADD COLUMN ai_sentiment_confidence DECIMAL(4,3);
    ALTER TABLE leader_news_intelligence ADD COLUMN ai_model_used TEXT;
    ALTER TABLE leader_news_intelligence ADD COLUMN ai_analyzed_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- 2. AI-Generated Attack Points Table
-- ============================================

CREATE TABLE IF NOT EXISTS ai_generated_attack_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT REFERENCES constituency_leaders(constituency_id) ON DELETE CASCADE,
  target_leader TEXT NOT NULL,
  target_party TEXT NOT NULL,

  -- Attack point content
  attack_point TEXT NOT NULL,
  evidence TEXT,
  attack_type TEXT, -- corruption, legal_trouble, employment, unfulfilled_promise, etc.
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),

  -- Targeting
  affected_voter_groups TEXT[] DEFAULT '{}',
  suggested_messaging JSONB DEFAULT '{}', -- { rally_slogan, door_to_door, social_media }

  -- Source tracking
  source_news_ids UUID[] DEFAULT '{}',
  source_headlines TEXT[] DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Manual verification flag
  times_used INTEGER DEFAULT 0,

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Some attack points become stale
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_attack_points_constituency ON ai_generated_attack_points(constituency_id);
CREATE INDEX IF NOT EXISTS idx_ai_attack_points_leader ON ai_generated_attack_points(target_leader);
CREATE INDEX IF NOT EXISTS idx_ai_attack_points_active ON ai_generated_attack_points(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_attack_points_impact ON ai_generated_attack_points(impact_level);

-- ============================================
-- 3. Vulnerability Score History Table
-- ============================================

CREATE TABLE IF NOT EXISTS vulnerability_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT REFERENCES constituency_leaders(constituency_id) ON DELETE CASCADE,

  -- Score data
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  previous_score INTEGER,
  score_change INTEGER, -- Positive = worsening for opponent, negative = improving

  -- Score breakdown
  score_breakdown JSONB DEFAULT '{}', -- { news_impact, controversy_impact, grievance_impact, margin_risk }

  -- Analysis metadata
  news_analyzed INTEGER DEFAULT 0,
  controversies_found INTEGER DEFAULT 0,
  attack_points_generated INTEGER DEFAULT 0,

  -- Trend
  trend TEXT CHECK (trend IN ('improving', 'stable', 'deteriorating')),

  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for history lookups
CREATE INDEX IF NOT EXISTS idx_vuln_history_constituency ON vulnerability_score_history(constituency_id);
CREATE INDEX IF NOT EXISTS idx_vuln_history_date ON vulnerability_score_history(calculated_at DESC);

-- ============================================
-- 4. Bengali News Sources Configuration
-- ============================================

CREATE TABLE IF NOT EXISTS news_source_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'api', 'scrape')),
  base_url TEXT NOT NULL,
  rss_url TEXT,
  language TEXT DEFAULT 'en',
  region TEXT DEFAULT 'west_bengal',

  -- Rate limiting
  priority INTEGER DEFAULT 5, -- 1 = highest priority
  rate_limit_per_hour INTEGER DEFAULT 100,
  last_fetched_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Bengali news sources
INSERT INTO news_source_config (source_name, source_type, base_url, rss_url, language, region, priority)
VALUES
  ('Anandabazar Patrika', 'rss', 'https://www.anandabazar.com', 'https://www.anandabazar.com/rss/west-bengal', 'bn', 'west_bengal', 1),
  ('Ei Samay', 'rss', 'https://eisamay.com', 'https://eisamay.com/rssfeedstopstories.cms', 'bn', 'west_bengal', 2),
  ('Sangbad Pratidin', 'rss', 'https://www.sangbadpratidin.in', 'https://www.sangbadpratidin.in/feed/', 'bn', 'west_bengal', 3),
  ('Google News Bengali', 'rss', 'https://news.google.com', 'https://news.google.com/rss/search?hl=bn-IN&gl=IN&ceid=IN:bn', 'bn', 'west_bengal', 4),
  ('Google News English', 'rss', 'https://news.google.com', 'https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en', 'en', 'west_bengal', 5),
  ('Times of India Bengal', 'rss', 'https://timesofindia.com', 'https://timesofindia.indiatimes.com/rssfeeds/7658688.cms', 'en', 'west_bengal', 6)
ON CONFLICT (source_name) DO UPDATE SET
  rss_url = EXCLUDED.rss_url,
  is_active = TRUE,
  updated_at = NOW();

-- ============================================
-- 5. Update trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
DROP TRIGGER IF EXISTS update_ai_attack_points_updated_at ON ai_generated_attack_points;
CREATE TRIGGER update_ai_attack_points_updated_at
  BEFORE UPDATE ON ai_generated_attack_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_source_config_updated_at ON news_source_config;
CREATE TRIGGER update_news_source_config_updated_at
  BEFORE UPDATE ON news_source_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE ai_generated_attack_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerability_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_source_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read on ai_attack_points" ON ai_generated_attack_points
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on vuln_history" ON vulnerability_score_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on news_sources" ON news_source_config
  FOR SELECT TO authenticated USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on ai_attack_points" ON ai_generated_attack_points
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on vuln_history" ON vulnerability_score_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on news_sources" ON news_source_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- 7. Views for easy querying
-- ============================================

-- View: Latest vulnerability scores per constituency
CREATE OR REPLACE VIEW v_latest_vulnerability_scores AS
SELECT DISTINCT ON (constituency_id)
  constituency_id,
  score,
  previous_score,
  score_change,
  score_breakdown,
  trend,
  calculated_at
FROM vulnerability_score_history
ORDER BY constituency_id, calculated_at DESC;

-- View: Active attack points with news count
CREATE OR REPLACE VIEW v_active_attack_points AS
SELECT
  ap.*,
  cl.constituency_name,
  cl.district,
  array_length(ap.source_news_ids, 1) as news_source_count
FROM ai_generated_attack_points ap
LEFT JOIN constituency_leaders cl ON ap.constituency_id = cl.constituency_id
WHERE ap.is_active = TRUE
ORDER BY
  CASE ap.impact_level
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END,
  ap.generated_at DESC;

-- ============================================
-- 8. Function to calculate vulnerability score
-- ============================================

CREATE OR REPLACE FUNCTION calculate_vulnerability_score(
  p_constituency_id TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_news_count INTEGER;
  v_negative_count INTEGER;
  v_controversy_count INTEGER;
  v_grievance_count INTEGER;
  v_margin DECIMAL;
  v_score INTEGER;
  v_news_impact DECIMAL;
  v_controversy_impact DECIMAL;
  v_grievance_impact DECIMAL;
  v_margin_risk DECIMAL;
  v_previous_score INTEGER;
BEGIN
  -- Get news metrics
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE sentiment = 'negative'),
    COUNT(*) FILTER (WHERE is_controversy = TRUE)
  INTO v_news_count, v_negative_count, v_controversy_count
  FROM leader_news_intelligence
  WHERE constituency_id = p_constituency_id
    AND published_at >= NOW() - (p_days || ' days')::INTERVAL;

  -- Get grievance count from constituency_issues
  SELECT COUNT(*) INTO v_grievance_count
  FROM constituency_issues
  WHERE constituency_id = p_constituency_id
    AND severity IN ('high', 'critical');

  -- Get election margin
  SELECT ABS(current_mla_margin)::DECIMAL / NULLIF(total_voters, 0) * 100
  INTO v_margin
  FROM constituency_leaders
  WHERE constituency_id = p_constituency_id;

  -- Calculate component scores
  v_news_impact := LEAST(30, COALESCE(v_negative_count::DECIMAL / NULLIF(v_news_count, 0) * 30, 0));
  v_controversy_impact := LEAST(30, COALESCE(v_controversy_count * 10, 0));
  v_grievance_impact := LEAST(20, COALESCE(v_grievance_count * 4, 0));

  -- Margin risk (smaller margin = higher risk for opponent)
  v_margin_risk := CASE
    WHEN v_margin IS NULL THEN 10
    WHEN v_margin < 5 THEN 20
    WHEN v_margin < 10 THEN 15
    WHEN v_margin < 15 THEN 10
    ELSE 5
  END;

  -- Total score
  v_score := LEAST(100, GREATEST(0,
    ROUND(v_news_impact + v_controversy_impact + v_grievance_impact + v_margin_risk)::INTEGER
  ));

  -- Get previous score
  SELECT score INTO v_previous_score
  FROM vulnerability_score_history
  WHERE constituency_id = p_constituency_id
  ORDER BY calculated_at DESC
  LIMIT 1;

  -- Return result
  RETURN jsonb_build_object(
    'score', v_score,
    'previous_score', v_previous_score,
    'score_change', v_score - COALESCE(v_previous_score, v_score),
    'breakdown', jsonb_build_object(
      'news_impact', ROUND(v_news_impact),
      'controversy_impact', ROUND(v_controversy_impact),
      'grievance_impact', ROUND(v_grievance_impact),
      'margin_risk', ROUND(v_margin_risk)
    ),
    'metrics', jsonb_build_object(
      'news_analyzed', v_news_count,
      'negative_news', v_negative_count,
      'controversies', v_controversy_count,
      'grievances', v_grievance_count,
      'margin_pct', ROUND(v_margin, 2)
    ),
    'trend', CASE
      WHEN v_score > COALESCE(v_previous_score, v_score) + 5 THEN 'deteriorating'
      WHEN v_score < COALESCE(v_previous_score, v_score) - 5 THEN 'improving'
      ELSE 'stable'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_vulnerability_score(TEXT, INTEGER) TO authenticated;

COMMENT ON TABLE ai_generated_attack_points IS 'AI-generated attack points from news analysis';
COMMENT ON TABLE vulnerability_score_history IS 'Historical vulnerability scores for trend analysis';
COMMENT ON TABLE news_source_config IS 'Configuration for news sources including Bengali outlets';
COMMENT ON FUNCTION calculate_vulnerability_score IS 'Calculates dynamic vulnerability score based on recent news and data';
