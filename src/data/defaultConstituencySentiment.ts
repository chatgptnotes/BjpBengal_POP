/**
 * Default Constituency-Level Sentiment Data for West Bengal
 * 294 Assembly Constituencies
 */

import { SentimentScore } from '../types/geography';

const generateSentiment = (acNo) => {
  if (acNo <= 213) {
    return {
      positive: 52 + Math.floor(Math.random() * 15),
      neutral: 20 + Math.floor(Math.random() * 15),
      negative: 8 + Math.floor(Math.random() * 8),
      overall: 'positive',
      confidence: 0.72 + Math.random() * 0.15,
      lastUpdated: new Date().toISOString()
    };
  } else if (acNo <= 290) {
    return {
      positive: 45 + Math.floor(Math.random() * 12),
      neutral: 25 + Math.floor(Math.random() * 12),
      negative: 10 + Math.floor(Math.random() * 10),
      overall: 'neutral',
      confidence: 0.68 + Math.random() * 0.12,
      lastUpdated: new Date().toISOString()
    };
  } else {
    return {
      positive: 48 + Math.floor(Math.random() * 10),
      neutral: 25 + Math.floor(Math.random() * 10),
      negative: 12 + Math.floor(Math.random() * 8),
      overall: 'neutral',
      confidence: 0.65 + Math.random() * 0.15,
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

export default defaultConstituencySentiment;
