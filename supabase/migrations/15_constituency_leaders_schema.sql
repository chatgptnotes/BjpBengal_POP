-- =========================================================
-- Migration: 15_constituency_leaders_schema.sql
-- Purpose: Real-time leader tracking for 50 WB constituencies
-- Created: 2025-11-28
-- =========================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. CONSTITUENCY_LEADERS TABLE
-- Fixed data: MLA info, election history
-- =========================================================
CREATE TABLE IF NOT EXISTS constituency_leaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constituency_id VARCHAR(100) UNIQUE NOT NULL,
    constituency_name VARCHAR(255) NOT NULL,
    constituency_name_bengali VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    district_bengali VARCHAR(100),

    -- Current MLA (2021 Election)
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

    -- Previous MLA (2016 Election)
    previous_mla_name VARCHAR(255),
    previous_mla_name_bengali VARCHAR(255),
    previous_mla_party VARCHAR(50),
    previous_mla_votes INTEGER,
    previous_mla_vote_share DECIMAL(5,2),

    -- Runner-up 2021
    runner_up_name VARCHAR(255),
    runner_up_name_bengali VARCHAR(255),
    runner_up_party VARCHAR(50),
    runner_up_votes INTEGER,
    runner_up_vote_share DECIMAL(5,2),

    -- Third place 2021 (often important for triangular fights)
    third_place_name VARCHAR(255),
    third_place_party VARCHAR(50),
    third_place_votes INTEGER,
    third_place_vote_share DECIMAL(5,2),

    -- Election metrics
    total_voters_2021 INTEGER,
    votes_polled_2021 INTEGER,
    voter_turnout_2021 DECIMAL(5,2),
    total_voters_2016 INTEGER,
    votes_polled_2016 INTEGER,

    -- Tracking configuration
    tracking_tier INTEGER DEFAULT 3 CHECK (tracking_tier BETWEEN 1 AND 3),
    is_swing_constituency BOOLEAN DEFAULT false,
    bjp_priority_rank INTEGER,

    -- Metadata
    data_source VARCHAR(100) DEFAULT 'ECI',
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 2. LEADER_DAILY_NEWS TABLE
-- Real-time news per leader
-- =========================================================
CREATE TABLE IF NOT EXISTS leader_daily_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constituency_id VARCHAR(100) REFERENCES constituency_leaders(constituency_id) ON DELETE CASCADE,
    leader_name VARCHAR(255) NOT NULL,
    leader_party VARCHAR(50),

    -- News content
    title TEXT NOT NULL,
    title_bengali TEXT,
    description TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    source VARCHAR(200),
    source_domain VARCHAR(100),
    published_at TIMESTAMPTZ NOT NULL,

    -- Analysis
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score DECIMAL(5,4) CHECK (sentiment_score BETWEEN -1 AND 1),
    is_controversy BOOLEAN DEFAULT false,
    controversy_category VARCHAR(100),
    controversy_severity VARCHAR(20) CHECK (controversy_severity IN ('low', 'medium', 'high', 'critical')),

    -- Keywords and topics
    keywords TEXT[],
    topics TEXT[],
    mentioned_leaders TEXT[],
    mentioned_parties TEXT[],

    -- Deduplication
    content_hash VARCHAR(64) UNIQUE,

    -- Metadata
    fetch_source VARCHAR(50) CHECK (fetch_source IN ('google_rss', 'newsapi', 'twitter', 'manual')),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3. LEADER_SENTIMENT_DAILY TABLE
-- Aggregated daily metrics per leader
-- =========================================================
CREATE TABLE IF NOT EXISTS leader_sentiment_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constituency_id VARCHAR(100) REFERENCES constituency_leaders(constituency_id) ON DELETE CASCADE,
    leader_name VARCHAR(255) NOT NULL,
    leader_party VARCHAR(50),
    date DATE NOT NULL,

    -- News metrics
    news_count INTEGER DEFAULT 0,
    positive_news INTEGER DEFAULT 0,
    negative_news INTEGER DEFAULT 0,
    neutral_news INTEGER DEFAULT 0,

    -- Sentiment
    avg_sentiment_score DECIMAL(5,4),
    sentiment_trend VARCHAR(20) CHECK (sentiment_trend IN ('improving', 'declining', 'stable')),

    -- Approval (calculated)
    approval_rating DECIMAL(5,2),
    approval_change DECIMAL(5,2),

    -- Controversy
    controversy_count INTEGER DEFAULT 0,
    top_controversy TEXT,

    -- Social metrics (from Twitter API)
    social_mentions INTEGER DEFAULT 0,
    social_positive INTEGER DEFAULT 0,
    social_negative INTEGER DEFAULT 0,

    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(constituency_id, leader_name, date)
);

-- =========================================================
-- 4. TMC_MISTAKES_LOG TABLE
-- Track TMC controversies for BJP strategic use
-- =========================================================
CREATE TABLE IF NOT EXISTS tmc_mistakes_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constituency_id VARCHAR(100),
    leader_name VARCHAR(255) NOT NULL,
    leader_name_bengali VARCHAR(255),
    party VARCHAR(50) DEFAULT 'TMC',

    -- Mistake details
    date DATE NOT NULL,
    headline TEXT NOT NULL,
    headline_bengali TEXT,
    description TEXT,
    description_bengali TEXT,
    source_url TEXT,
    source_name VARCHAR(200),

    -- Classification
    category VARCHAR(100) CHECK (category IN (
        'corruption', 'violence', 'governance', 'scandal',
        'election_malpractice', 'nepotism', 'administrative_failure',
        'public_protest', 'judicial_action', 'other'
    )),
    sub_category VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Impact
    affected_area VARCHAR(255),
    estimated_affected_people INTEGER,
    media_coverage_level VARCHAR(20) CHECK (media_coverage_level IN ('local', 'regional', 'national', 'international')),

    -- BJP usage
    can_use_in_campaign BOOLEAN DEFAULT true,
    campaign_usage_notes TEXT,
    related_bjp_response TEXT,

    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(255),
    verification_source TEXT,

    -- Keywords for search
    keywords TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 5. SWING_CONSTITUENCIES TABLE
-- Priority constituencies for BJP
-- =========================================================
CREATE TABLE IF NOT EXISTS swing_constituencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constituency_id VARCHAR(100) UNIQUE REFERENCES constituency_leaders(constituency_id) ON DELETE CASCADE,

    -- 2021 Election data
    margin_2021 INTEGER,
    winner_party_2021 VARCHAR(50),
    bjp_votes_2021 INTEGER,
    bjp_vote_share_2021 DECIMAL(5,2),
    tmc_votes_2021 INTEGER,
    tmc_vote_share_2021 DECIMAL(5,2),
    left_votes_2021 INTEGER,
    left_vote_share_2021 DECIMAL(5,2),

    -- 2016 Election data
    margin_2016 INTEGER,
    winner_party_2016 VARCHAR(50),
    bjp_votes_2016 INTEGER,
    bjp_vote_share_2016 DECIMAL(5,2),
    tmc_votes_2016 INTEGER,
    tmc_vote_share_2016 DECIMAL(5,2),
    left_votes_2016 INTEGER,
    left_vote_share_2016 DECIMAL(5,2),

    -- Growth analysis
    bjp_growth_votes INTEGER,
    bjp_growth_percentage DECIMAL(5,2),
    tmc_decline_votes INTEGER,
    tmc_decline_percentage DECIMAL(5,2),

    -- Current sentiment
    current_bjp_sentiment DECIMAL(5,4),
    current_tmc_sentiment DECIMAL(5,4),
    sentiment_gap DECIMAL(5,4),

    -- Swing calculation
    swing_potential VARCHAR(20) CHECK (swing_potential IN ('very_high', 'high', 'medium', 'low')),
    swing_score DECIMAL(5,2),
    priority_rank INTEGER,

    -- Strategic notes
    key_issues TEXT[],
    demographic_advantage TEXT,
    recommended_strategy TEXT,

    -- Metadata
    last_analyzed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 6. BJP_TMC_COMPARISON TABLE
-- Daily comparison metrics
-- =========================================================
CREATE TABLE IF NOT EXISTS bjp_tmc_comparison (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,

    -- News coverage
    bjp_total_news INTEGER DEFAULT 0,
    tmc_total_news INTEGER DEFAULT 0,
    bjp_positive_news INTEGER DEFAULT 0,
    tmc_positive_news INTEGER DEFAULT 0,
    bjp_negative_news INTEGER DEFAULT 0,
    tmc_negative_news INTEGER DEFAULT 0,

    -- Sentiment
    bjp_avg_sentiment DECIMAL(5,4),
    tmc_avg_sentiment DECIMAL(5,4),

    -- Approval
    bjp_avg_approval DECIMAL(5,2),
    tmc_avg_approval DECIMAL(5,2),

    -- Controversies
    bjp_controversy_count INTEGER DEFAULT 0,
    tmc_controversy_count INTEGER DEFAULT 0,

    -- Social metrics
    bjp_social_mentions INTEGER DEFAULT 0,
    tmc_social_mentions INTEGER DEFAULT 0,
    bjp_social_engagement INTEGER DEFAULT 0,
    tmc_social_engagement INTEGER DEFAULT 0,

    -- Calculated advantage
    news_advantage VARCHAR(10) CHECK (news_advantage IN ('BJP', 'TMC', 'TIE')),
    sentiment_advantage VARCHAR(10) CHECK (sentiment_advantage IN ('BJP', 'TMC', 'TIE')),
    overall_advantage VARCHAR(10) CHECK (overall_advantage IN ('BJP', 'TMC', 'TIE')),

    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 7. NEWS_FETCH_LOG TABLE
-- Track API usage and fetch history
-- =========================================================
CREATE TABLE IF NOT EXISTS news_fetch_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fetch_type VARCHAR(50) NOT NULL,
    constituency_id VARCHAR(100),
    leader_name VARCHAR(255),

    -- API details
    api_source VARCHAR(50),
    api_endpoint TEXT,
    query_used TEXT,

    -- Results
    articles_found INTEGER DEFAULT 0,
    articles_new INTEGER DEFAULT 0,
    articles_duplicate INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) CHECK (status IN ('success', 'partial', 'failed', 'rate_limited')),
    error_message TEXT,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER
);

-- =========================================================
-- INDEXES
-- =========================================================

-- constituency_leaders
CREATE INDEX IF NOT EXISTS idx_cl_constituency_id ON constituency_leaders(constituency_id);
CREATE INDEX IF NOT EXISTS idx_cl_district ON constituency_leaders(district);
CREATE INDEX IF NOT EXISTS idx_cl_current_party ON constituency_leaders(current_mla_party);
CREATE INDEX IF NOT EXISTS idx_cl_tracking_tier ON constituency_leaders(tracking_tier);
CREATE INDEX IF NOT EXISTS idx_cl_swing ON constituency_leaders(is_swing_constituency) WHERE is_swing_constituency = true;

-- leader_daily_news
CREATE INDEX IF NOT EXISTS idx_ldn_constituency ON leader_daily_news(constituency_id);
CREATE INDEX IF NOT EXISTS idx_ldn_leader ON leader_daily_news(leader_name);
CREATE INDEX IF NOT EXISTS idx_ldn_published ON leader_daily_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ldn_sentiment ON leader_daily_news(sentiment);
CREATE INDEX IF NOT EXISTS idx_ldn_controversy ON leader_daily_news(is_controversy) WHERE is_controversy = true;
-- Note: Removed expression index on published_at::date as it requires IMMUTABLE function

-- leader_sentiment_daily
CREATE INDEX IF NOT EXISTS idx_lsd_constituency ON leader_sentiment_daily(constituency_id);
CREATE INDEX IF NOT EXISTS idx_lsd_date ON leader_sentiment_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_lsd_party ON leader_sentiment_daily(leader_party);

-- tmc_mistakes_log
CREATE INDEX IF NOT EXISTS idx_tml_leader ON tmc_mistakes_log(leader_name);
CREATE INDEX IF NOT EXISTS idx_tml_date ON tmc_mistakes_log(date DESC);
CREATE INDEX IF NOT EXISTS idx_tml_category ON tmc_mistakes_log(category);
CREATE INDEX IF NOT EXISTS idx_tml_severity ON tmc_mistakes_log(severity);
CREATE INDEX IF NOT EXISTS idx_tml_verified ON tmc_mistakes_log(is_verified);

-- swing_constituencies
CREATE INDEX IF NOT EXISTS idx_sc_priority ON swing_constituencies(priority_rank);
CREATE INDEX IF NOT EXISTS idx_sc_potential ON swing_constituencies(swing_potential);

-- bjp_tmc_comparison
CREATE INDEX IF NOT EXISTS idx_btc_date ON bjp_tmc_comparison(date DESC);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE constituency_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_daily_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_sentiment_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE tmc_mistakes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bjp_tmc_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_fetch_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Public read access for constituency_leaders" ON constituency_leaders;
DROP POLICY IF EXISTS "Public read access for leader_daily_news" ON leader_daily_news;
DROP POLICY IF EXISTS "Public read access for leader_sentiment_daily" ON leader_sentiment_daily;
DROP POLICY IF EXISTS "Public read access for tmc_mistakes_log" ON tmc_mistakes_log;
DROP POLICY IF EXISTS "Public read access for swing_constituencies" ON swing_constituencies;
DROP POLICY IF EXISTS "Public read access for bjp_tmc_comparison" ON bjp_tmc_comparison;
DROP POLICY IF EXISTS "Authenticated insert for leader_daily_news" ON leader_daily_news;
DROP POLICY IF EXISTS "Authenticated insert for leader_sentiment_daily" ON leader_sentiment_daily;
DROP POLICY IF EXISTS "Authenticated insert for tmc_mistakes_log" ON tmc_mistakes_log;
DROP POLICY IF EXISTS "Authenticated insert for news_fetch_log" ON news_fetch_log;

-- Public read access for all tables
CREATE POLICY "Public read access for constituency_leaders"
    ON constituency_leaders FOR SELECT
    USING (true);

CREATE POLICY "Public read access for leader_daily_news"
    ON leader_daily_news FOR SELECT
    USING (true);

CREATE POLICY "Public read access for leader_sentiment_daily"
    ON leader_sentiment_daily FOR SELECT
    USING (true);

CREATE POLICY "Public read access for tmc_mistakes_log"
    ON tmc_mistakes_log FOR SELECT
    USING (true);

CREATE POLICY "Public read access for swing_constituencies"
    ON swing_constituencies FOR SELECT
    USING (true);

CREATE POLICY "Public read access for bjp_tmc_comparison"
    ON bjp_tmc_comparison FOR SELECT
    USING (true);

-- Authenticated users can insert/update
CREATE POLICY "Authenticated insert for leader_daily_news"
    ON leader_daily_news FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated insert for leader_sentiment_daily"
    ON leader_sentiment_daily FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated insert for tmc_mistakes_log"
    ON tmc_mistakes_log FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated insert for news_fetch_log"
    ON news_fetch_log FOR INSERT
    WITH CHECK (true);

-- =========================================================
-- TRIGGERS
-- =========================================================

-- Auto-update updated_at timestamp (function may already exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_constituency_leaders_updated_at ON constituency_leaders;
DROP TRIGGER IF EXISTS update_tmc_mistakes_updated_at ON tmc_mistakes_log;
DROP TRIGGER IF EXISTS update_swing_constituencies_updated_at ON swing_constituencies;

CREATE TRIGGER update_constituency_leaders_updated_at
    BEFORE UPDATE ON constituency_leaders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tmc_mistakes_updated_at
    BEFORE UPDATE ON tmc_mistakes_log
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swing_constituencies_updated_at
    BEFORE UPDATE ON swing_constituencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- VIEWS
-- =========================================================

-- View: Top swing constituencies
CREATE OR REPLACE VIEW v_top_swing_constituencies AS
SELECT
    cl.constituency_name,
    cl.district,
    cl.current_mla_name,
    cl.current_mla_party,
    cl.current_mla_margin,
    sc.bjp_vote_share_2021,
    sc.bjp_growth_percentage,
    sc.swing_potential,
    sc.priority_rank
FROM swing_constituencies sc
JOIN constituency_leaders cl ON sc.constituency_id = cl.constituency_id
WHERE sc.swing_potential IN ('very_high', 'high')
ORDER BY sc.priority_rank;

-- View: Today's leader news
CREATE OR REPLACE VIEW v_today_leader_news AS
SELECT
    ldn.id,
    cl.constituency_name,
    ldn.leader_name,
    ldn.leader_party,
    ldn.title,
    ldn.source,
    ldn.published_at,
    ldn.sentiment,
    ldn.sentiment_score,
    ldn.is_controversy
FROM leader_daily_news ldn
JOIN constituency_leaders cl ON ldn.constituency_id = cl.constituency_id
WHERE DATE(ldn.published_at) = CURRENT_DATE
ORDER BY ldn.published_at DESC;

-- View: TMC recent mistakes
CREATE OR REPLACE VIEW v_tmc_recent_mistakes AS
SELECT
    tml.id,
    tml.leader_name,
    tml.date,
    tml.headline,
    tml.category,
    tml.severity,
    tml.source_name,
    cl.constituency_name,
    cl.district
FROM tmc_mistakes_log tml
LEFT JOIN constituency_leaders cl ON tml.constituency_id = cl.constituency_id
WHERE tml.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY
    CASE tml.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
    END,
    tml.date DESC;

-- View: BJP vs TMC dashboard
CREATE OR REPLACE VIEW v_bjp_tmc_dashboard AS
SELECT
    date,
    bjp_total_news,
    tmc_total_news,
    bjp_positive_news - bjp_negative_news as bjp_net_positive,
    tmc_positive_news - tmc_negative_news as tmc_net_positive,
    ROUND(bjp_avg_sentiment::numeric, 2) as bjp_sentiment,
    ROUND(tmc_avg_sentiment::numeric, 2) as tmc_sentiment,
    bjp_controversy_count,
    tmc_controversy_count,
    overall_advantage
FROM bjp_tmc_comparison
ORDER BY date DESC
LIMIT 30;

-- =========================================================
-- COMPLETED
-- =========================================================
