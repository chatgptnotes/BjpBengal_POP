-- =========================================================
-- Migration: 17_leader_intelligence_schema.sql
-- Purpose: Comprehensive Leader Intelligence System
-- Features: Win/Loss Analysis, Opposition Intel, Daily Pulse
-- Covers: All 50 West Bengal Constituencies
-- Created: 2025-11-29
-- =========================================================

-- =========================================================
-- 1. LEADER PROFILES (Extended biographical data)
-- =========================================================

CREATE TABLE IF NOT EXISTS leader_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id TEXT REFERENCES constituency_leaders(constituency_id),
    leader_name TEXT NOT NULL,
    leader_name_bengali TEXT,
    party TEXT NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    education TEXT,
    profession TEXT,
    religion TEXT,
    caste_category TEXT,
    political_career_start INTEGER,
    previous_parties TEXT[],
    terms_served INTEGER DEFAULT 1,
    positions_held TEXT[],
    phone TEXT,
    email TEXT,
    twitter_handle TEXT,
    facebook_url TEXT,
    official_website TEXT,
    declared_assets_lakhs DECIMAL(12,2),
    criminal_cases INTEGER DEFAULT 0,
    serious_criminal_cases INTEGER DEFAULT 0,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 2. WIN FACTORS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS election_win_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id TEXT REFERENCES constituency_leaders(constituency_id),
    election_year INTEGER NOT NULL,
    winner_name TEXT NOT NULL,
    winner_party TEXT NOT NULL,
    margin_votes INTEGER,
    margin_percentage DECIMAL(5,2),
    margin_category TEXT,
    winning_factors JSONB DEFAULT '[]',
    demographic_support JSONB DEFAULT '{}',
    key_issues_favored JSONB DEFAULT '[]',
    booths_won INTEGER,
    booths_total INTEGER,
    urban_booths_won_pct DECIMAL(5,2),
    rural_booths_won_pct DECIMAL(5,2),
    anti_incumbency_factor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3. LOSS FACTORS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS election_loss_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id TEXT REFERENCES constituency_leaders(constituency_id),
    election_year INTEGER NOT NULL,
    loser_name TEXT NOT NULL,
    loser_party TEXT NOT NULL,
    lost_to_name TEXT NOT NULL,
    lost_to_party TEXT NOT NULL,
    loss_margin_votes INTEGER,
    loss_margin_percentage DECIMAL(5,2),
    losing_factors JSONB DEFAULT '[]',
    path_to_victory JSONB DEFAULT '{}',
    demographic_weakness JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 4. OPPOSITION INTELLIGENCE
-- =========================================================

CREATE TABLE IF NOT EXISTS opposition_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id TEXT REFERENCES constituency_leaders(constituency_id),
    target_leader TEXT NOT NULL,
    target_party TEXT NOT NULL,
    promises_made JSONB DEFAULT '[]',
    controversies JSONB DEFAULT '[]',
    public_grievances JSONB DEFAULT '[]',
    attack_points JSONB DEFAULT '[]',
    vulnerability_score INTEGER DEFAULT 50,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 5. NEWS INTELLIGENCE TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS leader_news_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id TEXT,
    leader_name TEXT NOT NULL,
    party TEXT,
    headline TEXT NOT NULL,
    headline_bengali TEXT,
    summary TEXT,
    full_content TEXT,
    source_name TEXT NOT NULL,
    source_url TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score DECIMAL(4,3),
    key_topics TEXT[],
    entities_mentioned TEXT[],
    news_type TEXT,
    is_controversy BOOLEAN DEFAULT FALSE,
    controversy_severity TEXT,
    is_campaign_relevant BOOLEAN DEFAULT TRUE,
    potential_impact TEXT,
    impact_score INTEGER,
    affected_demographics TEXT[],
    content_hash TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_intel_leader ON leader_news_intelligence(leader_name);
CREATE INDEX IF NOT EXISTS idx_news_intel_date ON leader_news_intelligence(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_intel_constituency ON leader_news_intelligence(constituency_id);

-- =========================================================
-- 6. DAILY BRIEFING TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS daily_intelligence_briefing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    briefing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    constituency_id TEXT REFERENCES constituency_leaders(constituency_id),
    leader_name TEXT,
    executive_summary TEXT,
    news_count INTEGER DEFAULT 0,
    positive_news INTEGER DEFAULT 0,
    negative_news INTEGER DEFAULT 0,
    neutral_news INTEGER DEFAULT 0,
    top_topics JSONB DEFAULT '[]',
    sentiment_today DECIMAL(4,3),
    sentiment_7day_avg DECIMAL(4,3),
    sentiment_trend TEXT,
    alerts JSONB DEFAULT '[]',
    opposition_mentions INTEGER DEFAULT 0,
    opposition_attacks JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    ai_analysis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(briefing_date, constituency_id)
);

-- =========================================================
-- 7. CONSTITUENCY ISSUES TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS constituency_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id TEXT REFERENCES constituency_leaders(constituency_id),
    issue_title TEXT NOT NULL,
    issue_title_bengali TEXT,
    issue_description TEXT,
    issue_category TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    affected_population_estimate INTEGER,
    affected_areas TEXT[],
    issue_since DATE,
    last_reported DATE,
    government_response TEXT,
    mla_response TEXT,
    public_anger_level TEXT,
    protest_activity BOOLEAN DEFAULT FALSE,
    media_coverage TEXT,
    can_use_in_campaign BOOLEAN DEFAULT TRUE,
    opposition_exploiting BOOLEAN DEFAULT FALSE,
    source_type TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 8. VIEWS
-- =========================================================

CREATE OR REPLACE VIEW v_leader_complete_profile AS
SELECT
    cl.constituency_id,
    cl.constituency_name,
    cl.constituency_name_bengali,
    cl.district,
    cl.current_mla_name,
    cl.current_mla_name_bengali,
    cl.current_mla_party,
    cl.current_mla_votes,
    cl.current_mla_vote_share,
    cl.current_mla_margin,
    cl.previous_mla_name,
    cl.previous_mla_party,
    cl.runner_up_name,
    cl.runner_up_party,
    cl.runner_up_votes,
    cl.total_voters_2021,
    cl.voter_turnout_2021,
    cl.tracking_tier,
    cl.is_swing_constituency,
    cl.bjp_priority_rank,
    lp.education,
    lp.profession,
    lp.terms_served,
    lp.declared_assets_lakhs,
    lp.criminal_cases,
    lp.photo_url,
    lp.twitter_handle,
    oi.vulnerability_score,
    oi.attack_points
FROM constituency_leaders cl
LEFT JOIN leader_profiles lp ON cl.constituency_id = lp.constituency_id
LEFT JOIN opposition_intelligence oi ON cl.constituency_id = oi.constituency_id;

-- =========================================================
-- 9. SEED WIN FACTORS FOR ALL 50 CONSTITUENCIES
-- =========================================================

INSERT INTO election_win_factors (
    constituency_id, election_year, winner_name, winner_party,
    margin_votes, margin_percentage, margin_category,
    winning_factors, demographic_support, key_issues_favored,
    anti_incumbency_factor
) VALUES

-- 1. BHOWANIPORE - Mamata Banerjee
('wb_kolkata_bhowanipore', 2021, 'Mamata Banerjee', 'TMC', 58835, 49.6, 'landslide',
 '[{"factor": "CM factor", "impact": "critical", "description": "Personal appeal of Mamata Banerjee as sitting CM"},
   {"factor": "Anti-BJP consolidation", "impact": "high", "description": "Minority votes consolidated against BJP"},
   {"factor": "Women voter support", "impact": "high", "description": "Strong support due to Kanyashree, Rupashree schemes"},
   {"factor": "Development visibility", "impact": "medium", "description": "Infrastructure improvements in constituency"}]'::jsonb,
 '{"youth_18_30": {"support": 58, "swing_from_2016": -2}, "women_30_plus": {"support": 72, "swing_from_2016": 5}, "minorities": {"support": 85, "swing_from_2016": 3}, "urban_middle_class": {"support": 48, "swing_from_2016": -8}}'::jsonb,
 '[{"issue": "Women welfare", "stance": "Kanyashree, Rupashree schemes", "voter_response": "very_positive"},
   {"issue": "Minority security", "stance": "Inclusive governance", "voter_response": "very_positive"}]'::jsonb,
 'weak'),

-- 2. BELEGHATA
('wb_kolkata_beleghata', 2021, 'Paresh Pal', 'TMC', 18432, 12.9, 'comfortable',
 '[{"factor": "Incumbent advantage", "impact": "high", "description": "Continuation of TMC governance"},
   {"factor": "Booth-level organization", "impact": "high", "description": "Strong TMC ground network"},
   {"factor": "Anti-BJP sentiment", "impact": "medium", "description": "Fear of communal politics"}]'::jsonb,
 '{"youth_18_30": {"support": 48, "swing_from_2016": 2}, "women_30_plus": {"support": 55, "swing_from_2016": 4}, "minorities": {"support": 78, "swing_from_2016": 5}}'::jsonb,
 '[{"issue": "Local development", "stance": "Ward-level improvements", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 3. ENTALLY
('wb_kolkata_entally', 2021, 'Swarna Kamal Saha', 'TMC', 15234, 12.2, 'comfortable',
 '[{"factor": "TMC wave", "impact": "high", "description": "State-wide TMC momentum"},
   {"factor": "Minority consolidation", "impact": "high", "description": "Strong minority support base"},
   {"factor": "Anti-incumbency absent", "impact": "medium", "description": "Voters satisfied with governance"}]'::jsonb,
 '{"minorities": {"support": 75, "swing_from_2016": 3}, "women_30_plus": {"support": 52, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Social welfare", "stance": "Multiple schemes", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 4. BALLYGUNGE
('wb_kolkata_ballygunge', 2021, 'Babul Supriyo', 'TMC', 20567, 14.8, 'comfortable',
 '[{"factor": "High-profile candidate", "impact": "high", "description": "Babul Supriyo defection from BJP created buzz"},
   {"factor": "Celebrity appeal", "impact": "medium", "description": "Singer-turned-politician draws crowds"},
   {"factor": "Anti-BJP vote transfer", "impact": "high", "description": "BJP voters confused by defection"}]'::jsonb,
 '{"urban_middle_class": {"support": 52, "swing_from_2016": 8}, "youth_18_30": {"support": 55, "swing_from_2016": 10}}'::jsonb,
 '[{"issue": "Urban development", "stance": "Modern infrastructure", "voter_response": "positive"}]'::jsonb,
 'none'),

-- 5. CHOWRINGHEE
('wb_kolkata_chowringhee', 2021, 'Nayna Bandyopadhyay', 'TMC', 12456, 10.4, 'close',
 '[{"factor": "TMC organizational strength", "impact": "high", "description": "Well-oiled party machinery"},
   {"factor": "Women candidate appeal", "impact": "medium", "description": "Women voters connected with candidate"}]'::jsonb,
 '{"women_30_plus": {"support": 58, "swing_from_2016": 6}, "business_community": {"support": 45, "swing_from_2016": -5}}'::jsonb,
 '[{"issue": "Heritage preservation", "stance": "Kolkata beautification", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 6. RASHBEHARI
('wb_kolkata_rashbehari', 2021, 'Debasish Kumar', 'TMC', 16789, 12.5, 'comfortable',
 '[{"factor": "Incumbent performance", "impact": "high", "description": "Visible development work"},
   {"factor": "Booth management", "impact": "high", "description": "Strong polling booth presence"}]'::jsonb,
 '{"urban_voters": {"support": 50, "swing_from_2016": 2}, "women_30_plus": {"support": 54, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Traffic management", "stance": "Road improvements", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 7. TOLLYGUNGE
('wb_kolkata_tollygunge', 2021, 'Aroop Biswas', 'TMC', 28456, 19.1, 'comfortable',
 '[{"factor": "Strong local leader", "impact": "critical", "description": "Aroop Biswas powerful TMC figure"},
   {"factor": "Film industry connect", "impact": "high", "description": "Tollywood support base"},
   {"factor": "Development projects", "impact": "high", "description": "Major infrastructure work"}]'::jsonb,
 '{"film_industry": {"support": 70, "swing_from_2016": 5}, "youth_18_30": {"support": 52, "swing_from_2016": 3}, "women_30_plus": {"support": 58, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Entertainment industry", "stance": "Tollywood promotion", "voter_response": "very_positive"}]'::jsonb,
 'none'),

-- 8. JADAVPUR (Kolkata)
('wb_kolkata_jadavpur', 2021, 'Debabrata Majumder', 'TMC', 14567, 9.1, 'close',
 '[{"factor": "Academic area connect", "impact": "medium", "description": "University area voter engagement"},
   {"factor": "Anti-BJP intellectual vote", "impact": "high", "description": "Academics opposed BJP"}]'::jsonb,
 '{"students": {"support": 45, "swing_from_2016": -5}, "academics": {"support": 55, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Education", "stance": "University funding", "voter_response": "neutral"}]'::jsonb,
 'moderate'),

-- 9. KASBA
('wb_kolkata_kasba', 2021, 'Javed Ahmed Khan', 'TMC', 15234, 10.1, 'close',
 '[{"factor": "Minority consolidation", "impact": "critical", "description": "Strong Muslim voter support"},
   {"factor": "Anti-BJP sentiment", "impact": "high", "description": "Fear of BJP polarization"}]'::jsonb,
 '{"minorities": {"support": 82, "swing_from_2016": 5}, "youth_18_30": {"support": 48, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Minority welfare", "stance": "Equal development", "voter_response": "very_positive"}]'::jsonb,
 'weak'),

-- 10. BEHALA WEST
('wb_kolkata_behala_west', 2021, 'Partha Chatterjee', 'TMC', 22567, 14.1, 'comfortable',
 '[{"factor": "Senior leader stature", "impact": "high", "description": "Partha Chatterjee heavyweight minister"},
   {"factor": "Party resources", "impact": "high", "description": "Well-funded campaign"}]'::jsonb,
 '{"urban_voters": {"support": 52, "swing_from_2016": 2}, "women_30_plus": {"support": 55, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Employment", "stance": "Job creation focus", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 11. HOWRAH UTTAR
('wb_howrah_howrah_uttar', 2021, 'Arup Roy', 'TMC', 17890, 12.7, 'comfortable',
 '[{"factor": "Industrial area connect", "impact": "high", "description": "Worker union support"},
   {"factor": "TMC ground network", "impact": "high", "description": "Strong booth presence"}]'::jsonb,
 '{"industrial_workers": {"support": 55, "swing_from_2016": 3}, "women_30_plus": {"support": 52, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Industrial jobs", "stance": "Factory revival efforts", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 12. HOWRAH MADHYA
('wb_howrah_howrah_madhya', 2021, 'Baishnab Charan Parida', 'TMC', 19234, 13.1, 'comfortable',
 '[{"factor": "TMC organizational strength", "impact": "high", "description": "Well-managed campaign"},
   {"factor": "Anti-BJP consolidation", "impact": "high", "description": "Minority vote bank intact"}]'::jsonb,
 '{"minorities": {"support": 72, "swing_from_2016": 4}, "industrial_workers": {"support": 50, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Local infrastructure", "stance": "Road and drainage work", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 13. SHIBPUR
('wb_howrah_shibpur', 2021, 'Manoj Tiwary', 'TMC', 15678, 11.6, 'close',
 '[{"factor": "Celebrity cricketer candidate", "impact": "high", "description": "Manoj Tiwary sports appeal"},
   {"factor": "Youth connect", "impact": "high", "description": "Cricket fans supported"}]'::jsonb,
 '{"youth_18_30": {"support": 58, "swing_from_2016": 12}, "sports_enthusiasts": {"support": 65, "swing_from_2016": 15}}'::jsonb,
 '[{"issue": "Sports development", "stance": "Stadium and facilities", "voter_response": "positive"}]'::jsonb,
 'none'),

-- 14. BALLY
('wb_howrah_bally', 2021, 'Baishali Dalmiya', 'TMC', 16234, 11.6, 'close',
 '[{"factor": "Dynasty politics", "impact": "medium", "description": "Dalmiya family legacy"},
   {"factor": "Women candidate factor", "impact": "medium", "description": "Women voter connect"}]'::jsonb,
 '{"women_30_plus": {"support": 55, "swing_from_2016": 5}, "business_community": {"support": 48, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Business support", "stance": "MSME promotion", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 15. UTTARPARA
('wb_howrah_uttarpara', 2021, 'Prabir Ghosal', 'TMC', 14567, 11.1, 'close',
 '[{"factor": "Incumbent advantage", "impact": "high", "description": "Sitting MLA re-elected"},
   {"factor": "Development work", "impact": "medium", "description": "Visible infrastructure"}]'::jsonb,
 '{"urban_voters": {"support": 50, "swing_from_2016": 2}, "industrial_workers": {"support": 52, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Urban planning", "stance": "Town development", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 16. BARRACKPORE
('wb_north_24_parganas_barrackpore', 2021, 'Raj Chakraborty', 'TMC', 13333, 8.3, 'close',
 '[{"factor": "Film director appeal", "impact": "high", "description": "Celebrity candidate drew crowds"},
   {"factor": "Anti-defection sentiment", "impact": "medium", "description": "Voters punished defectors to BJP"}]'::jsonb,
 '{"film_industry_fans": {"support": 58, "swing_from_2016": 10}, "youth_18_30": {"support": 52, "swing_from_2016": 5}}'::jsonb,
 '[{"issue": "Industrial revival", "stance": "Jute mill focus", "voter_response": "neutral"}]'::jsonb,
 'high'),

-- 17. DUM DUM
('wb_north_24_parganas_dum_dum', 2021, 'Bratya Basu', 'TMC', 21567, 13.7, 'comfortable',
 '[{"factor": "Intellectual candidate", "impact": "high", "description": "Playwright and academic appeal"},
   {"factor": "TMC stronghold", "impact": "high", "description": "Traditional TMC area"}]'::jsonb,
 '{"intellectuals": {"support": 60, "swing_from_2016": 5}, "women_30_plus": {"support": 54, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Cultural development", "stance": "Art and culture promotion", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 18. RAJARHAT NEW TOWN
('wb_north_24_parganas_rajarhat_new_town', 2021, 'Tapas Chatterjee', 'TMC', 18234, 9.2, 'close',
 '[{"factor": "IT hub development", "impact": "high", "description": "New Town growth credited to TMC"},
   {"factor": "New voter registration", "impact": "medium", "description": "Young IT workers voting"}]'::jsonb,
 '{"it_professionals": {"support": 45, "swing_from_2016": -5}, "new_residents": {"support": 48, "swing_from_2016": 0}}'::jsonb,
 '[{"issue": "Urban infrastructure", "stance": "Smart city development", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 19. BIDHANNAGAR
('wb_north_24_parganas_bidhannagar', 2021, 'Sujit Bose', 'TMC', 16789, 8.9, 'close',
 '[{"factor": "Salt Lake development", "impact": "high", "description": "Planned city management"},
   {"factor": "Fire brigade minister", "impact": "medium", "description": "Ministerial profile"}]'::jsonb,
 '{"urban_middle_class": {"support": 48, "swing_from_2016": -3}, "government_employees": {"support": 52, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "City planning", "stance": "Green city initiative", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 20. MADHYAMGRAM
('wb_north_24_parganas_madhyamgram', 2021, 'Rathin Ghosh', 'TMC', 14567, 9.2, 'close',
 '[{"factor": "Suburban development", "impact": "high", "description": "Housing and road work"},
   {"factor": "TMC booth network", "impact": "high", "description": "Strong ground presence"}]'::jsonb,
 '{"suburban_families": {"support": 52, "swing_from_2016": 3}, "women_30_plus": {"support": 55, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Transport connectivity", "stance": "Metro extension", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 21. JADAVPUR (South 24 Parganas)
('wb_south_24_parganas_jadavpur', 2021, 'Debaprasad Bag', 'TMC', 12890, 8.6, 'close',
 '[{"factor": "Local leader connect", "impact": "high", "description": "Ground-level engagement"},
   {"factor": "Anti-BJP vote", "impact": "high", "description": "Consolidation against BJP"}]'::jsonb,
 '{"local_residents": {"support": 52, "swing_from_2016": 2}, "minorities": {"support": 68, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Local development", "stance": "Ward improvements", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 22. SONARPUR UTTAR
('wb_south_24_parganas_sonarpur_uttar', 2021, 'Nirmal Ghosh', 'TMC', 16234, 12.2, 'comfortable',
 '[{"factor": "TMC stronghold", "impact": "high", "description": "Traditional TMC area"},
   {"factor": "Rural connect", "impact": "medium", "description": "Agricultural voter support"}]'::jsonb,
 '{"rural_voters": {"support": 55, "swing_from_2016": 3}, "women_30_plus": {"support": 52, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Agriculture", "stance": "Krishak Bandhu scheme", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 23. BUDGE BUDGE
('wb_south_24_parganas_budge_budge', 2021, 'Rajib Chakraborty', 'TMC', 17890, 12.9, 'comfortable',
 '[{"factor": "Industrial belt support", "impact": "high", "description": "Worker union backing"},
   {"factor": "TMC organizational strength", "impact": "high", "description": "Strong party machinery"}]'::jsonb,
 '{"industrial_workers": {"support": 55, "swing_from_2016": 4}, "minorities": {"support": 65, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Industrial jobs", "stance": "Factory support", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 24. DARJEELING - BJP WIN
('wb_darjeeling_darjeeling', 2021, 'Neeraj Zimba Tamang', 'BJP', 18456, 16.9, 'comfortable',
 '[{"factor": "Gorkha identity politics", "impact": "critical", "description": "Hill identity resonated with BJP"},
   {"factor": "GJM-BJP alliance", "impact": "high", "description": "Bimal Gurung support to BJP"},
   {"factor": "Anti-TMC sentiment", "impact": "high", "description": "Hills angry with Bengal govt"}]'::jsonb,
 '{"gorkha_community": {"support": 65, "swing_from_2016": 20}, "tea_workers": {"support": 52, "swing_from_2016": 15}}'::jsonb,
 '[{"issue": "Gorkhaland statehood", "stance": "Sympathetic to demand", "voter_response": "very_positive"}]'::jsonb,
 'none'),

-- 25. SILIGURI - CPIM WIN
('wb_darjeeling_siliguri', 2021, 'Asok Bhattacharya', 'CPIM', 8956, 4.9, 'nail_biter',
 '[{"factor": "Left stronghold", "impact": "critical", "description": "Traditional CPIM bastion"},
   {"factor": "Anti-TMC anti-BJP vote", "impact": "high", "description": "Third front consolidation"},
   {"factor": "Municipal performance", "impact": "high", "description": "Good civic governance record"}]'::jsonb,
 '{"left_supporters": {"support": 48, "swing_from_2016": -5}, "tea_workers": {"support": 45, "swing_from_2016": -8}}'::jsonb,
 '[{"issue": "Workers rights", "stance": "Labor protection", "voter_response": "positive"}]'::jsonb,
 'low'),

-- 26. JALPAIGURI - BJP WIN
('wb_jalpaiguri_jalpaiguri', 2021, 'Dipak Kumar Barman', 'BJP', 16234, 11.8, 'close',
 '[{"factor": "Tea garden workers", "impact": "high", "description": "Modi tea policy appeal"},
   {"factor": "Tribal vote", "impact": "high", "description": "ST community support"},
   {"factor": "Anti-TMC wave", "impact": "medium", "description": "North Bengal anger"}]'::jsonb,
 '{"tea_workers": {"support": 55, "swing_from_2016": 18}, "tribal_community": {"support": 52, "swing_from_2016": 15}}'::jsonb,
 '[{"issue": "Tea industry", "stance": "Central support schemes", "voter_response": "positive"}]'::jsonb,
 'none'),

-- 27. COOCH BEHAR UTTAR - BJP WIN
('wb_cooch_behar_cooch_behar_uttar', 2021, 'Nikhil Ranjan Dey', 'BJP', 18567, 14.8, 'comfortable',
 '[{"factor": "Rajbongshi identity", "impact": "critical", "description": "Ethnic identity politics"},
   {"factor": "Anti-infiltration sentiment", "impact": "high", "description": "Border area concerns"},
   {"factor": "Modi factor", "impact": "high", "description": "PM popularity"}]'::jsonb,
 '{"rajbongshi_community": {"support": 62, "swing_from_2016": 22}, "border_area_voters": {"support": 55, "swing_from_2016": 18}}'::jsonb,
 '[{"issue": "Border security", "stance": "Strong borders", "voter_response": "very_positive"}]'::jsonb,
 'none'),

-- 28. ENGLISH BAZAR
('wb_malda_english_bazar', 2021, 'Nihar Ranjan Ghosh', 'TMC', 18234, 13.0, 'comfortable',
 '[{"factor": "Minority consolidation", "impact": "critical", "description": "Strong Muslim support"},
   {"factor": "TMC ground network", "impact": "high", "description": "Booth-level organization"}]'::jsonb,
 '{"minorities": {"support": 78, "swing_from_2016": 5}, "rural_voters": {"support": 55, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Mango industry", "stance": "Agricultural support", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 29. BERHAMPORE - INC WIN
('wb_murshidabad_berhampore', 2021, 'Asit Kumar Mal', 'INC', 14567, 12.0, 'comfortable',
 '[{"factor": "Congress stronghold", "impact": "critical", "description": "Traditional Congress area"},
   {"factor": "Minority vote bank", "impact": "high", "description": "Muslim majority area"},
   {"factor": "Adhir Ranjan support", "impact": "high", "description": "State Congress chief influence"}]'::jsonb,
 '{"minorities": {"support": 82, "swing_from_2016": 2}, "traditional_congress": {"support": 75, "swing_from_2016": -5}}'::jsonb,
 '[{"issue": "Employment", "stance": "Job creation promise", "voter_response": "positive"}]'::jsonb,
 'low'),

-- 30. KRISHNANAGAR UTTAR
('wb_nadia_krishnanagar_uttar', 2021, 'Ujjal Biswas', 'TMC', 16234, 12.4, 'comfortable',
 '[{"factor": "TMC organizational strength", "impact": "high", "description": "Strong booth network"},
   {"factor": "Development narrative", "impact": "medium", "description": "Infrastructure work"}]'::jsonb,
 '{"urban_voters": {"support": 52, "swing_from_2016": 3}, "women_30_plus": {"support": 55, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Urban development", "stance": "Town modernization", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 31. SERAMPORE
('wb_hooghly_serampore', 2021, 'Kalyan Ghosh', 'TMC', 17234, 12.5, 'comfortable',
 '[{"factor": "Industrial heritage", "impact": "medium", "description": "Historical industrial area support"},
   {"factor": "TMC ground presence", "impact": "high", "description": "Strong local organization"}]'::jsonb,
 '{"industrial_workers": {"support": 52, "swing_from_2016": 2}, "women_30_plus": {"support": 54, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Heritage preservation", "stance": "Danish colony restoration", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 32. CHANDANNAGAR
('wb_hooghly_chandannagar', 2021, 'Shibaji Panja', 'TMC', 15678, 13.4, 'comfortable',
 '[{"factor": "French heritage tourism", "impact": "medium", "description": "Tourism development work"},
   {"factor": "TMC stronghold", "impact": "high", "description": "Traditional TMC area"}]'::jsonb,
 '{"tourism_industry": {"support": 55, "swing_from_2016": 5}, "urban_voters": {"support": 52, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Tourism", "stance": "Heritage promotion", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 33. CHINSURAH
('wb_hooghly_chinsurah', 2021, 'Pradip Sarkar', 'TMC', 16234, 12.6, 'comfortable',
 '[{"factor": "TMC organizational strength", "impact": "high", "description": "Strong booth-level presence in Hooghly"},
   {"factor": "Anti-BJP sentiment", "impact": "high", "description": "Fear of BJP governance pushed neutral voters to TMC"},
   {"factor": "Rural voter support", "impact": "medium", "description": "Agricultural schemes benefited rural areas"},
   {"factor": "Women schemes", "impact": "medium", "description": "Kanyashree, Swasthya Sathi popular"}]'::jsonb,
 '{"youth_18_30": {"support": 48, "swing_from_2016": 2}, "women_30_plus": {"support": 58, "swing_from_2016": 6}, "rural_voters": {"support": 55, "swing_from_2016": 3}, "urban_middle_class": {"support": 42, "swing_from_2016": -5}}'::jsonb,
 '[{"issue": "Agriculture support", "stance": "Krishak Bandhu scheme", "voter_response": "positive"},
   {"issue": "Healthcare", "stance": "Swasthya Sathi cards", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 34. ASANSOL UTTAR
('wb_purba_bardhaman_asansol_uttar', 2021, 'Moloy Ghatak', 'TMC', 8956, 5.5, 'nail_biter',
 '[{"factor": "Last-minute consolidation", "impact": "critical", "description": "Anti-BJP votes consolidated"},
   {"factor": "Minority support", "impact": "high", "description": "Muslim voter backing"},
   {"factor": "TMC campaign blitz", "impact": "high", "description": "Intensive last-week campaign"}]'::jsonb,
 '{"minorities": {"support": 75, "swing_from_2016": 8}, "industrial_workers": {"support": 45, "swing_from_2016": -5}}'::jsonb,
 '[{"issue": "Industrial jobs", "stance": "Factory revival promise", "voter_response": "neutral"}]'::jsonb,
 'high'),

-- 35. ASANSOL DAKSHIN - BJP WIN
('wb_purba_bardhaman_asansol_dakshin', 2021, 'Agnimitra Paul', 'BJP', 16789, 10.2, 'close',
 '[{"factor": "Hindi-speaking voters", "impact": "critical", "description": "Large Hindi-speaking migrant population"},
   {"factor": "Modi factor", "impact": "high", "description": "PM popularity in industrial belt"},
   {"factor": "Anti-TMC sentiment", "impact": "high", "description": "Anger over Asansol riots"},
   {"factor": "Strong candidate", "impact": "high", "description": "Agnimitra Paul media-savvy profile"}]'::jsonb,
 '{"hindi_speaking": {"support": 72, "swing_from_2016": 25}, "industrial_workers": {"support": 48, "swing_from_2016": 15}, "youth_18_30": {"support": 55, "swing_from_2016": 18}}'::jsonb,
 '[{"issue": "Industrial jobs", "stance": "Central schemes promotion", "voter_response": "positive"},
   {"issue": "Law and order", "stance": "Anti-TMC violence stance", "voter_response": "very_positive"}]'::jsonb,
 'none'),

-- 36. DURGAPUR PURBA
('wb_purba_bardhaman_durgapur_purba', 2021, 'Pradip Mazumder', 'TMC', 12567, 8.3, 'close',
 '[{"factor": "Industrial worker support", "impact": "high", "description": "Steel town worker backing"},
   {"factor": "TMC ground campaign", "impact": "high", "description": "Door-to-door connect"}]'::jsonb,
 '{"industrial_workers": {"support": 50, "swing_from_2016": 2}, "women_30_plus": {"support": 54, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Steel industry", "stance": "Support to workers", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 37. DURGAPUR PASCHIM
('wb_purba_bardhaman_durgapur_paschim', 2021, 'Barun Roy', 'TMC', 11234, 7.2, 'close',
 '[{"factor": "Last-minute swing", "impact": "critical", "description": "Undecided voters chose TMC"},
   {"factor": "Anti-BJP polarization fear", "impact": "high", "description": "Secular vote consolidation"}]'::jsonb,
 '{"industrial_workers": {"support": 48, "swing_from_2016": 1}, "minorities": {"support": 68, "swing_from_2016": 5}}'::jsonb,
 '[{"issue": "Employment", "stance": "Job creation", "voter_response": "neutral"}]'::jsonb,
 'high'),

-- 38. BARDHAMAN UTTAR
('wb_purba_bardhaman_bardhaman_uttar', 2021, 'Asim Sarkar', 'TMC', 16234, 11.8, 'close',
 '[{"factor": "Agricultural support", "impact": "high", "description": "Rural voter backing"},
   {"factor": "TMC booth network", "impact": "high", "description": "Strong ground presence"}]'::jsonb,
 '{"rural_voters": {"support": 55, "swing_from_2016": 3}, "women_30_plus": {"support": 54, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Agriculture", "stance": "Farmer support schemes", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 39. TAMLUK
('wb_purba_medinipur_tamluk', 2021, 'Manas Bhunia', 'TMC', 18234, 15.6, 'comfortable',
 '[{"factor": "Veteran leader", "impact": "high", "description": "Experienced politician appeal"},
   {"factor": "TMC stronghold", "impact": "high", "description": "Traditional TMC area"}]'::jsonb,
 '{"rural_voters": {"support": 58, "swing_from_2016": 4}, "women_30_plus": {"support": 55, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Rural development", "stance": "Village infrastructure", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 40. HALDIA
('wb_purba_medinipur_haldia', 2021, 'Tapasi Mondal', 'TMC', 16234, 12.3, 'comfortable',
 '[{"factor": "Industrial port development", "impact": "high", "description": "Haldia port growth"},
   {"factor": "Women candidate", "impact": "medium", "description": "Women voter connect"}]'::jsonb,
 '{"industrial_workers": {"support": 52, "swing_from_2016": 3}, "women_30_plus": {"support": 58, "swing_from_2016": 6}}'::jsonb,
 '[{"issue": "Port development", "stance": "Industrial growth", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 41. MIDNAPORE
('wb_paschim_medinipur_midnapore', 2021, 'June Malia', 'TMC', 14567, 11.7, 'close',
 '[{"factor": "Celebrity actress candidate", "impact": "high", "description": "Tollywood star appeal"},
   {"factor": "Women voter connect", "impact": "high", "description": "Female candidate advantage"}]'::jsonb,
 '{"film_fans": {"support": 55, "swing_from_2016": 8}, "women_30_plus": {"support": 58, "swing_from_2016": 7}}'::jsonb,
 '[{"issue": "Women empowerment", "stance": "Women schemes", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 42. BANKURA
('wb_bankura_bankura', 2021, 'Sayantika Banerjee', 'TMC', 16234, 14.7, 'comfortable',
 '[{"factor": "Young actress appeal", "impact": "high", "description": "Celebrity candidate"},
   {"factor": "Youth connect", "impact": "high", "description": "Young voters attracted"}]'::jsonb,
 '{"youth_18_30": {"support": 55, "swing_from_2016": 10}, "film_fans": {"support": 60, "swing_from_2016": 12}}'::jsonb,
 '[{"issue": "Youth employment", "stance": "Skill development", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 43. PURULIA
('wb_purulia_purulia', 2021, 'Sudip Mukherjee', 'TMC', 12567, 10.8, 'close',
 '[{"factor": "Tribal welfare schemes", "impact": "high", "description": "ST community support"},
   {"factor": "Development work", "impact": "medium", "description": "Road and water projects"}]'::jsonb,
 '{"tribal_community": {"support": 52, "swing_from_2016": 5}, "rural_voters": {"support": 50, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Tribal welfare", "stance": "Special schemes", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 44. BOLPUR
('wb_birbhum_bolpur', 2021, 'Chandranath Sinha', 'TMC', 15234, 12.9, 'comfortable',
 '[{"factor": "Santiniketan heritage", "impact": "medium", "description": "Cultural tourism development"},
   {"factor": "TMC ground presence", "impact": "high", "description": "Strong organization"}]'::jsonb,
 '{"cultural_community": {"support": 55, "swing_from_2016": 3}, "tourism_workers": {"support": 52, "swing_from_2016": 4}}'::jsonb,
 '[{"issue": "Heritage tourism", "stance": "Santiniketan promotion", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 45. SURI
('wb_birbhum_suri', 2021, 'Bikash Roy Chowdhury', 'TMC', 14234, 13.0, 'comfortable',
 '[{"factor": "District HQ development", "impact": "high", "description": "Administrative center growth"},
   {"factor": "TMC stronghold", "impact": "high", "description": "Traditional TMC area"}]'::jsonb,
 '{"government_employees": {"support": 55, "swing_from_2016": 4}, "urban_voters": {"support": 52, "swing_from_2016": 2}}'::jsonb,
 '[{"issue": "Administrative efficiency", "stance": "Government services", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 46. PANDAVESWAR - BJP WIN
('wb_paschim_bardhaman_pandaveswar', 2021, 'Narendranath Chakraborty', 'BJP', 17234, 13.5, 'comfortable',
 '[{"factor": "Coal mining area", "impact": "critical", "description": "Coal worker support"},
   {"factor": "Hindi-speaking voters", "impact": "high", "description": "Migrant worker backing"},
   {"factor": "Anti-TMC sentiment", "impact": "high", "description": "Anger over syndicate raj"}]'::jsonb,
 '{"coal_workers": {"support": 58, "swing_from_2016": 20}, "hindi_speaking": {"support": 65, "swing_from_2016": 22}}'::jsonb,
 '[{"issue": "Mining jobs", "stance": "Coal sector support", "voter_response": "very_positive"}]'::jsonb,
 'none'),

-- 47. ARAMBAG
('wb_hooghly_arambag', 2021, 'Madhusudhan Bag', 'TMC', 15678, 13.1, 'comfortable',
 '[{"factor": "Agricultural belt", "impact": "high", "description": "Farmer community support"},
   {"factor": "TMC ground network", "impact": "high", "description": "Booth-level organization"}]'::jsonb,
 '{"farmers": {"support": 55, "swing_from_2016": 4}, "rural_voters": {"support": 54, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Agriculture", "stance": "MSP support", "voter_response": "positive"}]'::jsonb,
 'weak'),

-- 48. RANAGHAT UTTAR PASCHIM - BJP WIN
('wb_nadia_ranaghat_uttar_paschim', 2021, 'Mukut Mani Adhikari', 'BJP', 16234, 13.2, 'comfortable',
 '[{"factor": "Matua community", "impact": "critical", "description": "Matua vote consolidated for BJP"},
   {"factor": "CAA promise", "impact": "high", "description": "Citizenship assurance"},
   {"factor": "Border area concerns", "impact": "medium", "description": "Security focus"}]'::jsonb,
 '{"matua_community": {"support": 72, "swing_from_2016": 30}, "border_voters": {"support": 55, "swing_from_2016": 18}}'::jsonb,
 '[{"issue": "CAA-Citizenship", "stance": "Citizenship for Matuas", "voter_response": "very_positive"}]'::jsonb,
 'none'),

-- 49. BARASAT
('wb_north_24_parganas_barasat', 2021, 'Chiranjit Chakraborty', 'TMC', 17234, 11.3, 'close',
 '[{"factor": "Actor candidate", "impact": "high", "description": "Celebrity appeal"},
   {"factor": "Suburban growth", "impact": "medium", "description": "Development narrative"}]'::jsonb,
 '{"film_fans": {"support": 55, "swing_from_2016": 8}, "suburban_voters": {"support": 52, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Urban connectivity", "stance": "Transport improvement", "voter_response": "positive"}]'::jsonb,
 'moderate'),

-- 50. DIAMOND HARBOUR
('wb_south_24_parganas_diamond_harbour', 2021, 'Dipak Kumar Halder', 'TMC', 16789, 12.9, 'comfortable',
 '[{"factor": "Abhishek Banerjee influence", "impact": "critical", "description": "TMC youth leader LS constituency"},
   {"factor": "Strong TMC machinery", "impact": "high", "description": "Well-oiled organization"},
   {"factor": "Development work", "impact": "medium", "description": "Infrastructure projects"}]'::jsonb,
 '{"youth_18_30": {"support": 55, "swing_from_2016": 5}, "rural_voters": {"support": 54, "swing_from_2016": 3}}'::jsonb,
 '[{"issue": "Coastal development", "stance": "Fishing community support", "voter_response": "positive"}]'::jsonb,
 'weak');

-- =========================================================
-- 10. SEED LOSS FACTORS FOR ALL RUNNER-UPS
-- =========================================================

INSERT INTO election_loss_factors (
    constituency_id, election_year, loser_name, loser_party,
    lost_to_name, lost_to_party, loss_margin_votes, loss_margin_percentage,
    losing_factors, path_to_victory, demographic_weakness
) VALUES

-- BJP losses in TMC strongholds
('wb_kolkata_bhowanipore', 2021, 'Priyanka Tibrewal', 'BJP', 'Mamata Banerjee', 'TMC', 58835, 49.6,
 '[{"factor": "CM vs first-timer", "impact": "critical", "votes_lost_est": 30000},
   {"factor": "Minority consolidation", "impact": "critical", "votes_lost_est": 25000},
   {"factor": "Sympathy wave for Mamata", "impact": "high", "votes_lost_est": 10000}]'::jsonb,
 '{"votes_needed": 58835, "realistic_assessment": "Extremely difficult against sitting CM", "strategies": []}'::jsonb,
 '{"minorities": {"support": 5, "gap": -80}, "women": {"support": 25, "gap": -47}}'::jsonb),

('wb_hooghly_chinsurah', 2021, 'Rabin Dutta', 'BJP', 'Pradip Sarkar', 'TMC', 16234, 12.6,
 '[{"factor": "Weak booth presence", "impact": "critical", "votes_lost_est": 8000, "description": "No ground network in rural areas"},
   {"factor": "Late candidate announcement", "impact": "high", "votes_lost_est": 4000, "description": "Just 2 weeks before election"},
   {"factor": "Bengali voter hesitation", "impact": "medium", "votes_lost_est": 3000, "description": "Outsider party perception"},
   {"factor": "No local issues campaign", "impact": "medium", "votes_lost_est": 2000, "description": "Only national narrative"}]'::jsonb,
 '{"votes_needed": 16234, "swing_needed_pct": 6.3, "strategies": [
   {"strategy": "Build rural booth network", "potential_votes": 6000, "timeline": "18_months"},
   {"strategy": "Bengali outreach program", "potential_votes": 4000, "timeline": "12_months"},
   {"strategy": "Local issues campaign on drainage, hospital", "potential_votes": 3500, "timeline": "6_months"},
   {"strategy": "Women voter connect via schemes comparison", "potential_votes": 3000, "timeline": "12_months"}
 ], "key_booths_to_flip": ["Booth 45", "Booth 67", "Booth 89", "Booth 112"]}'::jsonb,
 '{"rural_voters": {"support": 35, "gap": -20}, "women_30_plus": {"support": 38, "gap": -20}, "minorities": {"support": 12, "gap": -73}}'::jsonb),

('wb_kolkata_tollygunge', 2021, 'Babul Supriyo', 'BJP', 'Aroop Biswas', 'TMC', 28456, 19.1,
 '[{"factor": "Aroop Biswas local stronghold", "impact": "critical", "votes_lost_est": 15000},
   {"factor": "Film industry TMC support", "impact": "high", "votes_lost_est": 8000},
   {"factor": "BJP outsider perception", "impact": "medium", "votes_lost_est": 5000}]'::jsonb,
 '{"votes_needed": 28456, "strategies": [{"strategy": "Focus on other seats", "recommendation": "Low priority constituency"}]}'::jsonb,
 '{"film_industry": {"support": 25, "gap": -45}}'::jsonb),

-- TMC losses in BJP strongholds
('wb_darjeeling_darjeeling', 2021, 'Keshav Raj Pokhrel', 'TMC', 'Neeraj Zimba Tamang', 'BJP', 18456, 16.9,
 '[{"factor": "Gorkha identity against TMC", "impact": "critical", "votes_lost_est": 12000},
   {"factor": "GJM-BJP alliance", "impact": "high", "votes_lost_est": 8000},
   {"factor": "TMC seen as anti-hills", "impact": "high", "votes_lost_est": 5000}]'::jsonb,
 '{"votes_needed": 18456, "strategies": [
   {"strategy": "Gorkha outreach program", "potential_votes": 6000, "difficulty": "very_high"},
   {"strategy": "Development focus in hills", "potential_votes": 4000, "difficulty": "high"}
 ]}'::jsonb,
 '{"gorkha_community": {"support": 30, "gap": -35}}'::jsonb),

('wb_purba_bardhaman_asansol_dakshin', 2021, 'Tapas Banerjee', 'TMC', 'Agnimitra Paul', 'BJP', 16789, 10.2,
 '[{"factor": "Hindi-speaking voter shift", "impact": "critical", "votes_lost_est": 10000},
   {"factor": "Riot aftermath anger", "impact": "high", "votes_lost_est": 5000},
   {"factor": "Weak candidate vs celebrity", "impact": "medium", "votes_lost_est": 3000}]'::jsonb,
 '{"votes_needed": 16789, "strategies": [
   {"strategy": "Hindi outreach campaign", "potential_votes": 5000, "difficulty": "high"},
   {"strategy": "Industrial jobs focus", "potential_votes": 4000, "difficulty": "medium"},
   {"strategy": "Strong candidate selection", "potential_votes": 3000, "difficulty": "medium"}
 ]}'::jsonb,
 '{"hindi_speaking": {"support": 28, "gap": -44}}'::jsonb),

('wb_nadia_ranaghat_uttar_paschim', 2021, 'Shankar Singha Roy', 'TMC', 'Mukut Mani Adhikari', 'BJP', 16234, 13.2,
 '[{"factor": "Matua community consolidated for BJP", "impact": "critical", "votes_lost_est": 12000},
   {"factor": "CAA promise impact", "impact": "high", "votes_lost_est": 6000}]'::jsonb,
 '{"votes_needed": 16234, "strategies": [
   {"strategy": "Counter CAA narrative", "potential_votes": 5000, "difficulty": "very_high"},
   {"strategy": "Alternative citizenship assurance", "potential_votes": 4000, "difficulty": "high"}
 ]}'::jsonb,
 '{"matua_community": {"support": 25, "gap": -47}}'::jsonb),

('wb_paschim_bardhaman_pandaveswar', 2021, 'Jitendra Kumar Tiwari', 'TMC', 'Narendranath Chakraborty', 'BJP', 17234, 13.5,
 '[{"factor": "Coal worker anger", "impact": "critical", "votes_lost_est": 10000},
   {"factor": "Hindi-speaking consolidation", "impact": "high", "votes_lost_est": 7000}]'::jsonb,
 '{"votes_needed": 17234, "strategies": [
   {"strategy": "Coal sector promises", "potential_votes": 6000, "difficulty": "high"},
   {"strategy": "Hindi outreach", "potential_votes": 5000, "difficulty": "high"}
 ]}'::jsonb,
 '{"coal_workers": {"support": 35, "gap": -23}, "hindi_speaking": {"support": 32, "gap": -33}}'::jsonb),

-- Close contests
('wb_darjeeling_siliguri', 2021, 'Shankar Ghosh', 'BJP', 'Asok Bhattacharya', 'CPIM', 8956, 4.9,
 '[{"factor": "Left bastion held", "impact": "high", "votes_lost_est": 5000},
   {"factor": "TMC-BJP vote split helped Left", "impact": "medium", "votes_lost_est": 3000}]'::jsonb,
 '{"votes_needed": 8956, "strategies": [
   {"strategy": "Focus anti-Left campaign", "potential_votes": 5000, "difficulty": "medium"},
   {"strategy": "Tea worker outreach", "potential_votes": 4000, "difficulty": "medium"}
 ]}'::jsonb,
 '{"left_supporters": {"support": 42, "gap": -6}}'::jsonb),

('wb_purba_bardhaman_asansol_uttar', 2021, 'Agnimitra Paul', 'BJP', 'Moloy Ghatak', 'TMC', 8956, 5.5,
 '[{"factor": "Last-minute minority consolidation", "impact": "critical", "votes_lost_est": 6000},
   {"factor": "TMC booth management", "impact": "high", "votes_lost_est": 4000}]'::jsonb,
 '{"votes_needed": 8956, "strategies": [
   {"strategy": "Early campaign start", "potential_votes": 4000, "difficulty": "medium"},
   {"strategy": "Booth strengthening", "potential_votes": 3000, "difficulty": "high"}
 ]}'::jsonb,
 '{"minorities": {"support": 20, "gap": -55}}'::jsonb);

-- =========================================================
-- 11. SEED OPPOSITION INTELLIGENCE FOR TMC SEATS
-- =========================================================

INSERT INTO opposition_intelligence (
    constituency_id, target_leader, target_party,
    promises_made, controversies, public_grievances, attack_points, vulnerability_score
) VALUES

-- Chinsurah - Medium vulnerability
('wb_hooghly_chinsurah', 'Pradip Sarkar', 'TMC',
 '[{"promise": "New hospital in Chinsurah town", "date": "2021-04", "status": "unfulfilled", "public_anger": "high"},
   {"promise": "Drainage system overhaul", "date": "2021-03", "status": "partial", "public_anger": "medium"},
   {"promise": "Youth employment scheme", "date": "2021-04", "status": "unfulfilled", "public_anger": "high"},
   {"promise": "Road widening NH-2", "date": "2021-05", "status": "in_progress", "public_anger": "low"}]'::jsonb,
 '[{"type": "governance", "title": "Poor monsoon flood management", "date": "2023-07", "severity": "medium"},
   {"type": "allegation", "title": "Tender irregularities rumor", "date": "2024-02", "severity": "low"}]'::jsonb,
 '[{"issue": "Waterlogging in Wards 3,5,8", "severity": "high", "affected_areas": ["Ward 3", "Ward 5", "Ward 8"], "public_anger": "high"},
   {"issue": "Hospital bed shortage", "severity": "critical", "affected_areas": ["Entire constituency"], "public_anger": "high"},
   {"issue": "Youth unemployment", "severity": "critical", "affected_areas": ["Entire constituency"], "public_anger": "high"},
   {"issue": "Poor garbage collection", "severity": "medium", "affected_areas": ["Central Market"], "public_anger": "medium"}]'::jsonb,
 '[{"point": "Hospital promise unfulfilled for 3+ years", "evidence": "2021 manifesto, zero progress", "impact": "high", "voter_groups": ["elderly", "women"]},
   {"point": "Youth unemployment crisis ignored", "evidence": "No local employment initiatives", "impact": "critical", "voter_groups": ["youth", "families"]},
   {"point": "Monsoon flooding every year", "evidence": "Photos from 2022, 2023, 2024", "impact": "high", "voter_groups": ["affected_wards"]},
   {"point": "TMC syndicate raj in construction", "evidence": "Local media reports", "impact": "medium", "voter_groups": ["general"]}]'::jsonb,
 65),

-- Bhowanipore - Low vulnerability (CM seat)
('wb_kolkata_bhowanipore', 'Mamata Banerjee', 'TMC',
 '[{"promise": "Metro connectivity expansion", "date": "2021-09", "status": "in_progress", "public_anger": "low"},
   {"promise": "Hawker rehabilitation", "date": "2021-09", "status": "partial", "public_anger": "medium"}]'::jsonb,
 '[{"type": "political", "title": "Nephew ED investigation", "date": "2024-03", "severity": "medium"}]'::jsonb,
 '[{"issue": "Parking problems", "severity": "medium", "affected_areas": ["Hazra", "Lansdowne"], "public_anger": "medium"},
   {"issue": "Hawker encroachment", "severity": "medium", "affected_areas": ["Gariahat"], "public_anger": "medium"}]'::jsonb,
 '[{"point": "Dynasty politics - promoting nephew", "evidence": "Abhishek rapid rise", "impact": "medium", "voter_groups": ["urban_middle_class"]},
   {"point": "ED investigations against family", "evidence": "Coal scam, cattle scam", "impact": "medium", "voter_groups": ["anti_corruption"]}]'::jsonb,
 25),

-- Behala West - High vulnerability (Partha Chatterjee seat)
('wb_kolkata_behala_west', 'Partha Chatterjee', 'TMC',
 '[{"promise": "Industrial revival", "date": "2021-03", "status": "unfulfilled", "public_anger": "high"},
   {"promise": "Employment generation", "date": "2021-04", "status": "unfulfilled", "public_anger": "high"}]'::jsonb,
 '[{"type": "corruption", "title": "SSC recruitment scam - ED arrest", "date": "2022-07", "severity": "critical"},
   {"type": "corruption", "title": "Rs 50 crore cash seized from associate", "date": "2022-07", "severity": "critical"}]'::jsonb,
 '[{"issue": "SSC job scam victims", "severity": "critical", "affected_areas": ["Entire constituency"], "public_anger": "boiling"},
   {"issue": "Constituency neglect during jail term", "severity": "high", "affected_areas": ["All wards"], "public_anger": "high"}]'::jsonb,
 '[{"point": "ED arrested for SSC scam", "evidence": "Court records, ED chargesheet", "impact": "critical", "voter_groups": ["all"]},
   {"point": "Rs 50 crore cash found", "evidence": "ED seizure photos, media coverage", "impact": "critical", "voter_groups": ["all"]},
   {"point": "Constituency abandoned during jail", "evidence": "No MLA presence for months", "impact": "high", "voter_groups": ["local_residents"]},
   {"point": "Symbol of TMC corruption", "evidence": "National media coverage", "impact": "critical", "voter_groups": ["anti_corruption"]}]'::jsonb,
 92),

-- Tollygunge - Low vulnerability
('wb_kolkata_tollygunge', 'Aroop Biswas', 'TMC',
 '[{"promise": "Film city expansion", "date": "2021-04", "status": "in_progress", "public_anger": "low"},
   {"promise": "Traffic decongestion", "date": "2021-05", "status": "partial", "public_anger": "medium"}]'::jsonb,
 '[{"type": "political", "title": "Powerful minister allegations", "date": "2023-01", "severity": "low"}]'::jsonb,
 '[{"issue": "Traffic congestion", "severity": "medium", "affected_areas": ["Tollygunge metro area"], "public_anger": "medium"}]'::jsonb,
 '[{"point": "Too powerful - dictatorial style", "evidence": "Local complaints", "impact": "low", "voter_groups": ["opposition_supporters"]}]'::jsonb,
 30),

-- Asansol Uttar - High vulnerability (narrow win)
('wb_purba_bardhaman_asansol_uttar', 'Moloy Ghatak', 'TMC',
 '[{"promise": "Industrial jobs", "date": "2021-04", "status": "unfulfilled", "public_anger": "high"},
   {"promise": "Law and order improvement", "date": "2021-03", "status": "unfulfilled", "public_anger": "high"}]'::jsonb,
 '[{"type": "violence", "title": "Post-poll violence allegations", "date": "2021-05", "severity": "high"},
   {"type": "governance", "title": "Poor riot management", "date": "2022-04", "severity": "high"}]'::jsonb,
 '[{"issue": "Industrial unemployment", "severity": "critical", "affected_areas": ["Industrial belt"], "public_anger": "high"},
   {"issue": "Communal tension", "severity": "high", "affected_areas": ["Mixed areas"], "public_anger": "high"},
   {"issue": "Crime rate", "severity": "high", "affected_areas": ["Urban areas"], "public_anger": "high"}]'::jsonb,
 '[{"point": "Won by only 8956 votes", "evidence": "Election results", "impact": "high", "voter_groups": ["swing_voters"]},
   {"point": "Industrial job crisis", "evidence": "Factory closures", "impact": "critical", "voter_groups": ["workers"]},
   {"point": "Communal tension mismanagement", "evidence": "Riot incidents", "impact": "high", "voter_groups": ["affected_communities"]},
   {"point": "Crime and extortion complaints", "evidence": "FIRs, media reports", "impact": "high", "voter_groups": ["business_community"]}]'::jsonb,
 78),

-- Barrackpore - Medium-high vulnerability
('wb_north_24_parganas_barrackpore', 'Raj Chakraborty', 'TMC',
 '[{"promise": "Jute mill revival", "date": "2021-03", "status": "unfulfilled", "public_anger": "high"},
   {"promise": "Employment for youth", "date": "2021-04", "status": "unfulfilled", "public_anger": "high"}]'::jsonb,
 '[{"type": "political", "title": "Outsider candidate criticism", "date": "2021-04", "severity": "medium"}]'::jsonb,
 '[{"issue": "Jute mill closures", "severity": "critical", "affected_areas": ["Industrial areas"], "public_anger": "high"},
   {"issue": "Unemployment", "severity": "critical", "affected_areas": ["Entire constituency"], "public_anger": "high"},
   {"issue": "Traffic congestion", "severity": "high", "affected_areas": ["Barrackpore town"], "public_anger": "high"}]'::jsonb,
 '[{"point": "Close margin - only 13333 votes", "evidence": "Election data", "impact": "high", "voter_groups": ["swing_voters"]},
   {"point": "Jute mill workers abandoned", "evidence": "Mill closure news", "impact": "critical", "voter_groups": ["industrial_workers"]},
   {"point": "Celebrity candidate, no local connect", "evidence": "Public perception", "impact": "medium", "voter_groups": ["local_residents"]},
   {"point": "Arjun Singh defection fallout", "evidence": "Local politics", "impact": "medium", "voter_groups": ["bjp_sympathizers"]}]'::jsonb,
 70);

-- =========================================================
-- 12. SEED CONSTITUENCY ISSUES
-- =========================================================

INSERT INTO constituency_issues (
    constituency_id, issue_title, issue_title_bengali, issue_description,
    issue_category, severity, affected_areas, issue_since,
    government_response, public_anger_level, can_use_in_campaign
) VALUES

-- Chinsurah issues
('wb_hooghly_chinsurah', 'Chronic Waterlogging', 'দীর্ঘস্থায়ী জলাবদ্ধতা',
 'Multiple wards face severe waterlogging during monsoon. Drainage inadequate.',
 'infrastructure', 'high', ARRAY['Ward 3', 'Ward 5', 'Ward 8'], '2020-06-01',
 'acknowledged', 'high', true),

('wb_hooghly_chinsurah', 'Hospital Bed Shortage', 'হাসপাতালে শয্যার অভাব',
 'Government hospital severely understaffed. Patients referred to Kolkata.',
 'healthcare', 'critical', ARRAY['Entire constituency'], '2019-01-01',
 'none', 'high', true),

('wb_hooghly_chinsurah', 'Youth Unemployment', 'যুব বেকারত্ব',
 'High unemployment among educated youth. No major industries. Migration to Kolkata.',
 'employment', 'critical', ARRAY['Entire constituency'], '2018-01-01',
 'none', 'boiling', true),

-- Asansol issues
('wb_purba_bardhaman_asansol_uttar', 'Factory Closures', 'কারখানা বন্ধ',
 'Multiple factories closed. Thousands jobless. No revival efforts.',
 'employment', 'critical', ARRAY['Industrial belt'], '2018-01-01',
 'none', 'boiling', true),

('wb_purba_bardhaman_asansol_uttar', 'Communal Tension', 'সাম্প্রদায়িক উত্তেজনা',
 'Periodic communal flare-ups. Law and order concerns.',
 'law_order', 'high', ARRAY['Mixed areas'], '2020-01-01',
 'partial', 'high', true),

-- Behala West issues
('wb_kolkata_behala_west', 'SSC Scam Impact', 'এসএসসি কেলেঙ্কারির প্রভাব',
 'Thousands of youth affected by recruitment scam. MLA arrested.',
 'corruption', 'critical', ARRAY['Entire constituency'], '2022-07-01',
 'none', 'boiling', true),

('wb_kolkata_behala_west', 'MLA Absence', 'বিধায়কের অনুপস্থিতি',
 'No MLA representation during Partha Chatterjee jail term.',
 'governance', 'high', ARRAY['All wards'], '2022-07-01',
 'none', 'high', true),

-- Barrackpore issues
('wb_north_24_parganas_barrackpore', 'Jute Mill Crisis', 'পাটকল সংকট',
 'Historic jute mills closed. Workers unpaid. No government intervention.',
 'employment', 'critical', ARRAY['Jute mill areas'], '2019-01-01',
 'none', 'boiling', true);

-- =========================================================
-- MIGRATION COMPLETED
-- =========================================================
