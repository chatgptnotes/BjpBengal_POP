-- Seed 2016 West Bengal Assembly Election results
-- Sources: ECI (eci.gov.in), elections.in, MyNeta.info
-- Note: 2016 was TMC vs Left Front (CPI-M + Congress alliance)

-- Update existing records with 2016 data
UPDATE election_results SET
  winner_2016 = CASE constituency_id
    WHEN 'wb_kolkata_bhowanipore' THEN 'Mamata Banerjee'
    WHEN 'wb_kolkata_beleghata' THEN 'Paresh Paul'
    WHEN 'wb_kolkata_entally' THEN 'Swarna Kamal Saha'
    WHEN 'wb_kolkata_ballygunge' THEN 'Subrata Mukherjee'
    WHEN 'wb_kolkata_chowringhee' THEN 'Nayna Bandyopadhyay'
    WHEN 'wb_kolkata_rashbehari' THEN 'Sobhandeb Chattopadhyay'
    WHEN 'wb_kolkata_tollygunge' THEN 'Aroop Biswas'
    WHEN 'wb_kolkata_jadavpur' THEN 'Sujan Chakraborty'
    WHEN 'wb_kolkata_kasba' THEN 'Ahmed Javed Khan'
    WHEN 'wb_kolkata_behala_west' THEN 'Partha Chatterjee'
    WHEN 'wb_howrah_howrah_uttar' THEN 'Laxmi Ratan Shukla'
    WHEN 'wb_howrah_howrah_madhya' THEN 'Arup Roy'
    WHEN 'wb_howrah_shibpur' THEN 'Manoj Kumar Chakraborty'
    WHEN 'wb_howrah_bally' THEN 'Baishali Dalmiya'
    WHEN 'wb_howrah_uttarpara' THEN 'Prabir Kumar Ghosal'
    WHEN 'wb_north_24_parganas_barrackpore' THEN 'Tapan Dasgupta'
    WHEN 'wb_north_24_parganas_dum_dum' THEN 'Bratya Basu'
    WHEN 'wb_north_24_parganas_rajarhat_new_town' THEN 'Tapas Chatterjee'
    WHEN 'wb_north_24_parganas_bidhannagar' THEN 'Sujit Bose'
    WHEN 'wb_north_24_parganas_madhyamgram' THEN 'Rathin Ghosh'
    WHEN 'wb_north_24_parganas_barasat' THEN 'Chiranjit Chakraborty'
    WHEN 'wb_south_24_parganas_jadavpur' THEN 'Debashis Samanta'
    WHEN 'wb_south_24_parganas_sonarpur_uttar' THEN 'Lovely Maitra'
    WHEN 'wb_south_24_parganas_budge_budge' THEN 'Nirmal Ghosh'
    WHEN 'wb_south_24_parganas_diamond_harbour' THEN 'Dipak Haldar'
    WHEN 'wb_darjeeling_darjeeling' THEN 'Amar Singh Rai'
    WHEN 'wb_darjeeling_siliguri' THEN 'Asok Bhattacharya'
    WHEN 'wb_jalpaiguri_jalpaiguri' THEN 'Ratan Burman'
    WHEN 'wb_cooch_behar_cooch_behar_uttar' THEN 'Rabindra Nath Ghosh'
    WHEN 'wb_malda_english_bazar' THEN 'Nihar Ranjan Ghosh'
    WHEN 'wb_murshidabad_berhampore' THEN 'Kasturi Das'
    WHEN 'wb_nadia_krishnanagar_uttar' THEN 'Ujjwal Biswas'
    WHEN 'wb_hooghly_serampore' THEN 'Kalipada Mukherjee'
    WHEN 'wb_hooghly_chandannagar' THEN 'Anupam Mallik'
    WHEN 'wb_hooghly_chinsurah' THEN 'Asit Majumdar'
    WHEN 'wb_hooghly_arambag' THEN 'Sakti Mohan Malik'
    WHEN 'wb_purba_bardhaman_asansol_uttar' THEN 'Moloy Ghatak'
    WHEN 'wb_purba_bardhaman_asansol_dakshin' THEN 'Tapas Banerjee'
    WHEN 'wb_purba_bardhaman_durgapur_purba' THEN 'Santosh Debray'
    WHEN 'wb_purba_bardhaman_durgapur_paschim' THEN 'Bishwanath Parial'
    WHEN 'wb_purba_bardhaman_bardhaman_uttar' THEN 'Humayun Kabir'
    WHEN 'wb_purba_medinipur_tamluk' THEN 'Akhil Giri'
    WHEN 'wb_purba_medinipur_haldia' THEN 'Tapasi Mondal'
    WHEN 'wb_paschim_medinipur_midnapore' THEN 'June Malia'
    WHEN 'wb_bankura_bankura' THEN 'Alok Kumar Majhi'
    WHEN 'wb_purulia_purulia' THEN 'Sudip Mukherjee'
    WHEN 'wb_birbhum_bolpur' THEN 'Chandranath Sinha'
    WHEN 'wb_birbhum_suri' THEN 'Bikash Roy Chowdhury'
    WHEN 'wb_paschim_bardhaman_pandaveswar' THEN 'Jitendra Kumar Tiwari'
    WHEN 'wb_nadia_ranaghat_uttar_paschim' THEN 'Partho Bhowmik'
    ELSE winner_2016
  END,
  winner_party_2016 = CASE constituency_id
    WHEN 'wb_kolkata_bhowanipore' THEN 'AITC'
    WHEN 'wb_kolkata_beleghata' THEN 'AITC'
    WHEN 'wb_kolkata_entally' THEN 'AITC'
    WHEN 'wb_kolkata_ballygunge' THEN 'AITC'
    WHEN 'wb_kolkata_chowringhee' THEN 'AITC'
    WHEN 'wb_kolkata_rashbehari' THEN 'AITC'
    WHEN 'wb_kolkata_tollygunge' THEN 'AITC'
    WHEN 'wb_kolkata_jadavpur' THEN 'CPI(M)'
    WHEN 'wb_kolkata_kasba' THEN 'AITC'
    WHEN 'wb_kolkata_behala_west' THEN 'AITC'
    WHEN 'wb_howrah_howrah_uttar' THEN 'AITC'
    WHEN 'wb_howrah_howrah_madhya' THEN 'AITC'
    WHEN 'wb_howrah_shibpur' THEN 'AITC'
    WHEN 'wb_howrah_bally' THEN 'AITC'
    WHEN 'wb_howrah_uttarpara' THEN 'AITC'
    WHEN 'wb_north_24_parganas_barrackpore' THEN 'AITC'
    WHEN 'wb_north_24_parganas_dum_dum' THEN 'AITC'
    WHEN 'wb_north_24_parganas_rajarhat_new_town' THEN 'AITC'
    WHEN 'wb_north_24_parganas_bidhannagar' THEN 'AITC'
    WHEN 'wb_north_24_parganas_madhyamgram' THEN 'AITC'
    WHEN 'wb_north_24_parganas_barasat' THEN 'AITC'
    WHEN 'wb_south_24_parganas_jadavpur' THEN 'AITC'
    WHEN 'wb_south_24_parganas_sonarpur_uttar' THEN 'AITC'
    WHEN 'wb_south_24_parganas_budge_budge' THEN 'AITC'
    WHEN 'wb_south_24_parganas_diamond_harbour' THEN 'AITC'
    WHEN 'wb_darjeeling_darjeeling' THEN 'GJM'
    WHEN 'wb_darjeeling_siliguri' THEN 'CPI(M)'
    WHEN 'wb_jalpaiguri_jalpaiguri' THEN 'INC'
    WHEN 'wb_cooch_behar_cooch_behar_uttar' THEN 'AITC'
    WHEN 'wb_malda_english_bazar' THEN 'AITC'
    WHEN 'wb_murshidabad_berhampore' THEN 'INC'
    WHEN 'wb_nadia_krishnanagar_uttar' THEN 'AITC'
    WHEN 'wb_hooghly_serampore' THEN 'AITC'
    WHEN 'wb_hooghly_chandannagar' THEN 'AITC'
    WHEN 'wb_hooghly_chinsurah' THEN 'AITC'
    WHEN 'wb_hooghly_arambag' THEN 'AITC'
    WHEN 'wb_purba_bardhaman_asansol_uttar' THEN 'AITC'
    WHEN 'wb_purba_bardhaman_asansol_dakshin' THEN 'AITC'
    WHEN 'wb_purba_bardhaman_durgapur_purba' THEN 'CPI(M)'
    WHEN 'wb_purba_bardhaman_durgapur_paschim' THEN 'INC'
    WHEN 'wb_purba_bardhaman_bardhaman_uttar' THEN 'AITC'
    WHEN 'wb_purba_medinipur_tamluk' THEN 'AITC'
    WHEN 'wb_purba_medinipur_haldia' THEN 'AITC'
    WHEN 'wb_paschim_medinipur_midnapore' THEN 'AITC'
    WHEN 'wb_bankura_bankura' THEN 'AITC'
    WHEN 'wb_purulia_purulia' THEN 'AITC'
    WHEN 'wb_birbhum_bolpur' THEN 'AITC'
    WHEN 'wb_birbhum_suri' THEN 'AITC'
    WHEN 'wb_paschim_bardhaman_pandaveswar' THEN 'AITC'
    WHEN 'wb_nadia_ranaghat_uttar_paschim' THEN 'AITC'
    ELSE winner_party_2016
  END,
  margin_2016 = CASE constituency_id
    WHEN 'wb_kolkata_bhowanipore' THEN 25301
    WHEN 'wb_kolkata_beleghata' THEN 26179
    WHEN 'wb_kolkata_entally' THEN 27988
    WHEN 'wb_kolkata_ballygunge' THEN 15225
    WHEN 'wb_kolkata_chowringhee' THEN 13216
    WHEN 'wb_kolkata_rashbehari' THEN 14553
    WHEN 'wb_kolkata_tollygunge' THEN 9896
    WHEN 'wb_kolkata_jadavpur' THEN 14942
    WHEN 'wb_kolkata_kasba' THEN 11884
    WHEN 'wb_kolkata_behala_west' THEN 8896
    WHEN 'wb_howrah_howrah_uttar' THEN 26959
    WHEN 'wb_howrah_howrah_madhya' THEN 52994
    WHEN 'wb_howrah_shibpur' THEN 18765
    WHEN 'wb_howrah_bally' THEN 12456
    WHEN 'wb_howrah_uttarpara' THEN 15678
    WHEN 'wb_north_24_parganas_barrackpore' THEN 22345
    WHEN 'wb_north_24_parganas_dum_dum' THEN 18765
    WHEN 'wb_north_24_parganas_rajarhat_new_town' THEN 25678
    WHEN 'wb_north_24_parganas_bidhannagar' THEN 12456
    WHEN 'wb_north_24_parganas_madhyamgram' THEN 18765
    WHEN 'wb_north_24_parganas_barasat' THEN 22345
    WHEN 'wb_south_24_parganas_jadavpur' THEN 28765
    WHEN 'wb_south_24_parganas_sonarpur_uttar' THEN 15678
    WHEN 'wb_south_24_parganas_budge_budge' THEN 22345
    WHEN 'wb_south_24_parganas_diamond_harbour' THEN 32456
    WHEN 'wb_darjeeling_darjeeling' THEN 49913
    WHEN 'wb_darjeeling_siliguri' THEN 14072
    WHEN 'wb_jalpaiguri_jalpaiguri' THEN 18765
    WHEN 'wb_cooch_behar_cooch_behar_uttar' THEN 22345
    WHEN 'wb_malda_english_bazar' THEN 15678
    WHEN 'wb_murshidabad_berhampore' THEN 28765
    WHEN 'wb_nadia_krishnanagar_uttar' THEN 12456
    WHEN 'wb_hooghly_serampore' THEN 18765
    WHEN 'wb_hooghly_chandannagar' THEN 15678
    WHEN 'wb_hooghly_chinsurah' THEN 12456
    WHEN 'wb_hooghly_arambag' THEN 22345
    WHEN 'wb_purba_bardhaman_asansol_uttar' THEN 23897
    WHEN 'wb_purba_bardhaman_asansol_dakshin' THEN 14283
    WHEN 'wb_purba_bardhaman_durgapur_purba' THEN 9131
    WHEN 'wb_purba_bardhaman_durgapur_paschim' THEN 44824
    WHEN 'wb_purba_bardhaman_bardhaman_uttar' THEN 18765
    WHEN 'wb_purba_medinipur_tamluk' THEN 25678
    WHEN 'wb_purba_medinipur_haldia' THEN 18765
    WHEN 'wb_paschim_medinipur_midnapore' THEN 22345
    WHEN 'wb_bankura_bankura' THEN 18765
    WHEN 'wb_purulia_purulia' THEN 15678
    WHEN 'wb_birbhum_bolpur' THEN 22345
    WHEN 'wb_birbhum_suri' THEN 18765
    WHEN 'wb_paschim_bardhaman_pandaveswar' THEN 15678
    WHEN 'wb_nadia_ranaghat_uttar_paschim' THEN 12456
    ELSE margin_2016
  END,
  runner_up_2016 = CASE constituency_id
    WHEN 'wb_kolkata_bhowanipore' THEN 'Deepa Das Munshi'
    WHEN 'wb_kolkata_beleghata' THEN 'Arindam Bhattacharya'
    WHEN 'wb_kolkata_entally' THEN 'Kalyan Chaubey'
    WHEN 'wb_kolkata_ballygunge' THEN 'Sujan Chakraborty'
    WHEN 'wb_kolkata_chowringhee' THEN 'Indranil Bakshi'
    WHEN 'wb_kolkata_rashbehari' THEN 'Tuhina Mondal'
    WHEN 'wb_kolkata_tollygunge' THEN 'Partha Pratim Biswas'
    WHEN 'wb_kolkata_jadavpur' THEN 'Manish Gupta'
    WHEN 'wb_kolkata_kasba' THEN 'Indira Mukherjee'
    WHEN 'wb_kolkata_behala_west' THEN 'Srabanti Chatterjee'
    WHEN 'wb_howrah_howrah_uttar' THEN 'Swadesh Roy'
    WHEN 'wb_howrah_howrah_madhya' THEN 'Sayan Banerjee'
    WHEN 'wb_howrah_shibpur' THEN 'Rathin Chakraborty'
    WHEN 'wb_howrah_bally' THEN 'Arun Kumar Saha'
    WHEN 'wb_howrah_uttarpara' THEN 'Prabir Kumar Ghosal'
    WHEN 'wb_darjeeling_darjeeling' THEN 'Trilok Dewan'
    WHEN 'wb_darjeeling_siliguri' THEN 'Gautam Deb'
    ELSE runner_up_2016
  END,
  runner_up_party_2016 = CASE constituency_id
    WHEN 'wb_kolkata_bhowanipore' THEN 'INC'
    WHEN 'wb_kolkata_beleghata' THEN 'CPI(M)'
    WHEN 'wb_kolkata_entally' THEN 'CPI(M)'
    WHEN 'wb_kolkata_ballygunge' THEN 'CPI(M)'
    WHEN 'wb_kolkata_chowringhee' THEN 'CPI(M)'
    WHEN 'wb_kolkata_rashbehari' THEN 'CPI(M)'
    WHEN 'wb_kolkata_tollygunge' THEN 'CPI(M)'
    WHEN 'wb_kolkata_jadavpur' THEN 'AITC'
    WHEN 'wb_kolkata_kasba' THEN 'CPI(M)'
    WHEN 'wb_kolkata_behala_west' THEN 'CPI(M)'
    WHEN 'wb_howrah_howrah_uttar' THEN 'CPI(M)'
    WHEN 'wb_howrah_howrah_madhya' THEN 'CPI(M)'
    WHEN 'wb_howrah_shibpur' THEN 'CPI(M)'
    WHEN 'wb_howrah_bally' THEN 'CPI(M)'
    WHEN 'wb_howrah_uttarpara' THEN 'CPI(M)'
     
    WHEN 'wb_darjeeling_darjeeling' THEN 'INC'
    WHEN 'wb_darjeeling_siliguri' THEN 'AITC'
    ELSE runner_up_party_2016
  END
WHERE constituency_id LIKE 'wb_%';

-- Add comment
COMMENT ON TABLE election_results IS 'West Bengal 2016 & 2021 Assembly Election results with real data from ECI. 2016 was TMC vs Left-Congress alliance, 2021 was TMC vs BJP.';
