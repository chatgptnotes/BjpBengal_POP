-- Demographic Sentiment Table
-- Stores sentiment data by demographic category for each constituency

CREATE TABLE IF NOT EXISTS demographic_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id VARCHAR(100) NOT NULL,

  -- Youth (18-30) sentiment percentages
  youth_positive INTEGER DEFAULT 0,
  youth_neutral INTEGER DEFAULT 0,
  youth_negative INTEGER DEFAULT 0,

  -- Women (30+) sentiment percentages
  women_positive INTEGER DEFAULT 0,
  women_neutral INTEGER DEFAULT 0,
  women_negative INTEGER DEFAULT 0,

  -- Urban Middle Class sentiment percentages
  urban_middle_class_positive INTEGER DEFAULT 0,
  urban_middle_class_neutral INTEGER DEFAULT 0,
  urban_middle_class_negative INTEGER DEFAULT 0,

  -- Rural Voters sentiment percentages
  rural_voters_positive INTEGER DEFAULT 0,
  rural_voters_neutral INTEGER DEFAULT 0,
  rural_voters_negative INTEGER DEFAULT 0,

  -- Small Traders sentiment percentages
  small_traders_positive INTEGER DEFAULT 0,
  small_traders_neutral INTEGER DEFAULT 0,
  small_traders_negative INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(constituency_id)
);

-- Enable RLS
ALTER TABLE demographic_sentiment ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read for authenticated" ON demographic_sentiment
  FOR SELECT TO authenticated USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated" ON demographic_sentiment
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON demographic_sentiment
  FOR UPDATE TO authenticated USING (true);

-- Create index for fast lookup by constituency
CREATE INDEX idx_demographic_sentiment_constituency
  ON demographic_sentiment(constituency_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_demographic_sentiment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER demographic_sentiment_updated_at
  BEFORE UPDATE ON demographic_sentiment
  FOR EACH ROW
  EXECUTE FUNCTION update_demographic_sentiment_updated_at();
