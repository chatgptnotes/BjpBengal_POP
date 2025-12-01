-- =========================================================
-- Migration: 20_leader_profiles_extended.sql
-- Purpose: Extend leader_profiles with MyNeta & Wikipedia data
-- Created: 2025-12-01
-- =========================================================

-- Asset breakdown columns (MyNeta affidavit data)
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS movable_assets_lakhs DECIMAL(12,2);
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS immovable_assets_lakhs DECIMAL(12,2);
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS total_assets_lakhs DECIMAL(12,2);
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS liabilities_lakhs DECIMAL(12,2);
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS net_worth_lakhs DECIMAL(12,2);
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS assets_declared_year INTEGER;

-- Criminal record details
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS ipc_cases INTEGER DEFAULT 0;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS pending_cases INTEGER DEFAULT 0;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS is_convicted BOOLEAN DEFAULT FALSE;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS case_details JSONB DEFAULT '[]';

-- Personal info
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS education_details TEXT;

-- Wikipedia data
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS biography_summary TEXT;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS political_positions JSONB DEFAULT '[]';
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS party_history JSONB DEFAULT '[]';
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS wikipedia_url TEXT;

-- Source URLs and metadata
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS myneta_url TEXT;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS myneta_fetch_status TEXT CHECK (myneta_fetch_status IN ('success', 'not_found', 'error', 'pending'));
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS wikipedia_fetch_status TEXT CHECK (wikipedia_fetch_status IN ('success', 'not_found', 'error', 'pending'));
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ;
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0;

-- Create unique constraint on constituency_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'leader_profiles_constituency_id_key'
    ) THEN
        ALTER TABLE leader_profiles ADD CONSTRAINT leader_profiles_constituency_id_key UNIQUE (constituency_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_leader_profiles_constituency ON leader_profiles(constituency_id);
CREATE INDEX IF NOT EXISTS idx_leader_profiles_fetch_status ON leader_profiles(myneta_fetch_status, wikipedia_fetch_status);

-- =========================================================
-- MIGRATION COMPLETED
-- =========================================================
