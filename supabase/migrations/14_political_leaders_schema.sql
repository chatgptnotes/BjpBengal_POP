-- =====================================================
-- Political Leaders Analysis Schema
-- Migration: 14_political_leaders_schema.sql
-- Description: Tables for leader performance, metrics,
--              election results, and sentiment tracking
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. POLITICAL_LEADERS TABLE
-- Core table for political leader information
-- =====================================================
CREATE TABLE IF NOT EXISTS political_leaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_bengali VARCHAR(255),
    party VARCHAR(50) NOT NULL,
    party_color VARCHAR(20) DEFAULT '#666666',
    position VARCHAR(255),
    constituency VARCHAR(100),
    constituency_id VARCHAR(100),
    district VARCHAR(100),
    photo_url TEXT,
    twitter_handle VARCHAR(100),
    facebook_url TEXT,
    wikipedia_url TEXT,
    is_active BOOLEAN DEFAULT true,
    prominence_score INTEGER DEFAULT 50,
    bio TEXT,
    date_of_birth DATE,
    education TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_political_leaders_party ON political_leaders(party);
CREATE INDEX IF NOT EXISTS idx_political_leaders_constituency ON political_leaders(constituency_id);
CREATE INDEX IF NOT EXISTS idx_political_leaders_active ON political_leaders(is_active);
CREATE INDEX IF NOT EXISTS idx_political_leaders_prominence ON political_leaders(prominence_score DESC);

-- =====================================================
-- 2. LEADER_METRICS TABLE
-- Performance metrics for each leader
-- =====================================================
CREATE TABLE IF NOT EXISTS leader_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_id UUID NOT NULL REFERENCES political_leaders(id) ON DELETE CASCADE,
    approval_rating DECIMAL(5,2) DEFAULT 50.00,
    sentiment_score DECIMAL(5,4) DEFAULT 0.0000,
    mentions_count INTEGER DEFAULT 0,
    positive_mentions INTEGER DEFAULT 0,
    negative_mentions INTEGER DEFAULT 0,
    neutral_mentions INTEGER DEFAULT 0,
    trend VARCHAR(10) DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
    trend_change DECIMAL(5,2) DEFAULT 0.00,
    twitter_followers INTEGER DEFAULT 0,
    facebook_followers INTEGER DEFAULT 0,
    media_coverage_score DECIMAL(5,2) DEFAULT 0.00,
    week_over_week_change DECIMAL(5,2) DEFAULT 0.00,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (leader_id, period_start, period_end)
);

-- Index for metrics queries
CREATE INDEX IF NOT EXISTS idx_leader_metrics_leader ON leader_metrics(leader_id);
CREATE INDEX IF NOT EXISTS idx_leader_metrics_approval ON leader_metrics(approval_rating DESC);
CREATE INDEX IF NOT EXISTS idx_leader_metrics_updated ON leader_metrics(updated_at DESC);

-- =====================================================
-- 3. ELECTION_RESULTS TABLE
-- Historical election data for 2016, 2021
-- =====================================================
CREATE TABLE IF NOT EXISTS election_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_year INTEGER NOT NULL CHECK (election_year IN (2016, 2021, 2026)),
    election_type VARCHAR(50) DEFAULT 'assembly' CHECK (election_type IN ('assembly', 'loksabha', 'panchayat', 'municipal')),
    constituency_id VARCHAR(100) NOT NULL,
    constituency_name VARCHAR(255) NOT NULL,
    district VARCHAR(100),
    winner_name VARCHAR(255) NOT NULL,
    winner_party VARCHAR(50) NOT NULL,
    winner_votes INTEGER NOT NULL,
    winner_vote_share DECIMAL(5,2),
    runner_up_name VARCHAR(255),
    runner_up_party VARCHAR(50),
    runner_up_votes INTEGER,
    runner_up_vote_share DECIMAL(5,2),
    margin INTEGER,
    margin_percentage DECIMAL(5,2),
    total_votes INTEGER,
    voter_turnout DECIMAL(5,2),
    total_electors INTEGER,
    is_bye_election BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (election_year, constituency_id, election_type, is_bye_election)
);

-- Index for election queries
CREATE INDEX IF NOT EXISTS idx_election_results_year ON election_results(election_year);
CREATE INDEX IF NOT EXISTS idx_election_results_constituency ON election_results(constituency_id);
CREATE INDEX IF NOT EXISTS idx_election_results_winner_party ON election_results(winner_party);
CREATE INDEX IF NOT EXISTS idx_election_results_district ON election_results(district);

-- =====================================================
-- 4. LEADER_SENTIMENT_LOGS TABLE
-- Individual sentiment analysis records
-- =====================================================
CREATE TABLE IF NOT EXISTS leader_sentiment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_id UUID NOT NULL REFERENCES political_leaders(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('news', 'twitter', 'facebook', 'youtube', 'reddit', 'manual')),
    source_url TEXT,
    source_title VARCHAR(500),
    content_snippet TEXT,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    analysis_method VARCHAR(20) DEFAULT 'keyword' CHECK (analysis_method IN ('keyword', 'gemini', 'openai', 'manual')),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for sentiment logs
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_leader ON leader_sentiment_logs(leader_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_sentiment ON leader_sentiment_logs(sentiment);
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_analyzed ON leader_sentiment_logs(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_source ON leader_sentiment_logs(source_type);

-- =====================================================
-- 5. PARTY_STRENGTH_SUMMARY TABLE
-- Aggregated party-wise statistics
-- =====================================================
CREATE TABLE IF NOT EXISTS party_strength_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_year INTEGER NOT NULL,
    party VARCHAR(50) NOT NULL,
    party_color VARCHAR(20),
    seats_won INTEGER DEFAULT 0,
    seats_contested INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    vote_share DECIMAL(5,2) DEFAULT 0.00,
    avg_margin DECIMAL(10,2),
    swing_from_previous DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (election_year, party)
);

-- Index for party strength
CREATE INDEX IF NOT EXISTS idx_party_strength_year ON party_strength_summary(election_year);
CREATE INDEX IF NOT EXISTS idx_party_strength_party ON party_strength_summary(party);

-- =====================================================
-- 6. DATABASE FUNCTIONS
-- =====================================================

-- Function to get party strength data
CREATE OR REPLACE FUNCTION get_party_strength(election_year INTEGER DEFAULT 2021)
RETURNS TABLE (
    party VARCHAR(50),
    party_color VARCHAR(20),
    seats_won BIGINT,
    vote_share DECIMAL(5,2),
    sentiment_score DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.party,
        ps.party_color,
        ps.seats_won::BIGINT,
        ps.vote_share,
        COALESCE(
            (SELECT AVG(lm.sentiment_score)
             FROM leader_metrics lm
             JOIN political_leaders pl ON pl.id = lm.leader_id
             WHERE pl.party = ps.party),
            0.5
        )::DECIMAL(5,4) as sentiment_score
    FROM party_strength_summary ps
    WHERE ps.election_year = get_party_strength.election_year
    ORDER BY ps.seats_won DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get voting trends (2016 vs 2021)
CREATE OR REPLACE FUNCTION get_voting_trends()
RETURNS TABLE (
    party VARCHAR(50),
    party_color VARCHAR(20),
    vote_share_2016 DECIMAL(5,2),
    vote_share_2021 DECIMAL(5,2),
    change DECIMAL(5,2),
    seats_2016 INTEGER,
    seats_2021 INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p21.party,
        p21.party_color,
        COALESCE(p16.vote_share, 0) as vote_share_2016,
        p21.vote_share as vote_share_2021,
        (p21.vote_share - COALESCE(p16.vote_share, 0)) as change,
        COALESCE(p16.seats_won, 0)::INTEGER as seats_2016,
        p21.seats_won::INTEGER as seats_2021
    FROM party_strength_summary p21
    LEFT JOIN party_strength_summary p16 ON p16.party = p21.party AND p16.election_year = 2016
    WHERE p21.election_year = 2021
    ORDER BY p21.seats_won DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update leader metrics aggregation
CREATE OR REPLACE FUNCTION update_leader_metrics_from_logs(p_leader_id UUID)
RETURNS VOID AS $$
DECLARE
    v_positive_count INTEGER;
    v_negative_count INTEGER;
    v_neutral_count INTEGER;
    v_total_count INTEGER;
    v_avg_score DECIMAL(5,4);
    v_sentiment_trend VARCHAR(10);
BEGIN
    -- Count sentiments from last 30 days
    SELECT
        COUNT(*) FILTER (WHERE sentiment = 'positive'),
        COUNT(*) FILTER (WHERE sentiment = 'negative'),
        COUNT(*) FILTER (WHERE sentiment = 'neutral'),
        COUNT(*),
        COALESCE(AVG(score), 0)
    INTO v_positive_count, v_negative_count, v_neutral_count, v_total_count, v_avg_score
    FROM leader_sentiment_logs
    WHERE leader_id = p_leader_id
      AND analyzed_at >= NOW() - INTERVAL '30 days';

    -- Determine trend based on sentiment ratio
    IF v_positive_count > v_negative_count * 1.2 THEN
        v_sentiment_trend := 'up';
    ELSIF v_negative_count > v_positive_count * 1.2 THEN
        v_sentiment_trend := 'down';
    ELSE
        v_sentiment_trend := 'stable';
    END IF;

    -- Upsert metrics
    INSERT INTO leader_metrics (
        leader_id,
        mentions_count,
        positive_mentions,
        negative_mentions,
        neutral_mentions,
        sentiment_score,
        trend,
        updated_at
    )
    VALUES (
        p_leader_id,
        v_total_count,
        v_positive_count,
        v_negative_count,
        v_neutral_count,
        v_avg_score,
        v_sentiment_trend,
        NOW()
    )
    ON CONFLICT (leader_id, period_start, period_end)
    DO UPDATE SET
        mentions_count = EXCLUDED.mentions_count,
        positive_mentions = EXCLUDED.positive_mentions,
        negative_mentions = EXCLUDED.negative_mentions,
        neutral_mentions = EXCLUDED.neutral_mentions,
        sentiment_score = EXCLUDED.sentiment_score,
        trend = EXCLUDED.trend,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. SEED DATA - Key West Bengal Political Leaders
-- =====================================================

-- Insert major political leaders
INSERT INTO political_leaders (name, name_bengali, party, party_color, position, constituency, photo_url, is_active, prominence_score) VALUES
('Mamata Banerjee', 'মমতা বন্দ্যোপাধ্যায়', 'TMC', '#00BFFF', 'Chief Minister', 'Bhowanipore', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Mamata_Banerjee_in_2017.jpg/220px-Mamata_Banerjee_in_2017.jpg', true, 100),
('Suvendu Adhikari', 'শুভেন্দু অধিকারী', 'BJP', '#FF9933', 'Leader of Opposition', 'Nandigram', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Suvendu_Adhikari.jpg/220px-Suvendu_Adhikari.jpg', true, 95),
('Dilip Ghosh', 'দিলীপ ঘোষ', 'BJP', '#FF9933', 'Former State President', 'Kharagpur', NULL, true, 85),
('Abhishek Banerjee', 'অভিষেক বন্দ্যোপাধ্যায়', 'TMC', '#00BFFF', 'National General Secretary', 'Diamond Harbour', NULL, true, 90),
('Partha Chatterjee', 'পার্থ চট্টোপাধ্যায়', 'TMC', '#00BFFF', 'Former Minister', 'Behala Paschim', NULL, false, 60),
('Adhir Ranjan Chowdhury', 'অধীর রঞ্জন চৌধুরী', 'INC', '#00FF00', 'State Congress President', 'Berhampore', NULL, true, 75),
('Biman Bose', 'বিমান বসু', 'CPIM', '#FF0000', 'Former Left Front Chairman', NULL, NULL, true, 65),
('Surya Kanta Mishra', 'সূর্যকান্ত মিশ্র', 'CPIM', '#FF0000', 'State Secretary', NULL, NULL, true, 60)
ON CONFLICT DO NOTHING;

-- Insert party strength summary for 2021
INSERT INTO party_strength_summary (election_year, party, party_color, seats_won, seats_contested, vote_share) VALUES
(2021, 'TMC', '#00BFFF', 213, 294, 47.94),
(2021, 'BJP', '#FF9933', 77, 294, 38.13),
(2021, 'INC', '#00FF00', 0, 92, 2.93),
(2021, 'CPIM', '#FF0000', 0, 189, 4.73),
(2021, 'Others', '#808080', 4, 294, 6.27)
ON CONFLICT (election_year, party) DO UPDATE SET
    seats_won = EXCLUDED.seats_won,
    vote_share = EXCLUDED.vote_share;

-- Insert party strength summary for 2016
INSERT INTO party_strength_summary (election_year, party, party_color, seats_won, seats_contested, vote_share) VALUES
(2016, 'TMC', '#00BFFF', 211, 294, 44.91),
(2016, 'BJP', '#FF9933', 3, 291, 10.16),
(2016, 'INC', '#00FF00', 44, 92, 12.25),
(2016, 'CPIM', '#FF0000', 26, 189, 19.75),
(2016, 'Others', '#808080', 10, 294, 12.93)
ON CONFLICT (election_year, party) DO UPDATE SET
    seats_won = EXCLUDED.seats_won,
    vote_share = EXCLUDED.vote_share;

-- Insert sample election results for key constituencies
INSERT INTO election_results (election_year, constituency_id, constituency_name, district, winner_name, winner_party, winner_votes, winner_vote_share, runner_up_name, runner_up_party, runner_up_votes, margin, voter_turnout) VALUES
(2021, 'wb_kolkata_bhowanipore', 'Bhowanipore', 'Kolkata', 'Sobhandeb Chattopadhyay', 'TMC', 78355, 56.2, 'Rudranil Ghosh', 'BJP', 54289, 24066, 65.3),
(2021, 'wb_purba_midnapur_nandigram', 'Nandigram', 'Purba Medinipur', 'Suvendu Adhikari', 'BJP', 101568, 50.8, 'Mamata Banerjee', 'TMC', 100056, 1512, 88.1),
(2021, 'wb_south_24_parganas_diamond_harbour', 'Diamond Harbour', 'South 24 Parganas', 'Abhishek Banerjee', 'TMC', 156547, 72.4, 'Dipak Haldar', 'BJP', 52344, 104203, 80.5),
(2021, 'wb_murshidabad_berhampore', 'Berhampore', 'Murshidabad', 'Adhir Ranjan Chowdhury', 'INC', 89234, 48.2, 'Gouri Sankar Ghosh', 'TMC', 75432, 13802, 78.9),
(2021, 'wb_paschim_midnapur_kharagpur', 'Kharagpur', 'Paschim Medinipur', 'Dilip Ghosh', 'BJP', 98765, 55.3, 'Sambhunath Chatterjee', 'TMC', 67890, 30875, 76.4),
(2016, 'wb_kolkata_bhowanipore', 'Bhowanipore', 'Kolkata', 'Sobhandeb Chattopadhyay', 'TMC', 65432, 52.1, 'Deepa Dasmunshi', 'INC', 35678, 29754, 62.1),
(2016, 'wb_purba_midnapur_nandigram', 'Nandigram', 'Purba Medinipur', 'Suvendu Adhikari', 'TMC', 89234, 58.9, 'Prashanta Mandal', 'CPIM', 45678, 43556, 82.3),
(2016, 'wb_south_24_parganas_diamond_harbour', 'Diamond Harbour', 'South 24 Parganas', 'Dipak Haldar', 'TMC', 123456, 65.4, 'Manoranjan Byapari', 'CPIM', 45678, 77778, 76.8)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE political_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_sentiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_strength_summary ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required for read operations)
CREATE POLICY "Allow public read on political_leaders" ON political_leaders
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on leader_metrics" ON leader_metrics
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on election_results" ON election_results
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on leader_sentiment_logs" ON leader_sentiment_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on party_strength_summary" ON party_strength_summary
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow auth insert on leader_sentiment_logs" ON leader_sentiment_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow auth update on leader_metrics" ON leader_metrics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_political_leaders_updated_at
    BEFORE UPDATE ON political_leaders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leader_metrics_updated_at
    BEFORE UPDATE ON leader_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_party_strength_updated_at
    BEFORE UPDATE ON party_strength_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION
-- =====================================================
