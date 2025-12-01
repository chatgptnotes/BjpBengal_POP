-- Create table for constituency-wise issue sentiments
-- Data derived from CSDS-Lokniti 2024 survey + local adjustments

CREATE TABLE IF NOT EXISTS constituency_issue_sentiments (
  id SERIAL PRIMARY KEY,
  constituency_id TEXT NOT NULL,
  issue_category TEXT NOT NULL,
  issue_label TEXT NOT NULL, -- Display name for UI
  concern_percent DECIMAL(5,2) NOT NULL CHECK (concern_percent >= 0 AND concern_percent <= 100),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  trend TEXT NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
  trend_change DECIMAL(5,2) DEFAULT 0,
  priority_rank INTEGER DEFAULT 1, -- 1 = highest priority issue
  data_source TEXT DEFAULT 'Estimated from CSDS 2024',
  last_updated DATE DEFAULT '2024-06-01',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(constituency_id, issue_category)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_issue_sentiments_constituency ON constituency_issue_sentiments(constituency_id);
CREATE INDEX IF NOT EXISTS idx_issue_sentiments_category ON constituency_issue_sentiments(issue_category);

-- Enable RLS
ALTER TABLE constituency_issue_sentiments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on constituency_issue_sentiments"
  ON constituency_issue_sentiments
  FOR SELECT
  USING (true);

-- Allow authenticated users to modify
CREATE POLICY "Allow authenticated users to modify constituency_issue_sentiments"
  ON constituency_issue_sentiments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE constituency_issue_sentiments IS 'Stores voter concern percentages by issue category for each constituency. Data derived from CSDS-Lokniti 2024 national survey with urban/rural/district adjustments.';
COMMENT ON COLUMN constituency_issue_sentiments.concern_percent IS 'Percentage of voters concerned about this issue (0-100)';
COMMENT ON COLUMN constituency_issue_sentiments.sentiment IS 'Overall sentiment: positive (improving), neutral (stable), negative (worsening)';
COMMENT ON COLUMN constituency_issue_sentiments.trend IS 'Recent trend direction: up (increasing concern), down (decreasing), stable';
COMMENT ON COLUMN constituency_issue_sentiments.data_source IS 'Source attribution for the data';
