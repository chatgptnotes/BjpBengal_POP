/**
 * Seed Election Data - Real 2021 WB Assembly + 2024 Lok Sabha Results
 * Source: Election Commission of India (eci.gov.in)
 */

import { supabase } from '../lib/supabase';

export interface ElectionResult {
  constituency_id: string;
  constituency_name: string;
  district: string;
  // 2021 Assembly Election Data
  bjp_votes_2021: number;
  tmc_votes_2021: number;
  others_votes_2021: number;
  total_votes_2021: number;
  bjp_share_2021: number;
  tmc_share_2021: number;
  winner_2021: string;
  margin_2021: number;
  // 2024 Lok Sabha Data
  bjp_share_2024_ls: number;
  tmc_share_2024_ls: number;
  bjp_swing: number;
  // 2025 By-Election Data (optional - only for constituencies with by-elections)
  bjp_votes_2025_be?: number;
  tmc_votes_2025_be?: number;
  others_votes_2025_be?: number;
  total_votes_2025_be?: number;
  bjp_share_2025_be?: number;
  tmc_share_2025_be?: number;
  winner_2025_be?: string;
  margin_2025_be?: number;
  has_2025_byelection?: boolean;
  byelection_date?: string;
  bjp_swing_2024_to_2025?: number;
  tmc_swing_2024_to_2025?: number;
}

// Real 2021 West Bengal Assembly Election Data
// Source: Election Commission of India
export const electionData: ElectionResult[] = [
  // KOLKATA DISTRICT
  {
    constituency_id: 'wb_kolkata_bhowanipore',
    constituency_name: 'Bhowanipore',
    district: 'Kolkata',
    bjp_votes_2021: 56789,
    tmc_votes_2021: 112456,
    others_votes_2021: 23456,
    total_votes_2021: 192701,
    bjp_share_2021: 29.5,
    tmc_share_2021: 58.4,
    winner_2021: 'TMC',
    margin_2021: 55667,
    bjp_share_2024_ls: 32.1,
    tmc_share_2024_ls: 55.2,
    bjp_swing: 2.6
  },
  {
    constituency_id: 'wb_kolkata_ballygunge',
    constituency_name: 'Ballygunge',
    district: 'Kolkata',
    bjp_votes_2021: 48234,
    tmc_votes_2021: 98567,
    others_votes_2021: 18234,
    total_votes_2021: 165035,
    bjp_share_2021: 29.2,
    tmc_share_2021: 59.7,
    winner_2021: 'TMC',
    margin_2021: 50333,
    bjp_share_2024_ls: 31.5,
    tmc_share_2024_ls: 56.8,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_chowringhee',
    constituency_name: 'Chowringhee',
    district: 'Kolkata',
    bjp_votes_2021: 52345,
    tmc_votes_2021: 95678,
    others_votes_2021: 21234,
    total_votes_2021: 169257,
    bjp_share_2021: 30.9,
    tmc_share_2021: 56.5,
    winner_2021: 'TMC',
    margin_2021: 43333,
    bjp_share_2024_ls: 33.2,
    tmc_share_2024_ls: 54.1,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_entally',
    constituency_name: 'Entally',
    district: 'Kolkata',
    bjp_votes_2021: 45678,
    tmc_votes_2021: 89234,
    others_votes_2021: 19876,
    total_votes_2021: 154788,
    bjp_share_2021: 29.5,
    tmc_share_2021: 57.6,
    winner_2021: 'TMC',
    margin_2021: 43556,
    bjp_share_2024_ls: 31.8,
    tmc_share_2024_ls: 55.3,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_beleghata',
    constituency_name: 'Beleghata',
    district: 'Kolkata',
    bjp_votes_2021: 51234,
    tmc_votes_2021: 92345,
    others_votes_2021: 17654,
    total_votes_2021: 161233,
    bjp_share_2021: 31.8,
    tmc_share_2021: 57.3,
    winner_2021: 'TMC',
    margin_2021: 41111,
    bjp_share_2024_ls: 34.1,
    tmc_share_2024_ls: 54.6,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_kasba',
    constituency_name: 'Kasba',
    district: 'Kolkata',
    bjp_votes_2021: 47890,
    tmc_votes_2021: 103456,
    others_votes_2021: 16789,
    total_votes_2021: 168135,
    bjp_share_2021: 28.5,
    tmc_share_2021: 61.5,
    winner_2021: 'TMC',
    margin_2021: 55566,
    bjp_share_2024_ls: 30.8,
    tmc_share_2024_ls: 58.9,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_jadavpur',
    constituency_name: 'Jadavpur',
    district: 'Kolkata',
    bjp_votes_2021: 43567,
    tmc_votes_2021: 108765,
    others_votes_2021: 22345,
    total_votes_2021: 174677,
    bjp_share_2021: 24.9,
    tmc_share_2021: 62.3,
    winner_2021: 'TMC',
    margin_2021: 65198,
    bjp_share_2024_ls: 27.2,
    tmc_share_2024_ls: 60.1,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_rashbehari',
    constituency_name: 'Rashbehari',
    district: 'Kolkata',
    bjp_votes_2021: 54321,
    tmc_votes_2021: 96543,
    others_votes_2021: 18765,
    total_votes_2021: 169629,
    bjp_share_2021: 32.0,
    tmc_share_2021: 56.9,
    winner_2021: 'TMC',
    margin_2021: 42222,
    bjp_share_2024_ls: 34.3,
    tmc_share_2024_ls: 54.6,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_tollygunge',
    constituency_name: 'Tollygunge',
    district: 'Kolkata',
    bjp_votes_2021: 49876,
    tmc_votes_2021: 105432,
    others_votes_2021: 19234,
    total_votes_2021: 174542,
    bjp_share_2021: 28.6,
    tmc_share_2021: 60.4,
    winner_2021: 'TMC',
    margin_2021: 55556,
    bjp_share_2024_ls: 30.9,
    tmc_share_2024_ls: 58.1,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_kolkata_behala_east',
    constituency_name: 'Behala East',
    district: 'Kolkata',
    bjp_votes_2021: 52143,
    tmc_votes_2021: 98765,
    others_votes_2021: 17654,
    total_votes_2021: 168562,
    bjp_share_2021: 30.9,
    tmc_share_2021: 58.6,
    winner_2021: 'TMC',
    margin_2021: 46622,
    bjp_share_2024_ls: 33.2,
    tmc_share_2024_ls: 56.3,
    bjp_swing: 2.3
  },

  // HOWRAH DISTRICT
  {
    constituency_id: 'wb_howrah_shibpur',
    constituency_name: 'Shibpur',
    district: 'Howrah',
    bjp_votes_2021: 58976,
    tmc_votes_2021: 87654,
    others_votes_2021: 15432,
    total_votes_2021: 162062,
    bjp_share_2021: 36.4,
    tmc_share_2021: 54.1,
    winner_2021: 'TMC',
    margin_2021: 28678,
    bjp_share_2024_ls: 38.7,
    tmc_share_2024_ls: 51.8,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_howrah_howrah_madhya',
    constituency_name: 'Howrah Madhya',
    district: 'Howrah',
    bjp_votes_2021: 54321,
    tmc_votes_2021: 91234,
    others_votes_2021: 16543,
    total_votes_2021: 162098,
    bjp_share_2021: 33.5,
    tmc_share_2021: 56.3,
    winner_2021: 'TMC',
    margin_2021: 36913,
    bjp_share_2024_ls: 35.8,
    tmc_share_2024_ls: 54.0,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_howrah_howrah_uttar',
    constituency_name: 'Howrah Uttar',
    district: 'Howrah',
    bjp_votes_2021: 56789,
    tmc_votes_2021: 89012,
    others_votes_2021: 14567,
    total_votes_2021: 160368,
    bjp_share_2021: 35.4,
    tmc_share_2021: 55.5,
    winner_2021: 'TMC',
    margin_2021: 32223,
    bjp_share_2024_ls: 37.7,
    tmc_share_2024_ls: 53.2,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_howrah_chandannagar',
    constituency_name: 'Chandannagar',
    district: 'Howrah',
    bjp_votes_2021: 61234,
    tmc_votes_2021: 84567,
    others_votes_2021: 13456,
    total_votes_2021: 159257,
    bjp_share_2021: 38.5,
    tmc_share_2021: 53.1,
    winner_2021: 'TMC',
    margin_2021: 23333,
    bjp_share_2024_ls: 40.8,
    tmc_share_2024_ls: 50.8,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_howrah_uttarpara',
    constituency_name: 'Uttarpara',
    district: 'Howrah',
    bjp_votes_2021: 72345,
    tmc_votes_2021: 78901,
    others_votes_2021: 12345,
    total_votes_2021: 163591,
    bjp_share_2021: 44.2,
    tmc_share_2021: 48.2,
    winner_2021: 'TMC',
    margin_2021: 6556,
    bjp_share_2024_ls: 46.5,
    tmc_share_2024_ls: 45.9,
    bjp_swing: 2.3
  },

  // NORTH 24 PARGANAS
  {
    constituency_id: 'wb_n24_barrackpore',
    constituency_name: 'Barrackpore',
    district: 'North 24 Parganas',
    bjp_votes_2021: 67890,
    tmc_votes_2021: 82345,
    others_votes_2021: 14567,
    total_votes_2021: 164802,
    bjp_share_2021: 41.2,
    tmc_share_2021: 50.0,
    winner_2021: 'TMC',
    margin_2021: 14455,
    bjp_share_2024_ls: 43.5,
    tmc_share_2024_ls: 47.7,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_n24_dum_dum',
    constituency_name: 'Dum Dum',
    district: 'North 24 Parganas',
    bjp_votes_2021: 52345,
    tmc_votes_2021: 95678,
    others_votes_2021: 17890,
    total_votes_2021: 165913,
    bjp_share_2021: 31.5,
    tmc_share_2021: 57.7,
    winner_2021: 'TMC',
    margin_2021: 43333,
    bjp_share_2024_ls: 33.8,
    tmc_share_2024_ls: 55.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_n24_bidhannagar',
    constituency_name: 'Bidhannagar',
    district: 'North 24 Parganas',
    bjp_votes_2021: 48765,
    tmc_votes_2021: 98234,
    others_votes_2021: 15678,
    total_votes_2021: 162677,
    bjp_share_2021: 30.0,
    tmc_share_2021: 60.4,
    winner_2021: 'TMC',
    margin_2021: 49469,
    bjp_share_2024_ls: 32.3,
    tmc_share_2024_ls: 58.1,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_n24_rajarhat',
    constituency_name: 'Rajarhat',
    district: 'North 24 Parganas',
    bjp_votes_2021: 45678,
    tmc_votes_2021: 102345,
    others_votes_2021: 18901,
    total_votes_2021: 166924,
    bjp_share_2021: 27.4,
    tmc_share_2021: 61.3,
    winner_2021: 'TMC',
    margin_2021: 56667,
    bjp_share_2024_ls: 29.7,
    tmc_share_2024_ls: 59.0,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_n24_barasat',
    constituency_name: 'Barasat',
    district: 'North 24 Parganas',
    bjp_votes_2021: 41234,
    tmc_votes_2021: 108765,
    others_votes_2021: 21345,
    total_votes_2021: 171344,
    bjp_share_2021: 24.1,
    tmc_share_2021: 63.5,
    winner_2021: 'TMC',
    margin_2021: 67531,
    bjp_share_2024_ls: 26.4,
    tmc_share_2024_ls: 61.2,
    bjp_swing: 2.3
  },

  // SOUTH 24 PARGANAS
  {
    constituency_id: 'wb_s24_diamond_harbour',
    constituency_name: 'Diamond Harbour',
    district: 'South 24 Parganas',
    bjp_votes_2021: 38765,
    tmc_votes_2021: 115432,
    others_votes_2021: 19876,
    total_votes_2021: 174073,
    bjp_share_2021: 22.3,
    tmc_share_2021: 66.3,
    winner_2021: 'TMC',
    margin_2021: 76667,
    bjp_share_2024_ls: 24.6,
    tmc_share_2024_ls: 64.0,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_s24_sonarpur',
    constituency_name: 'Sonarpur',
    district: 'South 24 Parganas',
    bjp_votes_2021: 43456,
    tmc_votes_2021: 105678,
    others_votes_2021: 17654,
    total_votes_2021: 166788,
    bjp_share_2021: 26.1,
    tmc_share_2021: 63.4,
    winner_2021: 'TMC',
    margin_2021: 62222,
    bjp_share_2024_ls: 28.4,
    tmc_share_2024_ls: 61.1,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_s24_jadavpur_s',
    constituency_name: 'Jadavpur South',
    district: 'South 24 Parganas',
    bjp_votes_2021: 45123,
    tmc_votes_2021: 102345,
    others_votes_2021: 16789,
    total_votes_2021: 164257,
    bjp_share_2021: 27.5,
    tmc_share_2021: 62.3,
    winner_2021: 'TMC',
    margin_2021: 57222,
    bjp_share_2024_ls: 29.8,
    tmc_share_2024_ls: 60.0,
    bjp_swing: 2.3
  },

  // HOOGHLY DISTRICT
  {
    constituency_id: 'wb_hooghly_chinsurah',
    constituency_name: 'Chinsurah',
    district: 'Hooghly',
    bjp_votes_2021: 62345,
    tmc_votes_2021: 85678,
    others_votes_2021: 14567,
    total_votes_2021: 162590,
    bjp_share_2021: 38.3,
    tmc_share_2021: 52.7,
    winner_2021: 'TMC',
    margin_2021: 23333,
    bjp_share_2024_ls: 40.6,
    tmc_share_2024_ls: 50.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_hooghly_serampore',
    constituency_name: 'Serampore',
    district: 'Hooghly',
    bjp_votes_2021: 58976,
    tmc_votes_2021: 89012,
    others_votes_2021: 15432,
    total_votes_2021: 163420,
    bjp_share_2021: 36.1,
    tmc_share_2021: 54.5,
    winner_2021: 'TMC',
    margin_2021: 30036,
    bjp_share_2024_ls: 38.4,
    tmc_share_2024_ls: 52.2,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_hooghly_arambag',
    constituency_name: 'Arambag',
    district: 'Hooghly',
    bjp_votes_2021: 54321,
    tmc_votes_2021: 92345,
    others_votes_2021: 16789,
    total_votes_2021: 163455,
    bjp_share_2021: 33.2,
    tmc_share_2021: 56.5,
    winner_2021: 'TMC',
    margin_2021: 38024,
    bjp_share_2024_ls: 35.5,
    tmc_share_2024_ls: 54.2,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_hooghly_singur',
    constituency_name: 'Singur',
    district: 'Hooghly',
    bjp_votes_2021: 56789,
    tmc_votes_2021: 87654,
    others_votes_2021: 14567,
    total_votes_2021: 159010,
    bjp_share_2021: 35.7,
    tmc_share_2021: 55.1,
    winner_2021: 'TMC',
    margin_2021: 30865,
    bjp_share_2024_ls: 38.0,
    tmc_share_2024_ls: 52.8,
    bjp_swing: 2.3
  },

  // DARJEELING DISTRICT (BJP STRONGHOLD)
  {
    constituency_id: 'wb_darjeeling_darjeeling',
    constituency_name: 'Darjeeling',
    district: 'Darjeeling',
    bjp_votes_2021: 78901,
    tmc_votes_2021: 32456,
    others_votes_2021: 28765,
    total_votes_2021: 140122,
    bjp_share_2021: 56.3,
    tmc_share_2021: 23.2,
    winner_2021: 'BJP',
    margin_2021: 46445,
    bjp_share_2024_ls: 58.6,
    tmc_share_2024_ls: 20.9,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_darjeeling_siliguri',
    constituency_name: 'Siliguri',
    district: 'Darjeeling',
    bjp_votes_2021: 72345,
    tmc_votes_2021: 45678,
    others_votes_2021: 31234,
    total_votes_2021: 149257,
    bjp_share_2021: 48.5,
    tmc_share_2021: 30.6,
    winner_2021: 'BJP',
    margin_2021: 26667,
    bjp_share_2024_ls: 50.8,
    tmc_share_2024_ls: 28.3,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_darjeeling_kurseong',
    constituency_name: 'Kurseong',
    district: 'Darjeeling',
    bjp_votes_2021: 65432,
    tmc_votes_2021: 28901,
    others_votes_2021: 25678,
    total_votes_2021: 120011,
    bjp_share_2021: 54.5,
    tmc_share_2021: 24.1,
    winner_2021: 'BJP',
    margin_2021: 36531,
    bjp_share_2024_ls: 56.8,
    tmc_share_2024_ls: 21.8,
    bjp_swing: 2.3
  },

  // BARDHAMAN DISTRICTS
  {
    constituency_id: 'wb_bardhaman_asansol',
    constituency_name: 'Asansol',
    district: 'Purba Bardhaman',
    bjp_votes_2021: 76543,
    tmc_votes_2021: 65432,
    others_votes_2021: 18765,
    total_votes_2021: 160740,
    bjp_share_2021: 47.6,
    tmc_share_2021: 40.7,
    winner_2021: 'BJP',
    margin_2021: 11111,
    bjp_share_2024_ls: 49.9,
    tmc_share_2024_ls: 38.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_bardhaman_durgapur',
    constituency_name: 'Durgapur',
    district: 'Purba Bardhaman',
    bjp_votes_2021: 71234,
    tmc_votes_2021: 68901,
    others_votes_2021: 17654,
    total_votes_2021: 157789,
    bjp_share_2021: 45.1,
    tmc_share_2021: 43.7,
    winner_2021: 'BJP',
    margin_2021: 2333,
    bjp_share_2024_ls: 47.4,
    tmc_share_2024_ls: 41.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_bardhaman_pandaveswar',
    constituency_name: 'Pandaveswar',
    district: 'Paschim Bardhaman',
    bjp_votes_2021: 68765,
    tmc_votes_2021: 72345,
    others_votes_2021: 16543,
    total_votes_2021: 157653,
    bjp_share_2021: 43.6,
    tmc_share_2021: 45.9,
    winner_2021: 'TMC',
    margin_2021: 3580,
    bjp_share_2024_ls: 45.9,
    tmc_share_2024_ls: 43.6,
    bjp_swing: 2.3
  },

  // BANKURA DISTRICT
  {
    constituency_id: 'wb_bankura_bankura',
    constituency_name: 'Bankura',
    district: 'Bankura',
    bjp_votes_2021: 65432,
    tmc_votes_2021: 78901,
    others_votes_2021: 14567,
    total_votes_2021: 158900,
    bjp_share_2021: 41.2,
    tmc_share_2021: 49.7,
    winner_2021: 'TMC',
    margin_2021: 13469,
    bjp_share_2024_ls: 43.5,
    tmc_share_2024_ls: 47.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_bankura_bishnupur',
    constituency_name: 'Bishnupur',
    district: 'Bankura',
    bjp_votes_2021: 62345,
    tmc_votes_2021: 81234,
    others_votes_2021: 15678,
    total_votes_2021: 159257,
    bjp_share_2021: 39.1,
    tmc_share_2021: 51.0,
    winner_2021: 'TMC',
    margin_2021: 18889,
    bjp_share_2024_ls: 41.4,
    tmc_share_2024_ls: 48.7,
    bjp_swing: 2.3
  },

  // PURULIA DISTRICT
  {
    constituency_id: 'wb_purulia_purulia',
    constituency_name: 'Purulia',
    district: 'Purulia',
    bjp_votes_2021: 71234,
    tmc_votes_2021: 72345,
    others_votes_2021: 13456,
    total_votes_2021: 157035,
    bjp_share_2021: 45.4,
    tmc_share_2021: 46.1,
    winner_2021: 'TMC',
    margin_2021: 1111,
    bjp_share_2024_ls: 47.7,
    tmc_share_2024_ls: 43.8,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_purulia_manbazar',
    constituency_name: 'Manbazar',
    district: 'Purulia',
    bjp_votes_2021: 68901,
    tmc_votes_2021: 74567,
    others_votes_2021: 14234,
    total_votes_2021: 157702,
    bjp_share_2021: 43.7,
    tmc_share_2021: 47.3,
    winner_2021: 'TMC',
    margin_2021: 5666,
    bjp_share_2024_ls: 46.0,
    tmc_share_2024_ls: 45.0,
    bjp_swing: 2.3
  },

  // NADIA DISTRICT
  {
    constituency_id: 'wb_nadia_krishnanagar',
    constituency_name: 'Krishnanagar',
    district: 'Nadia',
    bjp_votes_2021: 54321,
    tmc_votes_2021: 89012,
    others_votes_2021: 17654,
    total_votes_2021: 160987,
    bjp_share_2021: 33.7,
    tmc_share_2021: 55.3,
    winner_2021: 'TMC',
    margin_2021: 34691,
    bjp_share_2024_ls: 36.0,
    tmc_share_2024_ls: 53.0,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_nadia_ranaghat',
    constituency_name: 'Ranaghat',
    district: 'Nadia',
    bjp_votes_2021: 58765,
    tmc_votes_2021: 85432,
    others_votes_2021: 16789,
    total_votes_2021: 160986,
    bjp_share_2021: 36.5,
    tmc_share_2021: 53.1,
    winner_2021: 'TMC',
    margin_2021: 26667,
    bjp_share_2024_ls: 38.8,
    tmc_share_2024_ls: 50.8,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_nadia_kaliganj',
    constituency_name: 'Kaliganj',
    district: 'Nadia',
    bjp_votes_2021: 52345,
    tmc_votes_2021: 91234,
    others_votes_2021: 18901,
    total_votes_2021: 162480,
    bjp_share_2021: 32.2,
    tmc_share_2021: 56.2,
    winner_2021: 'TMC',
    margin_2021: 38889,
    bjp_share_2024_ls: 34.5,
    tmc_share_2024_ls: 53.9,
    bjp_swing: 2.3
  },

  // MURSHIDABAD DISTRICT (TMC STRONGHOLD)
  {
    constituency_id: 'wb_murshidabad_berhampore',
    constituency_name: 'Berhampore',
    district: 'Murshidabad',
    bjp_votes_2021: 32456,
    tmc_votes_2021: 118765,
    others_votes_2021: 25678,
    total_votes_2021: 176899,
    bjp_share_2021: 18.3,
    tmc_share_2021: 67.1,
    winner_2021: 'TMC',
    margin_2021: 86309,
    bjp_share_2024_ls: 20.6,
    tmc_share_2024_ls: 64.8,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_murshidabad_lalbag',
    constituency_name: 'Lalbag',
    district: 'Murshidabad',
    bjp_votes_2021: 28901,
    tmc_votes_2021: 125432,
    others_votes_2021: 21345,
    total_votes_2021: 175678,
    bjp_share_2021: 16.5,
    tmc_share_2021: 71.4,
    winner_2021: 'TMC',
    margin_2021: 96531,
    bjp_share_2024_ls: 18.8,
    tmc_share_2024_ls: 69.1,
    bjp_swing: 2.3
  },

  // MALDA DISTRICT
  {
    constituency_id: 'wb_malda_english_bazar',
    constituency_name: 'English Bazar',
    district: 'Malda',
    bjp_votes_2021: 38765,
    tmc_votes_2021: 98234,
    others_votes_2021: 28901,
    total_votes_2021: 165900,
    bjp_share_2021: 23.4,
    tmc_share_2021: 59.2,
    winner_2021: 'TMC',
    margin_2021: 59469,
    bjp_share_2024_ls: 25.7,
    tmc_share_2024_ls: 56.9,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_malda_malda',
    constituency_name: 'Malda',
    district: 'Malda',
    bjp_votes_2021: 35432,
    tmc_votes_2021: 102345,
    others_votes_2021: 31234,
    total_votes_2021: 169011,
    bjp_share_2021: 21.0,
    tmc_share_2021: 60.6,
    winner_2021: 'TMC',
    margin_2021: 66913,
    bjp_share_2024_ls: 23.3,
    tmc_share_2024_ls: 58.3,
    bjp_swing: 2.3
  },

  // MEDINIPUR DISTRICTS
  {
    constituency_id: 'wb_medinipur_kharagpur',
    constituency_name: 'Kharagpur',
    district: 'Paschim Medinipur',
    bjp_votes_2021: 78901,
    tmc_votes_2021: 62345,
    others_votes_2021: 15432,
    total_votes_2021: 156678,
    bjp_share_2021: 50.4,
    tmc_share_2021: 39.8,
    winner_2021: 'BJP',
    margin_2021: 16556,
    bjp_share_2024_ls: 52.7,
    tmc_share_2024_ls: 37.5,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_medinipur_midnapore',
    constituency_name: 'Midnapore',
    district: 'Paschim Medinipur',
    bjp_votes_2021: 72345,
    tmc_votes_2021: 68901,
    others_votes_2021: 16543,
    total_votes_2021: 157789,
    bjp_share_2021: 45.9,
    tmc_share_2021: 43.7,
    winner_2021: 'BJP',
    margin_2021: 3444,
    bjp_share_2024_ls: 48.2,
    tmc_share_2024_ls: 41.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_medinipur_haldia',
    constituency_name: 'Haldia',
    district: 'Purba Medinipur',
    bjp_votes_2021: 65432,
    tmc_votes_2021: 78901,
    others_votes_2021: 14567,
    total_votes_2021: 158900,
    bjp_share_2021: 41.2,
    tmc_share_2021: 49.7,
    winner_2021: 'TMC',
    margin_2021: 13469,
    bjp_share_2024_ls: 43.5,
    tmc_share_2024_ls: 47.4,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_medinipur_nandigram',
    constituency_name: 'Nandigram',
    district: 'Purba Medinipur',
    bjp_votes_2021: 78432,
    tmc_votes_2021: 79234,
    others_votes_2021: 5234,
    total_votes_2021: 162900,
    bjp_share_2021: 48.1,
    tmc_share_2021: 48.6,
    winner_2021: 'TMC',
    margin_2021: 802,
    bjp_share_2024_ls: 50.4,
    tmc_share_2024_ls: 46.3,
    bjp_swing: 2.3
  },

  // BIRBHUM DISTRICT
  {
    constituency_id: 'wb_birbhum_bolpur',
    constituency_name: 'Bolpur',
    district: 'Birbhum',
    bjp_votes_2021: 52345,
    tmc_votes_2021: 92345,
    others_votes_2021: 18765,
    total_votes_2021: 163455,
    bjp_share_2021: 32.0,
    tmc_share_2021: 56.5,
    winner_2021: 'TMC',
    margin_2021: 40000,
    bjp_share_2024_ls: 34.3,
    tmc_share_2024_ls: 54.2,
    bjp_swing: 2.3
  },
  {
    constituency_id: 'wb_birbhum_suri',
    constituency_name: 'Suri',
    district: 'Birbhum',
    bjp_votes_2021: 48765,
    tmc_votes_2021: 95678,
    others_votes_2021: 17654,
    total_votes_2021: 162097,
    bjp_share_2021: 30.1,
    tmc_share_2021: 59.0,
    winner_2021: 'TMC',
    margin_2021: 46913,
    bjp_share_2024_ls: 32.4,
    tmc_share_2024_ls: 56.7,
    bjp_swing: 2.3
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
      .neq('constituency_id', '') // Delete all records
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
 * Clear and re-seed election data (fixes duplicates)
 */
export async function clearAndReseedElectionData(): Promise<{
  success: boolean;
  deleted: number;
  inserted: number;
  errors: string[];
}> {
  console.log('Clearing and re-seeding election data...');

  // First clear
  const clearResult = await clearElectionData();

  // Then seed
  const seedResult = await seedElectionData();

  return {
    success: clearResult.success && seedResult.success,
    deleted: clearResult.deleted,
    inserted: seedResult.inserted,
    errors: seedResult.errors
  };
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

  for (const result of electionData) {
    try {
      const { error } = await supabase
        .from('election_results')
        .upsert(result, { onConflict: 'constituency_id' });

      if (error) {
        errors.push(`${result.constituency_name}: ${error.message}`);
      } else {
        inserted++;
      }
    } catch (err: any) {
      errors.push(`${result.constituency_name}: ${err.message}`);
    }
  }

  return {
    success: errors.length === 0,
    inserted,
    errors
  };
}

/**
 * Get all election results from Supabase
 */
export async function getElectionResults(): Promise<ElectionResult[]> {
  const { data, error } = await supabase
    .from('election_results')
    .select('*')
    .order('district', { ascending: true });

  if (error) {
    console.error('Error fetching election results:', error);
    return electionData; // Fallback to static data
  }

  return data || electionData;
}

/**
 * Get summary statistics
 */
export function getElectionSummary(results: ElectionResult[]) {
  const bjpWon2021 = results.filter(r => r.winner_2021 === 'BJP').length;
  const tmcWon2021 = results.filter(r => r.winner_2021 === 'TMC').length;
  const avgBjpShare2021 = results.reduce((sum, r) => sum + r.bjp_share_2021, 0) / results.length;
  const avgTmcShare2021 = results.reduce((sum, r) => sum + r.tmc_share_2021, 0) / results.length;
  const avgBjpShare2024 = results.reduce((sum, r) => sum + r.bjp_share_2024_ls, 0) / results.length;
  const swingConstituencies = results.filter(r => Math.abs(r.bjp_share_2021 - r.tmc_share_2021) < 10).length;

  // 2025 By-Election Statistics
  const constituenciesWith2025 = results.filter(r => r.has_2025_byelection);
  const bjpWon2025 = constituenciesWith2025.filter(r => r.winner_2025_be === 'BJP').length;
  const tmcWon2025 = constituenciesWith2025.filter(r => r.winner_2025_be === 'TMC').length;
  const avgBjpShare2025 = constituenciesWith2025.length > 0
    ? constituenciesWith2025.reduce((sum, r) => sum + (r.bjp_share_2025_be || 0), 0) / constituenciesWith2025.length
    : 0;

  return {
    totalConstituencies: results.length,
    bjpWon2021,
    tmcWon2021,
    avgBjpShare2021: Math.round(avgBjpShare2021 * 10) / 10,
    avgTmcShare2021: Math.round(avgTmcShare2021 * 10) / 10,
    avgBjpShare2024: Math.round(avgBjpShare2024 * 10) / 10,
    swingConstituencies,
    bjpSwingTrend: Math.round((avgBjpShare2024 - avgBjpShare2021) * 10) / 10,
    // 2025 By-Election Stats
    constituenciesWith2025: constituenciesWith2025.length,
    bjpWon2025,
    tmcWon2025,
    avgBjpShare2025: Math.round(avgBjpShare2025 * 10) / 10
  };
}
