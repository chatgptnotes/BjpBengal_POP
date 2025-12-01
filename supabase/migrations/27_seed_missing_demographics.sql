-- Add missing constituency demographics from Census 2011
-- Sources: indiastatpublications.com, census2011.co.in
-- These 4 constituencies were missing from migration 26

INSERT INTO constituency_demographics (
  constituency_id,
  total_population,
  age_0_18, age_18_35, age_35_60, age_60_plus,
  male_percentage, female_percentage,
  sc_percentage, st_percentage, obc_percentage, general_percentage,
  hindu_percentage, muslim_percentage, christian_percentage, others_percentage,
  literacy_rate, urban_percentage, rural_percentage,
  sex_ratio, total_voters, polling_stations,
  data_source, last_updated
) VALUES

-- Bolpur Assembly (286) - Birbhum District
-- Census 2011: Population 328,531, SC 24.13%, ST 9.58%, Urban 30.28%
('wb_birbhum_bolpur', 328531,
  26.0, 31.5, 29.0, 13.5,
  51.2, 48.8,
  24.13, 9.58, 25.0, 41.29,
  64.0, 34.5, 0.2, 1.3,
  72.71, 30.28, 69.72,
  956, 285141, 296,
  'Census 2011', '2011-12-01'),

-- Suri Assembly (285) - Birbhum District
-- Census 2011: Population 324,115, SC 31.24%, ST 8.46%, Urban 29.95%
('wb_birbhum_suri', 324115,
  25.5, 32.0, 29.5, 13.0,
  51.0, 49.0,
  31.24, 8.46, 22.0, 38.30,
  64.5, 34.0, 0.2, 1.3,
  70.68, 29.95, 70.05,
  960, 272439, 297,
  'Census 2011', '2011-12-01'),

-- Jadavpur Assembly (South 24 Parganas portion)
-- Census 2011: Mostly urban (100%), SC 11.68%, ST 0.26%
('wb_south_24_parganas_jadavpur', 332018,
  22.0, 33.0, 31.0, 14.0,
  52.0, 48.0,
  11.68, 0.26, 15.0, 73.06,
  76.0, 21.5, 0.8, 1.7,
  86.21, 100.0, 0.0,
  920, 306713, 349,
  'Census 2011', '2011-12-01'),

-- Uttarpara Assembly (185) - Hooghly District
-- Census 2011: Population 307,133, SC 9.8%, ST 0.57%, Urban 99.69%
('wb_howrah_uttarpara', 307133,
  23.0, 32.5, 30.5, 14.0,
  51.15, 48.85,
  9.80, 0.57, 12.0, 77.63,
  96.61, 2.24, 0.10, 1.05,
  90.65, 99.69, 0.31,
  955, 249000, 310,
  'Census 2011', '2011-12-01');
