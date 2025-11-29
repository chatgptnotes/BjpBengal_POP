-- =========================================================
-- Migration 19: Issue Extraction Schema Additions
-- Adds support for news-based constituency issue extraction
-- =========================================================

-- Add tracking columns to existing constituency_issues table
ALTER TABLE constituency_issues
ADD COLUMN IF NOT EXISTS news_source_count INTEGER DEFAULT 1;

ALTER TABLE constituency_issues
ADD COLUMN IF NOT EXISTS news_source_ids TEXT[] DEFAULT '{}';

ALTER TABLE constituency_issues
ADD COLUMN IF NOT EXISTS extraction_confidence DECIMAL(4,3);

ALTER TABLE constituency_issues
ADD COLUMN IF NOT EXISTS last_news_mention TIMESTAMPTZ;

ALTER TABLE constituency_issues
ADD COLUMN IF NOT EXISTS issue_source TEXT DEFAULT 'manual';

-- Add index for efficient lookup by constituency and category
CREATE INDEX IF NOT EXISTS idx_constituency_issues_const_cat
ON constituency_issues(constituency_id, issue_category);

-- Add index for sorting by news mentions
CREATE INDEX IF NOT EXISTS idx_constituency_issues_news_count
ON constituency_issues(news_source_count DESC);

-- Add comment explaining new columns
COMMENT ON COLUMN constituency_issues.news_source_count IS 'Number of news articles mentioning this issue';
COMMENT ON COLUMN constituency_issues.news_source_ids IS 'Array of news intelligence IDs that detected this issue';
COMMENT ON COLUMN constituency_issues.extraction_confidence IS 'Confidence score (0-1) of AI extraction';
COMMENT ON COLUMN constituency_issues.last_news_mention IS 'Timestamp of most recent news mentioning this issue';
COMMENT ON COLUMN constituency_issues.issue_source IS 'Source of issue: manual, news_detected, field_report';
