-- Add 2025 By-Election columns to election_results table
-- This migration extends the prediction model to include 2025 by-election data

-- 2025 By-Election Vote Data
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS bjp_votes_2025_be INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS tmc_votes_2025_be INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS others_votes_2025_be INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS total_votes_2025_be INTEGER DEFAULT 0;

-- 2025 By-Election Vote Shares
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS bjp_share_2025_be FLOAT DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS tmc_share_2025_be FLOAT DEFAULT 0;

-- 2025 By-Election Results
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS winner_2025_be TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS margin_2025_be INTEGER DEFAULT 0;

-- By-Election Metadata
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS has_2025_byelection BOOLEAN DEFAULT FALSE;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS byelection_date DATE;

-- Swing calculations (2024 to 2025)
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS bjp_swing_2024_to_2025 FLOAT DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS tmc_swing_2024_to_2025 FLOAT DEFAULT 0;

-- Create index for faster queries on 2025 data
CREATE INDEX IF NOT EXISTS idx_election_results_2025_byelection ON election_results(has_2025_byelection);
CREATE INDEX IF NOT EXISTS idx_election_results_bjp_share_2025 ON election_results(bjp_share_2025_be DESC);

COMMENT ON COLUMN election_results.has_2025_byelection IS 'Flag indicating if constituency had a by-election in 2025';
COMMENT ON COLUMN election_results.byelection_date IS 'Date of the 2025 by-election';
COMMENT ON COLUMN election_results.bjp_swing_2024_to_2025 IS 'BJP vote share change from 2024 LS to 2025 by-election';
