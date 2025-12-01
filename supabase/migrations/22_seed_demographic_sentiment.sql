-- Seed demographic sentiment data for all 50 West Bengal constituencies
-- Data varies by urban/rural characteristics

INSERT INTO demographic_sentiment (
  constituency_id,
  youth_positive, youth_neutral, youth_negative,
  women_positive, women_neutral, women_negative,
  urban_middle_class_positive, urban_middle_class_neutral, urban_middle_class_negative,
  rural_voters_positive, rural_voters_neutral, rural_voters_negative,
  small_traders_positive, small_traders_neutral, small_traders_negative
) VALUES
-- KOLKATA METRO (Urban - More polarized youth, strong women support)
('wb_kolkata_bhowanipore', 25, 25, 50, 60, 25, 15, 40, 25, 35, 35, 30, 35, 35, 30, 35),
('wb_kolkata_beleghata', 30, 20, 50, 55, 30, 15, 45, 25, 30, 40, 25, 35, 40, 30, 30),
('wb_kolkata_entally', 28, 22, 50, 58, 27, 15, 42, 28, 30, 38, 27, 35, 38, 32, 30),
('wb_kolkata_ballygunge', 22, 28, 50, 62, 23, 15, 48, 22, 30, 32, 33, 35, 42, 28, 30),
('wb_kolkata_chowringhee', 20, 30, 50, 65, 20, 15, 50, 20, 30, 30, 35, 35, 45, 25, 30),
('wb_kolkata_rashbehari', 27, 23, 50, 57, 28, 15, 43, 27, 30, 37, 28, 35, 37, 33, 30),
('wb_kolkata_tollygunge', 32, 18, 50, 52, 33, 15, 38, 32, 30, 42, 23, 35, 35, 35, 30),
('wb_kolkata_jadavpur', 35, 15, 50, 50, 35, 15, 35, 35, 30, 45, 20, 35, 32, 38, 30),
('wb_kolkata_kasba', 29, 21, 50, 56, 29, 15, 44, 26, 30, 39, 26, 35, 39, 31, 30),
('wb_kolkata_behala_west', 33, 17, 50, 51, 34, 15, 36, 34, 30, 43, 22, 35, 34, 36, 30),

-- HOWRAH METRO (Urban - Industrial belt, strong worker sentiment)
('wb_howrah_howrah_uttar', 28, 27, 45, 55, 25, 20, 38, 32, 30, 42, 28, 30, 45, 30, 25),
('wb_howrah_howrah_madhya', 30, 25, 45, 53, 27, 20, 40, 30, 30, 40, 30, 30, 48, 27, 25),
('wb_howrah_shibpur', 32, 23, 45, 51, 29, 20, 42, 28, 30, 38, 32, 30, 50, 25, 25),
('wb_howrah_bally', 27, 28, 45, 56, 24, 20, 37, 33, 30, 43, 27, 30, 44, 31, 25),
('wb_howrah_uttarpara', 25, 30, 45, 58, 22, 20, 35, 35, 30, 45, 25, 30, 42, 33, 25),

-- NORTH 24 PARGANAS (Mixed - Suburban, diverse demographics)
('wb_north_24_parganas_barrackpore', 35, 25, 40, 50, 30, 20, 40, 30, 30, 45, 25, 30, 42, 33, 25),
('wb_north_24_parganas_dum_dum', 33, 27, 40, 52, 28, 20, 42, 28, 30, 43, 27, 30, 44, 31, 25),
('wb_north_24_parganas_rajarhat_new_town', 40, 20, 40, 45, 35, 20, 55, 20, 25, 35, 35, 30, 50, 25, 25),
('wb_north_24_parganas_bidhannagar', 38, 22, 40, 48, 32, 20, 52, 23, 25, 38, 32, 30, 48, 27, 25),
('wb_north_24_parganas_madhyamgram', 32, 28, 40, 53, 27, 20, 43, 27, 30, 42, 28, 30, 45, 30, 25),
('wb_north_24_parganas_barasat', 30, 30, 40, 55, 25, 20, 40, 30, 30, 45, 25, 30, 43, 32, 25),

-- SOUTH 24 PARGANAS (Semi-urban to Rural)
('wb_south_24_parganas_jadavpur', 34, 26, 40, 50, 30, 20, 45, 25, 30, 40, 30, 30, 42, 33, 25),
('wb_south_24_parganas_sonarpur_uttar', 30, 30, 40, 52, 28, 20, 40, 30, 30, 45, 25, 30, 40, 35, 25),
('wb_south_24_parganas_budge_budge', 28, 32, 40, 55, 25, 20, 38, 32, 30, 48, 22, 30, 38, 37, 25),
('wb_south_24_parganas_diamond_harbour', 25, 35, 40, 58, 22, 20, 35, 35, 30, 52, 18, 30, 35, 40, 25),

-- DARJEELING / SILIGURI (Hill and Terai - Different dynamics)
('wb_darjeeling_darjeeling', 40, 30, 30, 45, 35, 20, 50, 25, 25, 40, 35, 25, 45, 35, 20),
('wb_darjeeling_siliguri', 38, 32, 30, 48, 32, 20, 52, 23, 25, 42, 33, 25, 48, 32, 20),

-- JALPAIGURI / COOCH BEHAR (North Bengal - Rural dominant)
('wb_jalpaiguri_jalpaiguri', 35, 30, 35, 52, 28, 20, 42, 28, 30, 50, 25, 25, 45, 30, 25),
('wb_cooch_behar_cooch_behar_uttar', 32, 33, 35, 55, 25, 20, 38, 32, 30, 55, 20, 25, 42, 33, 25),

-- MALDA / MURSHIDABAD (Border districts - Diverse)
('wb_malda_english_bazar', 30, 35, 35, 53, 27, 20, 40, 30, 30, 52, 23, 25, 43, 32, 25),
('wb_murshidabad_berhampore', 28, 37, 35, 55, 25, 20, 38, 32, 30, 55, 20, 25, 40, 35, 25),

-- NADIA (Mixed urban-rural)
('wb_nadia_krishnanagar_uttar', 33, 32, 35, 50, 30, 20, 45, 25, 30, 48, 27, 25, 45, 30, 25),
('wb_nadia_ranaghat_uttar_paschim', 28, 37, 35, 55, 25, 20, 38, 32, 30, 55, 20, 25, 40, 35, 25),

-- HOOGHLY (Industrial + Rural mix)
('wb_hooghly_serampore', 35, 30, 35, 50, 30, 20, 48, 22, 30, 42, 33, 25, 50, 25, 25),
('wb_hooghly_chandannagar', 37, 28, 35, 48, 32, 20, 50, 20, 30, 40, 35, 25, 52, 23, 25),
('wb_hooghly_chinsurah', 34, 31, 35, 51, 29, 20, 47, 23, 30, 43, 32, 25, 49, 26, 25),
('wb_hooghly_arambag', 25, 40, 35, 58, 22, 20, 35, 35, 30, 58, 17, 25, 38, 37, 25),

-- PURBA BARDHAMAN (Industrial belt - Strong worker presence)
('wb_purba_bardhaman_asansol_uttar', 38, 27, 35, 48, 32, 20, 50, 20, 30, 40, 35, 25, 55, 20, 25),
('wb_purba_bardhaman_asansol_dakshin', 40, 25, 35, 45, 35, 20, 52, 18, 30, 38, 37, 25, 57, 18, 25),
('wb_purba_bardhaman_durgapur_purba', 42, 23, 35, 43, 37, 20, 55, 15, 30, 35, 40, 25, 58, 17, 25),
('wb_purba_bardhaman_durgapur_paschim', 41, 24, 35, 44, 36, 20, 54, 16, 30, 36, 39, 25, 57, 18, 25),
('wb_purba_bardhaman_bardhaman_uttar', 35, 30, 35, 50, 30, 20, 48, 22, 30, 45, 30, 25, 50, 25, 25),

-- PASCHIM BARDHAMAN (Coal belt - Rural + Mining)
('wb_paschim_bardhaman_pandaveswar', 30, 35, 35, 55, 25, 20, 40, 30, 30, 55, 20, 25, 48, 27, 25),

-- PURBA MEDINIPUR (Coastal + Rural)
('wb_purba_medinipur_tamluk', 28, 37, 35, 55, 25, 20, 38, 32, 30, 55, 20, 25, 42, 33, 25),
('wb_purba_medinipur_haldia', 35, 30, 35, 50, 30, 20, 50, 20, 30, 45, 30, 25, 52, 23, 25),

-- PASCHIM MEDINIPUR (Rural dominant)
('wb_paschim_medinipur_midnapore', 25, 40, 35, 58, 22, 20, 35, 35, 30, 60, 15, 25, 38, 37, 25),

-- BANKURA (Rural - Agricultural)
('wb_bankura_bankura', 27, 38, 35, 56, 24, 20, 37, 33, 30, 58, 17, 25, 40, 35, 25),

-- PURULIA (Tribal + Rural)
('wb_purulia_purulia', 25, 40, 35, 58, 22, 20, 33, 37, 30, 62, 13, 25, 35, 40, 25)

ON CONFLICT (constituency_id) DO UPDATE SET
  youth_positive = EXCLUDED.youth_positive,
  youth_neutral = EXCLUDED.youth_neutral,
  youth_negative = EXCLUDED.youth_negative,
  women_positive = EXCLUDED.women_positive,
  women_neutral = EXCLUDED.women_neutral,
  women_negative = EXCLUDED.women_negative,
  urban_middle_class_positive = EXCLUDED.urban_middle_class_positive,
  urban_middle_class_neutral = EXCLUDED.urban_middle_class_neutral,
  urban_middle_class_negative = EXCLUDED.urban_middle_class_negative,
  rural_voters_positive = EXCLUDED.rural_voters_positive,
  rural_voters_neutral = EXCLUDED.rural_voters_neutral,
  rural_voters_negative = EXCLUDED.rural_voters_negative,
  small_traders_positive = EXCLUDED.small_traders_positive,
  small_traders_neutral = EXCLUDED.small_traders_neutral,
  small_traders_negative = EXCLUDED.small_traders_negative,
  updated_at = NOW();
