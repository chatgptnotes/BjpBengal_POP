-- Constituency Demographics Table
-- Stores detailed demographic data for each constituency based on Census 2011

CREATE TABLE IF NOT EXISTS constituency_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id VARCHAR(100) NOT NULL UNIQUE,

  -- Population
  total_population INTEGER,

  -- Age Distribution (percentages)
  age_0_18 DECIMAL(5,2),
  age_18_35 DECIMAL(5,2),
  age_35_60 DECIMAL(5,2),
  age_60_plus DECIMAL(5,2),

  -- Gender (percentages)
  male_percentage DECIMAL(5,2),
  female_percentage DECIMAL(5,2),

  -- Caste Composition (percentages)
  sc_percentage DECIMAL(5,2),
  st_percentage DECIMAL(5,2),
  obc_percentage DECIMAL(5,2),
  general_percentage DECIMAL(5,2),

  -- Religion (percentages)
  hindu_percentage DECIMAL(5,2),
  muslim_percentage DECIMAL(5,2),
  christian_percentage DECIMAL(5,2),
  others_percentage DECIMAL(5,2),

  -- Metadata
  data_source VARCHAR(100) DEFAULT 'Census 2011',
  last_updated DATE DEFAULT '2011-12-01',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE constituency_demographics ENABLE ROW LEVEL SECURITY;

-- Allow read access for all (including anonymous)
CREATE POLICY "Allow read for all" ON constituency_demographics
  FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated" ON constituency_demographics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON constituency_demographics
  FOR UPDATE TO authenticated USING (true);

-- Create index for fast lookup by constituency
CREATE INDEX idx_constituency_demographics_id
  ON constituency_demographics(constituency_id);
