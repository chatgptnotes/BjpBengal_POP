-- Election Results Table for 2026 Prediction System
-- Contains 2021 Assembly + 2024 Lok Sabha results for prediction model

CREATE TABLE IF NOT EXISTS election_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Constituency Info
  constituency_id TEXT UNIQUE NOT NULL,
  constituency_name TEXT NOT NULL,
  district TEXT NOT NULL,

  -- 2021 West Bengal Assembly Election Results
  bjp_votes_2021 INTEGER DEFAULT 0,
  tmc_votes_2021 INTEGER DEFAULT 0,
  others_votes_2021 INTEGER DEFAULT 0,
  total_votes_2021 INTEGER DEFAULT 0,
  bjp_share_2021 FLOAT DEFAULT 0,
  tmc_share_2021 FLOAT DEFAULT 0,
  winner_2021 TEXT,
  margin_2021 INTEGER DEFAULT 0,

  -- 2024 Lok Sabha Results (mapped to assembly segments)
  bjp_votes_2024_ls INTEGER DEFAULT 0,
  tmc_votes_2024_ls INTEGER DEFAULT 0,
  bjp_share_2024_ls FLOAT DEFAULT 0,
  tmc_share_2024_ls FLOAT DEFAULT 0,

  -- Calculated Fields
  bjp_swing FLOAT DEFAULT 0,  -- Change from 2021 to 2024
  tmc_swing FLOAT DEFAULT 0,

  -- Prediction Factors (manually updatable)
  ground_report_bjp FLOAT DEFAULT 50,  -- 0-100 scale
  ground_report_tmc FLOAT DEFAULT 50,
  local_issues TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_election_results_district ON election_results(district);
CREATE INDEX IF NOT EXISTS idx_election_results_winner ON election_results(winner_2021);
CREATE INDEX IF NOT EXISTS idx_election_results_bjp_share ON election_results(bjp_share_2021 DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_election_results_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_election_results_updated ON election_results;
CREATE TRIGGER trigger_election_results_updated
  BEFORE UPDATE ON election_results
  FOR EACH ROW
  EXECUTE FUNCTION update_election_results_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON election_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON election_results TO authenticated;

COMMENT ON TABLE election_results IS 'Historical election results for 2026 WB Assembly prediction model';
