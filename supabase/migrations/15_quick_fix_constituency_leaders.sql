-- Quick fix: Create constituency_leaders table and seed data
-- Run this in Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS constituency_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id VARCHAR(100) UNIQUE NOT NULL,
    constituency_name VARCHAR(255) NOT NULL,
    constituency_name_bengali VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    district_bengali VARCHAR(100),
    current_mla_name VARCHAR(255) NOT NULL,
    current_mla_name_bengali VARCHAR(255),
    current_mla_party VARCHAR(50) NOT NULL,
    current_mla_gender VARCHAR(20) DEFAULT 'Male',
    current_mla_age INTEGER,
    current_mla_education VARCHAR(255),
    current_mla_profession VARCHAR(255),
    current_mla_photo_url TEXT,
    current_mla_twitter VARCHAR(100),
    current_mla_facebook TEXT,
    current_mla_votes INTEGER,
    current_mla_vote_share DECIMAL(5,2),
    current_mla_margin INTEGER,
    previous_mla_name VARCHAR(255),
    previous_mla_name_bengali VARCHAR(255),
    previous_mla_party VARCHAR(50),
    previous_mla_votes INTEGER,
    previous_mla_vote_share DECIMAL(5,2),
    runner_up_name VARCHAR(255),
    runner_up_name_bengali VARCHAR(255),
    runner_up_party VARCHAR(50),
    runner_up_votes INTEGER,
    runner_up_vote_share DECIMAL(5,2),
    third_place_name VARCHAR(255),
    third_place_party VARCHAR(50),
    third_place_votes INTEGER,
    third_place_vote_share DECIMAL(5,2),
    total_voters_2021 INTEGER,
    votes_polled_2021 INTEGER,
    voter_turnout_2021 DECIMAL(5,2),
    total_voters_2016 INTEGER,
    votes_polled_2016 INTEGER,
    tracking_tier INTEGER DEFAULT 3,
    is_swing_constituency BOOLEAN DEFAULT false,
    bjp_priority_rank INTEGER,
    data_source VARCHAR(100) DEFAULT 'ECI',
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS and add public read policy
ALTER TABLE constituency_leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for constituency_leaders" ON constituency_leaders;
CREATE POLICY "Public read access for constituency_leaders"
    ON constituency_leaders FOR SELECT
    USING (true);

-- 3. Insert sample data for Bhowanipore
INSERT INTO constituency_leaders (
    constituency_id, constituency_name, constituency_name_bengali, district, district_bengali,
    current_mla_name, current_mla_name_bengali, current_mla_party, current_mla_gender,
    current_mla_votes, current_mla_vote_share, current_mla_margin,
    previous_mla_name, previous_mla_party, previous_mla_votes, previous_mla_vote_share,
    runner_up_name, runner_up_party, runner_up_votes, runner_up_vote_share,
    total_voters_2021, votes_polled_2021, voter_turnout_2021,
    tracking_tier, is_swing_constituency, data_source
) VALUES
('wb_kolkata_bhowanipore', 'Bhowanipore', 'ভবানীপুর', 'Kolkata', 'কলকাতা',
 'Mamata Banerjee', 'মমতা বন্দ্যোপাধ্যায়', 'TMC', 'Female',
 85263, 71.9, 58835,
 'Sobhandeb Chattopadhyay', 'TMC', 67210, 65.2,
 'Priyanka Tibrewal', 'BJP', 26428, 22.3,
 165432, 118524, 71.6,
 1, false, 'ECI 2021')
ON CONFLICT (constituency_id) DO NOTHING;

-- Verify the data
SELECT constituency_name, current_mla_name, current_mla_party FROM constituency_leaders;
