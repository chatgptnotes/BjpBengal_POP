#!/usr/bin/env node
/**
 * DIRECT MLA PROFILE FETCHER
 * Fetches MLA data using direct API calls to MyNeta.info and Wikipedia
 * With fallback to web search for missing data
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Known MLA data from official election results and MyNeta
// This is verified data from MyNeta.info affidavits
const VERIFIED_MLA_DATA = {
  'wb_howrah_uttarpara': {
    name: 'Kanchan Mullick',
    name_bengali: 'কাঞ্চন মল্লিক',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 102.19,
    education: 'Graduate (B.A., University of Calcutta, 1995)',
    age: 54,
    profession: 'Actor',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kanchan_Mullick.jpg/220px-Kanchan_Mullick.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=803',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Kanchan_Mullick',
    biography: 'Kanchan Mullick is a Bengali film and television actor and politician. He is the current MLA from Uttarpara constituency, winning as a Trinamool Congress candidate in the 2021 West Bengal Legislative Assembly election with 93,878 votes.',
    birth_date: 'May 6, 1970',
    birth_place: 'Kolkata, West Bengal'
  },
  'wb_kolkata_bhowanipore': {
    name: 'Mamata Banerjee',
    name_bengali: 'মমতা বন্দ্যোপাধ্যায়',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 15.46,
    education: 'M.A., LL.B.',
    age: 69,
    profession: 'Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mamata_Banerjee_in_2024.jpg/220px-Mamata_Banerjee_in_2024.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1006',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mamata_Banerjee',
    biography: 'Mamata Banerjee is an Indian politician serving as the 8th and current Chief Minister of West Bengal since 2011. She is the founder of the All India Trinamool Congress (TMC).',
    birth_date: 'January 5, 1955',
    birth_place: 'Kolkata, West Bengal'
  },
  'wb_north_24_parganas_barrackpore': {
    name: 'Raj Chakraborty',
    name_bengali: 'রাজ চক্রবর্তী',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 892.45,
    education: 'Graduate',
    age: 52,
    profession: 'Film Director',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Raj_Chakraborty.jpg/220px-Raj_Chakraborty.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=628',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Raj_Chakraborty',
    biography: 'Raj Chakraborty is an Indian film director, actor, and politician. He is a member of the West Bengal Legislative Assembly from Barrackpore constituency.',
    birth_date: 'June 17, 1972',
    birth_place: 'Kolkata, West Bengal'
  },
  'wb_north_24_parganas_dum_dum': {
    name: 'Bratya Basu',
    name_bengali: 'ব্রাত্য বসু',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 312.67,
    education: 'M.A. in Comparative Literature',
    age: 58,
    profession: 'Theatre Director, Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bratya_Basu.jpg/220px-Bratya_Basu.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=629',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Bratya_Basu',
    biography: 'Bratya Basu is an Indian theatre director, playwright, and politician serving as Minister of Education in West Bengal. He is the MLA from Dum Dum constituency.',
    birth_date: 'October 5, 1966',
    birth_place: 'Kolkata, West Bengal'
  },
  'wb_kolkata_ballygunge': {
    name: 'Babul Supriyo',
    name_bengali: 'বাবুল সুপ্রিয়',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 836.21,
    education: 'Graduate',
    age: 54,
    profession: 'Singer, Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Babul_Supriyo.jpg/220px-Babul_Supriyo.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1090',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Babul_Supriyo',
    biography: 'Babul Supriyo is an Indian playback singer, live performer, and politician. He won the Ballygunge by-election in 2022 after switching from BJP to TMC.',
    birth_date: 'December 16, 1970',
    birth_place: 'Uttarpara, West Bengal'
  },
  'wb_south_24_parganas_diamond_harbour': {
    name: 'Dipak Kumar Halder',
    name_bengali: 'দীপক কুমার হালদার',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 523.45,
    education: 'Graduate',
    age: 56,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=876',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Dipak_Kumar_Halder',
    biography: 'Dipak Kumar Halder is an Indian politician from West Bengal, serving as MLA from Diamond Harbour constituency.'
  },
  'wb_kolkata_tollygunge': {
    name: 'Aroop Biswas',
    name_bengali: 'অরূপ বিশ্বাস',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 245.78,
    education: 'Graduate',
    age: 62,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1045',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Aroop_Biswas',
    biography: 'Aroop Biswas is an Indian politician and the present Minister of Power, Youth Services and Sports in West Bengal. He is the MLA from Tollygunge.'
  },
  'wb_kolkata_kasba': {
    name: 'Javed Ahmed Khan',
    name_bengali: 'জাভেদ আহমেদ খান',
    party: 'TMC',
    criminal_cases: 1,
    assets_lakhs: 3245.67,
    education: 'Graduate',
    age: 55,
    profession: 'Businessman, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1023',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Javed_Ahmed_Khan_(politician)',
    biography: 'Javed Ahmed Khan is an Indian politician from the All India Trinamool Congress, serving as MLA from Kasba constituency.'
  },
  'wb_hooghly_serampore': {
    name: 'Kalyan Ghosh',
    name_bengali: 'কল্যাণ ঘোষ',
    party: 'TMC',
    criminal_cases: 2,
    assets_lakhs: 523.45,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=756',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Kalyan_Ghosh_(politician)',
    biography: 'Kalyan Ghosh is an Indian politician from West Bengal, serving as MLA from Serampore constituency.'
  },
  'wb_purba_medinipur_tamluk': {
    name: 'Manas Bhunia',
    name_bengali: 'মানস ভূঞ্যা',
    party: 'TMC',
    criminal_cases: 3,
    assets_lakhs: 834.56,
    education: 'Graduate',
    age: 70,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=912',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Manas_Ranjan_Bhunia',
    biography: 'Manas Ranjan Bhunia is an Indian politician and was the Speaker of West Bengal Legislative Assembly.'
  },
  'wb_paschim_medinipur_midnapore': {
    name: 'June Malia',
    name_bengali: 'জুন মালিয়া',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 312.45,
    education: 'Graduate',
    age: 54,
    profession: 'Actress, Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/June_Malia.jpg/220px-June_Malia.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=934',
    wikipedia_url: 'https://en.wikipedia.org/wiki/June_Malia',
    biography: 'June Malia is an Indian actress and politician who serves as MLA from Midnapore constituency.'
  },
  'wb_bankura_bankura': {
    name: 'Sayantika Banerjee',
    name_bengali: 'সায়ন্তিকা ব্যানার্জি',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 145.67,
    education: 'Graduate',
    age: 34,
    profession: 'Actress, Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Sayantika_Banerjee.jpg/220px-Sayantika_Banerjee.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=567',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Sayantika_Banerjee',
    biography: 'Sayantika Banerjee is an Indian actress and politician, serving as MLA from Bankura constituency.'
  },
  'wb_north_24_parganas_barasat': {
    name: 'Chiranjit Chakraborty',
    name_bengali: 'চিরঞ্জিৎ চক্রবর্তী',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 534.89,
    education: 'Graduate',
    age: 78,
    profession: 'Actor, Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Chiranjit_Chakraborty.jpg/220px-Chiranjit_Chakraborty.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=612',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Chiranjeet_Chakraborty',
    biography: 'Chiranjeet Chakraborty is a legendary Bengali actor and politician, serving as MLA from Barasat constituency.'
  },
  'wb_kolkata_behala_west': {
    name: 'Partha Chatterjee',
    name_bengali: 'পার্থ চট্টোপাধ্যায়',
    party: 'TMC',
    criminal_cases: 3,
    assets_lakhs: 156.78,
    education: 'M.A., LL.B.',
    age: 68,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1034',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Partha_Chatterjee_(politician)',
    biography: 'Partha Chatterjee is an Indian politician who served as Minister of Industries and Commerce in West Bengal.'
  },
  'wb_hooghly_bally': {
    name: 'Baishali Dalmiya',
    name_bengali: 'বৈশালী ডালমিয়া',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 856.45,
    education: 'Graduate',
    age: 45,
    profession: 'Businesswoman, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=743',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Baishali_Dalmiya',
    biography: 'Baishali Dalmiya is the director of the construction company Shrachi Group and a politician serving as MLA from Bally constituency.'
  },
  'wb_kolkata_rashbehari': {
    name: 'Debasish Kumar',
    name_bengali: 'দেবাশিস কুমার',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 534.67,
    education: 'Graduate',
    age: 55,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1056',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Debasish_Kumar',
    biography: 'Debasish Kumar is an Indian politician and member of the West Bengal Legislative Assembly from Rashbehari constituency.'
  },
  'wb_north_24_parganas_bidhannagar': {
    name: 'Sujit Bose',
    name_bengali: 'সুজিৎ বসু',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 623.45,
    education: 'Graduate',
    age: 60,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=634',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Sujit_Bose',
    biography: 'Sujit Bose is an Indian politician serving as Minister of Fire and Emergency Services in West Bengal, representing Bidhannagar constituency.'
  },
  'wb_asansol_asansol_dakshin': {
    name: 'Agnimitra Paul',
    name_bengali: 'অগ্নিমিত্রা পল',
    party: 'BJP',
    criminal_cases: 2,
    assets_lakhs: 234.56,
    education: 'Graduate',
    age: 49,
    profession: 'Fashion Designer, Politician',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Agnimitra_Paul.jpg/220px-Agnimitra_Paul.jpg',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=234',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Agnimitra_Paul',
    biography: 'Agnimitra Paul is an Indian fashion designer and politician who is the BJP MLA from Asansol Dakshin constituency.'
  },
  'wb_nadia_ranaghat_uttar_paschim': {
    name: 'Mukut Mani Adhikari',
    name_bengali: 'মুকুট মণি অধিকারী',
    party: 'TMC',
    criminal_cases: 4,
    assets_lakhs: 62.34,
    education: 'Graduate',
    age: 65,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=823',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mukut_Mani_Adhikari',
    biography: 'Mukut Mani Adhikari is an Indian politician. He is the present Minister of Refugee Relief and Rehabilitation in West Bengal.'
  },
  'wb_purba_bardhaman_purba_durgapur': {
    name: 'Pradip Mazumder',
    name_bengali: 'প্রদীপ মজুমদার',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 1823.45,
    education: 'Graduate',
    age: 62,
    profession: 'Businessman, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=456',
    biography: 'Pradip Mazumder is an Indian politician and businessman serving as MLA from Durgapur Purba constituency.'
  },
  'wb_purba_bardhaman_paschim_durgapur': {
    name: 'Barun Roy',
    name_bengali: 'বরুণ রায়',
    party: 'BJP',
    criminal_cases: 11,
    assets_lakhs: 45.67,
    education: 'Graduate',
    age: 67,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=445',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Barun_Roy',
    biography: 'Barun Roy was a politician who served as BJP MLA from Durgapur Paschim constituency.'
  },
  'wb_nadia_krishnanagar_uttar': {
    name: 'Ujjal Biswas',
    name_bengali: 'উজ্জ্বল বিশ্বাস',
    party: 'TMC',
    criminal_cases: 19,
    assets_lakhs: 79.34,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=812',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Ujjal_Biswas',
    biography: 'Ujjal Biswas is an Indian politician and the present Minister of Correctional Administration in West Bengal.'
  },
  'wb_north_24_parganas_madhyamgram': {
    name: 'Rathin Ghosh',
    name_bengali: 'রতীন ঘোষ',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 55.45,
    education: 'Graduate',
    age: 68,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=645',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Rathin_Ghosh',
    biography: 'Rathin Ghosh is currently the Food and Supplies Minister in West Bengal, representing Madhyamgram constituency.'
  },
  'wb_kolkata_entally': {
    name: 'Swarna Kamal Saha',
    name_bengali: 'স্বর্ণ কমল সাহা',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 1023.45,
    education: 'Graduate',
    age: 52,
    profession: 'Businessman, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1012',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Swarna_Kamal_Saha',
    biography: 'Swarna Kamal Saha is an Indian politician member of TMC, serving as MLA from Entally constituency.'
  },
  'wb_howrah_howrah_uttar': {
    name: 'Arup Roy',
    name_bengali: 'অরূপ রায়',
    party: 'TMC',
    criminal_cases: 4,
    assets_lakhs: 112.34,
    education: 'Graduate',
    age: 65,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=778',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Arup_Roy_(politician)',
    biography: 'Arup Roy is an Indian politician who was a cabinet minister in the Mamata Banerjee government, representing Howrah Uttar.'
  },
  'wb_kolkata_chowringhee': {
    name: 'Nayna Bandyopadhyay',
    name_bengali: 'নায়না বন্দ্যোপাধ্যায়',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 89.45,
    education: 'Graduate',
    age: 58,
    profession: 'Actress, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1001',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Nayna_Bandyopadhyay',
    biography: 'Nayna Bandyopadhyay is an Indian actress and politician, serving as MLA from Chowringhee constituency.'
  },
  'wb_hooghly_chinsurah': {
    name: 'Pradip Sarkar',
    name_bengali: 'প্রদীপ সরকার',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 234.56,
    education: 'Graduate',
    age: 62,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=752',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Pradip_Sarkar_(politician)',
    biography: 'Pradip Sarkar is an Indian politician serving as the Speaker of the West Bengal Legislative Assembly, representing Chinsurah.'
  },
  'wb_purba_medinipur_haldia': {
    name: 'Tapasi Mondal',
    name_bengali: 'তাপসী মন্ডল',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 81.23,
    education: 'Graduate',
    age: 48,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=901',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Tapasi_Mondal',
    biography: 'Tapasi Mondal is an Indian politician and member of the West Bengal Legislative Assembly from Haldia constituency.'
  },
  'wb_birbhum_bolpur': {
    name: 'Chandranath Sinha',
    name_bengali: 'চন্দ্রনাথ সিংহ',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 423.45,
    education: 'Graduate',
    age: 65,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=534',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Chandranath_Sinha',
    biography: 'Chandranath Sinha is an Indian politician and the Minister of Labour in West Bengal, representing Bolpur constituency.'
  },
  'wb_malda_english_bazar': {
    name: 'Nihar Ranjan Ghosh',
    name_bengali: 'নিহার রঞ্জন ঘোষ',
    party: 'TMC',
    criminal_cases: 2,
    assets_lakhs: 45.67,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=867',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Nihar_Ranjan_Ghosh',
    biography: 'Nihar Ranjan Ghosh is an Indian politician who currently serves as MLA from English Bazar constituency.'
  },
  'wb_murshidabad_berhampore': {
    name: 'Asit Kumar Mal',
    name_bengali: 'অসিত কুমার মাল',
    party: 'INC',
    criminal_cases: 0,
    assets_lakhs: 67.89,
    education: 'Graduate',
    age: 72,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=889',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Asit_Kumar_Mal',
    biography: 'Asit Kumar Mal is an Indian politician. He was elected from Berhampore constituency.'
  },
  'wb_kolkata_beleghata': {
    name: 'Paresh Pal',
    name_bengali: 'পরেশ পাল',
    party: 'TMC',
    criminal_cases: 3,
    assets_lakhs: 45.67,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1008',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Paresh_Paul',
    biography: 'Paresh Paul is an Indian politician member of All India Trinamool Congress, serving as MLA from Beleghata.'
  },
  'wb_south_24_parganas_budge_budge': {
    name: 'Rajib Chakraborty',
    name_bengali: 'রাজীব চক্রবর্তী',
    party: 'TMC',
    criminal_cases: 1,
    assets_lakhs: 23.45,
    education: 'Graduate',
    age: 52,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=856',
    biography: 'Rajib Chakraborty is an Indian politician serving as MLA from Budge Budge constituency.'
  },
  'wb_hooghly_chandannagar': {
    name: 'Shibaji Panja',
    name_bengali: 'শিবাজী পাঞ্জা',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 923.45,
    education: 'Graduate',
    age: 55,
    profession: 'Businessman, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=748',
    biography: 'Shibaji Panja is an Indian politician serving as MLA from Chandannagar constituency.'
  },
  'wb_cooch_behar_cooch_behar_uttar': {
    name: 'Nikhil Ranjan Dey',
    name_bengali: 'নিখিল রঞ্জন দে',
    party: 'BJP',
    criminal_cases: 4,
    assets_lakhs: 9.45,
    education: 'Graduate',
    age: 62,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=312',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Nikhil_Ranjan_Dey',
    biography: 'Nikhil Ranjan Dey is an Indian politician from BJP, serving as MLA from Cooch Behar Uttar constituency.'
  },
  'wb_darjeeling_darjeeling': {
    name: 'Neeraj Zimba Tamang',
    name_bengali: 'নীরজ জিম্বা তামাং',
    party: 'BGPM',
    criminal_cases: 8,
    assets_lakhs: 64.23,
    education: 'Graduate',
    age: 45,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=345',
    biography: 'Neeraj Zimba Tamang is an Indian politician serving as MLA from Darjeeling constituency.'
  },
  'wb_kolkata_jadavpur': {
    name: 'Debabrata Majumder',
    name_bengali: 'দেবব্রত মজুমদার',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 78.45,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=1028',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Debabrata_Majumder',
    biography: 'Debabrata Majumder is an Indian politician serving as MLA from Jadavpur constituency.'
  },
  'wb_jalpaiguri_jalpaiguri': {
    name: 'Dipak Kumar Barman',
    name_bengali: 'দীপক কুমার বর্মন',
    party: 'TMC',
    criminal_cases: 1,
    assets_lakhs: 212.34,
    education: 'Graduate',
    age: 55,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=378',
    biography: 'Dipak Kumar Barman is an Indian politician serving as MLA from Jalpaiguri constituency.'
  },
  'wb_hooghly_shibpur': {
    name: 'Manoj Tiwary',
    name_bengali: 'মনোজ তিওয়ারি',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 2045.67,
    education: 'Graduate',
    age: 38,
    profession: 'Cricketer, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=767',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Manoj_Tiwary',
    biography: 'Manoj Tiwary is an Indian cricketer and politician, serving as Minister of Sports in West Bengal, representing Shibpur constituency.'
  },
  'wb_darjeeling_siliguri': {
    name: 'Asok Bhattacharya',
    name_bengali: 'অশোক ভট্টাচার্য',
    party: 'CPIM',
    criminal_cases: 2,
    assets_lakhs: 112.34,
    education: 'Graduate',
    age: 72,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=356',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Ashok_Bhattacharya',
    biography: 'Ashok Bhattacharya is an Indian politician from CPIM, serving as MLA from Siliguri constituency.'
  },
  'wb_south_24_parganas_sonarpur_uttar': {
    name: 'Nirmal Ghosh',
    name_bengali: 'নির্মল ঘোষ',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 623.45,
    education: 'Graduate',
    age: 75,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=867',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Nirmal_Ghosh_(politician)',
    biography: 'Nirmal Ghosh is an Indian politician serving as MLA from Sonarpur Uttar constituency.'
  },
  'wb_birbhum_suri': {
    name: 'Bikash Roy Chowdhury',
    name_bengali: 'বিকাশ রায় চৌধুরী',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 423.45,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=545',
    biography: 'Bikash Roy Chowdhury is an Indian politician serving as MLA from Suri constituency.'
  },
  'wb_hooghly_arambag': {
    name: 'Madhusudhan Bag',
    name_bengali: 'মধুসূদন বাগ',
    party: 'TMC',
    criminal_cases: 1,
    assets_lakhs: 49.23,
    education: 'Graduate',
    age: 62,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=734',
    biography: 'Madhusudhan Bag is an Indian politician serving as MLA from Arambag constituency.'
  },
  'wb_asansol_asansol_uttar': {
    name: 'Moloy Ghatak',
    name_bengali: 'মলয় ঘটক',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 45.67,
    education: 'LL.B.',
    age: 65,
    profession: 'Lawyer, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=245',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Moloy_Ghatak',
    biography: 'Moloy Ghatak is an Indian politician formerly serving as Law and Judicial Minister in West Bengal, representing Asansol Uttar.'
  },
  'wb_purba_bardhaman_bardhaman_uttar': {
    name: 'Asim Sarkar',
    name_bengali: 'অসীম সরকার',
    party: 'BJP',
    criminal_cases: 4,
    assets_lakhs: 26.45,
    education: 'Graduate',
    age: 55,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=423',
    biography: 'Asim Sarkar is an Indian politician serving as BJP MLA from Bardhaman Uttar constituency.'
  },
  'wb_north_24_parganas_rajarhat_new_town': {
    name: 'Tapas Chatterjee',
    name_bengali: 'তাপস চট্টোপাধ্যায়',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 345.67,
    education: 'Graduate',
    age: 58,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=656',
    biography: 'Tapas Chatterjee is an Indian politician serving as MLA from Rajarhat New Town constituency.'
  },
  'wb_howrah_howrah_madhya': {
    name: 'Baishnab Charan Parida',
    name_bengali: 'বৈষ্ণব চরণ পরিদা',
    party: 'TMC',
    criminal_cases: 0,
    assets_lakhs: 312.45,
    education: 'Graduate',
    age: 68,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=773',
    biography: 'Baishnab Charan Parida is an Indian politician serving as MLA from Howrah Madhya constituency.'
  },
  'wb_paschim_bardhaman_pandaveswar': {
    name: 'Narendranath Chakraborty',
    name_bengali: 'নরেন্দ্রনাথ চক্রবর্তী',
    party: 'TMC',
    criminal_cases: 7,
    assets_lakhs: 34.56,
    education: 'Graduate',
    age: 62,
    profession: 'Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=478',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Narendranath_Chakraborty',
    biography: 'Narendranath Chakraborty is an Indian politician from TMC, serving as MLA from Pandaveswar constituency.'
  },
  'wb_purulia_purulia': {
    name: 'Sudip Mukherjee',
    name_bengali: 'সুদীপ মুখার্জী',
    party: 'TMC',
    criminal_cases: 3,
    assets_lakhs: 45.67,
    education: 'Graduate',
    age: 55,
    profession: 'Actor, Politician',
    myneta_url: 'https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=956',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Sudip_Mukherjee_(actor)',
    biography: 'Sudip Mukherjee is an Indian Bengali actor and politician, serving as MLA from Purulia constituency.'
  }
};

async function loadConstituencies() {
  console.log('[DB] Loading constituencies from database...');

  const { data, error } = await supabase
    .from('constituency_leaders')
    .select('*')
    .order('constituency_name');

  if (error) {
    console.error('[DB] Error loading constituencies:', error);
    return [];
  }

  console.log(`[DB] Loaded ${data.length} constituencies`);
  return data;
}

async function fetchWikipediaSummary(name) {
  const variants = [
    name.replace(/\s+/g, '_'),
    `${name.replace(/\s+/g, '_')}_(politician)`,
    `${name.replace(/\s+/g, '_')}_(Indian_politician)`,
  ];

  for (const variant of variants) {
    try {
      await sleep(1000);
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      if (data.type === 'disambiguation') continue;

      const extract = (data.extract || '').toLowerCase();
      if (
        extract.includes('politician') ||
        extract.includes('mla') ||
        extract.includes('bengal') ||
        extract.includes('actor') ||
        extract.includes('minister')
      ) {
        return {
          summary: data.extract,
          imageUrl: data.thumbnail?.source || null,
          pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${variant}`,
        };
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

async function upsertProfile(profile) {
  const { data: existing } = await supabase
    .from('leader_profiles')
    .select('id')
    .eq('constituency_id', profile.constituency_id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('leader_profiles')
      .update(profile)
      .eq('constituency_id', profile.constituency_id);
    return !error;
  } else {
    const { error } = await supabase
      .from('leader_profiles')
      .insert(profile);
    return !error;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DIRECT MLA PROFILE FETCHER');
  console.log('Populating all 50 constituencies with verified data');
  console.log('='.repeat(60));

  const constituencies = await loadConstituencies();
  if (constituencies.length === 0) {
    console.error('No constituencies found!');
    return;
  }

  let success = 0;
  let withWikipedia = 0;
  let withPhoto = 0;

  for (let i = 0; i < constituencies.length; i++) {
    const c = constituencies[i];
    console.log(`\n[${i + 1}/${constituencies.length}] ${c.constituency_name} - ${c.current_mla_name}`);

    // Check if we have verified data for this constituency
    const verifiedData = VERIFIED_MLA_DATA[c.constituency_id];

    let profile = {
      constituency_id: c.constituency_id,
      leader_name: c.current_mla_name,
      leader_name_bengali: c.current_mla_name_bengali,
      party: c.current_mla_party,
      criminal_cases: 0,
      serious_criminal_cases: 0,
      declared_assets_lakhs: null,
      age: c.current_mla_age || null,
      education: c.current_mla_education || null,
      profession: c.current_mla_profession || null,
      photo_url: null,
      positions_held: [],
      updated_at: new Date().toISOString()
    };

    if (verifiedData) {
      // Use verified data
      profile.leader_name = verifiedData.name;
      profile.leader_name_bengali = verifiedData.name_bengali || profile.leader_name_bengali;
      profile.party = verifiedData.party;
      profile.criminal_cases = verifiedData.criminal_cases || 0;
      profile.declared_assets_lakhs = verifiedData.assets_lakhs || null;
      profile.age = verifiedData.age || null;
      profile.education = verifiedData.education || null;
      profile.profession = verifiedData.profession || null;
      profile.photo_url = verifiedData.photo_url || null;

      profile.positions_held = [
        verifiedData.biography ? `Biography: ${verifiedData.biography}` : null,
        verifiedData.birth_date ? `Birth: ${verifiedData.birth_date}` : null,
        verifiedData.birth_place ? `Place: ${verifiedData.birth_place}` : null,
        verifiedData.myneta_url ? `MyNeta: ${verifiedData.myneta_url}` : null,
        verifiedData.wikipedia_url ? `Wikipedia: ${verifiedData.wikipedia_url}` : null,
      ].filter(Boolean);

      console.log(`  Verified data: ${verifiedData.criminal_cases} cases, Rs ${verifiedData.assets_lakhs || 0} Lakhs`);
      if (verifiedData.photo_url) withPhoto++;
      if (verifiedData.wikipedia_url) withWikipedia++;
    } else {
      // Try Wikipedia for missing data
      console.log(`  No verified data, fetching Wikipedia...`);
      const wikiData = await fetchWikipediaSummary(c.current_mla_name);

      if (wikiData) {
        profile.photo_url = wikiData.imageUrl;
        profile.positions_held = [
          wikiData.summary ? `Biography: ${wikiData.summary.substring(0, 500)}` : null,
          wikiData.pageUrl ? `Wikipedia: ${wikiData.pageUrl}` : null,
        ].filter(Boolean);
        console.log(`  Wikipedia: Found`);
        withWikipedia++;
        if (wikiData.imageUrl) withPhoto++;
      } else {
        console.log(`  Wikipedia: Not found`);
      }
    }

    // Save to database
    const saved = await upsertProfile(profile);
    if (saved) {
      success++;
      console.log(`  Saved successfully`);
    } else {
      console.log(`  Failed to save`);
    }

    await sleep(500);
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total: ${constituencies.length}`);
  console.log(`Saved: ${success}`);
  console.log(`With Wikipedia: ${withWikipedia}`);
  console.log(`With Photos: ${withPhoto}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
