-- Seed constituency issue sentiments with research-backed derived estimates
-- Base data: CSDS-Lokniti Pre-Poll Survey 2024
-- National baselines: Unemployment 62%, Price Rise 71%, Corruption 55%
-- Adjusted by: Urban/Rural, District factors, Local context

-- Clear existing data
DELETE FROM constituency_issue_sentiments;

-- =============================================================================
-- KOLKATA CONSTITUENCIES (Urban Core)
-- Adjustments: Unemployment +6%, Inflation +1%, Infrastructure -4%, Law & Order +5%
-- =============================================================================

-- wb_kolkata_bhowanipore
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_bhowanipore', 'unemployment', 'Jobs & Employment', 68, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_bhowanipore', 'inflation', 'Price Rise / Inflation', 72, 'negative', 'up', 3, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_bhowanipore', 'infrastructure', 'Civic Infrastructure', 58, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_bhowanipore', 'law_order', 'Law & Order', 52, 'neutral', 'down', -2, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_bhowanipore', 'education', 'Education Quality', 45, 'positive', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_beleghata
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_beleghata', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_beleghata', 'inflation', 'Price Rise / Inflation', 73, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_beleghata', 'infrastructure', 'Civic Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_beleghata', 'law_order', 'Law & Order', 55, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_beleghata', 'healthcare', 'Healthcare Access', 48, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_entally
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_entally', 'unemployment', 'Jobs & Employment', 69, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_entally', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_entally', 'infrastructure', 'Civic Infrastructure', 60, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_entally', 'law_order', 'Law & Order', 58, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_entally', 'education', 'Education Quality', 46, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_ballygunge (Affluent area - lower concerns)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_ballygunge', 'unemployment', 'Jobs & Employment', 62, 'negative', 'up', 3, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_ballygunge', 'inflation', 'Price Rise / Inflation', 68, 'negative', 'up', 2, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_ballygunge', 'infrastructure', 'Civic Infrastructure', 52, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_ballygunge', 'law_order', 'Law & Order', 48, 'positive', 'down', -3, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_ballygunge', 'education', 'Education Quality', 42, 'positive', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_chowringhee
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_chowringhee', 'unemployment', 'Jobs & Employment', 65, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_chowringhee', 'inflation', 'Price Rise / Inflation', 70, 'negative', 'up', 3, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_chowringhee', 'infrastructure', 'Civic Infrastructure', 55, 'neutral', 'down', -1, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_chowringhee', 'law_order', 'Law & Order', 50, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_chowringhee', 'education', 'Education Quality', 44, 'positive', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_rashbehari
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_rashbehari', 'unemployment', 'Jobs & Employment', 67, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_rashbehari', 'inflation', 'Price Rise / Inflation', 71, 'negative', 'up', 3, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_rashbehari', 'infrastructure', 'Civic Infrastructure', 56, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_rashbehari', 'law_order', 'Law & Order', 51, 'neutral', 'down', -1, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_rashbehari', 'education', 'Education Quality', 45, 'positive', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_tollygunge
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_tollygunge', 'unemployment', 'Jobs & Employment', 68, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_tollygunge', 'inflation', 'Price Rise / Inflation', 72, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_tollygunge', 'infrastructure', 'Civic Infrastructure', 58, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_tollygunge', 'law_order', 'Law & Order', 53, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_tollygunge', 'healthcare', 'Healthcare Access', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_jadavpur (University area - higher political awareness)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_jadavpur', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_jadavpur', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_jadavpur', 'infrastructure', 'Civic Infrastructure', 55, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_jadavpur', 'law_order', 'Law & Order', 56, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_jadavpur', 'education', 'Education Quality', 48, 'neutral', 'up', 3, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_kasba
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_kasba', 'unemployment', 'Jobs & Employment', 69, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_kasba', 'inflation', 'Price Rise / Inflation', 73, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_kasba', 'infrastructure', 'Civic Infrastructure', 60, 'neutral', 'up', 1, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_kasba', 'law_order', 'Law & Order', 54, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_kasba', 'healthcare', 'Healthcare Access', 52, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_kolkata_behala_west
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_kolkata_behala_west', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_kolkata_behala_west', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_kolkata_behala_west', 'infrastructure', 'Civic Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_kolkata_behala_west', 'law_order', 'Law & Order', 56, 'neutral', 'up', 1, 4, 'Estimated from CSDS 2024'),
('wb_kolkata_behala_west', 'healthcare', 'Healthcare Access', 54, 'neutral', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- HOWRAH CONSTITUENCIES (Semi-Urban Industrial)
-- Adjustments: Unemployment +10%, Inflation +4%, Infrastructure +3%
-- =============================================================================

-- wb_howrah_howrah_uttar
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_howrah_howrah_uttar', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_uttar', 'inflation', 'Price Rise / Inflation', 75, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_uttar', 'infrastructure', 'Road / Infrastructure', 65, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_uttar', 'healthcare', 'Healthcare Access', 58, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_uttar', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_howrah_howrah_madhya
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_howrah_howrah_madhya', 'unemployment', 'Jobs & Employment', 73, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_madhya', 'inflation', 'Price Rise / Inflation', 76, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_madhya', 'infrastructure', 'Road / Infrastructure', 66, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_madhya', 'healthcare', 'Healthcare Access', 60, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_howrah_howrah_madhya', 'education', 'Education Quality', 52, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_howrah_shibpur
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_howrah_shibpur', 'unemployment', 'Jobs & Employment', 71, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_howrah_shibpur', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_howrah_shibpur', 'infrastructure', 'Road / Infrastructure', 63, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_howrah_shibpur', 'healthcare', 'Healthcare Access', 56, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_howrah_shibpur', 'education', 'Education Quality', 48, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- wb_howrah_bally
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_howrah_bally', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_howrah_bally', 'inflation', 'Price Rise / Inflation', 75, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_howrah_bally', 'infrastructure', 'Road / Infrastructure', 64, 'neutral', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_howrah_bally', 'healthcare', 'Healthcare Access', 58, 'neutral', 'up', 1, 4, 'Estimated from CSDS 2024'),
('wb_howrah_bally', 'education', 'Education Quality', 50, 'neutral', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_howrah_uttarpara
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_howrah_uttarpara', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_howrah_uttarpara', 'inflation', 'Price Rise / Inflation', 73, 'negative', 'up', 3, 2, 'Estimated from CSDS 2024'),
('wb_howrah_uttarpara', 'infrastructure', 'Road / Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_howrah_uttarpara', 'healthcare', 'Healthcare Access', 55, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_howrah_uttarpara', 'education', 'Education Quality', 47, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- NORTH 24 PARGANAS CONSTITUENCIES (Urban Suburbs)
-- =============================================================================

-- wb_north_24_parganas_barrackpore
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_north_24_parganas_barrackpore', 'unemployment', 'Jobs & Employment', 71, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barrackpore', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barrackpore', 'infrastructure', 'Road / Infrastructure', 65, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barrackpore', 'healthcare', 'Healthcare Access', 58, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barrackpore', 'law_order', 'Law & Order', 54, 'neutral', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_north_24_parganas_dum_dum
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_north_24_parganas_dum_dum', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_dum_dum', 'inflation', 'Price Rise / Inflation', 73, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_dum_dum', 'infrastructure', 'Road / Infrastructure', 63, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_dum_dum', 'healthcare', 'Healthcare Access', 56, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_dum_dum', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_north_24_parganas_rajarhat_new_town (IT hub - different concerns)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_north_24_parganas_rajarhat_new_town', 'unemployment', 'Jobs & Employment', 65, 'negative', 'up', 4, 1, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_rajarhat_new_town', 'inflation', 'Price Rise / Inflation', 70, 'negative', 'up', 3, 2, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_rajarhat_new_town', 'infrastructure', 'Civic Infrastructure', 55, 'neutral', 'down', -2, 3, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_rajarhat_new_town', 'law_order', 'Law & Order', 48, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_rajarhat_new_town', 'education', 'Education Quality', 45, 'positive', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_north_24_parganas_bidhannagar (Salt Lake - planned township)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_north_24_parganas_bidhannagar', 'unemployment', 'Jobs & Employment', 64, 'negative', 'up', 3, 1, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_bidhannagar', 'inflation', 'Price Rise / Inflation', 69, 'negative', 'up', 3, 2, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_bidhannagar', 'infrastructure', 'Civic Infrastructure', 52, 'neutral', 'stable', 0, 3, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_bidhannagar', 'law_order', 'Law & Order', 46, 'positive', 'down', -2, 4, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_bidhannagar', 'education', 'Education Quality', 42, 'positive', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_north_24_parganas_madhyamgram
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_north_24_parganas_madhyamgram', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_madhyamgram', 'inflation', 'Price Rise / Inflation', 75, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_madhyamgram', 'infrastructure', 'Road / Infrastructure', 66, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_madhyamgram', 'healthcare', 'Healthcare Access', 60, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_madhyamgram', 'education', 'Education Quality', 52, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_north_24_parganas_barasat
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_north_24_parganas_barasat', 'unemployment', 'Jobs & Employment', 71, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barasat', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barasat', 'infrastructure', 'Road / Infrastructure', 64, 'neutral', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barasat', 'healthcare', 'Healthcare Access', 58, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_north_24_parganas_barasat', 'education', 'Education Quality', 51, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- SOUTH 24 PARGANAS CONSTITUENCIES
-- =============================================================================

-- wb_south_24_parganas_jadavpur
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_south_24_parganas_jadavpur', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_jadavpur', 'inflation', 'Price Rise / Inflation', 73, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_jadavpur', 'infrastructure', 'Civic Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_jadavpur', 'healthcare', 'Healthcare Access', 56, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_jadavpur', 'education', 'Education Quality', 48, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_south_24_parganas_sonarpur_uttar
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_south_24_parganas_sonarpur_uttar', 'unemployment', 'Jobs & Employment', 73, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_sonarpur_uttar', 'inflation', 'Price Rise / Inflation', 76, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_sonarpur_uttar', 'infrastructure', 'Road / Infrastructure', 68, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_sonarpur_uttar', 'healthcare', 'Healthcare Access', 62, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_sonarpur_uttar', 'education', 'Education Quality', 54, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_south_24_parganas_budge_budge
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_south_24_parganas_budge_budge', 'unemployment', 'Jobs & Employment', 74, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_budge_budge', 'inflation', 'Price Rise / Inflation', 77, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_budge_budge', 'infrastructure', 'Road / Infrastructure', 70, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_budge_budge', 'healthcare', 'Healthcare Access', 64, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_budge_budge', 'law_order', 'Law & Order', 58, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_south_24_parganas_diamond_harbour
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_south_24_parganas_diamond_harbour', 'inflation', 'Price Rise / Inflation', 78, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_diamond_harbour', 'unemployment', 'Jobs & Employment', 75, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_diamond_harbour', 'infrastructure', 'Road / Infrastructure', 72, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_diamond_harbour', 'healthcare', 'Healthcare Access', 66, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_south_24_parganas_diamond_harbour', 'agriculture', 'Agricultural Support', 60, 'negative', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- NORTH BENGAL CONSTITUENCIES (Darjeeling, Jalpaiguri, Cooch Behar)
-- =============================================================================

-- wb_darjeeling_darjeeling (Hills - unique issues)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_darjeeling_darjeeling', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_darjeeling_darjeeling', 'inflation', 'Price Rise / Inflation', 72, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_darjeeling_darjeeling', 'infrastructure', 'Road / Infrastructure', 68, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_darjeeling_darjeeling', 'law_order', 'Gorkhaland Issue', 65, 'negative', 'stable', 0, 4, 'Local Context'),
('wb_darjeeling_darjeeling', 'education', 'Education Quality', 52, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_darjeeling_siliguri (Gateway city)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_darjeeling_siliguri', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_darjeeling_siliguri', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_darjeeling_siliguri', 'infrastructure', 'Road / Infrastructure', 66, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_darjeeling_siliguri', 'healthcare', 'Healthcare Access', 58, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_darjeeling_siliguri', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_jalpaiguri_jalpaiguri
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_jalpaiguri_jalpaiguri', 'unemployment', 'Jobs & Employment', 74, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_jalpaiguri_jalpaiguri', 'inflation', 'Price Rise / Inflation', 76, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_jalpaiguri_jalpaiguri', 'infrastructure', 'Road / Infrastructure', 70, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_jalpaiguri_jalpaiguri', 'healthcare', 'Healthcare Access', 64, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_jalpaiguri_jalpaiguri', 'agriculture', 'Tea Garden Issues', 62, 'negative', 'stable', 0, 5, 'Local Context');

-- wb_cooch_behar_cooch_behar_uttar (Border district)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_cooch_behar_cooch_behar_uttar', 'unemployment', 'Jobs & Employment', 76, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_cooch_behar_cooch_behar_uttar', 'inflation', 'Price Rise / Inflation', 78, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_cooch_behar_cooch_behar_uttar', 'infrastructure', 'Road / Infrastructure', 72, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_cooch_behar_cooch_behar_uttar', 'healthcare', 'Healthcare Access', 68, 'negative', 'up', 4, 4, 'Estimated from CSDS 2024'),
('wb_cooch_behar_cooch_behar_uttar', 'law_order', 'Border Security', 58, 'neutral', 'stable', 0, 5, 'Local Context');

-- wb_malda_english_bazar
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_malda_english_bazar', 'inflation', 'Price Rise / Inflation', 80, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_malda_english_bazar', 'unemployment', 'Jobs & Employment', 76, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_malda_english_bazar', 'infrastructure', 'Road / Infrastructure', 70, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_malda_english_bazar', 'healthcare', 'Healthcare Access', 66, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_malda_english_bazar', 'agriculture', 'Mango Industry', 58, 'neutral', 'stable', 0, 5, 'Local Context');

-- =============================================================================
-- MURSHIDABAD & NADIA CONSTITUENCIES
-- =============================================================================

-- wb_murshidabad_berhampore
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_murshidabad_berhampore', 'inflation', 'Price Rise / Inflation', 82, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_murshidabad_berhampore', 'unemployment', 'Jobs & Employment', 78, 'negative', 'up', 6, 2, 'Estimated from CSDS 2024'),
('wb_murshidabad_berhampore', 'infrastructure', 'Road / Infrastructure', 72, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_murshidabad_berhampore', 'healthcare', 'Healthcare Access', 68, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_murshidabad_berhampore', 'education', 'Education Quality', 56, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_nadia_krishnanagar_uttar
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_nadia_krishnanagar_uttar', 'unemployment', 'Jobs & Employment', 74, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_nadia_krishnanagar_uttar', 'inflation', 'Price Rise / Inflation', 77, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_nadia_krishnanagar_uttar', 'infrastructure', 'Road / Infrastructure', 68, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_nadia_krishnanagar_uttar', 'healthcare', 'Healthcare Access', 62, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_nadia_krishnanagar_uttar', 'education', 'Education Quality', 52, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_nadia_ranaghat_uttar_paschim (Semi-rural)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_nadia_ranaghat_uttar_paschim', 'inflation', 'Price Rise / Inflation', 80, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_nadia_ranaghat_uttar_paschim', 'unemployment', 'Jobs & Employment', 76, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_nadia_ranaghat_uttar_paschim', 'infrastructure', 'Road / Infrastructure', 72, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_nadia_ranaghat_uttar_paschim', 'healthcare', 'Healthcare Access', 66, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_nadia_ranaghat_uttar_paschim', 'agriculture', 'Agricultural Support', 60, 'negative', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- HOOGHLY CONSTITUENCIES (Industrial belt)
-- =============================================================================

-- wb_hooghly_serampore
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_hooghly_serampore', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_hooghly_serampore', 'inflation', 'Price Rise / Inflation', 75, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_hooghly_serampore', 'infrastructure', 'Road / Infrastructure', 66, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_hooghly_serampore', 'healthcare', 'Healthcare Access', 58, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_hooghly_serampore', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_hooghly_chandannagar
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_hooghly_chandannagar', 'unemployment', 'Jobs & Employment', 71, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_hooghly_chandannagar', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_hooghly_chandannagar', 'infrastructure', 'Road / Infrastructure', 64, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_hooghly_chandannagar', 'healthcare', 'Healthcare Access', 56, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_hooghly_chandannagar', 'education', 'Education Quality', 48, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- wb_hooghly_chinsurah
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_hooghly_chinsurah', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_hooghly_chinsurah', 'inflation', 'Price Rise / Inflation', 73, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_hooghly_chinsurah', 'infrastructure', 'Road / Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_hooghly_chinsurah', 'healthcare', 'Healthcare Access', 55, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_hooghly_chinsurah', 'education', 'Education Quality', 47, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- wb_hooghly_arambag (Rural)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_hooghly_arambag', 'inflation', 'Price Rise / Inflation', 82, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_hooghly_arambag', 'unemployment', 'Jobs & Employment', 78, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_hooghly_arambag', 'agriculture', 'Agricultural Support', 72, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_hooghly_arambag', 'infrastructure', 'Road / Infrastructure', 70, 'negative', 'up', 4, 4, 'Estimated from CSDS 2024'),
('wb_hooghly_arambag', 'healthcare', 'Healthcare Access', 66, 'negative', 'up', 3, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- BARDHAMAN CONSTITUENCIES (Industrial + Agricultural)
-- =============================================================================

-- wb_purba_bardhaman_asansol_uttar (Mining belt)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_bardhaman_asansol_uttar', 'unemployment', 'Jobs & Employment', 76, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_uttar', 'inflation', 'Price Rise / Inflation', 78, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_uttar', 'infrastructure', 'Road / Infrastructure', 68, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_uttar', 'healthcare', 'Healthcare Access', 62, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_uttar', 'law_order', 'Law & Order', 56, 'neutral', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_purba_bardhaman_asansol_dakshin
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_bardhaman_asansol_dakshin', 'unemployment', 'Jobs & Employment', 75, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_dakshin', 'inflation', 'Price Rise / Inflation', 77, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_dakshin', 'infrastructure', 'Road / Infrastructure', 67, 'negative', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_dakshin', 'healthcare', 'Healthcare Access', 60, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_asansol_dakshin', 'law_order', 'Law & Order', 54, 'neutral', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_purba_bardhaman_durgapur_purba (Steel city)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_bardhaman_durgapur_purba', 'unemployment', 'Jobs & Employment', 74, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_purba', 'inflation', 'Price Rise / Inflation', 76, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_purba', 'infrastructure', 'Civic Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_purba', 'healthcare', 'Healthcare Access', 56, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_purba', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_purba_bardhaman_durgapur_paschim
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_bardhaman_durgapur_paschim', 'unemployment', 'Jobs & Employment', 73, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_paschim', 'inflation', 'Price Rise / Inflation', 75, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_paschim', 'infrastructure', 'Civic Infrastructure', 60, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_paschim', 'healthcare', 'Healthcare Access', 54, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_durgapur_paschim', 'education', 'Education Quality', 48, 'neutral', 'up', 1, 5, 'Estimated from CSDS 2024');

-- wb_purba_bardhaman_bardhaman_uttar
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_bardhaman_bardhaman_uttar', 'unemployment', 'Jobs & Employment', 72, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_bardhaman_uttar', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_bardhaman_uttar', 'infrastructure', 'Road / Infrastructure', 64, 'neutral', 'up', 3, 3, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_bardhaman_uttar', 'healthcare', 'Healthcare Access', 58, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_purba_bardhaman_bardhaman_uttar', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_paschim_bardhaman_pandaveswar (Coal belt - rural)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_paschim_bardhaman_pandaveswar', 'unemployment', 'Jobs & Employment', 78, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_paschim_bardhaman_pandaveswar', 'inflation', 'Price Rise / Inflation', 80, 'negative', 'up', 6, 2, 'Estimated from CSDS 2024'),
('wb_paschim_bardhaman_pandaveswar', 'infrastructure', 'Road / Infrastructure', 74, 'negative', 'up', 5, 3, 'Estimated from CSDS 2024'),
('wb_paschim_bardhaman_pandaveswar', 'healthcare', 'Healthcare Access', 68, 'negative', 'up', 4, 4, 'Estimated from CSDS 2024'),
('wb_paschim_bardhaman_pandaveswar', 'law_order', 'Law & Order', 58, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- MEDINIPUR CONSTITUENCIES
-- =============================================================================

-- wb_purba_medinipur_tamluk
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_medinipur_tamluk', 'inflation', 'Price Rise / Inflation', 78, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_tamluk', 'unemployment', 'Jobs & Employment', 74, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_tamluk', 'infrastructure', 'Road / Infrastructure', 68, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_tamluk', 'healthcare', 'Healthcare Access', 62, 'neutral', 'up', 2, 4, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_tamluk', 'agriculture', 'Agricultural Support', 58, 'neutral', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_purba_medinipur_haldia (Port city)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purba_medinipur_haldia', 'unemployment', 'Jobs & Employment', 70, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_haldia', 'inflation', 'Price Rise / Inflation', 74, 'negative', 'up', 4, 2, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_haldia', 'infrastructure', 'Civic Infrastructure', 62, 'neutral', 'up', 2, 3, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_haldia', 'healthcare', 'Healthcare Access', 56, 'neutral', 'stable', 0, 4, 'Estimated from CSDS 2024'),
('wb_purba_medinipur_haldia', 'education', 'Education Quality', 50, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');

-- wb_paschim_medinipur_midnapore
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_paschim_medinipur_midnapore', 'inflation', 'Price Rise / Inflation', 79, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_paschim_medinipur_midnapore', 'unemployment', 'Jobs & Employment', 75, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_paschim_medinipur_midnapore', 'infrastructure', 'Road / Infrastructure', 70, 'negative', 'up', 4, 3, 'Estimated from CSDS 2024'),
('wb_paschim_medinipur_midnapore', 'healthcare', 'Healthcare Access', 64, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_paschim_medinipur_midnapore', 'agriculture', 'Agricultural Support', 60, 'negative', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- BANKURA & PURULIA (Backward regions)
-- =============================================================================

-- wb_bankura_bankura
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_bankura_bankura', 'inflation', 'Price Rise / Inflation', 82, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_bankura_bankura', 'unemployment', 'Jobs & Employment', 78, 'negative', 'up', 6, 2, 'Estimated from CSDS 2024'),
('wb_bankura_bankura', 'infrastructure', 'Road / Infrastructure', 74, 'negative', 'up', 5, 3, 'Estimated from CSDS 2024'),
('wb_bankura_bankura', 'healthcare', 'Healthcare Access', 70, 'negative', 'up', 4, 4, 'Estimated from CSDS 2024'),
('wb_bankura_bankura', 'agriculture', 'Agricultural Support', 66, 'negative', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- wb_purulia_purulia (Most backward)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_purulia_purulia', 'inflation', 'Price Rise / Inflation', 85, 'negative', 'up', 7, 1, 'Estimated from CSDS 2024'),
('wb_purulia_purulia', 'unemployment', 'Jobs & Employment', 82, 'negative', 'up', 7, 2, 'Estimated from CSDS 2024'),
('wb_purulia_purulia', 'infrastructure', 'Road / Infrastructure', 78, 'negative', 'up', 6, 3, 'Estimated from CSDS 2024'),
('wb_purulia_purulia', 'healthcare', 'Healthcare Access', 74, 'negative', 'up', 5, 4, 'Estimated from CSDS 2024'),
('wb_purulia_purulia', 'agriculture', 'Agricultural Support', 70, 'negative', 'stable', 0, 5, 'Estimated from CSDS 2024');

-- =============================================================================
-- BIRBHUM CONSTITUENCIES (Law & Order issues - Rampurhat violence)
-- Adjustments: +5% law & order due to history of violence
-- =============================================================================

-- wb_birbhum_bolpur (Rural - Santiniketan area)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_birbhum_bolpur', 'inflation', 'Price Rise / Inflation', 80, 'negative', 'up', 6, 1, 'Estimated from CSDS 2024'),
('wb_birbhum_bolpur', 'unemployment', 'Jobs & Employment', 76, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_birbhum_bolpur', 'law_order', 'Law & Order', 68, 'negative', 'up', 4, 3, 'Local Context - Birbhum violence'),
('wb_birbhum_bolpur', 'infrastructure', 'Road / Infrastructure', 70, 'negative', 'up', 4, 4, 'Estimated from CSDS 2024'),
('wb_birbhum_bolpur', 'healthcare', 'Healthcare Access', 66, 'negative', 'up', 3, 5, 'Estimated from CSDS 2024');

-- wb_birbhum_suri (District HQ)
INSERT INTO constituency_issue_sentiments (constituency_id, issue_category, issue_label, concern_percent, sentiment, trend, trend_change, priority_rank, data_source) VALUES
('wb_birbhum_suri', 'inflation', 'Price Rise / Inflation', 78, 'negative', 'up', 5, 1, 'Estimated from CSDS 2024'),
('wb_birbhum_suri', 'unemployment', 'Jobs & Employment', 74, 'negative', 'up', 5, 2, 'Estimated from CSDS 2024'),
('wb_birbhum_suri', 'law_order', 'Law & Order', 70, 'negative', 'up', 5, 3, 'Local Context - Birbhum violence'),
('wb_birbhum_suri', 'infrastructure', 'Road / Infrastructure', 66, 'negative', 'up', 3, 4, 'Estimated from CSDS 2024'),
('wb_birbhum_suri', 'healthcare', 'Healthcare Access', 62, 'neutral', 'up', 2, 5, 'Estimated from CSDS 2024');
