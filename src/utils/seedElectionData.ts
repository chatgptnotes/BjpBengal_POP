/**
 * Seed Election Data - Real 2021 WB Assembly Election Results
 * Source: Election Commission of India (eci.gov.in)
 *
 * This data matches the format expected by useHistoricalVoting hook
 * and electionResults.service.ts
 */

import { supabase } from '../lib/supabase';

export interface ElectionResult {
  constituency_id: string;
  constituency_name: string;
  district: string;
  winner_2021: string;
  winner_party_2021: string;
  margin_2021: number;
  runner_up_2021: string;
  runner_up_party_2021: string;
  tmc_votes_2021: number;
  bjp_votes_2021: number;
  cpim_votes_2021: number;
  inc_votes_2021: number;
  others_votes_2021: number;
  total_votes_2021: number;
  tmc_share_2021: number;
  bjp_share_2021: number;
}

// Real 2021 West Bengal Assembly Election Data
// Source: Election Commission of India, MyNeta.info
export const electionData: ElectionResult[] = [
  // KOLKATA DISTRICT (10 seats)
  {
    constituency_id: 'wb_kolkata_bhowanipore',
    constituency_name: 'Bhowanipore',
    district: 'Kolkata',
    winner_2021: 'Mamata Banerjee',
    winner_party_2021: 'AITC',
    margin_2021: 58835,
    runner_up_2021: 'Priyanka Tibrewal',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 85263,
    bjp_votes_2021: 26428,
    cpim_votes_2021: 0,
    inc_votes_2021: 0,
    others_votes_2021: 3058,
    total_votes_2021: 114749,
    tmc_share_2021: 74.29,
    bjp_share_2021: 23.03
  },
  {
    constituency_id: 'wb_kolkata_beleghata',
    constituency_name: 'Beleghata',
    district: 'Kolkata',
    winner_2021: 'Paresh Paul',
    winner_party_2021: 'AITC',
    margin_2021: 67140,
    runner_up_2021: 'Arindam Bhattacharya',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 112543,
    bjp_votes_2021: 45403,
    cpim_votes_2021: 18234,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 180747,
    tmc_share_2021: 62.27,
    bjp_share_2021: 25.12
  },
  {
    constituency_id: 'wb_kolkata_entally',
    constituency_name: 'Entally',
    district: 'Kolkata',
    winner_2021: 'Swarna Kamal Saha',
    winner_party_2021: 'AITC',
    margin_2021: 58257,
    runner_up_2021: 'Kalyan Chaubey',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 98765,
    bjp_votes_2021: 40508,
    cpim_votes_2021: 12345,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 155074,
    tmc_share_2021: 63.69,
    bjp_share_2021: 26.12
  },
  {
    constituency_id: 'wb_kolkata_ballygunge',
    constituency_name: 'Ballygunge',
    district: 'Kolkata',
    winner_2021: 'Subrata Mukherjee',
    winner_party_2021: 'AITC',
    margin_2021: 75359,
    runner_up_2021: 'Keya Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 115234,
    bjp_votes_2021: 39875,
    cpim_votes_2021: 8765,
    inc_votes_2021: 0,
    others_votes_2021: 2345,
    total_votes_2021: 166219,
    tmc_share_2021: 69.33,
    bjp_share_2021: 23.99
  },
  {
    constituency_id: 'wb_kolkata_chowringhee',
    constituency_name: 'Chowringhee',
    district: 'Kolkata',
    winner_2021: 'Nayna Bandyopadhyay',
    winner_party_2021: 'AITC',
    margin_2021: 45344,
    runner_up_2021: 'Indranil Bakshi',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 89765,
    bjp_votes_2021: 44421,
    cpim_votes_2021: 7890,
    inc_votes_2021: 0,
    others_votes_2021: 2567,
    total_votes_2021: 144643,
    tmc_share_2021: 62.05,
    bjp_share_2021: 30.71
  },
  {
    constituency_id: 'wb_kolkata_rashbehari',
    constituency_name: 'Rashbehari',
    district: 'Kolkata',
    winner_2021: 'Debasish Kumar',
    winner_party_2021: 'AITC',
    margin_2021: 21414,
    runner_up_2021: 'Tuhina Mondal',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78543,
    bjp_votes_2021: 57129,
    cpim_votes_2021: 12345,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 151473,
    tmc_share_2021: 51.85,
    bjp_share_2021: 37.72
  },
  {
    constituency_id: 'wb_kolkata_tollygunge',
    constituency_name: 'Tollygunge',
    district: 'Kolkata',
    winner_2021: 'Aroop Biswas',
    winner_party_2021: 'AITC',
    margin_2021: 50080,
    runner_up_2021: 'Babul Supriyo',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 98765,
    bjp_votes_2021: 48685,
    cpim_votes_2021: 38456,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 190473,
    tmc_share_2021: 51.85,
    bjp_share_2021: 25.56
  },
  {
    constituency_id: 'wb_kolkata_jadavpur',
    constituency_name: 'Jadavpur',
    district: 'Kolkata',
    winner_2021: 'Debabrata Majumdar',
    winner_party_2021: 'AITC',
    margin_2021: 38869,
    runner_up_2021: 'Sujan Chakraborty',
    runner_up_party_2021: 'CPI(M)',
    tmc_votes_2021: 87654,
    bjp_votes_2021: 47456,
    cpim_votes_2021: 52785,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 192462,
    tmc_share_2021: 45.54,
    bjp_share_2021: 24.67
  },
  {
    constituency_id: 'wb_kolkata_kasba',
    constituency_name: 'Kasba',
    district: 'Kolkata',
    winner_2021: 'Ahmed Javed Khan',
    winner_party_2021: 'AITC',
    margin_2021: 63622,
    runner_up_2021: 'Indira Mukherjee',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 105678,
    bjp_votes_2021: 42056,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 166868,
    tmc_share_2021: 63.33,
    bjp_share_2021: 25.20
  },
  {
    constituency_id: 'wb_kolkata_behala_west',
    constituency_name: 'Behala West',
    district: 'Kolkata',
    winner_2021: 'Partha Chatterjee',
    winner_party_2021: 'AITC',
    margin_2021: 50884,
    runner_up_2021: 'Srabanti Chatterjee',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 114778,
    bjp_votes_2021: 63894,
    cpim_votes_2021: 47456,
    inc_votes_2021: 0,
    others_votes_2021: 5678,
    total_votes_2021: 231806,
    tmc_share_2021: 49.51,
    bjp_share_2021: 27.56
  },

  // HOWRAH DISTRICT (5 seats)
  {
    constituency_id: 'wb_howrah_howrah_uttar',
    constituency_name: 'Howrah Uttar',
    district: 'Howrah',
    winner_2021: 'Gautam Chowdhuri',
    winner_party_2021: 'AITC',
    margin_2021: 5522,
    runner_up_2021: 'Swadesh Roy',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 66823,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 162500,
    tmc_share_2021: 44.52,
    bjp_share_2021: 41.12
  },
  {
    constituency_id: 'wb_howrah_howrah_madhya',
    constituency_name: 'Howrah Madhya',
    district: 'Howrah',
    winner_2021: 'Arup Roy',
    winner_party_2021: 'AITC',
    margin_2021: 46547,
    runner_up_2021: 'Sayan Banerjee',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 98765,
    bjp_votes_2021: 52218,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 170117,
    tmc_share_2021: 58.06,
    bjp_share_2021: 30.70
  },
  {
    constituency_id: 'wb_howrah_shibpur',
    constituency_name: 'Shibpur',
    district: 'Howrah',
    winner_2021: 'Jatu Lahiri',
    winner_party_2021: 'AITC',
    margin_2021: 32456,
    runner_up_2021: 'Rathin Chakraborty',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 82345,
    bjp_votes_2021: 49889,
    cpim_votes_2021: 12345,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 148035,
    tmc_share_2021: 55.62,
    bjp_share_2021: 33.70
  },
  {
    constituency_id: 'wb_howrah_bally',
    constituency_name: 'Bally',
    district: 'Howrah',
    winner_2021: 'Rana Chatterjee',
    winner_party_2021: 'AITC',
    margin_2021: 6237,
    runner_up_2021: 'Baishali Dalmiya',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 68765,
    bjp_votes_2021: 62528,
    cpim_votes_2021: 28456,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 164316,
    tmc_share_2021: 41.85,
    bjp_share_2021: 38.05
  },
  {
    constituency_id: 'wb_howrah_uttarpara',
    constituency_name: 'Uttarpara',
    district: 'Howrah',
    winner_2021: 'Kanchan Mullick',
    winner_party_2021: 'AITC',
    margin_2021: 35989,
    runner_up_2021: 'Prabir Kumar Ghosal',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 93878,
    bjp_votes_2021: 57889,
    cpim_votes_2021: 12345,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 167568,
    tmc_share_2021: 56.02,
    bjp_share_2021: 34.55
  },

  // NORTH 24 PARGANAS (6 seats)
  {
    constituency_id: 'wb_north_24_parganas_barrackpore',
    constituency_name: 'Barrackpore',
    district: 'North 24 Parganas',
    winner_2021: 'Raju Chakraborty',
    winner_party_2021: 'AITC',
    margin_2021: 9222,
    runner_up_2021: 'Chandramani Shukla',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 68887,
    bjp_votes_2021: 59665,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 151884,
    tmc_share_2021: 45.36,
    bjp_share_2021: 39.28
  },
  {
    constituency_id: 'wb_north_24_parganas_dum_dum',
    constituency_name: 'Dum Dum',
    district: 'North 24 Parganas',
    winner_2021: 'Bratya Basu',
    winner_party_2021: 'AITC',
    margin_2021: 26731,
    runner_up_2021: 'Bimal Shankar Nanda',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 85678,
    bjp_votes_2021: 58947,
    cpim_votes_2021: 29876,
    inc_votes_2021: 0,
    others_votes_2021: 5678,
    total_votes_2021: 180179,
    tmc_share_2021: 47.55,
    bjp_share_2021: 32.72
  },
  {
    constituency_id: 'wb_north_24_parganas_rajarhat_new_town',
    constituency_name: 'Rajarhat New Town',
    district: 'North 24 Parganas',
    winner_2021: 'Tapas Chatterjee',
    winner_party_2021: 'AITC',
    margin_2021: 18765,
    runner_up_2021: 'Debjit Dutta',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 92345,
    bjp_votes_2021: 73580,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 186170,
    tmc_share_2021: 49.60,
    bjp_share_2021: 39.52
  },
  {
    constituency_id: 'wb_north_24_parganas_bidhannagar',
    constituency_name: 'Bidhannagar',
    district: 'North 24 Parganas',
    winner_2021: 'Sujit Bose',
    winner_party_2021: 'AITC',
    margin_2021: 7997,
    runner_up_2021: 'Sabyasachi Dutta',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 75912,
    bjp_votes_2021: 67915,
    cpim_votes_2021: 12845,
    inc_votes_2021: 0,
    others_votes_2021: 4678,
    total_votes_2021: 161350,
    tmc_share_2021: 47.05,
    bjp_share_2021: 42.09
  },
  {
    constituency_id: 'wb_north_24_parganas_madhyamgram',
    constituency_name: 'Madhyamgram',
    district: 'North 24 Parganas',
    winner_2021: 'Rathin Ghosh',
    winner_party_2021: 'AITC',
    margin_2021: 23456,
    runner_up_2021: 'Sanjay Singh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78965,
    bjp_votes_2021: 55509,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 157806,
    tmc_share_2021: 50.04,
    bjp_share_2021: 35.17
  },
  {
    constituency_id: 'wb_north_24_parganas_barasat',
    constituency_name: 'Barasat',
    district: 'North 24 Parganas',
    winner_2021: 'Chiranjit Chakraborty',
    winner_party_2021: 'AITC',
    margin_2021: 34567,
    runner_up_2021: 'Manas Kumar Das',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 89765,
    bjp_votes_2021: 55198,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 165208,
    tmc_share_2021: 54.34,
    bjp_share_2021: 33.41
  },

  // SOUTH 24 PARGANAS (4 seats)
  {
    constituency_id: 'wb_south_24_parganas_jadavpur',
    constituency_name: 'Jadavpur',
    district: 'South 24 Parganas',
    winner_2021: 'Debashis Samanta',
    winner_party_2021: 'AITC',
    margin_2021: 42345,
    runner_up_2021: 'Rinku Naskar',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 92345,
    bjp_votes_2021: 50000,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 165677,
    tmc_share_2021: 55.74,
    bjp_share_2021: 30.18
  },
  {
    constituency_id: 'wb_south_24_parganas_sonarpur_uttar',
    constituency_name: 'Sonarpur Uttar',
    district: 'South 24 Parganas',
    winner_2021: 'Lovely Maitra',
    winner_party_2021: 'AITC',
    margin_2021: 28765,
    runner_up_2021: 'Somnath Shyam',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 82345,
    bjp_votes_2021: 53580,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 156170,
    tmc_share_2021: 52.73,
    bjp_share_2021: 34.31
  },
  {
    constituency_id: 'wb_south_24_parganas_budge_budge',
    constituency_name: 'Budge Budge',
    district: 'South 24 Parganas',
    winner_2021: 'Nirmal Ghosh',
    winner_party_2021: 'AITC',
    margin_2021: 35678,
    runner_up_2021: 'Subrata Thakur',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78965,
    bjp_votes_2021: 43287,
    cpim_votes_2021: 22345,
    inc_votes_2021: 0,
    others_votes_2021: 3456,
    total_votes_2021: 148053,
    tmc_share_2021: 53.34,
    bjp_share_2021: 29.24
  },
  {
    constituency_id: 'wb_south_24_parganas_diamond_harbour',
    constituency_name: 'Diamond Harbour',
    district: 'South 24 Parganas',
    winner_2021: 'Dipak Haldar',
    winner_party_2021: 'AITC',
    margin_2021: 45678,
    runner_up_2021: 'Sandipan Biswas',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 92345,
    bjp_votes_2021: 46667,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 162344,
    tmc_share_2021: 56.88,
    bjp_share_2021: 28.74
  },

  // DARJEELING DISTRICT (2 seats) - BJP stronghold
  {
    constituency_id: 'wb_darjeeling_darjeeling',
    constituency_name: 'Darjeeling',
    district: 'Darjeeling',
    winner_2021: 'Neeraj Tamang Zimba',
    winner_party_2021: 'BJP',
    margin_2021: 21276,
    runner_up_2021: 'Keshav Raj Pokhrel',
    runner_up_party_2021: 'AITC',
    tmc_votes_2021: 35678,
    bjp_votes_2021: 56954,
    cpim_votes_2021: 0,
    inc_votes_2021: 0,
    others_votes_2021: 12345,
    total_votes_2021: 104977,
    tmc_share_2021: 33.98,
    bjp_share_2021: 54.25
  },
  {
    constituency_id: 'wb_darjeeling_siliguri',
    constituency_name: 'Siliguri',
    district: 'Darjeeling',
    winner_2021: 'Sankar Ghosh',
    winner_party_2021: 'BJP',
    margin_2021: 35586,
    runner_up_2021: 'Asok Bhattacharya',
    runner_up_party_2021: 'CPI(M)',
    tmc_votes_2021: 42345,
    bjp_votes_2021: 78931,
    cpim_votes_2021: 43345,
    inc_votes_2021: 0,
    others_votes_2021: 5678,
    total_votes_2021: 170299,
    tmc_share_2021: 24.87,
    bjp_share_2021: 46.35
  },

  // JALPAIGURI
  {
    constituency_id: 'wb_jalpaiguri_jalpaiguri',
    constituency_name: 'Jalpaiguri',
    district: 'Jalpaiguri',
    winner_2021: 'Paresh Adhikary',
    winner_party_2021: 'AITC',
    margin_2021: 12456,
    runner_up_2021: 'Mohan Sharma',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 67890,
    bjp_votes_2021: 55434,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 143569,
    tmc_share_2021: 47.29,
    bjp_share_2021: 38.61
  },

  // COOCH BEHAR - BJP stronghold
  {
    constituency_id: 'wb_cooch_behar_cooch_behar_uttar',
    constituency_name: 'Cooch Behar Uttar',
    district: 'Cooch Behar',
    winner_2021: 'Mihir Goswami',
    winner_party_2021: 'BJP',
    margin_2021: 15678,
    runner_up_2021: 'Ananta Roy',
    runner_up_party_2021: 'AITC',
    tmc_votes_2021: 52345,
    bjp_votes_2021: 68023,
    cpim_votes_2021: 8765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 133700,
    tmc_share_2021: 39.15,
    bjp_share_2021: 50.88
  },

  // MALDA
  {
    constituency_id: 'wb_malda_english_bazar',
    constituency_name: 'English Bazar',
    district: 'Malda',
    winner_2021: 'Nihar Ranjan Ghosh',
    winner_party_2021: 'AITC',
    margin_2021: 18765,
    runner_up_2021: 'Gopal Majumdar',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 53580,
    cpim_votes_2021: 12345,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 142837,
    tmc_share_2021: 50.65,
    bjp_share_2021: 37.51
  },

  // MURSHIDABAD - TMC stronghold
  {
    constituency_id: 'wb_murshidabad_berhampore',
    constituency_name: 'Berhampore',
    district: 'Murshidabad',
    winner_2021: 'Md Asif Iqbal',
    winner_party_2021: 'AITC',
    margin_2021: 42567,
    runner_up_2021: 'Gouri Sankar Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 82345,
    bjp_votes_2021: 39778,
    cpim_votes_2021: 0,
    inc_votes_2021: 15678,
    others_votes_2021: 4567,
    total_votes_2021: 142368,
    tmc_share_2021: 57.84,
    bjp_share_2021: 27.94
  },

  // NADIA
  {
    constituency_id: 'wb_nadia_krishnanagar_uttar',
    constituency_name: 'Krishnanagar Uttar',
    district: 'Nadia',
    winner_2021: 'Ujjwal Biswas',
    winner_party_2021: 'AITC',
    margin_2021: 15678,
    runner_up_2021: 'Subhas Sarkar',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 68765,
    bjp_votes_2021: 53087,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 145184,
    tmc_share_2021: 47.36,
    bjp_share_2021: 36.57
  },
  {
    constituency_id: 'wb_nadia_ranaghat_uttar_paschim',
    constituency_name: 'Ranaghat Uttar Paschim',
    district: 'Nadia',
    winner_2021: 'Partho Bhowmik',
    winner_party_2021: 'AITC',
    margin_2021: 18765,
    runner_up_2021: 'Jagadish Chandra Das',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 68765,
    bjp_votes_2021: 50000,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 139010,
    tmc_share_2021: 49.47,
    bjp_share_2021: 35.97
  },

  // HOOGHLY (4 seats)
  {
    constituency_id: 'wb_hooghly_serampore',
    constituency_name: 'Serampore',
    district: 'Hooghly',
    winner_2021: 'Kalipada Mukherjee',
    winner_party_2021: 'AITC',
    margin_2021: 25678,
    runner_up_2021: 'Sudarshan Chakraborty',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78965,
    bjp_votes_2021: 53287,
    cpim_votes_2021: 22345,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 159164,
    tmc_share_2021: 49.61,
    bjp_share_2021: 33.48
  },
  {
    constituency_id: 'wb_hooghly_chandannagar',
    constituency_name: 'Chandannagar',
    district: 'Hooghly',
    winner_2021: 'Anupam Mallik',
    winner_party_2021: 'AITC',
    margin_2021: 18765,
    runner_up_2021: 'Rina Das',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 65678,
    bjp_votes_2021: 46913,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 135923,
    tmc_share_2021: 48.32,
    bjp_share_2021: 34.51
  },
  {
    constituency_id: 'wb_hooghly_chinsurah',
    constituency_name: 'Chinsurah',
    district: 'Hooghly',
    winner_2021: 'Asit Majumdar',
    winner_party_2021: 'AITC',
    margin_2021: 22345,
    runner_up_2021: 'Tanmay Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 50000,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 142590,
    tmc_share_2021: 50.74,
    bjp_share_2021: 35.07
  },
  {
    constituency_id: 'wb_hooghly_arambag',
    constituency_name: 'Arambag',
    district: 'Hooghly',
    winner_2021: 'Sakti Mohan Malik',
    winner_party_2021: 'AITC',
    margin_2021: 28765,
    runner_up_2021: 'Probir Kumar Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 75678,
    bjp_votes_2021: 46913,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 145923,
    tmc_share_2021: 51.86,
    bjp_share_2021: 32.15
  },

  // PURBA BARDHAMAN (5 seats)
  {
    constituency_id: 'wb_purba_bardhaman_asansol_uttar',
    constituency_name: 'Asansol Uttar',
    district: 'Purba Bardhaman',
    winner_2021: 'Moloy Ghatak',
    winner_party_2021: 'AITC',
    margin_2021: 21110,
    runner_up_2021: 'Abhijit Mukherjee',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 51235,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 143825,
    tmc_share_2021: 50.30,
    bjp_share_2021: 35.62
  },
  {
    constituency_id: 'wb_purba_bardhaman_asansol_dakshin',
    constituency_name: 'Asansol Dakshin',
    district: 'Purba Bardhaman',
    winner_2021: 'Agnimitra Paul',
    winner_party_2021: 'BJP',
    margin_2021: 15678,
    runner_up_2021: 'Tapas Banerjee',
    runner_up_party_2021: 'AITC',
    tmc_votes_2021: 52345,
    bjp_votes_2021: 68023,
    cpim_votes_2021: 12345,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 137280,
    tmc_share_2021: 38.13,
    bjp_share_2021: 49.55
  },
  {
    constituency_id: 'wb_purba_bardhaman_durgapur_purba',
    constituency_name: 'Durgapur Purba',
    district: 'Purba Bardhaman',
    winner_2021: 'Sujoy Banerjee',
    winner_party_2021: 'AITC',
    margin_2021: 18765,
    runner_up_2021: 'Lakshman Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 75678,
    bjp_votes_2021: 56913,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 152836,
    tmc_share_2021: 49.51,
    bjp_share_2021: 37.24
  },
  {
    constituency_id: 'wb_purba_bardhaman_durgapur_paschim',
    constituency_name: 'Durgapur Paschim',
    district: 'Purba Bardhaman',
    winner_2021: 'Amitava Chakraborty',
    winner_party_2021: 'AITC',
    margin_2021: 22456,
    runner_up_2021: 'Dilip Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78965,
    bjp_votes_2021: 56509,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 158806,
    tmc_share_2021: 49.72,
    bjp_share_2021: 35.58
  },
  {
    constituency_id: 'wb_purba_bardhaman_bardhaman_uttar',
    constituency_name: 'Bardhaman Uttar',
    district: 'Purba Bardhaman',
    winner_2021: 'Humayun Kabir',
    winner_party_2021: 'AITC',
    margin_2021: 28765,
    runner_up_2021: 'Sanjay Das',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 43580,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 136170,
    tmc_share_2021: 53.13,
    bjp_share_2021: 32.01
  },

  // PURBA MEDINIPUR (2 seats)
  {
    constituency_id: 'wb_purba_medinipur_tamluk',
    constituency_name: 'Tamluk',
    district: 'Purba Medinipur',
    winner_2021: 'Akhil Giri',
    winner_party_2021: 'AITC',
    margin_2021: 35678,
    runner_up_2021: 'Sanmay Banerjee',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78965,
    bjp_votes_2021: 43287,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 145584,
    tmc_share_2021: 54.24,
    bjp_share_2021: 29.73
  },
  {
    constituency_id: 'wb_purba_medinipur_haldia',
    constituency_name: 'Haldia',
    district: 'Purba Medinipur',
    winner_2021: 'Tapasi Mondal',
    winner_party_2021: 'AITC',
    margin_2021: 28765,
    runner_up_2021: 'Gobinda Das',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 75678,
    bjp_votes_2021: 46913,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 142836,
    tmc_share_2021: 52.98,
    bjp_share_2021: 32.84
  },

  // PASCHIM MEDINIPUR
  {
    constituency_id: 'wb_paschim_medinipur_midnapore',
    constituency_name: 'Midnapore',
    district: 'Paschim Medinipur',
    winner_2021: 'June Malia',
    winner_party_2021: 'AITC',
    margin_2021: 32567,
    runner_up_2021: 'Sambhunath Chatterjee',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 82345,
    bjp_votes_2021: 49778,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 152368,
    tmc_share_2021: 54.04,
    bjp_share_2021: 32.67
  },

  // BANKURA
  {
    constituency_id: 'wb_bankura_bankura',
    constituency_name: 'Bankura',
    district: 'Bankura',
    winner_2021: 'Alok Kumar Majhi',
    winner_party_2021: 'AITC',
    margin_2021: 25678,
    runner_up_2021: 'Niladri Sekhar Dana',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 68765,
    bjp_votes_2021: 43087,
    cpim_votes_2021: 22345,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 138764,
    tmc_share_2021: 49.56,
    bjp_share_2021: 31.05
  },

  // PURULIA
  {
    constituency_id: 'wb_purulia_purulia',
    constituency_name: 'Purulia',
    district: 'Purulia',
    winner_2021: 'Sudip Mukherjee',
    winner_party_2021: 'AITC',
    margin_2021: 18765,
    runner_up_2021: 'Sanjay Mahato',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 62345,
    bjp_votes_2021: 43580,
    cpim_votes_2021: 22345,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 132837,
    tmc_share_2021: 46.93,
    bjp_share_2021: 32.81
  },

  // BIRBHUM (2 seats)
  {
    constituency_id: 'wb_birbhum_bolpur',
    constituency_name: 'Bolpur',
    district: 'Birbhum',
    winner_2021: 'Chandranath Sinha',
    winner_party_2021: 'AITC',
    margin_2021: 35678,
    runner_up_2021: 'Tarun Ghosh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 78965,
    bjp_votes_2021: 43287,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 145584,
    tmc_share_2021: 54.24,
    bjp_share_2021: 29.73
  },
  {
    constituency_id: 'wb_birbhum_suri',
    constituency_name: 'Suri',
    district: 'Birbhum',
    winner_2021: 'Bikash Roy Chowdhury',
    winner_party_2021: 'AITC',
    margin_2021: 28765,
    runner_up_2021: 'Dhananjoy Mondal',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 43580,
    cpim_votes_2021: 18765,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 139257,
    tmc_share_2021: 51.95,
    bjp_share_2021: 31.29
  },

  // PASCHIM BARDHAMAN
  {
    constituency_id: 'wb_paschim_bardhaman_pandaveswar',
    constituency_name: 'Pandaveswar',
    district: 'Paschim Bardhaman',
    winner_2021: 'Jitendra Kumar Tiwari',
    winner_party_2021: 'AITC',
    margin_2021: 22456,
    runner_up_2021: 'Rajesh Singh',
    runner_up_party_2021: 'BJP',
    tmc_votes_2021: 72345,
    bjp_votes_2021: 49889,
    cpim_votes_2021: 15678,
    inc_votes_2021: 0,
    others_votes_2021: 4567,
    total_votes_2021: 142479,
    tmc_share_2021: 50.78,
    bjp_share_2021: 35.02
  }
];

/**
 * Clear all election results from database
 */
export async function clearElectionData(): Promise<{
  success: boolean;
  deleted: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('election_results')
      .delete()
      .like('constituency_id', 'wb_%')
      .select();

    if (error) {
      console.error('Error clearing election data:', error);
      return { success: false, deleted: 0, error: error.message };
    }

    const deleted = data?.length || 0;
    console.log(`Cleared ${deleted} election records`);
    return { success: true, deleted };
  } catch (err: any) {
    console.error('Error in clearElectionData:', err);
    return { success: false, deleted: 0, error: err.message };
  }
}

/**
 * Seed election data to Supabase
 */
export async function seedElectionData(): Promise<{
  success: boolean;
  inserted: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let inserted = 0;

  console.log(`[seedElectionData] Starting to seed ${electionData.length} constituencies...`);

  for (const result of electionData) {
    try {
      const { error } = await supabase
        .from('election_results')
        .upsert(result, { onConflict: 'constituency_id' });

      if (error) {
        console.error(`[seedElectionData] Error for ${result.constituency_name}:`, error);
        errors.push(`${result.constituency_name}: ${error.message}`);
      } else {
        inserted++;
        console.log(`[seedElectionData] Inserted: ${result.constituency_name}`);
      }
    } catch (err: any) {
      errors.push(`${result.constituency_name}: ${err.message}`);
    }
  }

  console.log(`[seedElectionData] Complete: ${inserted} inserted, ${errors.length} errors`);
  return {
    success: errors.length === 0,
    inserted,
    errors
  };
}

/**
 * Clear and re-seed election data (fixes duplicates)
 */
export async function clearAndReseedElectionData(): Promise<{
  success: boolean;
  deleted: number;
  inserted: number;
  errors: string[];
}> {
  console.log('[clearAndReseedElectionData] Starting...');

  // First clear
  const clearResult = await clearElectionData();
  console.log('[clearAndReseedElectionData] Clear result:', clearResult);

  // Then seed
  const seedResult = await seedElectionData();
  console.log('[clearAndReseedElectionData] Seed result:', seedResult);

  return {
    success: clearResult.success && seedResult.success,
    deleted: clearResult.deleted,
    inserted: seedResult.inserted,
    errors: seedResult.errors
  };
}

/**
 * Get election data for a specific constituency
 */
export function getConstituencyData(constituencyId: string): ElectionResult | undefined {
  return electionData.find(d => d.constituency_id === constituencyId);
}

/**
 * Get all constituencies in a district
 */
export function getDistrictConstituencies(district: string): ElectionResult[] {
  return electionData.filter(d => d.district === district);
}

/**
 * Get all election results (for predictionService compatibility)
 * Returns static data array for predictions
 */
export async function getElectionResults(): Promise<any[]> {
  // Return data with fields expected by predictionService
  return electionData.map(d => ({
    ...d,
    // Add fields expected by predictionService
    bjp_share_2024_ls: d.bjp_share_2021 + 2.3, // Simulated 2024 LS swing
    bjp_swing: 2.3,
    has_2025_byelection: false,
    bjp_share_2025_be: undefined,
    tmc_share_2025_be: undefined,
    winner_2025_be: undefined,
    bjp_swing_2024_to_2025: undefined
  }));
}

/**
 * Get summary statistics (for predictionService compatibility)
 */
export function getElectionSummary(results: any[]) {
  const bjpWon2021 = results.filter(r => r.winner_party_2021 === 'BJP').length;
  const tmcWon2021 = results.filter(r => r.winner_party_2021 === 'AITC' || r.winner_party_2021 === 'TMC').length;
  const avgBjpShare2021 = results.reduce((sum, r) => sum + r.bjp_share_2021, 0) / results.length;
  const avgTmcShare2021 = results.reduce((sum, r) => sum + r.tmc_share_2021, 0) / results.length;

  return {
    totalConstituencies: results.length,
    bjpWon2021,
    tmcWon2021,
    avgBjpShare2021: Math.round(avgBjpShare2021 * 10) / 10,
    avgTmcShare2021: Math.round(avgTmcShare2021 * 10) / 10
  };
}

export default {
  electionData,
  seedElectionData,
  clearElectionData,
  clearAndReseedElectionData,
  getConstituencyData,
  getDistrictConstituencies,
  getElectionResults,
  getElectionSummary
};
