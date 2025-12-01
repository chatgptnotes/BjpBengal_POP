-- Add 2016 election columns and missing 2021 columns to election_results table
-- This allows infographics to show real historical election data

-- Add missing 2021 columns
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS winner_party_2021 TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS runner_up_2021 TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS runner_up_party_2021 TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS cpim_votes_2021 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS inc_votes_2021 INTEGER DEFAULT 0;

-- Add 2016 Assembly Election columns
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS winner_2016 TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS winner_party_2016 TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS bjp_votes_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS tmc_votes_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS cpim_votes_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS inc_votes_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS others_votes_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS total_votes_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS margin_2016 INTEGER DEFAULT 0;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS runner_up_2016 TEXT;
ALTER TABLE election_results ADD COLUMN IF NOT EXISTS runner_up_party_2016 TEXT;

-- Add index for historical queries
CREATE INDEX IF NOT EXISTS idx_election_results_winner_2016 ON election_results(winner_party_2016);

COMMENT ON COLUMN election_results.winner_party_2021 IS '2021 winning party name (TMC/BJP/CPI(M)/INC/etc)';
COMMENT ON COLUMN election_results.winner_2016 IS '2016 WB Assembly election winner name';
COMMENT ON COLUMN election_results.winner_party_2016 IS '2016 winning party (TMC/CPI(M)/INC/BJP)';
COMMENT ON COLUMN election_results.margin_2016 IS '2016 victory margin in votes';
