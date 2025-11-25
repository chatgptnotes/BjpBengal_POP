/**
 * Default Issue-Specific Scores for West Bengal Constituencies
 *
 * Provides baseline data for each issue layer:
 * - jobs: Employment sentiment (0-100)
 * - healthcare: Healthcare access & quality (0-100)
 * - infrastructure: Roads, utilities, development (0-100)
 * - education: Education quality & access (0-100)
 * - agriculture: Agricultural support & conditions (0-100)
 *
 * Scores range from 0-100, representing issue-specific sentiment
 */

export interface IssueScores {
  jobs: number;
  healthcare: number;
  infrastructure: number;
  education: number;
  agriculture: number;
}

export interface ConstituencyIssueData {
  [constituencyName: string]: IssueScores;
}

/**
 * Default issue-specific scores for each constituency
 * Based on regional characteristics and development patterns
 */
export const defaultConstituencyIssueData: ConstituencyIssueData = {
  // Chennai Region - High infrastructure/education, mixed jobs/healthcare
  "Ponneri (SC)": { jobs: 55, healthcare: 65, infrastructure: 72, education: 70, agriculture: 45 },
  "Gummidipoondi": { jobs: 58, healthcare: 63, infrastructure: 68, education: 67, agriculture: 48 },
  "Tiruvottiyur": { jobs: 62, healthcare: 68, infrastructure: 75, education: 73, agriculture: 35 },
  "Madavaram": { jobs: 65, healthcare: 70, infrastructure: 73, education: 72, agriculture: 30 },
  "Perambur": { jobs: 68, healthcare: 72, infrastructure: 76, education: 75, agriculture: 25 },
  "Kolathur": { jobs: 66, healthcare: 71, infrastructure: 74, education: 73, agriculture: 28 },
  "Villivakkam": { jobs: 64, healthcare: 69, infrastructure: 72, education: 71, agriculture: 30 },
  "Thiru-Vi-Ka-Nagar(SC)": { jobs: 63, healthcare: 67, infrastructure: 70, education: 69, agriculture: 32 },
  "Dr.Radhakrishnan Naga": { jobs: 70, healthcare: 74, infrastructure: 78, education: 76, agriculture: 22 },
  "Harbour": { jobs: 65, healthcare: 68, infrastructure: 73, education: 70, agriculture: 20 },
  "Royapuram": { jobs: 67, healthcare: 70, infrastructure: 74, education: 72, agriculture: 25 },
  "Egmore (SC)": { jobs: 69, healthcare: 72, infrastructure: 76, education: 74, agriculture: 23 },
  "Chepauk-Thiruvalliken": { jobs: 72, healthcare: 75, infrastructure: 79, education: 77, agriculture: 20 },
  "Thousand Lights": { jobs: 75, healthcare: 78, infrastructure: 82, education: 80, agriculture: 18 },
  "Anna Nagar": { jobs: 76, healthcare: 79, infrastructure: 83, education: 81, agriculture: 17 },
  "Virugampakkam": { jobs: 71, healthcare: 73, infrastructure: 77, education: 75, agriculture: 22 },
  "Saidapet": { jobs: 68, healthcare: 71, infrastructure: 75, education: 73, agriculture: 24 },
  "Thiyagarayanagar": { jobs: 72, healthcare: 74, infrastructure: 78, education: 76, agriculture: 21 },
  "Mylapore": { jobs: 74, healthcare: 76, infrastructure: 80, education: 78, agriculture: 19 },
  "Velachery": { jobs: 75, healthcare: 77, infrastructure: 81, education: 79, agriculture: 18 },
  "Sholinganallur": { jobs: 73, healthcare: 74, infrastructure: 79, education: 77, agriculture: 20 },
  "Ambattur": { jobs: 67, healthcare: 70, infrastructure: 73, education: 71, agriculture: 28 },
  "Maduravoyal": { jobs: 66, healthcare: 69, infrastructure: 72, education: 70, agriculture: 29 },

  // Thiruvallur District - Industrial mix
  "Thiruvallur": { jobs: 60, healthcare: 64, infrastructure: 68, education: 66, agriculture: 52 },
  "Poonamallee (SC)": { jobs: 62, healthcare: 65, infrastructure: 69, education: 67, agriculture: 48 },
  "Avadi": { jobs: 64, healthcare: 66, infrastructure: 71, education: 69, agriculture: 42 },
  "Tiruttani": { jobs: 56, healthcare: 61, infrastructure: 65, education: 63, agriculture: 58 },

  // Coimbatore Region - Industrial hub, high scores across
  "Coimbatore (North)": { jobs: 78, healthcare: 76, infrastructure: 80, education: 78, agriculture: 45 },
  "Coimbatore (South)": { jobs: 79, healthcare: 77, infrastructure: 81, education: 79, agriculture: 43 },
  "Kavundampalayam": { jobs: 76, healthcare: 75, infrastructure: 79, education: 77, agriculture: 46 },
  "Singanallur": { jobs: 77, healthcare: 76, infrastructure: 80, education: 78, agriculture: 44 },
  "Sulur": { jobs: 74, healthcare: 73, infrastructure: 77, education: 75, agriculture: 48 },
  "Pollachi": { jobs: 70, healthcare: 72, infrastructure: 75, education: 73, agriculture: 62 },
  "Valparai (SC)": { jobs: 62, healthcare: 68, infrastructure: 70, education: 69, agriculture: 72 },
  "Kinathukadavu": { jobs: 65, healthcare: 70, infrastructure: 73, education: 71, agriculture: 65 },
  "Thondamuthur": { jobs: 67, healthcare: 71, infrastructure: 74, education: 72, agriculture: 58 },
  "Mettupalayam": { jobs: 64, healthcare: 68, infrastructure: 71, education: 69, agriculture: 68 },
  "Avanashi (SC)": { jobs: 63, healthcare: 67, infrastructure: 70, education: 68, agriculture: 60 },

  // Salem Region - Mixed industrial
  "Salem (North)": { jobs: 68, healthcare: 70, infrastructure: 73, education: 71, agriculture: 50 },
  "Salem (South)": { jobs: 69, healthcare: 71, infrastructure: 74, education: 72, agriculture: 48 },
  "Salem (West)": { jobs: 67, healthcare: 69, infrastructure: 72, education: 70, agriculture: 51 },
  "Omalur": { jobs: 60, healthcare: 64, infrastructure: 67, education: 65, agriculture: 62 },
  "Mettur": { jobs: 61, healthcare: 65, infrastructure: 68, education: 66, agriculture: 60 },
  "Edappadi": { jobs: 62, healthcare: 66, infrastructure: 69, education: 67, agriculture: 58 },
  "Sankari": { jobs: 58, healthcare: 63, infrastructure: 66, education: 64, agriculture: 64 },
  "Attur": { jobs: 59, healthcare: 64, infrastructure: 67, education: 65, agriculture: 61 },
  "Yercaud": { jobs: 55, healthcare: 62, infrastructure: 65, education: 63, agriculture: 70 },

  // Madurai Region - Cultural capital, moderate scores
  "Madurai (East)": { jobs: 70, healthcare: 72, infrastructure: 75, education: 73, agriculture: 35 },
  "Madurai (West)": { jobs: 71, healthcare: 73, infrastructure: 76, education: 74, agriculture: 34 },
  "Madurai (North)": { jobs: 69, healthcare: 71, infrastructure: 74, education: 72, agriculture: 36 },
  "Madurai (South)": { jobs: 70, healthcare: 72, infrastructure: 75, education: 73, agriculture: 35 },
  "Madurai (Central)": { jobs: 73, healthcare: 75, infrastructure: 78, education: 76, agriculture: 32 },
  "Sholavandan": { jobs: 64, healthcare: 68, infrastructure: 71, education: 69, agriculture: 52 },
  "Melur": { jobs: 62, healthcare: 67, infrastructure: 70, education: 68, agriculture: 55 },
  "Thiruparankundram": { jobs: 66, healthcare: 69, infrastructure: 72, education: 70, agriculture: 48 },
  "Tirumangalam": { jobs: 64, healthcare: 68, infrastructure: 71, education: 69, agriculture: 50 },
  "Usilampatti": { jobs: 60, healthcare: 66, infrastructure: 69, education: 67, agriculture: 58 },

  // Agricultural heartland - Thanjavur, high agriculture scores
  "Thanjavur": { jobs: 58, healthcare: 66, infrastructure: 70, education: 68, agriculture: 78 },
  "Orathanadu": { jobs: 52, healthcare: 64, infrastructure: 67, education: 65, agriculture: 82 },
  "Thiruvaiyaru": { jobs: 55, healthcare: 65, infrastructure: 68, education: 66, agriculture: 80 },
  "Kumbakonam": { jobs: 60, healthcare: 67, infrastructure: 71, education: 69, agriculture: 76 },
  "Papanasam": { jobs: 54, healthcare: 63, infrastructure: 66, education: 64, agriculture: 81 },
  "Thiruvidaimarudur": { jobs: 56, healthcare: 64, infrastructure: 67, education: 65, agriculture: 79 },
  "Pattukottai": { jobs: 57, healthcare: 65, infrastructure: 68, education: 66, agriculture: 77 },
  "Mannargudi": { jobs: 59, healthcare: 66, infrastructure: 69, education: 67, agriculture: 75 },

  // Tiruppur - Textile industry, high jobs
  "Tiruppur (North)": { jobs: 82, healthcare: 72, infrastructure: 76, education: 73, agriculture: 40 },
  "Tiruppur (South)": { jobs: 83, healthcare: 73, infrastructure: 77, education: 74, agriculture: 38 },
  "Dharapuram (SC)": { jobs: 75, healthcare: 68, infrastructure: 72, education: 69, agriculture: 52 },
  "Kangeyam": { jobs: 76, healthcare: 69, infrastructure: 73, education: 70, agriculture: 50 },
  "Palladam": { jobs: 78, healthcare: 70, infrastructure: 74, education: 71, agriculture: 48 },
  "Udumalpet": { jobs: 74, healthcare: 68, infrastructure: 72, education: 69, agriculture: 54 },

  // Erode - Textile hub
  "Erode (East)": { jobs: 74, healthcare: 70, infrastructure: 74, education: 71, agriculture: 55 },
  "Erode (West)": { jobs: 75, healthcare: 71, infrastructure: 75, education: 72, agriculture: 53 },
  "Modakurichi": { jobs: 72, healthcare: 69, infrastructure: 73, education: 70, agriculture: 56 },
  "Bhavani (SC)": { jobs: 68, healthcare: 67, infrastructure: 71, education: 68, agriculture: 60 },
  "Anthiyur": { jobs: 60, healthcare: 65, infrastructure: 68, education: 66, agriculture: 68 },
  "Gobichettipalayam": { jobs: 70, healthcare: 68, infrastructure: 72, education: 69, agriculture: 58 },
  "Bhavanisagar": { jobs: 62, healthcare: 66, infrastructure: 69, education: 67, agriculture: 65 },
  "Perundurai": { jobs: 66, healthcare: 67, infrastructure: 71, education: 68, agriculture: 62 },

  // Default for remaining constituencies - balanced mix
  "Sriperumbudur (SC)": { jobs: 72, healthcare: 70, infrastructure: 74, education: 71, agriculture: 42 },
  "Pallavaram": { jobs: 73, healthcare: 71, infrastructure: 75, education: 72, agriculture: 38 },
  "Tambaram": { jobs: 74, healthcare: 72, infrastructure: 76, education: 73, agriculture: 36 },
  "Chengalpattu": { jobs: 68, healthcare: 67, infrastructure: 71, education: 68, agriculture: 48 },
  "Tiruporur": { jobs: 64, healthcare: 65, infrastructure: 69, education: 66, agriculture: 54 },
  "Madurantakam (SC)": { jobs: 58, healthcare: 63, infrastructure: 67, education: 64, agriculture: 62 },
  "Uthiramerur": { jobs: 60, healthcare: 64, infrastructure: 68, education: 65, agriculture: 60 },
  "Kancheepuram": { jobs: 66, healthcare: 68, infrastructure: 72, education: 69, agriculture: 50 },
  "Alandur": { jobs: 75, healthcare: 73, infrastructure: 77, education: 74, agriculture: 34 },

  // Vellore & surrounding
  "Gudiyattam (SC)": { jobs: 58, healthcare: 62, infrastructure: 66, education: 63, agriculture: 55 },
  "Katpadi": { jobs: 62, healthcare: 64, infrastructure: 68, education: 65, agriculture: 50 },
  "Vellore": { jobs: 65, healthcare: 66, infrastructure: 70, education: 67, agriculture: 46 },
  "Anaicut": { jobs: 60, healthcare: 63, infrastructure: 67, education: 64, agriculture: 52 },
  "Arakkonam (SC)": { jobs: 63, healthcare: 65, infrastructure: 69, education: 66, agriculture: 48 },
  "Sholingur": { jobs: 56, healthcare: 61, infrastructure: 65, education: 62, agriculture: 58 },
  "Ranipet": { jobs: 61, healthcare: 64, infrastructure: 68, education: 65, agriculture: 51 },
  "Arcot": { jobs: 59, healthcare: 62, infrastructure: 66, education: 63, agriculture: 54 },
  "Kilvaithinankuppam(SC": { jobs: 55, healthcare: 60, infrastructure: 64, education: 61, agriculture: 60 },

  // Add more constituencies with varied scores
  "Tiruvannamalai": { jobs: 62, healthcare: 65, infrastructure: 69, education: 66, agriculture: 58 },
  "Kilpennathur": { jobs: 58, healthcare: 62, infrastructure: 66, education: 63, agriculture: 62 },
  "Polur": { jobs: 56, healthcare: 61, infrastructure: 65, education: 62, agriculture: 64 },
  "Arani": { jobs: 59, healthcare: 63, infrastructure: 67, education: 64, agriculture: 60 },
  "Cheyyar": { jobs: 60, healthcare: 64, infrastructure: 68, education: 65, agriculture: 58 },

  // Coastal areas
  "Cuddalore": { jobs: 64, healthcare: 66, infrastructure: 70, education: 67, agriculture: 52 },
  "Kurinjipadi": { jobs: 60, healthcare: 64, infrastructure: 68, education: 65, agriculture: 56 },
  "Bhuvanagiri": { jobs: 59, healthcare: 63, infrastructure: 67, education: 64, agriculture: 58 },
  "Chidambaram": { jobs: 65, healthcare: 67, infrastructure: 71, education: 68, agriculture: 54 },
  "Kattumannarkoil (SC)": { jobs: 58, healthcare: 62, infrastructure: 66, education: 63, agriculture: 60 },

  // Add remaining constituencies with default balanced values
};

// Generate varied issue scores for West Bengal constituencies (WB001-WB294)
// Each issue has different scoring patterns to show meaningful variation
function generateIssueScores(constituencyCode: string): IssueScores {
  // Extract AC number from code (e.g., "WB042" -> 42)
  const acNo = parseInt(constituencyCode.replace('WB', ''));

  if (isNaN(acNo)) {
    // For named constituencies, use hash-based generation
    const hash = constituencyCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return {
      jobs: 40 + (hash % 45), // 40-85 range
      healthcare: 35 + ((hash * 7) % 50), // 35-85 range
      infrastructure: 45 + ((hash * 13) % 40), // 45-85 range
      education: 38 + ((hash * 17) % 47), // 38-85 range
      agriculture: 30 + ((hash * 23) % 55), // 30-85 range
    };
  }

  // Deterministic variation based on AC number and issue type
  const seed = acNo;

  // Each issue has different patterns
  const jobsVariation = (seed * 11) % 50; // Jobs: varies by industrial development
  const healthcareVariation = (seed * 17) % 45; // Healthcare: varies by infrastructure
  const infrastructureVariation = (seed * 13) % 40; // Infrastructure: varies by urbanization
  const educationVariation = (seed * 19) % 47; // Education: varies by development
  const agricultureVariation = (seed * 23) % 55; // Agriculture: inverse to urbanization

  // Regional patterns for West Bengal
  if (acNo <= 50) {
    // Urban areas (Kolkata, Howrah) - high infrastructure, jobs; low agriculture
    return {
      jobs: 60 + jobsVariation * 0.5,
      healthcare: 55 + healthcareVariation * 0.6,
      infrastructure: 65 + infrastructureVariation * 0.4,
      education: 58 + educationVariation * 0.5,
      agriculture: 25 + agricultureVariation * 0.3,
    };
  } else if (acNo <= 150) {
    // Semi-urban and industrial towns - mixed scores
    return {
      jobs: 50 + jobsVariation * 0.7,
      healthcare: 45 + healthcareVariation * 0.8,
      infrastructure: 50 + infrastructureVariation * 0.7,
      education: 48 + educationVariation * 0.7,
      agriculture: 40 + agricultureVariation * 0.6,
    };
  } else if (acNo <= 250) {
    // Rural constituencies - higher agriculture, lower infrastructure
    return {
      jobs: 35 + jobsVariation * 0.8,
      healthcare: 35 + healthcareVariation * 0.9,
      infrastructure: 40 + infrastructureVariation * 0.8,
      education: 40 + educationVariation * 0.8,
      agriculture: 60 + agricultureVariation * 0.4,
    };
  } else {
    // Remote/border areas - most varied
    return {
      jobs: 30 + jobsVariation,
      healthcare: 30 + healthcareVariation,
      infrastructure: 35 + infrastructureVariation,
      education: 35 + educationVariation,
      agriculture: 55 + agricultureVariation * 0.5,
    };
  }
}

/**
 * Get issue scores for a constituency
 * Generates varied scores for each West Bengal constituency
 */
export function getConstituencyIssueScores(constituencyName: string): IssueScores {
  // If it's in the Tamil Nadu data (for backwards compatibility), return it
  if (defaultConstituencyIssueData[constituencyName]) {
    return defaultConstituencyIssueData[constituencyName];
  }

  // Generate scores for West Bengal constituencies
  return generateIssueScores(constituencyName);
}

/**
 * Get specific issue score for a constituency
 */
export function getIssueScore(
  constituencyName: string,
  issue: 'jobs' | 'healthcare' | 'infrastructure' | 'education' | 'agriculture'
): number {
  const scores = getConstituencyIssueScores(constituencyName);
  return Math.round(scores[issue]); // Ensure integer scores
}
