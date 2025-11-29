/**
 * Extended Constituency Data
 * Contains demographic sentiment, issue priorities, and map coordinates
 * for all 50 constituencies in the dashboard
 */

// Demographic Sentiment Data per constituency
export interface DemographicSentiment {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface ConstituencyDemographics {
  constituency_id: string;
  demographics: DemographicSentiment[];
}

// Issue Data per constituency
export interface IssueData {
  issue: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface ConstituencyIssues {
  constituency_id: string;
  issues: IssueData[];
}

// Map Data per constituency
export interface ConstituencyMapData {
  constituency_id: string;
  constituency_name: string;
  map_x: number;
  map_y: number;
  sentiment: 'strong' | 'moderate' | 'weak';
  party: string;
  is_swing: boolean;
}

// Helper function to generate demographic data based on constituency type
function generateDemographics(
  isUrban: boolean,
  party: string,
  isSwing: boolean,
  margin: number
): DemographicSentiment[] {
  // Base values adjusted by constituency characteristics
  const isBJP = party === 'BJP';
  const isLowMargin = margin < 20000;

  if (isUrban) {
    return [
      {
        category: 'Youth (18-30)',
        positive: isBJP ? 45 : 25,
        neutral: 25,
        negative: isBJP ? 30 : 50
      },
      {
        category: 'Women (30+)',
        positive: isBJP ? 40 : 60,
        neutral: 25,
        negative: isBJP ? 35 : 15
      },
      {
        category: 'Urban Middle Class',
        positive: isBJP ? 55 : 40,
        neutral: 25,
        negative: isBJP ? 20 : 35
      },
      {
        category: 'Rural Voters',
        positive: 35,
        neutral: 30,
        negative: 35
      },
      {
        category: 'Small Traders',
        positive: isBJP ? 50 : 35,
        neutral: 30,
        negative: isBJP ? 20 : 35
      },
    ];
  } else {
    // Rural constituencies
    return [
      {
        category: 'Youth (18-30)',
        positive: isBJP ? 40 : 30,
        neutral: 30,
        negative: isBJP ? 30 : 40
      },
      {
        category: 'Women (30+)',
        positive: isBJP ? 35 : 65,
        neutral: 20,
        negative: isBJP ? 45 : 15
      },
      {
        category: 'Urban Middle Class',
        positive: 30,
        neutral: 35,
        negative: 35
      },
      {
        category: 'Rural Voters',
        positive: isBJP ? 45 : 55,
        neutral: 25,
        negative: isBJP ? 30 : 20
      },
      {
        category: 'Small Traders',
        positive: isBJP ? 45 : 40,
        neutral: 30,
        negative: isBJP ? 25 : 30
      },
    ];
  }
}

// Helper function to generate issue data based on constituency type
function generateIssues(
  isUrban: boolean,
  party: string,
  isSwing: boolean
): IssueData[] {
  const isBJP = party === 'BJP';

  if (isUrban) {
    return [
      {
        issue: 'Unemployment',
        sentiment: 'negative',
        score: isSwing ? 82 : 75,
        trend: 'up',
        change: isSwing ? 6 : 3
      },
      {
        issue: 'Price Rise / Inflation',
        sentiment: 'negative',
        score: 78,
        trend: 'up',
        change: 4
      },
      {
        issue: 'Civic Infrastructure',
        sentiment: isBJP ? 'negative' : 'neutral',
        score: isBJP ? 72 : 62,
        trend: 'stable',
        change: 0
      },
      {
        issue: 'Law & Order',
        sentiment: isBJP ? 'negative' : 'neutral',
        score: isBJP ? 68 : 55,
        trend: isBJP ? 'up' : 'down',
        change: isBJP ? 5 : -2
      },
      {
        issue: 'Education / Exams',
        sentiment: 'neutral',
        score: 58,
        trend: 'up',
        change: 3
      },
    ];
  } else {
    // Rural constituencies - different priorities
    return [
      {
        issue: 'Price Rise / Inflation',
        sentiment: 'negative',
        score: 85,
        trend: 'up',
        change: 5
      },
      {
        issue: 'Unemployment',
        sentiment: 'negative',
        score: 80,
        trend: 'up',
        change: 4
      },
      {
        issue: 'Healthcare Access',
        sentiment: 'neutral',
        score: 68,
        trend: 'stable',
        change: 0
      },
      {
        issue: 'Agricultural Support',
        sentiment: isBJP ? 'negative' : 'neutral',
        score: isBJP ? 70 : 55,
        trend: 'down',
        change: -3
      },
      {
        issue: 'Road / Infrastructure',
        sentiment: 'neutral',
        score: 60,
        trend: 'up',
        change: 2
      },
    ];
  }
}

// Extended data for all 50 constituencies
export const CONSTITUENCY_EXTENDED_DATA: {
  constituency_id: string;
  is_urban: boolean;
  map_x: number;
  map_y: number;
}[] = [
  // KOLKATA METRO (x: 140-160, y: 280-320)
  { constituency_id: 'wb_kolkata_bhowanipore', is_urban: true, map_x: 145, map_y: 295 },
  { constituency_id: 'wb_kolkata_beleghata', is_urban: true, map_x: 155, map_y: 280 },
  { constituency_id: 'wb_kolkata_entally', is_urban: true, map_x: 150, map_y: 285 },
  { constituency_id: 'wb_kolkata_ballygunge', is_urban: true, map_x: 148, map_y: 290 },
  { constituency_id: 'wb_kolkata_chowringhee', is_urban: true, map_x: 147, map_y: 288 },
  { constituency_id: 'wb_kolkata_rashbehari', is_urban: true, map_x: 143, map_y: 298 },
  { constituency_id: 'wb_kolkata_tollygunge', is_urban: true, map_x: 142, map_y: 305 },
  { constituency_id: 'wb_kolkata_jadavpur', is_urban: true, map_x: 150, map_y: 310 },
  { constituency_id: 'wb_kolkata_kasba', is_urban: true, map_x: 155, map_y: 305 },
  { constituency_id: 'wb_kolkata_behala_west', is_urban: true, map_x: 138, map_y: 310 },

  // HOWRAH METRO (x: 125-140, y: 280-310)
  { constituency_id: 'wb_howrah_howrah_uttar', is_urban: true, map_x: 132, map_y: 285 },
  { constituency_id: 'wb_howrah_howrah_madhya', is_urban: true, map_x: 130, map_y: 290 },
  { constituency_id: 'wb_howrah_shibpur', is_urban: true, map_x: 128, map_y: 295 },
  { constituency_id: 'wb_howrah_bally', is_urban: true, map_x: 135, map_y: 278 },
  { constituency_id: 'wb_howrah_uttarpara', is_urban: true, map_x: 138, map_y: 270 },

  // NORTH 24 PARGANAS (x: 150-185, y: 240-280)
  { constituency_id: 'wb_north_24_parganas_barrackpore', is_urban: true, map_x: 155, map_y: 265 },
  { constituency_id: 'wb_north_24_parganas_dum_dum', is_urban: true, map_x: 152, map_y: 270 },
  { constituency_id: 'wb_north_24_parganas_rajarhat_new_town', is_urban: true, map_x: 165, map_y: 275 },
  { constituency_id: 'wb_north_24_parganas_bidhannagar', is_urban: true, map_x: 160, map_y: 278 },
  { constituency_id: 'wb_north_24_parganas_madhyamgram', is_urban: true, map_x: 158, map_y: 260 },
  { constituency_id: 'wb_north_24_parganas_barasat', is_urban: true, map_x: 170, map_y: 255 },

  // SOUTH 24 PARGANAS (x: 140-200, y: 320-400)
  { constituency_id: 'wb_south_24_parganas_jadavpur', is_urban: true, map_x: 152, map_y: 315 },
  { constituency_id: 'wb_south_24_parganas_sonarpur_uttar', is_urban: true, map_x: 158, map_y: 325 },
  { constituency_id: 'wb_south_24_parganas_budge_budge', is_urban: true, map_x: 145, map_y: 330 },
  { constituency_id: 'wb_south_24_parganas_diamond_harbour', is_urban: true, map_x: 155, map_y: 360 },

  // DARJEELING / SILIGURI (x: 115-155, y: 40-100)
  { constituency_id: 'wb_darjeeling_darjeeling', is_urban: true, map_x: 125, map_y: 55 },
  { constituency_id: 'wb_darjeeling_siliguri', is_urban: true, map_x: 140, map_y: 75 },

  // JALPAIGURI / COOCH BEHAR (x: 145-180, y: 60-120)
  { constituency_id: 'wb_jalpaiguri_jalpaiguri', is_urban: true, map_x: 155, map_y: 85 },
  { constituency_id: 'wb_cooch_behar_cooch_behar_uttar', is_urban: true, map_x: 175, map_y: 70 },

  // MALDA / MURSHIDABAD (x: 95-145, y: 140-200)
  { constituency_id: 'wb_malda_english_bazar', is_urban: true, map_x: 115, map_y: 155 },
  { constituency_id: 'wb_murshidabad_berhampore', is_urban: true, map_x: 125, map_y: 185 },

  // NADIA (x: 130-165, y: 200-240)
  { constituency_id: 'wb_nadia_krishnanagar_uttar', is_urban: true, map_x: 145, map_y: 220 },
  { constituency_id: 'wb_nadia_ranaghat_uttar_paschim', is_urban: false, map_x: 155, map_y: 235 },

  // HOOGHLY (x: 110-140, y: 240-280)
  { constituency_id: 'wb_hooghly_serampore', is_urban: true, map_x: 135, map_y: 265 },
  { constituency_id: 'wb_hooghly_chandannagar', is_urban: true, map_x: 132, map_y: 260 },
  { constituency_id: 'wb_hooghly_chinsurah', is_urban: true, map_x: 130, map_y: 255 },
  { constituency_id: 'wb_hooghly_arambag', is_urban: false, map_x: 115, map_y: 270 },

  // PURBA BARDHAMAN (x: 80-120, y: 200-260)
  { constituency_id: 'wb_purba_bardhaman_asansol_uttar', is_urban: true, map_x: 85, map_y: 215 },
  { constituency_id: 'wb_purba_bardhaman_asansol_dakshin', is_urban: true, map_x: 88, map_y: 225 },
  { constituency_id: 'wb_purba_bardhaman_durgapur_purba', is_urban: true, map_x: 95, map_y: 220 },
  { constituency_id: 'wb_purba_bardhaman_durgapur_paschim', is_urban: true, map_x: 92, map_y: 218 },
  { constituency_id: 'wb_purba_bardhaman_bardhaman_uttar', is_urban: true, map_x: 110, map_y: 240 },

  // PASCHIM BARDHAMAN (x: 70-95, y: 200-240)
  { constituency_id: 'wb_paschim_bardhaman_pandaveswar', is_urban: false, map_x: 80, map_y: 210 },

  // PURBA MEDINIPUR (x: 130-165, y: 330-380)
  { constituency_id: 'wb_purba_medinipur_tamluk', is_urban: true, map_x: 140, map_y: 350 },
  { constituency_id: 'wb_purba_medinipur_haldia', is_urban: true, map_x: 148, map_y: 365 },

  // PASCHIM MEDINIPUR (x: 95-130, y: 310-360)
  { constituency_id: 'wb_paschim_medinipur_midnapore', is_urban: true, map_x: 110, map_y: 335 },

  // BANKURA (x: 80-110, y: 280-320)
  { constituency_id: 'wb_bankura_bankura', is_urban: true, map_x: 95, map_y: 295 },

  // PURULIA (x: 60-90, y: 270-310)
  { constituency_id: 'wb_purulia_purulia', is_urban: true, map_x: 75, map_y: 285 },

  // BIRBHUM (x: 90-120, y: 180-220)
  { constituency_id: 'wb_birbhum_bolpur', is_urban: false, map_x: 105, map_y: 200 },
  { constituency_id: 'wb_birbhum_suri', is_urban: true, map_x: 100, map_y: 190 },
];

// Get constituency extended data by ID
export function getConstituencyExtendedData(constituencyId: string) {
  return CONSTITUENCY_EXTENDED_DATA.find(c => c.constituency_id === constituencyId);
}

// Get demographic sentiment for a constituency
export function getDemographicSentiment(
  constituencyId: string,
  party: string,
  isSwing: boolean,
  margin: number
): DemographicSentiment[] {
  const extData = getConstituencyExtendedData(constituencyId);
  const isUrban = extData?.is_urban ?? true;
  return generateDemographics(isUrban, party, isSwing, margin);
}

// Get issue data for a constituency
export function getIssueSentiment(
  constituencyId: string,
  party: string,
  isSwing: boolean
): IssueData[] {
  const extData = getConstituencyExtendedData(constituencyId);
  const isUrban = extData?.is_urban ?? true;
  return generateIssues(isUrban, party, isSwing);
}

// Get map data for all constituencies
export function getMapData(
  constituencyLeaders: Array<{
    constituency_id: string;
    constituency_name: string;
    current_mla_party: string;
    current_mla_margin?: number;
    is_swing_constituency: boolean;
  }>,
  selectedConstituencyId?: string
): ConstituencyMapData[] {
  return constituencyLeaders.map(leader => {
    const extData = getConstituencyExtendedData(leader.constituency_id);

    // Calculate sentiment based on party and margin
    let sentiment: 'strong' | 'moderate' | 'weak' = 'moderate';
    if (leader.current_mla_party === 'BJP') {
      sentiment = 'strong';
    } else if (leader.is_swing_constituency) {
      sentiment = 'weak';
    } else if ((leader.current_mla_margin || 0) > 30000) {
      sentiment = 'moderate';
    } else if ((leader.current_mla_margin || 0) < 15000) {
      sentiment = 'weak';
    }

    return {
      constituency_id: leader.constituency_id,
      constituency_name: leader.constituency_name,
      map_x: extData?.map_x || 150,
      map_y: extData?.map_y || 300,
      sentiment,
      party: leader.current_mla_party,
      is_swing: leader.is_swing_constituency,
    };
  });
}

// Export constituency IDs for reference
export const CONSTITUENCY_IDS = CONSTITUENCY_EXTENDED_DATA.map(c => c.constituency_id);
