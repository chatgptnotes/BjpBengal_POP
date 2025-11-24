-- =====================================================
-- Competitor Tracking System Schema
-- =====================================================
-- This migration creates the complete schema for tracking
-- political competitors including their social media presence,
-- posts, and sentiment analysis.
-- =====================================================

-- =====================================================
-- 1. COMPETITORS TABLE
-- =====================================================
-- Stores information about political parties/competitors
-- =====================================================

CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(100) NOT NULL, -- Short name (e.g., "BJP", "TMC")
  party_name VARCHAR(255) NOT NULL, -- Full name (e.g., "Bharatiya Janata Party")
  leader_name VARCHAR(255),

  -- Location
  state VARCHAR(100),
  district VARCHAR(100),

  -- Branding
  color_code VARCHAR(7), -- Hex color code (e.g., "#FF9933")
  logo_url TEXT,
  website_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  tracking_status VARCHAR(50) DEFAULT 'active', -- active, paused, archived

  -- Metadata
  description TEXT,
  ideology VARCHAR(100), -- e.g., "right-wing", "left-wing", "centrist"
  founded_year INTEGER,

  -- Legal Compliance
  data_source VARCHAR(50) DEFAULT 'manual', -- manual, official_api, third_party
  data_collection_consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(organization_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_competitors_org_id ON public.competitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitors_is_active ON public.competitors(is_active);
CREATE INDEX IF NOT EXISTS idx_competitors_state ON public.competitors(state);

-- =====================================================
-- 2. COMPETITOR_SOCIAL_ACCOUNTS TABLE
-- =====================================================
-- Stores social media accounts for each competitor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.competitor_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE NOT NULL,

  -- Platform Information
  platform VARCHAR(50) NOT NULL, -- twitter, facebook, instagram, youtube, telegram
  account_url TEXT NOT NULL,
  username VARCHAR(255),
  account_id VARCHAR(255), -- Platform-specific ID

  -- Metrics
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  scraping_status VARCHAR(50) DEFAULT 'active', -- active, paused, error, rate_limited
  scraping_error TEXT,

  -- API Integration
  api_credentials_id UUID, -- Reference to stored API credentials (if using official APIs)
  rate_limit_remaining INTEGER,
  rate_limit_reset_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(competitor_id, platform, username)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competitor_accounts_competitor_id ON public.competitor_social_accounts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_accounts_platform ON public.competitor_social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_competitor_accounts_is_active ON public.competitor_social_accounts(is_active);

-- =====================================================
-- 3. COMPETITOR_POSTS TABLE
-- =====================================================
-- Stores social media posts from competitors
-- =====================================================

CREATE TABLE IF NOT EXISTS public.competitor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES public.competitor_social_accounts(id) ON DELETE CASCADE,

  -- Post Information
  platform VARCHAR(50) NOT NULL,
  post_id VARCHAR(255) NOT NULL, -- Platform-specific post ID
  post_url TEXT,
  content TEXT,
  post_type VARCHAR(50), -- text, image, video, link, poll

  -- Media
  media_urls TEXT[], -- Array of media URLs
  media_count INTEGER DEFAULT 0,

  -- Engagement Metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2), -- Calculated: (likes + comments + shares) / followers * 100

  -- Sentiment Analysis
  sentiment_score DECIMAL(5,2), -- -1.0 to 1.0 or 0-100 scale
  sentiment_label VARCHAR(20), -- positive, negative, neutral
  sentiment_confidence DECIMAL(5,2),

  -- Content Analysis
  topics TEXT[], -- Array of detected topics
  hashtags TEXT[], -- Array of hashtags
  mentions TEXT[], -- Array of mentioned accounts
  language VARCHAR(10) DEFAULT 'en',

  -- Timing
  posted_at TIMESTAMPTZ NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),

  -- Legal Compliance & Data Source
  data_source VARCHAR(50) DEFAULT 'manual', -- manual, official_api, mention, brand24, social_listening
  collection_method VARCHAR(50), -- api, web_scrape, manual_entry, rss_feed
  is_public BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 90,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(platform, post_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON public.competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_account_id ON public.competitor_posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_platform ON public.competitor_posts(platform);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_posted_at ON public.competitor_posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_sentiment ON public.competitor_posts(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_data_source ON public.competitor_posts(data_source);

-- Create GIN index for array columns for faster search
CREATE INDEX IF NOT EXISTS idx_competitor_posts_topics ON public.competitor_posts USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_hashtags ON public.competitor_posts USING GIN (hashtags);

-- =====================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger for competitors table
CREATE OR REPLACE FUNCTION update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_competitors_updated_at ON public.competitors;
CREATE TRIGGER trigger_update_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

-- Trigger for competitor_social_accounts table
CREATE OR REPLACE FUNCTION update_competitor_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_competitor_accounts_updated_at ON public.competitor_social_accounts;
CREATE TRIGGER trigger_update_competitor_accounts_updated_at
  BEFORE UPDATE ON public.competitor_social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_competitor_accounts_updated_at();

-- Trigger for competitor_posts table
CREATE OR REPLACE FUNCTION update_competitor_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_competitor_posts_updated_at ON public.competitor_posts;
CREATE TRIGGER trigger_update_competitor_posts_updated_at
  BEFORE UPDATE ON public.competitor_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_competitor_posts_updated_at();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_posts ENABLE ROW LEVEL SECURITY;

-- Policy for competitors table
DROP POLICY IF EXISTS "Users can view competitors in their organization" ON public.competitors;
CREATE POLICY "Users can view competitors in their organization"
  ON public.competitors FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert competitors in their organization" ON public.competitors;
CREATE POLICY "Users can insert competitors in their organization"
  ON public.competitors FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update competitors in their organization" ON public.competitors;
CREATE POLICY "Users can update competitors in their organization"
  ON public.competitors FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for competitor_social_accounts table
DROP POLICY IF EXISTS "Users can view social accounts for their org competitors" ON public.competitor_social_accounts;
CREATE POLICY "Users can view social accounts for their org competitors"
  ON public.competitor_social_accounts FOR SELECT
  USING (
    competitor_id IN (
      SELECT id FROM public.competitors WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage social accounts for their org competitors" ON public.competitor_social_accounts;
CREATE POLICY "Users can manage social accounts for their org competitors"
  ON public.competitor_social_accounts FOR ALL
  USING (
    competitor_id IN (
      SELECT id FROM public.competitors WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Policy for competitor_posts table
DROP POLICY IF EXISTS "Users can view posts for their org competitors" ON public.competitor_posts;
CREATE POLICY "Users can view posts for their org competitors"
  ON public.competitor_posts FOR SELECT
  USING (
    competitor_id IN (
      SELECT id FROM public.competitors WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage posts for their org competitors" ON public.competitor_posts;
CREATE POLICY "Users can manage posts for their org competitors"
  ON public.competitor_posts FOR ALL
  USING (
    competitor_id IN (
      SELECT id FROM public.competitors WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON TABLE public.competitors IS 'Stores information about political parties and competitors being tracked';
COMMENT ON TABLE public.competitor_social_accounts IS 'Stores social media accounts for each competitor';
COMMENT ON TABLE public.competitor_posts IS 'Stores social media posts from competitors with engagement and sentiment data';

COMMENT ON COLUMN public.competitors.data_source IS 'Legal compliance: How data was collected (manual, official_api, third_party)';
COMMENT ON COLUMN public.competitor_posts.data_source IS 'Legal compliance: Source of post data (manual, official_api, mention, brand24, social_listening)';
COMMENT ON COLUMN public.competitor_posts.data_retention_days IS 'Legal compliance: Number of days to retain this data';
