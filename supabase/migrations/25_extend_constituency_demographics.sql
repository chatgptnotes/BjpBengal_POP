-- Extend constituency_demographics table with additional fields
-- Based on Census 2011 data availability

-- Add literacy rate
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS literacy_rate DECIMAL(5,2);

-- Add urban/rural percentage
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS urban_percentage DECIMAL(5,2);

ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS rural_percentage DECIMAL(5,2);

-- Add sex ratio (females per 1000 males)
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS sex_ratio INTEGER;

-- Add child sex ratio (0-6 years, females per 1000 males)
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS child_sex_ratio INTEGER;

-- Add BPL (Below Poverty Line) percentage
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS bpl_percentage DECIMAL(5,2);

-- Add voter count (electorate)
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS total_voters INTEGER;

-- Add geographical area (sq km)
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS area_sq_km DECIMAL(10,2);

-- Add population density (per sq km)
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS population_density INTEGER;

-- Add number of polling stations
ALTER TABLE constituency_demographics
ADD COLUMN IF NOT EXISTS polling_stations INTEGER;

-- Comment on table
COMMENT ON TABLE constituency_demographics IS 'Detailed demographic data for West Bengal assembly constituencies based on Census 2011';
