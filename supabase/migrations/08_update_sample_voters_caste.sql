-- Migration: Update Sample Voters with Caste Values
-- Created: 2025-11-12
-- Description: Assigns caste values to existing 50 sample voters to display demographic distribution

-- This migration updates the 50 sample voters that were inserted without caste values
-- Distribution: General (25%), OBC (50%), SC (21%), ST (4%)

-- Step 1: Update first 13 voters to General (25%)
UPDATE voters
SET caste = 'General'
WHERE id IN (
  SELECT id
  FROM voters
  WHERE caste IS NULL
  ORDER BY created_at
  LIMIT 13
);

-- Step 2: Update next 26 voters to OBC (50%)
UPDATE voters
SET caste = 'OBC'
WHERE id IN (
  SELECT id
  FROM voters
  WHERE caste IS NULL
  ORDER BY created_at
  LIMIT 26
);

-- Step 3: Update next 11 voters to SC (21%)
UPDATE voters
SET caste = 'SC'
WHERE id IN (
  SELECT id
  FROM voters
  WHERE caste IS NULL
  ORDER BY created_at
  LIMIT 11
);

-- Step 4: Update remaining voters to ST (4%)
UPDATE voters
SET caste = 'ST'
WHERE caste IS NULL;

-- Verification: Check the caste distribution
SELECT
  caste,
  COUNT(*) as voter_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM voters), 1) as percentage
FROM voters
GROUP BY caste
ORDER BY voter_count DESC;
