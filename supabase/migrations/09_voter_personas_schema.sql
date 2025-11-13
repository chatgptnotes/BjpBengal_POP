-- =====================================================
-- Voter Personas ML Module - Database Schema
-- Version: 1.0
-- Date: 2025-11-13
-- =====================================================

-- =====================================================
-- 1. Voter Personas Table
-- =====================================================
CREATE TABLE IF NOT EXISTS voter_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID, -- Optional: Add REFERENCES tenants(id) ON DELETE CASCADE if tenants table exists
  name VARCHAR(100) NOT NULL,
  description TEXT,
  segment_key VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for visualization
  icon VARCHAR(50) DEFAULT 'person',
  total_voters INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_voter_personas_tenant ON voter_personas(tenant_id);
CREATE INDEX idx_voter_personas_segment ON voter_personas(segment_key);

-- =====================================================
-- 2. Psychographic Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS psychographic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES voter_personas(id) ON DELETE CASCADE,

  -- Big Five Personality Traits (OCEAN Model)
  openness FLOAT CHECK (openness BETWEEN 0 AND 1),
  conscientiousness FLOAT CHECK (conscientiousness BETWEEN 0 AND 1),
  extraversion FLOAT CHECK (extraversion BETWEEN 0 AND 1),
  agreeableness FLOAT CHECK (agreeableness BETWEEN 0 AND 1),
  neuroticism FLOAT CHECK (neuroticism BETWEEN 0 AND 1),

  -- Additional psychographic data
  values JSONB DEFAULT '[]'::jsonb, -- Array of key values
  beliefs JSONB DEFAULT '{}'::jsonb, -- Political beliefs mapping
  communication_preferences JSONB DEFAULT '{}'::jsonb, -- Channel, tone, timing
  persuasion_score FLOAT CHECK (persuasion_score BETWEEN 0 AND 100),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(persona_id)
);

-- Index for personality queries
CREATE INDEX idx_psychographic_persona ON psychographic_profiles(persona_id);

-- =====================================================
-- 3. Voter Persona Assignments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS voter_persona_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES voter_personas(id) ON DELETE CASCADE,
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1) DEFAULT 0.5,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by VARCHAR(20) DEFAULT 'ml_model', -- ml_model, manual, survey
  ml_model_version VARCHAR(20),

  UNIQUE(voter_id, persona_id)
);

-- Indexes for faster queries
CREATE INDEX idx_voter_persona_voter ON voter_persona_assignments(voter_id);
CREATE INDEX idx_voter_persona_persona ON voter_persona_assignments(persona_id);
CREATE INDEX idx_voter_persona_confidence ON voter_persona_assignments(confidence_score DESC);

-- =====================================================
-- 4. Behavioral Cues Table
-- =====================================================
CREATE TABLE IF NOT EXISTS behavioral_cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,

  -- Cue classification
  cue_type VARCHAR(50) NOT NULL, -- emotion, linguistic, timing, engagement
  cue_category VARCHAR(50), -- subcategory
  cue_value VARCHAR(100) NOT NULL, -- anger, fear, hope, urgency, etc.
  intensity FLOAT CHECK (intensity BETWEEN 0 AND 1) DEFAULT 0.5,

  -- Source information
  source VARCHAR(100), -- social_media, survey, interaction, phone_call
  source_id UUID, -- Reference to source record
  source_text TEXT, -- Original text that triggered the cue

  -- Language support
  language VARCHAR(10) DEFAULT 'ta', -- Tamil support

  -- Metadata
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confidence FLOAT CHECK (confidence BETWEEN 0 AND 1) DEFAULT 0.5,
  ml_model_version VARCHAR(20)
);

-- Indexes for behavioral queries
CREATE INDEX idx_behavioral_cues_voter ON behavioral_cues(voter_id);
CREATE INDEX idx_behavioral_cues_type ON behavioral_cues(cue_type);
CREATE INDEX idx_behavioral_cues_value ON behavioral_cues(cue_value);
CREATE INDEX idx_behavioral_cues_detected ON behavioral_cues(detected_at DESC);

-- =====================================================
-- 5. Persona Metrics Table (Aggregated)
-- =====================================================
CREATE TABLE IF NOT EXISTS persona_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES voter_personas(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,

  -- Voter counts
  total_voters INT DEFAULT 0,
  new_voters_count INT DEFAULT 0,
  churned_voters_count INT DEFAULT 0,

  -- Propensity scores (averages)
  avg_turnout_propensity FLOAT CHECK (avg_turnout_propensity BETWEEN 0 AND 1),
  avg_donation_likelihood FLOAT CHECK (avg_donation_likelihood BETWEEN 0 AND 1),
  avg_volunteer_potential FLOAT CHECK (avg_volunteer_potential BETWEEN 0 AND 1),
  avg_persuasion_score FLOAT CHECK (avg_persuasion_score BETWEEN 0 AND 100),

  -- Engagement metrics
  engagement_rate FLOAT CHECK (engagement_rate BETWEEN 0 AND 1),
  avg_interactions_per_voter FLOAT,

  -- Top emotions and issues (JSON arrays)
  top_emotions JSONB DEFAULT '[]'::jsonb,
  top_issues JSONB DEFAULT '[]'::jsonb,
  top_channels JSONB DEFAULT '[]'::jsonb,

  -- Geographic distribution
  top_constituencies JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(persona_id, metric_date)
);

-- Index for time-series queries
CREATE INDEX idx_persona_metrics_persona ON persona_metrics(persona_id);
CREATE INDEX idx_persona_metrics_date ON persona_metrics(metric_date DESC);

-- =====================================================
-- 6. Persona Migration Tracking Table
-- =====================================================
CREATE TABLE IF NOT EXISTS persona_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
  from_persona_id UUID REFERENCES voter_personas(id) ON DELETE SET NULL,
  to_persona_id UUID REFERENCES voter_personas(id) ON DELETE CASCADE,
  migration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trigger_event VARCHAR(100), -- survey_response, behavior_change, campaign_interaction
  trigger_id UUID, -- Reference to event that triggered migration
  confidence_before FLOAT,
  confidence_after FLOAT,
  notes TEXT
);

-- Indexes for migration analysis
CREATE INDEX idx_persona_migrations_voter ON persona_migrations(voter_id);
CREATE INDEX idx_persona_migrations_from ON persona_migrations(from_persona_id);
CREATE INDEX idx_persona_migrations_to ON persona_migrations(to_persona_id);
CREATE INDEX idx_persona_migrations_date ON persona_migrations(migration_date DESC);

-- =====================================================
-- 7. Persuasion Scores Table
-- =====================================================
CREATE TABLE IF NOT EXISTS voter_persuasion_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,

  -- Propensity scores
  turnout_propensity FLOAT CHECK (turnout_propensity BETWEEN 0 AND 1),
  donation_likelihood FLOAT CHECK (donation_likelihood BETWEEN 0 AND 1),
  volunteer_potential FLOAT CHECK (volunteer_potential BETWEEN 0 AND 1),

  -- Persuasion metrics
  persuasion_score FLOAT CHECK (persuasion_score BETWEEN 0 AND 100),
  swing_voter_probability FLOAT CHECK (swing_voter_probability BETWEEN 0 AND 1),
  influence_score FLOAT CHECK (influence_score BETWEEN 0 AND 100),

  -- Messaging recommendations
  recommended_channels JSONB DEFAULT '[]'::jsonb,
  recommended_tone VARCHAR(50),
  recommended_timing JSONB DEFAULT '{}'::jsonb,
  message_themes JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ml_model_version VARCHAR(20),

  UNIQUE(voter_id)
);

-- Index for scoring queries
CREATE INDEX idx_persuasion_voter ON voter_persuasion_scores(voter_id);
CREATE INDEX idx_persuasion_score ON voter_persuasion_scores(persuasion_score DESC);
CREATE INDEX idx_swing_probability ON voter_persuasion_scores(swing_voter_probability DESC);

-- =====================================================
-- 8. ML Model Metadata Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ml_model_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  model_type VARCHAR(50), -- clustering, classification, emotion_detection
  algorithm VARCHAR(50), -- kmeans, random_forest, transformer

  -- Performance metrics
  accuracy FLOAT,
  precision_score FLOAT,
  recall FLOAT,
  f1_score FLOAT,

  -- Training info
  training_data_size INT,
  training_date TIMESTAMP WITH TIME ZONE,
  feature_count INT,
  hyperparameters JSONB DEFAULT '{}'::jsonb,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, deprecated, testing
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(model_name, model_version)
);

-- Index for model queries
CREATE INDEX idx_ml_models_name ON ml_model_metadata(model_name);
CREATE INDEX idx_ml_models_status ON ml_model_metadata(status);

-- =====================================================
-- 9. Audience Export Log Table
-- =====================================================
CREATE TABLE IF NOT EXISTS audience_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES voter_personas(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- facebook, google, twitter
  export_type VARCHAR(50), -- custom_audience, lookalike, targeting

  -- Export details
  voter_count INT,
  criteria JSONB DEFAULT '{}'::jsonb,
  audience_id VARCHAR(100), -- Platform-specific audience ID

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,

  -- Metadata
  exported_by UUID REFERENCES users(id),
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for export tracking
CREATE INDEX idx_audience_export_persona ON audience_export_logs(persona_id);
CREATE INDEX idx_audience_export_platform ON audience_export_logs(platform);
CREATE INDEX idx_audience_export_date ON audience_export_logs(exported_at DESC);

-- =====================================================
-- 10. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE voter_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychographic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_persona_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_persuasion_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_export_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view all personas
-- Note: Update these policies based on your multi-tenancy requirements
CREATE POLICY "Authenticated users can view personas"
  ON voter_personas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view psychographic profiles"
  ON psychographic_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view voter assignments"
  ON voter_persona_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view behavioral cues"
  ON behavioral_cues FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view persona metrics"
  ON persona_metrics FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert/Update policies for authorized users
CREATE POLICY "Authenticated users can insert personas"
  ON voter_personas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update personas"
  ON voter_personas FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete personas"
  ON voter_personas FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 11. Functions and Triggers
-- =====================================================

-- Function to update persona total_voters count
CREATE OR REPLACE FUNCTION update_persona_voter_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voter_personas
  SET total_voters = (
    SELECT COUNT(DISTINCT voter_id)
    FROM voter_persona_assignments
    WHERE persona_id = COALESCE(NEW.persona_id, OLD.persona_id)
  )
  WHERE id = COALESCE(NEW.persona_id, OLD.persona_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update persona counts
CREATE TRIGGER persona_voter_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON voter_persona_assignments
FOR EACH ROW
EXECUTE FUNCTION update_persona_voter_count();

-- Function to track persona migrations
CREATE OR REPLACE FUNCTION track_persona_migration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if persona actually changed
  IF OLD.persona_id != NEW.persona_id THEN
    INSERT INTO persona_migrations (
      voter_id,
      from_persona_id,
      to_persona_id,
      confidence_before,
      confidence_after,
      trigger_event
    ) VALUES (
      NEW.voter_id,
      OLD.persona_id,
      NEW.persona_id,
      OLD.confidence_score,
      NEW.confidence_score,
      'assignment_update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-track migrations
CREATE TRIGGER persona_migration_trigger
AFTER UPDATE ON voter_persona_assignments
FOR EACH ROW
WHEN (OLD.persona_id IS DISTINCT FROM NEW.persona_id)
EXECUTE FUNCTION track_persona_migration();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_voter_personas_updated_at
BEFORE UPDATE ON voter_personas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_psychographic_profiles_updated_at
BEFORE UPDATE ON psychographic_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 12. Sample Data (Optional - for development)
-- =====================================================

-- Insert sample personas (only if none exist)
-- Insert sample personas (only if none exist)
-- Note: tenant_id is NULL unless you have a tenants table
INSERT INTO voter_personas (name, description, segment_key, color, icon, tenant_id)
SELECT
  'Progressive Enthusiast',
  'Young, educated, socially progressive voters who engage heavily on social media',
  'progressive_enthusiast',
  '#10B981',
  'trending_up',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM voter_personas WHERE segment_key = 'progressive_enthusiast');

INSERT INTO voter_personas (name, description, segment_key, color, icon, tenant_id)
SELECT
  'Traditional Conservative',
  'Older voters with traditional values, prefer in-person interactions',
  'traditional_conservative',
  '#EF4444',
  'account_balance',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM voter_personas WHERE segment_key = 'traditional_conservative');

INSERT INTO voter_personas (name, description, segment_key, color, icon, tenant_id)
SELECT
  'Swing Moderate',
  'Undecided voters who consider multiple perspectives before making decisions',
  'swing_moderate',
  '#F59E0B',
  'compare_arrows',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM voter_personas WHERE segment_key = 'swing_moderate');

-- =====================================================
-- End of Migration
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Voter Personas schema migration completed successfully';
  RAISE NOTICE 'Tables created: 9';
  RAISE NOTICE 'Indexes created: ~20';
  RAISE NOTICE 'Functions created: 3';
  RAISE NOTICE 'Triggers created: 4';
END $$;
