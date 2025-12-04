/**
 * Mapping between GeoJSON AC_NAME and wb_constituencies_50.json names
 * GeoJSON uses uppercase AC_NAME like "BHABANIPUR"
 * Our data uses mixed case like "Bhowanipore"
 */

// GeoJSON AC_NAME -> wb_constituencies_50 name
export const AC_NAME_TO_CONSTITUENCY: Record<string, string> = {
  // Kolkata
  'BHABANIPUR': 'Bhowanipore',
  'BELEGHATA': 'Beleghata',
  'ENTALLY': 'Entally',
  'BALLYGUNGE': 'Ballygunge',
  'CHOWRANGEE': 'Chowringhee',
  'RASHBEHARI': 'Rashbehari',
  'TOLLYGANJ': 'Tollygunge',
  'JADAVPUR': 'Jadavpur',
  'KASBA': 'Kasba',
  'BEHALA PASCHIM': 'Behala West',

  // Howrah
  'HOWRAH UTTAR': 'Howrah Uttar',
  'HOWRAH MADHYA': 'Howrah Madhya',
  'SHIBPUR': 'Shibpur',
  'BALLY': 'Bally',
  'UTTARPARA': 'Uttarpara',

  // North 24 Parganas
  'BARRACKPUR': 'Barrackpore',
  'DUM DUM': 'Dum Dum',
  'RAJARHAT NEW TOWN': 'Rajarhat New Town',
  'BIDHANNAGAR': 'Bidhannagar',
  'MADHYAMGRAM': 'Madhyamgram',
  'BARASAT': 'Barasat',

  // South 24 Parganas
  'SONARPUR UTTAR': 'Sonarpur Uttar',
  'BUDGE BUDGE': 'Budge Budge',
  'DIAMOND HARBOUR': 'Diamond Harbour',

  // Darjeeling
  'DARJEELING': 'Darjeeling',
  'SILIGURI': 'Siliguri',

  // Jalpaiguri
  'JALPAIGURI (SC)': 'Jalpaiguri',

  // Cooch Behar
  'COOCHBEHAR UTTAR (SC)': 'Cooch Behar Uttar',

  // Malda
  'ENGLISH BAZAR': 'English Bazar',

  // Murshidabad
  'BAHARAMPUR': 'Berhampore',

  // Nadia
  'KRISHNANAGAR UTTAR': 'Krishnanagar Uttar',
  'RANAGHAT UTTAR PASCHIM': 'Ranaghat Uttar Paschim',

  // Hooghly
  'SREERAMPUR': 'Serampore',
  'CHANDANNAGAR': 'Chandannagar',
  'CHUNCHURA': 'Chinsurah',
  'ARAMBAG (SC)': 'Arambag',

  // Purba Bardhaman
  'ASANSOL UTTAR': 'Asansol Uttar',
  'ASANSOL DAKSHIN': 'Asansol Dakshin',
  'DURGAPUR PURBA': 'Durgapur Purba',
  'DURGAPUR PASCHIM': 'Durgapur Paschim',
  'BARDHAMAN UTTAR': 'Bardhaman Uttar',

  // Paschim Bardhaman
  'PANDABESWAR': 'Pandaveswar',

  // Purba Medinipur
  'TAMLUK': 'Tamluk',
  'HALDIA (SC)': 'Haldia',

  // Paschim Medinipur
  'MEDINIPUR': 'Midnapore',

  // Bankura
  'BANKURA': 'Bankura',

  // Purulia
  'PURULIA': 'Purulia',

  // Birbhum
  'BOLPUR': 'Bolpur',
  'SURI': 'Suri',
};

// Reverse mapping: wb_constituencies_50 name -> GeoJSON AC_NAME
export const CONSTITUENCY_TO_AC_NAME: Record<string, string> = Object.entries(
  AC_NAME_TO_CONSTITUENCY
).reduce((acc, [acName, constName]) => {
  acc[constName] = acName;
  return acc;
}, {} as Record<string, string>);

// List of all 50 target constituency names for filtering GeoJSON
export const TARGET_CONSTITUENCY_NAMES = Object.keys(CONSTITUENCY_TO_AC_NAME);

// List of all 50 target AC_NAMEs for filtering GeoJSON
export const TARGET_AC_NAMES = Object.keys(AC_NAME_TO_CONSTITUENCY);

/**
 * Match a GeoJSON feature to our 50 constituencies
 * Returns the mapped constituency name or null if not in our list
 */
export function matchGeoJSONToConstituency(acName: string): string | null {
  // Direct match
  if (AC_NAME_TO_CONSTITUENCY[acName]) {
    return AC_NAME_TO_CONSTITUENCY[acName];
  }

  // Try without SC/ST suffix
  const cleanName = acName.replace(/\s*\(SC\)|\s*\(ST\)/gi, '').trim();
  if (AC_NAME_TO_CONSTITUENCY[cleanName]) {
    return AC_NAME_TO_CONSTITUENCY[cleanName];
  }

  return null;
}

/**
 * Check if a GeoJSON feature AC_NAME is in our 50 constituencies
 */
export function isTargetConstituency(acName: string): boolean {
  return matchGeoJSONToConstituency(acName) !== null;
}

/**
 * Get color based on prediction winner
 */
export function getPredictionColor(
  predictedWinner: 'BJP' | 'TMC' | 'Swing',
  confidence: number = 50
): string {
  if (predictedWinner === 'BJP') {
    // Orange gradient based on confidence
    if (confidence >= 70) return '#EA580C'; // orange-600 (Safe)
    if (confidence >= 50) return '#F97316'; // orange-500 (Likely)
    return '#FB923C'; // orange-400 (Leaning)
  }

  if (predictedWinner === 'TMC') {
    // Green gradient based on confidence
    if (confidence >= 70) return '#15803D'; // green-700 (Safe)
    if (confidence >= 50) return '#22C55E'; // green-500 (Likely)
    return '#4ADE80'; // green-400 (Leaning)
  }

  // Swing - Yellow
  return '#EAB308'; // yellow-500
}
