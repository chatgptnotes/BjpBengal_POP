-- =====================================================
-- Competitor Analysis Enhancement Schema
-- =====================================================
-- Additional tables for campaigns, alerts, and issue sentiment
-- =====================================================

-- =====================================================
-- 1. COMPETITOR_CAMPAIGNS TABLE
-- =====================================================
-- Tracks active political campaigns by competitors
-- =====================================================

CREATE TABLE IF NOT EXISTS public.competitor_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Campaign Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50), -- election, rally, digital, outreach, protest

  -- Metrics
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  sentiment_score DECIMAL(5,2), -- 0 to 1
  mention_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, cancelled

  -- Timing
  start_date DATE,
  end_date DATE,

  -- Source
  data_source VARCHAR(50) DEFAULT 'manual', -- manual, detected, news, social
  source_urls TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_campaigns_competitor_id ON public.competitor_campaigns(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_campaigns_status ON public.competitor_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_competitor_campaigns_org_id ON public.competitor_campaigns(organization_id);

-- =====================================================
-- 2. COMPETITOR_ALERTS TABLE
-- =====================================================
-- Competitive intelligence alerts
-- =====================================================

CREATE TABLE IF NOT EXISTS public.competitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Alert Information
  alert_type VARCHAR(50) NOT NULL, -- campaign_launch, sentiment_spike, viral_post, news_mention, crisis, engagement_surge
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Severity
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical

  -- Related Data
  related_post_id UUID REFERENCES public.competitor_posts(id) ON DELETE SET NULL,
  related_campaign_id UUID REFERENCES public.competitor_campaigns(id) ON DELETE SET NULL,
  source_url TEXT,

  -- Metrics at time of alert
  metric_value DECIMAL(10,2),
  metric_change DECIMAL(10,2),

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor_id ON public.competitor_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_org_id ON public.competitor_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_severity ON public.competitor_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_created_at ON public.competitor_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_is_read ON public.competitor_alerts(is_read);

-- =====================================================
-- 3. COMPETITOR_ISSUE_SENTIMENT TABLE
-- =====================================================
-- Tracks sentiment by issue/topic for each competitor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.competitor_issue_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Issue Information
  issue_name VARCHAR(100) NOT NULL, -- Education, Healthcare, Jobs, Infrastructure, Agriculture, etc.
  issue_category VARCHAR(50), -- governance, welfare, economy, social, environment

  -- Sentiment Metrics
  sentiment_score DECIMAL(5,2), -- 0 to 1
  mention_count INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,

  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for period
  UNIQUE(competitor_id, issue_name, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_issue_sentiment_competitor_id ON public.competitor_issue_sentiment(competitor_id);
CREATE INDEX IF NOT EXISTS idx_issue_sentiment_issue ON public.competitor_issue_sentiment(issue_name);
CREATE INDEX IF NOT EXISTS idx_issue_sentiment_period ON public.competitor_issue_sentiment(period_start, period_end);

-- =====================================================
-- 4. ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE public.competitor_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_issue_sentiment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitor_campaigns
CREATE POLICY "Users can view campaigns in their organization"
  ON public.competitor_campaigns FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
    OR
    competitor_id IN (
      SELECT id FROM public.competitors WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage campaigns in their organization"
  ON public.competitor_campaigns FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- RLS Policies for competitor_alerts
CREATE POLICY "Users can view alerts in their organization"
  ON public.competitor_alerts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage alerts in their organization"
  ON public.competitor_alerts FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- RLS Policies for competitor_issue_sentiment
CREATE POLICY "Users can view issue sentiment in their organization"
  ON public.competitor_issue_sentiment FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
    OR
    competitor_id IN (
      SELECT id FROM public.competitors WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage issue sentiment in their organization"
  ON public.competitor_issue_sentiment FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 5. SEED WEST BENGAL COMPETITORS
-- =====================================================

-- Get the dev organization ID
DO $$
DECLARE
  dev_org_id UUID;
BEGIN
  -- Get the existing dev organization
  SELECT id INTO dev_org_id FROM public.organizations WHERE slug = 'bjp-bengal' OR name ILIKE '%BJP%Bengal%' LIMIT 1;

  -- If no org found, try to get any org
  IF dev_org_id IS NULL THEN
    SELECT id INTO dev_org_id FROM public.organizations LIMIT 1;
  END IF;

  -- Only proceed if we have an organization
  IF dev_org_id IS NOT NULL THEN
    -- Insert TMC
    INSERT INTO public.competitors (organization_id, name, party_name, leader_name, state, color_code, ideology, is_active, data_source)
    VALUES (
      dev_org_id,
      'TMC',
      'All India Trinamool Congress',
      'Mamata Banerjee',
      'West Bengal',
      '#00BCD4',
      'center-left',
      true,
      'official_api'
    ) ON CONFLICT (organization_id, name) DO NOTHING;

    -- Insert Congress
    INSERT INTO public.competitors (organization_id, name, party_name, leader_name, state, color_code, ideology, is_active, data_source)
    VALUES (
      dev_org_id,
      'Congress',
      'Indian National Congress',
      'Adhir Ranjan Chowdhury',
      'West Bengal',
      '#138808',
      'center-left',
      true,
      'official_api'
    ) ON CONFLICT (organization_id, name) DO NOTHING;

    -- Insert CPIM
    INSERT INTO public.competitors (organization_id, name, party_name, leader_name, state, color_code, ideology, is_active, data_source)
    VALUES (
      dev_org_id,
      'CPIM',
      'Communist Party of India (Marxist)',
      'Md. Salim',
      'West Bengal',
      '#FF0000',
      'left-wing',
      true,
      'official_api'
    ) ON CONFLICT (organization_id, name) DO NOTHING;

    -- Insert ISF
    INSERT INTO public.competitors (organization_id, name, party_name, leader_name, state, color_code, ideology, is_active, data_source)
    VALUES (
      dev_org_id,
      'ISF',
      'Indian Secular Front',
      'Abbas Siddiqui',
      'West Bengal',
      '#800080',
      'center',
      true,
      'official_api'
    ) ON CONFLICT (organization_id, name) DO NOTHING;

    -- Add Twitter accounts for each competitor
    -- TMC Twitter
    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/AITCofficial', 'AITCofficial', true, true, true
    FROM public.competitors WHERE name = 'TMC' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/MamataOfficial', 'MamataOfficial', true, true, true
    FROM public.competitors WHERE name = 'TMC' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    -- Congress Twitter
    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/INCIndia', 'INCIndia', true, true, true
    FROM public.competitors WHERE name = 'Congress' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/INCWestBengal', 'INCWestBengal', true, true, true
    FROM public.competitors WHERE name = 'Congress' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/adhaborpara', 'adhaborpara', true, true, true
    FROM public.competitors WHERE name = 'Congress' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    -- CPIM Twitter
    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/cpaborpara', 'cpaborpara', true, true, true
    FROM public.competitors WHERE name = 'CPIM' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/ABORPARA', 'ABOLPARA', true, true, true
    FROM public.competitors WHERE name = 'CPIM' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    -- ISF Twitter
    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/isfborpara', 'isfaborpara', false, true, true
    FROM public.competitors WHERE name = 'ISF' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    INSERT INTO public.competitor_social_accounts (competitor_id, platform, account_url, username, is_verified, is_official, is_active)
    SELECT id, 'twitter', 'https://twitter.com/AbsasSiddiqui', 'AbbasSiddiqui', false, true, true
    FROM public.competitors WHERE name = 'ISF' AND organization_id = dev_org_id
    ON CONFLICT (competitor_id, platform, username) DO NOTHING;

    RAISE NOTICE 'Successfully seeded competitors for organization %', dev_org_id;
  ELSE
    RAISE NOTICE 'No organization found to seed competitors';
  END IF;
END $$;

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON TABLE public.competitor_campaigns IS 'Tracks political campaigns run by competitors';
COMMENT ON TABLE public.competitor_alerts IS 'Competitive intelligence alerts for significant events';
COMMENT ON TABLE public.competitor_issue_sentiment IS 'Issue-wise sentiment tracking for each competitor';
