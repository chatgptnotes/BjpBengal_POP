/**
 * Default Constituency-Level Sentiment Data for West Bengal
 * 294 Assembly Constituencies
 */

import { SentimentScore } from '../types/geography';

// Generate more varied sentiment data based on constituency patterns
// Urban areas (Kolkata region): Higher sentiment
// Industrial areas: Mixed sentiment
// Rural areas: More varied sentiment
// IMPORTANT: All values are deterministic (no Math.random()) to ensure consistency
const generateSentiment = (acNo) => {
  // Create deterministic pseudo-random values using acNo as seed
  const seed1 = (acNo * 7 + 13) % 50; // 0-49 for positive variation
  const seed2 = (acNo * 11 + 17) % 15; // 0-14 for neutral
  const seed3 = (acNo * 13 + 19) % 10; // 0-9 for negative (smaller range)
  const seed4 = (acNo * 17 + 23) % 15; // 0-14 alternate neutral
  const seed5 = (acNo * 19 + 29) % 20; // 0-19 for wider neutral range
  const seed6 = (acNo * 23 + 31) % 15; // 0-14 alternate negative
  const seed7 = (acNo * 29 + 37) % 20; // 0-19 for wider negative range
  const seed8 = (acNo * 31 + 41) % 15; // 0-14 for confidence

  // Different patterns for different regions
  if (acNo <= 50) {
    // Urban constituencies (Kolkata, Howrah) - Generally positive
    return {
      positive: 55 + seed1,
      neutral: 20 + seed2,
      negative: 10 + seed3,
      overall: 'positive',
      confidence: 0.75 + (seed8 / 100), // 0.75-0.90
      lastUpdated: new Date().toISOString()
    };
  } else if (acNo <= 150) {
    // Semi-urban and industrial areas - Mixed
    return {
      positive: 40 + seed1,
      neutral: 25 + seed2,
      negative: 15 + seed4,
      overall: seed1 > 25 ? 'positive' : 'neutral',
      confidence: 0.68 + (seed8 / 100), // 0.68-0.83
      lastUpdated: new Date().toISOString()
    };
  } else if (acNo <= 250) {
    // Rural constituencies - More varied
    return {
      positive: 35 + seed1,
      neutral: 20 + seed5,
      negative: 10 + seed6,
      overall: seed1 > 30 ? 'positive' : 'neutral',
      confidence: 0.65 + (seed8 / 100), // 0.65-0.80
      lastUpdated: new Date().toISOString()
    };
  } else {
    // Border constituencies - Variable sentiment
    return {
      positive: 30 + seed1,
      neutral: 25 + seed5,
      negative: 15 + seed7,
      overall: seed1 > 35 ? 'positive' : 'neutral',
      confidence: 0.60 + (seed8 * 0.015), // 0.60-0.825
      lastUpdated: new Date().toISOString()
    };
  }
};

export const defaultConstituencySentiment = {};

for (let i = 1; i <= 294; i++) {
  const code = 'WB' + String(i).padStart(3, '0');
  defaultConstituencySentiment[code] = generateSentiment(i);
}

/**
 * Get sentiment score for a constituency by name or code
 */
export function getConstituencySentiment(constituencyName: string): SentimentScore | undefined {
  // Try direct lookup by code (e.g., 'WB001')
  if (defaultConstituencySentiment[constituencyName]) {
    return defaultConstituencySentiment[constituencyName];
  }

  // Try to find by name (case-insensitive search)
  const normalized = constituencyName.toLowerCase();
  for (const [code, sentiment] of Object.entries(defaultConstituencySentiment)) {
    if (code.toLowerCase().includes(normalized)) {
      return sentiment;
    }
  }

  // Return a default sentiment if not found
  return {
    positive: 55,
    neutral: 30,
    negative: 15,
    overall: 'neutral',
    confidence: 0.70,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calculate aggregated sentiment for a list of constituencies
 */
export function aggregateSentiment(constituencyCodes: string[]): SentimentScore {
  if (constituencyCodes.length === 0) {
    return {
      positive: 50,
      neutral: 30,
      negative: 20,
      overall: 'neutral',
      confidence: 0.70,
      lastUpdated: new Date().toISOString()
    };
  }

  let totalPositive = 0;
  let totalNeutral = 0;
  let totalNegative = 0;
  let count = 0;

  constituencyCodes.forEach(code => {
    const sentiment = defaultConstituencySentiment[code];
    if (sentiment) {
      totalPositive += sentiment.positive;
      totalNeutral += sentiment.neutral;
      totalNegative += sentiment.negative;
      count++;
    }
  });

  if (count === 0) {
    return {
      positive: 50,
      neutral: 30,
      negative: 20,
      overall: 'neutral',
      confidence: 0.70,
      lastUpdated: new Date().toISOString()
    };
  }

  const avgPositive = Math.round(totalPositive / count);
  const avgNeutral = Math.round(totalNeutral / count);
  const avgNegative = Math.round(totalNegative / count);

  return {
    positive: avgPositive,
    neutral: avgNeutral,
    negative: avgNegative,
    overall: avgPositive >= 60 ? 'positive' : avgPositive >= 40 ? 'neutral' : 'negative',
    confidence: 0.70,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get state-wide aggregated sentiment (all 294 constituencies)
 */
export function getStateSentiment(): SentimentScore {
  const allCodes = Object.keys(defaultConstituencySentiment);
  return aggregateSentiment(allCodes);
}

/**
 * Get district-level sentiment by aggregating constituencies in that district
 * This function will be called with the GeoJSON features to build district sentiment map
 */
export function getDistrictSentiment(districtName: string, constituenciesInDistrict: string[]): SentimentScore {
  return aggregateSentiment(constituenciesInDistrict);
}

/**
 * Build district sentiment map from GeoJSON features
 * Returns { districtName: sentimentScore } mapping
 */
export function buildDistrictSentimentMap(geoJSONFeatures: any[]): Record<string, SentimentScore> {
  const districtMap: Record<string, string[]> = {};

  // Group constituencies by district
  geoJSONFeatures.forEach((feature: any) => {
    const districtName = feature.properties?.DIST_NAME;
    const acNo = feature.properties?.AC_NO;

    if (districtName && acNo) {
      const constituencyCode = `WB${String(acNo).padStart(3, '0')}`;

      if (!districtMap[districtName]) {
        districtMap[districtName] = [];
      }

      if (!districtMap[districtName].includes(constituencyCode)) {
        districtMap[districtName].push(constituencyCode);
      }
    }
  });

  // Calculate aggregated sentiment for each district
  const districtSentiment: Record<string, SentimentScore> = {};

  Object.entries(districtMap).forEach(([districtName, constituencyCodes]) => {
    districtSentiment[districtName] = aggregateSentiment(constituencyCodes);
  });

  return districtSentiment;
}

export default defaultConstituencySentiment;
