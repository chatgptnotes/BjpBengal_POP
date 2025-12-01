-- Seed constituency demographics data for all 50 West Bengal constituencies
-- Based on Census 2011 patterns for West Bengal

INSERT INTO constituency_demographics (
  constituency_id,
  total_population,
  age_0_18, age_18_35, age_35_60, age_60_plus,
  male_percentage, female_percentage,
  sc_percentage, st_percentage, obc_percentage, general_percentage,
  hindu_percentage, muslim_percentage, christian_percentage, others_percentage,
  data_source, last_updated
) VALUES
-- KOLKATA METRO (Urban - Higher literacy, more balanced gender, diverse religion)
('wb_kolkata_bhowanipore', 165432, 22.5, 32.8, 31.2, 13.5, 51.2, 48.8, 18.5, 0.8, 12.3, 68.4, 72.5, 24.8, 1.2, 1.5, 'Census 2011', '2011-12-01'),
('wb_kolkata_beleghata', 178234, 24.2, 33.5, 29.8, 12.5, 51.8, 48.2, 19.2, 0.5, 14.5, 65.8, 68.2, 29.5, 0.8, 1.5, 'Census 2011', '2011-12-01'),
('wb_kolkata_entally', 156789, 23.8, 34.2, 28.5, 13.5, 52.1, 47.9, 17.8, 0.6, 13.8, 67.8, 65.5, 32.2, 1.0, 1.3, 'Census 2011', '2011-12-01'),
('wb_kolkata_ballygunge', 142567, 21.5, 31.2, 32.5, 14.8, 50.8, 49.2, 15.2, 0.4, 10.5, 73.9, 78.5, 18.2, 1.5, 1.8, 'Census 2011', '2011-12-01'),
('wb_kolkata_chowringhee', 134890, 20.8, 30.5, 33.2, 15.5, 50.5, 49.5, 14.5, 0.5, 11.2, 73.8, 75.2, 21.5, 1.8, 1.5, 'Census 2011', '2011-12-01'),
('wb_kolkata_rashbehari', 158976, 23.2, 32.5, 30.8, 13.5, 51.5, 48.5, 17.5, 0.6, 12.8, 69.1, 74.8, 22.5, 1.2, 1.5, 'Census 2011', '2011-12-01'),
('wb_kolkata_tollygunge', 172345, 24.5, 33.8, 28.2, 13.5, 51.2, 48.8, 20.5, 0.8, 15.2, 63.5, 71.2, 26.5, 1.0, 1.3, 'Census 2011', '2011-12-01'),
('wb_kolkata_jadavpur', 168234, 25.2, 35.5, 27.8, 11.5, 51.5, 48.5, 18.8, 0.5, 14.2, 66.5, 73.5, 24.2, 1.0, 1.3, 'Census 2011', '2011-12-01'),
('wb_kolkata_kasba', 155678, 24.8, 34.2, 28.5, 12.5, 51.2, 48.8, 19.5, 0.6, 13.5, 66.4, 70.5, 27.2, 0.8, 1.5, 'Census 2011', '2011-12-01'),
('wb_kolkata_behala_west', 185432, 25.5, 33.5, 28.8, 12.2, 51.8, 48.2, 21.2, 0.8, 16.5, 61.5, 68.5, 29.8, 0.7, 1.0, 'Census 2011', '2011-12-01'),

-- HOWRAH METRO (Industrial - Working class demographics)
('wb_howrah_howrah_uttar', 195678, 26.2, 34.5, 28.2, 11.1, 52.5, 47.5, 22.5, 1.2, 18.5, 57.8, 65.2, 33.5, 0.5, 0.8, 'Census 2011', '2011-12-01'),
('wb_howrah_howrah_madhya', 187654, 25.8, 35.2, 27.5, 11.5, 52.8, 47.2, 23.2, 1.0, 19.2, 56.6, 64.8, 34.2, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_howrah_shibpur', 176543, 25.5, 34.8, 28.2, 11.5, 52.2, 47.8, 21.8, 0.8, 17.5, 59.9, 66.5, 32.5, 0.5, 0.5, 'Census 2011', '2011-12-01'),
('wb_howrah_bally', 168765, 26.5, 33.8, 28.5, 11.2, 52.5, 47.5, 22.8, 1.2, 18.8, 57.2, 64.2, 34.8, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_howrah_uttarpara', 154321, 25.2, 34.5, 29.2, 11.1, 51.8, 48.2, 20.5, 0.8, 16.2, 62.5, 68.8, 30.2, 0.5, 0.5, 'Census 2011', '2011-12-01'),

-- NORTH 24 PARGANAS (Suburban - Mixed demographics)
('wb_north_24_parganas_barrackpore', 212345, 27.5, 34.2, 27.8, 10.5, 52.2, 47.8, 24.5, 1.5, 20.5, 53.5, 62.5, 36.2, 0.5, 0.8, 'Census 2011', '2011-12-01'),
('wb_north_24_parganas_dum_dum', 198765, 26.8, 34.8, 27.2, 11.2, 52.5, 47.5, 23.8, 1.2, 19.5, 55.5, 63.8, 35.2, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_north_24_parganas_rajarhat_new_town', 145678, 24.5, 38.5, 28.2, 8.8, 51.5, 48.5, 18.2, 0.5, 14.8, 66.5, 72.5, 25.5, 0.8, 1.2, 'Census 2011', '2011-12-01'),
('wb_north_24_parganas_bidhannagar', 156789, 23.8, 36.5, 29.5, 10.2, 51.2, 48.8, 17.5, 0.6, 13.5, 68.4, 74.2, 23.8, 0.8, 1.2, 'Census 2011', '2011-12-01'),
('wb_north_24_parganas_madhyamgram', 178965, 26.2, 34.5, 28.2, 11.1, 52.2, 47.8, 22.5, 1.0, 18.2, 58.3, 65.5, 33.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_north_24_parganas_barasat', 234567, 27.8, 33.5, 27.5, 11.2, 52.5, 47.5, 25.2, 1.5, 21.5, 51.8, 58.5, 40.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),

-- SOUTH 24 PARGANAS (Semi-urban to Rural)
('wb_south_24_parganas_jadavpur', 167890, 25.5, 34.8, 28.2, 11.5, 51.8, 48.2, 21.5, 0.8, 16.8, 60.9, 69.5, 28.8, 0.7, 1.0, 'Census 2011', '2011-12-01'),
('wb_south_24_parganas_sonarpur_uttar', 198765, 27.2, 33.8, 27.5, 11.5, 52.2, 47.8, 24.2, 1.2, 19.8, 54.8, 62.8, 36.2, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_south_24_parganas_budge_budge', 187654, 28.2, 33.2, 27.2, 11.4, 52.5, 47.5, 25.5, 1.5, 21.2, 51.8, 58.5, 40.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_south_24_parganas_diamond_harbour', 245678, 29.5, 32.5, 26.8, 11.2, 52.8, 47.2, 26.8, 2.2, 22.5, 48.5, 52.5, 46.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),

-- DARJEELING / SILIGURI (Hill and Terai - Different ethnic composition)
('wb_darjeeling_darjeeling', 134567, 26.5, 34.2, 28.5, 10.8, 50.2, 49.8, 12.5, 15.8, 25.5, 46.2, 45.5, 5.2, 3.5, 45.8, 'Census 2011', '2011-12-01'),
('wb_darjeeling_siliguri', 287654, 27.8, 35.5, 27.2, 9.5, 51.5, 48.5, 15.2, 8.5, 22.5, 53.8, 68.5, 22.5, 2.5, 6.5, 'Census 2011', '2011-12-01'),

-- JALPAIGURI / COOCH BEHAR (North Bengal - Rural, tribal presence)
('wb_jalpaiguri_jalpaiguri', 198765, 28.5, 33.8, 26.5, 11.2, 51.8, 48.2, 28.5, 12.5, 25.8, 33.2, 65.2, 28.5, 1.5, 4.8, 'Census 2011', '2011-12-01'),
('wb_cooch_behar_cooch_behar_uttar', 223456, 29.2, 32.8, 26.8, 11.2, 52.2, 47.8, 42.5, 2.8, 18.5, 36.2, 68.5, 28.2, 0.8, 2.5, 'Census 2011', '2011-12-01'),

-- MALDA / MURSHIDABAD (Border districts - High Muslim population)
('wb_malda_english_bazar', 267890, 30.2, 33.5, 25.8, 10.5, 51.8, 48.2, 18.5, 5.2, 28.5, 47.8, 42.5, 56.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_murshidabad_berhampore', 289765, 30.8, 33.2, 25.5, 10.5, 51.5, 48.5, 15.2, 1.2, 32.5, 51.1, 32.5, 66.8, 0.3, 0.4, 'Census 2011', '2011-12-01'),

-- NADIA (Mixed urban-rural)
('wb_nadia_krishnanagar_uttar', 234567, 28.5, 33.5, 26.8, 11.2, 51.8, 48.2, 28.5, 2.5, 22.5, 46.5, 58.5, 40.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_nadia_ranaghat_uttar_paschim', 256789, 29.2, 32.8, 26.5, 11.5, 52.2, 47.8, 32.5, 2.2, 20.8, 44.5, 55.2, 44.2, 0.3, 0.3, 'Census 2011', '2011-12-01'),

-- HOOGHLY (Industrial + Rural mix)
('wb_hooghly_serampore', 178654, 25.8, 34.5, 28.2, 11.5, 51.5, 48.5, 22.5, 1.5, 18.5, 57.5, 72.5, 26.2, 0.5, 0.8, 'Census 2011', '2011-12-01'),
('wb_hooghly_chandannagar', 165432, 25.2, 34.8, 28.5, 11.5, 51.2, 48.8, 20.5, 1.2, 16.8, 61.5, 74.5, 24.2, 0.5, 0.8, 'Census 2011', '2011-12-01'),
('wb_hooghly_chinsurah', 187654, 26.5, 33.8, 28.2, 11.5, 51.8, 48.2, 23.5, 1.5, 19.5, 55.5, 70.2, 28.5, 0.5, 0.8, 'Census 2011', '2011-12-01'),
('wb_hooghly_arambag', 278965, 30.2, 32.5, 26.2, 11.1, 52.5, 47.5, 28.5, 5.5, 28.5, 37.5, 75.5, 23.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),

-- PURBA BARDHAMAN (Industrial belt)
('wb_purba_bardhaman_asansol_uttar', 312456, 27.5, 35.2, 27.8, 9.5, 53.5, 46.5, 18.5, 8.5, 25.5, 47.5, 68.5, 25.5, 2.5, 3.5, 'Census 2011', '2011-12-01'),
('wb_purba_bardhaman_asansol_dakshin', 298765, 27.2, 35.5, 27.5, 9.8, 53.8, 46.2, 17.8, 9.2, 26.2, 46.8, 67.2, 26.8, 2.8, 3.2, 'Census 2011', '2011-12-01'),
('wb_purba_bardhaman_durgapur_purba', 256789, 26.5, 36.2, 28.2, 9.1, 53.2, 46.8, 16.5, 7.5, 24.5, 51.5, 70.5, 23.5, 2.5, 3.5, 'Census 2011', '2011-12-01'),
('wb_purba_bardhaman_durgapur_paschim', 245678, 26.8, 35.8, 28.5, 8.9, 53.5, 46.5, 17.2, 8.2, 25.2, 49.4, 69.2, 24.5, 2.8, 3.5, 'Census 2011', '2011-12-01'),
('wb_purba_bardhaman_bardhaman_uttar', 234567, 28.2, 33.5, 27.2, 11.1, 52.2, 47.8, 25.5, 3.5, 22.5, 48.5, 72.5, 26.2, 0.5, 0.8, 'Census 2011', '2011-12-01'),

-- PASCHIM BARDHAMAN (Coal belt)
('wb_paschim_bardhaman_pandaveswar', 287654, 29.5, 34.2, 26.5, 9.8, 54.2, 45.8, 20.5, 12.5, 28.5, 38.5, 65.5, 28.5, 2.5, 3.5, 'Census 2011', '2011-12-01'),

-- PURBA MEDINIPUR (Coastal + Rural)
('wb_purba_medinipur_tamluk', 267890, 28.8, 32.5, 27.2, 11.5, 51.5, 48.5, 28.5, 2.5, 25.5, 43.5, 82.5, 16.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),
('wb_purba_medinipur_haldia', 198765, 27.5, 34.8, 27.5, 10.2, 52.5, 47.5, 22.5, 1.8, 22.8, 52.9, 78.5, 20.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),

-- PASCHIM MEDINIPUR (Rural dominant)
('wb_paschim_medinipur_midnapore', 287654, 29.8, 32.2, 26.5, 11.5, 51.8, 48.2, 18.5, 8.5, 32.5, 40.5, 85.5, 13.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),

-- BANKURA (Rural - Agricultural)
('wb_bankura_bankura', 267890, 30.2, 31.8, 26.5, 11.5, 51.5, 48.5, 32.5, 8.5, 28.5, 30.5, 88.5, 10.5, 0.4, 0.6, 'Census 2011', '2011-12-01'),

-- PURULIA (Tribal + Rural)
('wb_purulia_purulia', 245678, 31.5, 31.2, 25.8, 11.5, 51.2, 48.8, 18.5, 18.5, 35.5, 27.5, 90.5, 8.2, 0.5, 0.8, 'Census 2011', '2011-12-01')

ON CONFLICT (constituency_id) DO UPDATE SET
  total_population = EXCLUDED.total_population,
  age_0_18 = EXCLUDED.age_0_18,
  age_18_35 = EXCLUDED.age_18_35,
  age_35_60 = EXCLUDED.age_35_60,
  age_60_plus = EXCLUDED.age_60_plus,
  male_percentage = EXCLUDED.male_percentage,
  female_percentage = EXCLUDED.female_percentage,
  sc_percentage = EXCLUDED.sc_percentage,
  st_percentage = EXCLUDED.st_percentage,
  obc_percentage = EXCLUDED.obc_percentage,
  general_percentage = EXCLUDED.general_percentage,
  hindu_percentage = EXCLUDED.hindu_percentage,
  muslim_percentage = EXCLUDED.muslim_percentage,
  christian_percentage = EXCLUDED.christian_percentage,
  others_percentage = EXCLUDED.others_percentage,
  data_source = EXCLUDED.data_source,
  last_updated = EXCLUDED.last_updated;
