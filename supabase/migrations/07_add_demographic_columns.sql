-- Migration: Add Demographic Columns to Voters Table
-- Created: 2025-11-12
-- Description: Adds caste, religion, education, and occupation columns to voters table

-- Add demographic columns to voters table
ALTER TABLE voters
ADD COLUMN IF NOT EXISTS caste VARCHAR(50),
ADD COLUMN IF NOT EXISTS religion VARCHAR(50),
ADD COLUMN IF NOT EXISTS education VARCHAR(50),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);

-- Add comments to document the columns
COMMENT ON COLUMN voters.caste IS 'Caste category: General, OBC, SC, ST, Other';
COMMENT ON COLUMN voters.religion IS 'Religion: Hindu, Muslim, Christian, Sikh, Buddhist, Jain, Other';
COMMENT ON COLUMN voters.education IS 'Education level: Illiterate, Primary, Secondary, Graduate, Post Graduate, Doctorate';
COMMENT ON COLUMN voters.occupation IS 'Voter occupation or profession';

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'voters'
AND column_name IN ('caste', 'religion', 'education', 'occupation')
ORDER BY column_name;
