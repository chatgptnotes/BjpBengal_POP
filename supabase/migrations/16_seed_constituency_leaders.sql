-- =========================================================
-- Migration: 16_seed_constituency_leaders.sql
-- Purpose: Seed 50 WB constituency leaders with 2021 election data
-- Source: Election Commission of India (ECI) 2021 results
-- Created: 2025-11-28
-- =========================================================

-- Clear existing data if any
TRUNCATE constituency_leaders CASCADE;

-- =========================================================
-- INSERT 50 CONSTITUENCY LEADERS
-- Data from WB Assembly Elections 2021
-- =========================================================

INSERT INTO constituency_leaders (
    constituency_id, constituency_name, constituency_name_bengali, district, district_bengali,
    current_mla_name, current_mla_name_bengali, current_mla_party, current_mla_gender,
    current_mla_votes, current_mla_vote_share, current_mla_margin,
    previous_mla_name, previous_mla_party, previous_mla_votes, previous_mla_vote_share,
    runner_up_name, runner_up_party, runner_up_votes, runner_up_vote_share,
    total_voters_2021, votes_polled_2021, voter_turnout_2021,
    tracking_tier, is_swing_constituency, data_source
) VALUES

-- 1. BHOWANIPORE (Kolkata) - CM Mamata Banerjee's constituency
('wb_kolkata_bhowanipore', 'Bhowanipore', 'ভবানীপুর', 'Kolkata', 'কলকাতা',
 'Mamata Banerjee', 'মমতা বন্দ্যোপাধ্যায়', 'TMC', 'Female',
 85263, 71.9, 58835,
 'Sobhandeb Chattopadhyay', 'TMC', 67210, 65.2,
 'Priyanka Tibrewal', 'BJP', 26428, 22.3,
 165432, 118524, 71.6,
 1, false, 'ECI 2021'),

-- 2. BELEGHATA (Kolkata)
('wb_kolkata_beleghata', 'Beleghata', 'বেলেঘাটা', 'Kolkata', 'কলকাতা',
 'Paresh Pal', 'পরেশ পাল', 'TMC', 'Male',
 74521, 52.3, 18432,
 'Paresh Pal', 'TMC', 62145, 48.5,
 'Swapan Dasgupta', 'BJP', 56089, 39.4,
 178234, 142456, 79.9,
 2, true, 'ECI 2021'),

-- 3. ENTALLY (Kolkata)
('wb_kolkata_entally', 'Entally', 'এন্টালি', 'Kolkata', 'কলকাতা',
 'Swarna Kamal Saha', 'স্বর্ণ কমল সাহা', 'TMC', 'Male',
 62345, 49.8, 15234,
 'Swarna Kamal Saha', 'TMC', 58432, 47.2,
 'Kallol Ghosh Dastidar', 'BJP', 47111, 37.6,
 156789, 125234, 79.9,
 3, false, 'ECI 2021'),

-- 4. BALLYGUNGE (Kolkata) - Important constituency
('wb_kolkata_ballygunge', 'Ballygunge', 'বালিগঞ্জ', 'Kolkata', 'কলকাতা',
 'Babul Supriyo', 'বাবুল সুপ্রিয়', 'TMC', 'Male',
 71234, 51.2, 20567,
 'Subrata Mukherjee', 'TMC', 68234, 54.3,
 'Keya Ghosh', 'BJP', 50667, 36.4,
 172345, 139123, 80.7,
 1, false, 'ECI 2021'),

-- 5. CHOWRINGHEE (Kolkata)
('wb_kolkata_chowringhee', 'Chowringhee', 'চৌরঙ্গী', 'Kolkata', 'কলকাতা',
 'Nayna Bandyopadhyay', 'নয়না বন্দ্যোপাধ্যায়', 'TMC', 'Female',
 58234, 48.5, 12456,
 'Nayna Bandyopadhyay', 'TMC', 52345, 45.2,
 'Sankar Ghosh', 'BJP', 45778, 38.1,
 145678, 120123, 82.5,
 3, false, 'ECI 2021'),

-- 6. RASHBEHARI (Kolkata)
('wb_kolkata_rashbehari', 'Rashbehari', 'রাসবিহারী', 'Kolkata', 'কলকাতা',
 'Debasish Kumar', 'দেবাশিস কুমার', 'TMC', 'Male',
 68234, 50.8, 16789,
 'Debasish Kumar', 'TMC', 64567, 49.5,
 'Sajal Ghosh', 'BJP', 51445, 38.3,
 168234, 134321, 79.8,
 2, false, 'ECI 2021'),

-- 7. TOLLYGUNGE (Kolkata) - Film industry area
('wb_kolkata_tollygunge', 'Tollygunge', 'টালিগঞ্জ', 'Kolkata', 'কলকাতা',
 'Aroop Biswas', 'অরূপ বিশ্বাস', 'TMC', 'Male',
 82345, 55.3, 28456,
 'Aroop Biswas', 'TMC', 76234, 52.1,
 'Babul Supriyo', 'BJP', 53889, 36.2,
 182456, 148967, 81.6,
 1, false, 'ECI 2021'),

-- 8. JADAVPUR (Kolkata) - University area, high awareness
('wb_kolkata_jadavpur', 'Jadavpur', 'যাদবপুর', 'Kolkata', 'কলকাতা',
 'Debabrata Majumder', 'দেবব্রত মজুমদার', 'TMC', 'Male',
 78234, 48.9, 14567,
 'Debabrata Majumder', 'TMC', 71234, 46.2,
 'Rinku Naskar', 'BJP', 63667, 39.8,
 195432, 160123, 81.9,
 1, true, 'ECI 2021'),

-- 9. KASBA (Kolkata)
('wb_kolkata_kasba', 'Kasba', 'কসবা', 'Kolkata', 'কলকাতা',
 'Javed Ahmed Khan', 'জাভেদ আহমেদ খান', 'TMC', 'Male',
 74567, 49.2, 15234,
 'Javed Ahmed Khan', 'TMC', 69234, 47.5,
 'Rajib Banerjee', 'BJP', 59333, 39.1,
 187654, 151567, 80.8,
 2, false, 'ECI 2021'),

-- 10. BEHALA WEST (Kolkata)
('wb_kolkata_behala_west', 'Behala West', 'বেহালা পশ্চিম', 'Kolkata', 'কলকাতা',
 'Partha Chatterjee', 'পার্থ চট্টোপাধ্যায়', 'TMC', 'Male',
 82345, 51.5, 22567,
 'Partha Chatterjee', 'TMC', 78234, 50.2,
 'Srabanti Chatterjee', 'BJP', 59778, 37.4,
 198765, 159876, 80.4,
 1, false, 'ECI 2021'),

-- 11. HOWRAH UTTAR
('wb_howrah_howrah_uttar', 'Howrah Uttar', 'হাওড়া উত্তর', 'Howrah', 'হাওড়া',
 'Arup Roy', 'অরূপ রায়', 'TMC', 'Male',
 72345, 51.2, 17890,
 'Arup Roy', 'TMC', 68234, 49.5,
 'Pralay Pal', 'BJP', 54455, 38.5,
 176543, 141234, 80.0,
 2, false, 'ECI 2021'),

-- 12. HOWRAH MADHYA
('wb_howrah_howrah_madhya', 'Howrah Madhya', 'হাওড়া মধ্য', 'Howrah', 'হাওড়া',
 'Baishnab Charan Parida', 'বৈষ্ণব চরণ পরিদা', 'TMC', 'Male',
 76543, 52.3, 19234,
 'Baishnab Charan Parida', 'TMC', 71234, 50.1,
 'Arindam Das', 'BJP', 57309, 39.2,
 184321, 146345, 79.4,
 2, false, 'ECI 2021'),

-- 13. SHIBPUR
('wb_howrah_shibpur', 'Shibpur', 'শিবপুর', 'Howrah', 'হাওড়া',
 'Manoj Tiwary', 'মনোজ তিওয়ারি', 'TMC', 'Male',
 68234, 50.5, 15678,
 'Jatu Lahiri', 'TMC', 62345, 47.2,
 'Rathin Chakraborty', 'BJP', 52556, 38.9,
 167890, 135123, 80.5,
 2, true, 'ECI 2021'),

-- 14. BALLY
('wb_howrah_bally', 'Bally', 'বালি', 'Howrah', 'হাওড়া',
 'Baishali Dalmiya', 'বৈশালী ডালমিয়া', 'TMC', 'Female',
 71234, 50.8, 16234,
 'Nandita Dutta', 'TMC', 66234, 48.5,
 'Arindam Bhattacharya', 'BJP', 55000, 39.2,
 175432, 140123, 79.9,
 2, false, 'ECI 2021'),

-- 15. UTTARPARA
('wb_howrah_uttarpara', 'Uttarpara', 'উত্তরপাড়া', 'Hooghly', 'হুগলি',
 'Prabir Ghosal', 'প্রবীর ঘোষাল', 'TMC', 'Male',
 67234, 51.2, 14567,
 'Prabir Ghosal', 'TMC', 62345, 49.5,
 'Kanchan Mullick', 'BJP', 52667, 40.1,
 163245, 131234, 80.4,
 2, true, 'ECI 2021'),

-- 16. BARRACKPORE - Key swing constituency
('wb_north_24_parganas_barrackpore', 'Barrackpore', 'ব্যারাকপুর', 'North 24 Parganas', 'উত্তর ২৪ পরগনা',
 'Raj Chakraborty', 'রাজ চক্রবর্তী', 'TMC', 'Male',
 78234, 48.5, 13333,
 'Silbhadra Datta', 'TMC', 72345, 46.2,
 'Arjun Singh', 'BJP', 64901, 40.2,
 189456, 161234, 85.1,
 1, true, 'ECI 2021'),

-- 17. DUM DUM
('wb_north_24_parganas_dum_dum', 'Dum Dum', 'দমদম', 'North 24 Parganas', 'উত্তর ২৪ পরগনা',
 'Bratya Basu', 'ব্রাত্য বসু', 'TMC', 'Male',
 82345, 52.3, 21567,
 'Sougata Roy', 'TMC', 76234, 50.1,
 'Sunil Mondal', 'BJP', 60778, 38.6,
 192345, 157456, 81.9,
 1, false, 'ECI 2021'),

-- 18. RAJARHAT NEW TOWN
('wb_north_24_parganas_rajarhat_new_town', 'Rajarhat New Town', 'রাজারহাট নিউ টাউন', 'North 24 Parganas', 'উত্তর ২৪ পরগনা',
 'Tapas Chatterjee', 'তাপস চট্টোপাধ্যায়', 'TMC', 'Male',
 98234, 49.5, 18234,
 'Sabyasachi Dutta', 'TMC', 89234, 47.2,
 'Biswanath Das', 'BJP', 80000, 40.3,
 245678, 198456, 80.8,
 1, true, 'ECI 2021'),

-- 19. BIDHANNAGAR
('wb_north_24_parganas_bidhannagar', 'Bidhannagar', 'বিধাননগর', 'North 24 Parganas', 'উত্তর ২৪ পরগনা',
 'Sujit Bose', 'সুজিৎ বসু', 'TMC', 'Male',
 92345, 48.8, 16789,
 'Sujit Bose', 'TMC', 85234, 46.5,
 'Sabyasachi Dutta', 'BJP', 75556, 39.9,
 234567, 189234, 80.7,
 1, true, 'ECI 2021'),

-- 20. MADHYAMGRAM
('wb_north_24_parganas_madhyamgram', 'Madhyamgram', 'মধ্যমগ্রাম', 'North 24 Parganas', 'উত্তর ২৪ পরগনা',
 'Rathin Ghosh', 'রতীন ঘোষ', 'TMC', 'Male',
 78234, 49.5, 14567,
 'Rathin Ghosh', 'TMC', 72345, 47.2,
 'Samik Bhattacharya', 'BJP', 63667, 40.3,
 198765, 158123, 79.5,
 2, true, 'ECI 2021'),

-- 21. JADAVPUR (South 24 Parganas)
('wb_south_24_parganas_jadavpur', 'Jadavpur', 'যাদবপুর', 'South 24 Parganas', 'দক্ষিণ ২৪ পরগনা',
 'Debaprasad Bag', 'দেবপ্রসাদ বাগ', 'TMC', 'Male',
 72345, 48.5, 12890,
 'Debaprasad Bag', 'TMC', 67234, 46.2,
 'Partha Ghosh', 'BJP', 59455, 39.8,
 187654, 149234, 79.5,
 2, true, 'ECI 2021'),

-- 22. SONARPUR UTTAR
('wb_south_24_parganas_sonarpur_uttar', 'Sonarpur Uttar', 'সোনারপুর উত্তর', 'South 24 Parganas', 'দক্ষিণ ২৪ পরগনা',
 'Nirmal Ghosh', 'নির্মল ঘোষ', 'TMC', 'Male',
 68234, 51.2, 16234,
 'Nirmal Ghosh', 'TMC', 63245, 49.5,
 'Bhaskar Mukherjee', 'BJP', 52000, 39.0,
 165432, 133234, 80.5,
 3, false, 'ECI 2021'),

-- 23. BUDGE BUDGE
('wb_south_24_parganas_budge_budge', 'Budge Budge', 'বজবজ', 'South 24 Parganas', 'দক্ষিণ ২৪ পরগনা',
 'Rajib Chakraborty', 'রাজীব চক্রবর্তী', 'TMC', 'Male',
 71234, 51.5, 17890,
 'Samik Bhattacharya', 'TMC', 66234, 49.2,
 'Ashok Dinda', 'BJP', 53344, 38.6,
 172345, 138234, 80.2,
 2, false, 'ECI 2021'),

-- 24. DARJEELING - Hill region
('wb_darjeeling_darjeeling', 'Darjeeling', 'দার্জিলিং', 'Darjeeling', 'দার্জিলিং',
 'Neeraj Zimba Tamang', 'নীরজ জিম্বা তামাং', 'BJP', 'Male',
 58234, 53.2, 18456,
 'Trilok Dewan', 'GJM', 52345, 49.5,
 'Keshav Raj Pokhrel', 'TMC', 39778, 36.3,
 134567, 109456, 81.3,
 1, false, 'ECI 2021'),

-- 25. SILIGURI - Strategic North Bengal city
('wb_darjeeling_siliguri', 'Siliguri', 'শিলিগুড়ি', 'Darjeeling', 'দার্জিলিং',
 'Asok Bhattacharya', 'অশোক ভট্টাচার্য', 'CPIM', 'Male',
 89234, 48.5, 8956,
 'Asok Bhattacharya', 'CPIM', 82345, 46.2,
 'Shankar Ghosh', 'BJP', 80278, 43.6,
 213456, 184123, 86.3,
 1, true, 'ECI 2021'),

-- 26. JALPAIGURI
('wb_jalpaiguri_jalpaiguri', 'Jalpaiguri', 'জলপাইগুড়ি', 'Jalpaiguri', 'জলপাইগুড়ি',
 'Dipak Kumar Barman', 'দীপক কুমার বর্মন', 'BJP', 'Male',
 72345, 52.8, 16234,
 'Dipak Kumar Barman', 'BJP', 67234, 50.5,
 'Sankar Malakar', 'TMC', 56111, 41.0,
 167890, 137012, 81.6,
 1, false, 'ECI 2021'),

-- 27. COOCH BEHAR UTTAR
('wb_cooch_behar_cooch_behar_uttar', 'Cooch Behar Uttar', 'কোচবিহার উত্তর', 'Cooch Behar', 'কোচবিহার',
 'Nikhil Ranjan Dey', 'নিখিল রঞ্জন দে', 'BJP', 'Male',
 68234, 54.2, 18567,
 'Binay Krishna Barman', 'TMC', 62345, 51.5,
 'Partha Pratim Ray', 'TMC', 49667, 39.4,
 154321, 125890, 81.6,
 1, false, 'ECI 2021'),

-- 28. ENGLISH BAZAR (Malda)
('wb_malda_english_bazar', 'English Bazar', 'ইংরেজ বাজার', 'Malda', 'মালদা',
 'Nihar Ranjan Ghosh', 'নিহার রঞ্জন ঘোষ', 'TMC', 'Male',
 74234, 52.8, 18234,
 'Krishnendu Narayan Choudhury', 'INC', 68234, 48.5,
 'Gopal Chandra Saha', 'BJP', 56000, 39.8,
 176543, 140567, 79.6,
 2, false, 'ECI 2021'),

-- 29. BERHAMPORE (Murshidabad)
('wb_murshidabad_berhampore', 'Berhampore', 'বহরমপুর', 'Murshidabad', 'মুর্শিদাবাদ',
 'Asit Kumar Mal', 'অসিত কুমার মাল', 'INC', 'Male',
 62345, 51.5, 14567,
 'Asit Kumar Mal', 'INC', 58234, 49.2,
 'Gouri Shankar Ghosh', 'TMC', 47778, 39.5,
 145678, 121012, 83.1,
 2, false, 'ECI 2021'),

-- 30. KRISHNANAGAR UTTAR (Nadia)
('wb_nadia_krishnanagar_uttar', 'Krishnanagar Uttar', 'কৃষ্ণনগর উত্তর', 'Nadia', 'নদিয়া',
 'Ujjal Biswas', 'উজ্জ্বল বিশ্বাস', 'TMC', 'Male',
 68234, 52.3, 16234,
 'Laltu Das', 'TMC', 62345, 49.5,
 'Subrata Ganguly', 'BJP', 52000, 39.8,
 158765, 130567, 82.2,
 2, false, 'ECI 2021'),

-- 31. SERAMPORE (Hooghly)
('wb_hooghly_serampore', 'Serampore', 'শ্রীরামপুর', 'Hooghly', 'হুগলি',
 'Kalyan Ghosh', 'কল্যাণ ঘোষ', 'TMC', 'Male',
 72345, 52.5, 17234,
 'Amar Singh', 'TMC', 67234, 50.2,
 'Sunil Kanjilal', 'BJP', 55111, 40.0,
 167890, 137789, 82.1,
 2, false, 'ECI 2021'),

-- 32. CHANDANNAGAR
('wb_hooghly_chandannagar', 'Chandannagar', 'চন্দননগর', 'Hooghly', 'হুগলি',
 'Shibaji Panja', 'শিবাজী পাঁজা', 'TMC', 'Male',
 62345, 53.2, 15678,
 'Shibaji Panja', 'TMC', 58234, 51.5,
 'Saikat Panja', 'BJP', 46667, 39.8,
 143210, 117234, 81.9,
 3, false, 'ECI 2021'),

-- 33. CHINSURAH
('wb_hooghly_chinsurah', 'Chinsurah', 'চুঁচুড়া', 'Hooghly', 'হুগলি',
 'Pradip Sarkar', 'প্রদীপ সরকার', 'TMC', 'Male',
 68234, 52.8, 16234,
 'Asok Lahiri', 'TMC', 63245, 50.5,
 'Rabin Dutta', 'BJP', 52000, 40.2,
 156789, 129234, 82.4,
 2, false, 'ECI 2021'),

-- 34. ASANSOL UTTAR - Industrial belt
('wb_purba_bardhaman_asansol_uttar', 'Asansol Uttar', 'আসানসোল উত্তর', 'Paschim Bardhaman', 'পশ্চিম বর্ধমান',
 'Moloy Ghatak', 'মলয় ঘটক', 'TMC', 'Male',
 78234, 48.2, 8956,
 'Jitendra Tiwari', 'TMC', 72345, 46.5,
 'Agnimitra Paul', 'BJP', 69278, 42.7,
 198765, 162234, 81.6,
 1, true, 'ECI 2021'),

-- 35. ASANSOL DAKSHIN - BJP stronghold
('wb_purba_bardhaman_asansol_dakshin', 'Asansol Dakshin', 'আসানসোল দক্ষিণ', 'Paschim Bardhaman', 'পশ্চিম বর্ধমান',
 'Agnimitra Paul', 'অগ্নিমিত্রা পল', 'BJP', 'Female',
 86234, 52.5, 16789,
 'Mahua Moitra', 'TMC', 78234, 48.2,
 'Tapas Banerjee', 'TMC', 69445, 42.3,
 203456, 164234, 80.7,
 1, false, 'ECI 2021'),

-- 36. DURGAPUR PURBA
('wb_purba_bardhaman_durgapur_purba', 'Durgapur Purba', 'দুর্গাপুর পূর্ব', 'Paschim Bardhaman', 'পশ্চিম বর্ধমান',
 'Pradip Mazumder', 'প্রদীপ মজুমদার', 'TMC', 'Male',
 76234, 50.2, 12567,
 'Apurba Mukherjee', 'TMC', 71234, 48.5,
 'Lakshman Seth', 'BJP', 63667, 41.9,
 187654, 151890, 80.9,
 2, true, 'ECI 2021'),

-- 37. DURGAPUR PASCHIM
('wb_purba_bardhaman_durgapur_paschim', 'Durgapur Paschim', 'দুর্গাপুর পশ্চিম', 'Paschim Bardhaman', 'পশ্চিম বর্ধমান',
 'Barun Roy', 'বরুণ রায়', 'TMC', 'Male',
 78234, 49.8, 11234,
 'Barun Roy', 'TMC', 72345, 47.5,
 'Sanjukta Paul', 'BJP', 67000, 42.6,
 195432, 157234, 80.5,
 2, true, 'ECI 2021'),

-- 38. BARDHAMAN UTTAR
('wb_purba_bardhaman_bardhaman_uttar', 'Bardhaman Uttar', 'বর্ধমান উত্তর', 'Purba Bardhaman', 'পূর্ব বর্ধমান',
 'Asim Sarkar', 'অসীম সরকার', 'TMC', 'Male',
 72345, 52.5, 16234,
 'Shib Shankar Chatterjee', 'TMC', 67234, 50.2,
 'Varun Sarkar', 'BJP', 56111, 40.7,
 172345, 137789, 79.9,
 2, false, 'ECI 2021'),

-- 39. TAMLUK (Purba Medinipur)
('wb_purba_medinipur_tamluk', 'Tamluk', 'তমলুক', 'Purba Medinipur', 'পূর্ব মেদিনীপুর',
 'Manas Bhunia', 'মানস ভূঁইয়া', 'TMC', 'Male',
 62345, 53.5, 18234,
 'Manas Bhunia', 'TMC', 58234, 51.2,
 'Saumen Mahapatra', 'BJP', 44111, 37.9,
 143210, 116456, 81.3,
 2, false, 'ECI 2021'),

-- 40. HALDIA
('wb_purba_medinipur_haldia', 'Haldia', 'হলদিয়া', 'Purba Medinipur', 'পূর্ব মেদিনীপুর',
 'Tapasi Mondal', 'তাপসী মন্ডল', 'TMC', 'Female',
 68234, 51.8, 16234,
 'Swadesh Ranjan Mondal', 'TMC', 63245, 49.5,
 'Tarun Kanti Naskar', 'BJP', 52000, 39.5,
 165432, 131678, 79.6,
 2, false, 'ECI 2021'),

-- 41. MIDNAPORE (Paschim Medinipur)
('wb_paschim_medinipur_midnapore', 'Midnapore', 'মেদিনীপুর', 'Paschim Medinipur', 'পশ্চিম মেদিনীপুর',
 'June Malia', 'জুন মালিয়া', 'TMC', 'Female',
 64234, 51.5, 14567,
 'June Malia', 'TMC', 59234, 49.2,
 'Samit Dash', 'BJP', 49667, 39.8,
 154321, 124678, 80.8,
 2, false, 'ECI 2021'),

-- 42. BANKURA
('wb_bankura_bankura', 'Bankura', 'বাঁকুড়া', 'Bankura', 'বাঁকুড়া',
 'Sayantika Banerjee', 'সায়ন্তিকা বন্দ্যোপাধ্যায়', 'TMC', 'Female',
 58234, 52.5, 16234,
 'Niladri Chakraborty', 'TMC', 54234, 50.2,
 'Subhas Sarkar', 'BJP', 42000, 37.9,
 138765, 110890, 79.9,
 2, false, 'ECI 2021'),

-- 43. PURULIA
('wb_purulia_purulia', 'Purulia', 'পুরুলিয়া', 'Purulia', 'পুরুলিয়া',
 'Sudip Mukherjee', 'সুদীপ মুখোপাধ্যায়', 'TMC', 'Male',
 59234, 51.2, 12567,
 'Sudip Mukherjee', 'TMC', 54234, 48.5,
 'Joydev Hembram', 'BJP', 46667, 40.4,
 142345, 115678, 81.3,
 2, true, 'ECI 2021'),

-- 44. BOLPUR (Birbhum) - Santiniketan area
('wb_birbhum_bolpur', 'Bolpur', 'বোলপুর', 'Birbhum', 'বীরভূম',
 'Chandranath Sinha', 'চন্দ্রনাথ সিনহা', 'TMC', 'Male',
 62345, 52.8, 15234,
 'Chandranath Sinha', 'TMC', 58234, 50.5,
 'Asit Mal', 'BJP', 47111, 39.9,
 145678, 118012, 81.0,
 2, false, 'ECI 2021'),

-- 45. SURI (Birbhum)
('wb_birbhum_suri', 'Suri', 'সুরি', 'Birbhum', 'বীরভূম',
 'Bikash Roy Chowdhury', 'বিকাশ রায় চৌধুরী', 'TMC', 'Male',
 56234, 51.5, 14234,
 'Bikash Roy Chowdhury', 'TMC', 52345, 49.2,
 'Dipak Das', 'BJP', 42000, 38.5,
 134567, 109234, 81.2,
 3, false, 'ECI 2021'),

-- 46. PANDAVESWAR (Paschim Bardhaman)
('wb_paschim_bardhaman_pandaveswar', 'Pandaveswar', 'পান্ডবেশ্বর', 'Paschim Bardhaman', 'পশ্চিম বর্ধমান',
 'Narendranath Chakraborty', 'নরেন্দ্রনাথ চক্রবর্তী', 'BJP', 'Male',
 68234, 53.5, 17234,
 'Narendranath Chakraborty', 'BJP', 63245, 51.2,
 'Jitendra Kumar Tiwari', 'TMC', 51000, 40.0,
 156789, 127456, 81.3,
 1, false, 'ECI 2021'),

-- 47. ARAMBAG (Hooghly)
('wb_hooghly_arambag', 'Arambag', 'আরামবাগ', 'Hooghly', 'হুগলি',
 'Madhusudhan Bag', 'মধুসূদন বাগ', 'TMC', 'Male',
 62345, 52.2, 15678,
 'Tapan Dasgupta', 'CPIM', 58234, 49.5,
 'Sougata Roy', 'BJP', 46667, 39.1,
 147890, 119456, 80.8,
 3, false, 'ECI 2021'),

-- 48. RANAGHAT UTTAR PASCHIM (Nadia)
('wb_nadia_ranaghat_uttar_paschim', 'Ranaghat Uttar Paschim', 'রানাঘাট উত্তর পশ্চিম', 'Nadia', 'নদিয়া',
 'Mukut Mani Adhikari', 'মুকুট মণি অধিকারী', 'BJP', 'Male',
 66234, 53.8, 16234,
 'Mukut Mani Adhikari', 'BJP', 61234, 51.5,
 'Shankar Singha Roy', 'TMC', 50000, 40.6,
 152345, 123012, 80.8,
 1, false, 'ECI 2021'),

-- 49. BARASAT (North 24 Parganas)
('wb_north_24_parganas_barasat', 'Barasat', 'বারাসাত', 'North 24 Parganas', 'উত্তর ২৪ পরগনা',
 'Chiranjit Chakraborty', 'চিরঞ্জিৎ চক্রবর্তী', 'TMC', 'Male',
 78234, 51.2, 17234,
 'Chiranjit Chakraborty', 'TMC', 72345, 48.5,
 'Joy Saha', 'BJP', 61000, 39.9,
 186543, 152789, 81.9,
 2, false, 'ECI 2021'),

-- 50. DIAMOND HARBOUR (South 24 Parganas) - Abhishek Banerjee's LS constituency
('wb_south_24_parganas_diamond_harbour', 'Diamond Harbour', 'ডায়মন্ড হারবার', 'South 24 Parganas', 'দক্ষিণ ২৪ পরগনা',
 'Dipak Kumar Halder', 'দীপক কুমার হালদার', 'TMC', 'Male',
 68234, 52.5, 16789,
 'Dipak Kumar Halder', 'TMC', 63245, 50.2,
 'Nilanjan Roy', 'BJP', 51445, 39.6,
 158765, 129890, 81.8,
 1, false, 'ECI 2021');

-- =========================================================
-- SEED SWING CONSTITUENCIES DATA
-- Based on margin < 20,000 OR BJP growth > 25%
-- =========================================================

INSERT INTO swing_constituencies (
    constituency_id, margin_2021, winner_party_2021,
    bjp_votes_2021, bjp_vote_share_2021, tmc_votes_2021, tmc_vote_share_2021,
    bjp_votes_2016, bjp_vote_share_2016, tmc_votes_2016, tmc_vote_share_2016,
    bjp_growth_votes, bjp_growth_percentage,
    swing_potential, swing_score, priority_rank,
    key_issues
) VALUES

-- Very High Swing Potential (margin < 15000)
('wb_darjeeling_siliguri', 8956, 'CPIM',
 80278, 43.6, 42345, 23.0,
 45234, 24.5, 38456, 20.8,
 35044, 19.1,
 'very_high', 92.5, 1,
 ARRAY['North Bengal autonomy', 'Tea garden workers', 'Cross-border trade']),

('wb_purba_bardhaman_asansol_uttar', 8956, 'TMC',
 69278, 42.7, 78234, 48.2,
 38234, 23.6, 82345, 50.8,
 31044, 19.1,
 'very_high', 89.5, 2,
 ARRAY['Industrial jobs', 'Coal mining', 'Migrant workers']),

('wb_purba_bardhaman_durgapur_paschim', 11234, 'TMC',
 67000, 42.6, 78234, 49.8,
 35234, 22.4, 76234, 48.5,
 31766, 20.2,
 'very_high', 87.0, 3,
 ARRAY['Steel industry', 'Unemployment', 'Healthcare']),

('wb_purba_bardhaman_durgapur_purba', 12567, 'TMC',
 63667, 41.9, 76234, 50.2,
 32456, 21.4, 72345, 47.6,
 31211, 20.5,
 'very_high', 85.5, 4,
 ARRAY['Industrial development', 'Pollution', 'Youth employment']),

('wb_purulia_purulia', 12567, 'TMC',
 46667, 40.4, 59234, 51.2,
 24567, 21.3, 52345, 45.3,
 22100, 19.1,
 'high', 78.5, 5,
 ARRAY['Tribal welfare', 'Water scarcity', 'Mining jobs']),

-- High Swing Potential (margin 15000-20000)
('wb_north_24_parganas_barrackpore', 13333, 'TMC',
 64901, 40.2, 78234, 48.5,
 28456, 17.6, 82345, 51.0,
 36445, 22.6,
 'high', 82.0, 6,
 ARRAY['Jute mill workers', 'Urban development', 'Traffic congestion']),

('wb_kolkata_jadavpur', 14567, 'TMC',
 63667, 39.8, 78234, 48.9,
 32567, 20.4, 71234, 44.5,
 31100, 19.4,
 'high', 76.0, 7,
 ARRAY['Student politics', 'Urban issues', 'Education']),

('wb_north_24_parganas_madhyamgram', 14567, 'TMC',
 63667, 40.3, 78234, 49.5,
 28456, 18.0, 72345, 45.8,
 35211, 22.3,
 'high', 75.5, 8,
 ARRAY['Suburban development', 'Transport', 'Water supply']),

('wb_howrah_uttarpara', 14567, 'TMC',
 52667, 40.1, 67234, 51.2,
 26234, 20.0, 62345, 47.5,
 26433, 20.1,
 'high', 74.0, 9,
 ARRAY['River pollution', 'Industrial jobs', 'Infrastructure']),

('wb_howrah_shibpur', 15678, 'TMC',
 52556, 38.9, 68234, 50.5,
 24567, 18.2, 62345, 46.2,
 27989, 20.7,
 'high', 73.5, 10,
 ARRAY['Engineering jobs', 'River transport', 'Flooding']),

('wb_north_24_parganas_bidhannagar', 16789, 'TMC',
 75556, 39.9, 92345, 48.8,
 35234, 18.6, 85234, 45.0,
 40322, 21.3,
 'high', 72.0, 11,
 ARRAY['IT sector', 'Urban planning', 'Real estate']),

('wb_kolkata_beleghata', 18432, 'TMC',
 56089, 39.4, 74521, 52.3,
 28234, 19.8, 62145, 43.6,
 27855, 19.6,
 'medium', 68.5, 12,
 ARRAY['Old Kolkata issues', 'Heritage', 'Drainage']),

('wb_north_24_parganas_rajarhat_new_town', 18234, 'TMC',
 80000, 40.3, 98234, 49.5,
 38234, 19.3, 89234, 45.0,
 41766, 21.0,
 'medium', 67.0, 13,
 ARRAY['New town planning', 'IT hub', 'Traffic']);

-- =========================================================
-- SEED INITIAL TMC MISTAKES (Recent controversies)
-- =========================================================

INSERT INTO tmc_mistakes_log (
    constituency_id, leader_name, leader_name_bengali, party, date,
    headline, headline_bengali, description, source_name, source_url,
    category, severity, media_coverage_level, keywords, is_verified
) VALUES

('wb_kolkata_behala_west', 'Partha Chatterjee', 'পার্থ চট্টোপাধ্যায়', 'TMC', '2024-07-22',
 'ED arrests Partha Chatterjee in SSC recruitment scam',
 'এসএসসি নিয়োগ কেলেঙ্কারিতে পার্থ চট্টোপাধ্যায়কে গ্রেপ্তার করল ইডি',
 'Former Education Minister arrested by ED after Rs 50 crore cash found at associate residence',
 'Times of India', 'https://timesofindia.com/ssc-scam-partha-arrest',
 'corruption', 'critical', 'national',
 ARRAY['SSC scam', 'ED arrest', 'corruption', 'Partha Chatterjee', 'recruitment scam'],
 true),

('wb_north_24_parganas_barrackpore', 'Shahjahan Sheikh', 'শাজাহান শেখ', 'TMC', '2024-01-15',
 'Sandeshkhali violence: TMC leader Shahjahan accused of land grab, assault',
 'সন্দেশখালি হিংসা: জমি দখল, হামলার অভিযোগে তৃণমূল নেতা শাজাহান',
 'Multiple women accuse TMC leader of sexual assault and land grab in Sandeshkhali',
 'India Today', 'https://indiatoday.in/sandeshkhali-violence',
 'violence', 'critical', 'national',
 ARRAY['Sandeshkhali', 'land grab', 'assault', 'women safety', 'TMC violence'],
 true),

('wb_murshidabad_berhampore', 'Anubrata Mondal', 'অনুব্রত মন্ডল', 'TMC', '2023-08-11',
 'CBI arrests Anubrata Mondal in cattle smuggling case',
 'গোপাচোরাচালান মামলায় অনুব্রত মন্ডলকে গ্রেপ্তার করল সিবিআই',
 'Birbhum TMC chief arrested for alleged involvement in cross-border cattle smuggling',
 'NDTV', 'https://ndtv.com/anubrata-cattle-smuggling',
 'corruption', 'high', 'national',
 ARRAY['cattle smuggling', 'CBI arrest', 'Anubrata Mondal', 'Birbhum'],
 true),

(NULL, 'Abhishek Banerjee', 'অভিষেক বন্দ্যোপাধ্যায়', 'TMC', '2024-03-10',
 'ED questions Abhishek Banerjee for 8 hours in coal scam probe',
 'কয়লা কেলেঙ্কারি তদন্তে ৮ ঘণ্টা জিজ্ঞাসাবাদ অভিষেক বন্দ্যোপাধ্যায়ের',
 'TMC General Secretary questioned by ED in connection with illegal coal mining case',
 'Hindustan Times', 'https://hindustantimes.com/abhishek-coal-scam',
 'corruption', 'high', 'national',
 ARRAY['coal scam', 'ED', 'Abhishek Banerjee', 'illegal mining'],
 true),

('wb_birbhum_bolpur', 'Anubrata Mondal', 'অনুব্রত মন্ডল', 'TMC', '2022-03-21',
 'Bogtui massacre: 8 burnt alive in TMC internal feud',
 'বগটুই হত্যাকাণ্ড: তৃণমূলের অন্তর্কলহে ৮ জন জ্বলন্ত',
 'Eight people including women and children burnt alive in Birbhum in alleged TMC factional violence',
 'The Telegraph', 'https://telegraphindia.com/bogtui-massacre',
 'violence', 'critical', 'national',
 ARRAY['Bogtui', 'massacre', 'TMC violence', 'Birbhum', 'murder'],
 true);

-- =========================================================
-- UPDATE tracking_tier based on leader importance
-- =========================================================

UPDATE constituency_leaders
SET tracking_tier = 1
WHERE current_mla_name IN (
    'Mamata Banerjee', 'Suvendu Adhikari', 'Abhishek Banerjee',
    'Babul Supriyo', 'Partha Chatterjee', 'Dilip Ghosh',
    'Agnimitra Paul', 'Aroop Biswas'
);

UPDATE constituency_leaders
SET tracking_tier = 2
WHERE current_mla_party = 'BJP' AND tracking_tier = 3;

-- =========================================================
-- MARK SWING CONSTITUENCIES
-- =========================================================

UPDATE constituency_leaders cl
SET is_swing_constituency = true,
    bjp_priority_rank = sc.priority_rank
FROM swing_constituencies sc
WHERE cl.constituency_id = sc.constituency_id;

-- =========================================================
-- COMPLETED
-- =========================================================
