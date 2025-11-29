/**
 * MLA Profile Service
 * Scrapes comprehensive MLA data from MyNeta.info and Wikipedia
 */

// Types
export interface CriminalCase {
  section: string;
  description: string;
  status: 'pending' | 'convicted' | 'acquitted' | 'unknown';
}

export interface CriminalRecord {
  total_cases: number;
  ipc_cases: number;
  pending_cases: number;
  convicted: boolean;
  case_details: CriminalCase[];
}

export interface Assets {
  movable: number;
  immovable: number;
  total: number;
  liabilities: number;
  net_worth: number;
  declared_year: number;
}

export interface Education {
  qualification: string;
  details: string;
}

export interface PersonalInfo {
  age: number;
  gender: string;
  profession: string;
}

export interface ElectionRecord {
  year: number;
  constituency: string;
  party: string;
  votes: number;
  result: 'won' | 'lost';
}

export interface Biography {
  birth_date: string;
  birth_place: string;
  summary: string;
  image_url?: string;
}

export interface PoliticalCareer {
  positions: { title: string; period: string }[];
  party_history: { party: string; period: string }[];
}

export interface Family {
  spouse: string;
  children: string;
  political_connections: string;
}

export interface MLAProfile {
  name: string;
  constituency: string;
  party: string;

  // MyNeta data
  criminal: CriminalRecord;
  assets: Assets;
  education: Education;
  personal: PersonalInfo;
  elections: ElectionRecord[];

  // Wikipedia data
  biography: Biography;
  political_career: PoliticalCareer;
  family: Family;

  // Metadata
  myneta_url: string;
  wikipedia_url: string;
  last_fetched: string;
  fetch_status: {
    myneta: 'success' | 'not_found' | 'error';
    wikipedia: 'success' | 'not_found' | 'error';
  };
}

// Helper: Parse Indian currency amounts (e.g., "Rs 45,23,456" or "Rs 2 Crore 34 Lakh")
function parseIndianCurrency(text: string): number {
  if (!text) return 0;

  const cleanText = text.replace(/[^\d.,\s]/gi, '').trim();

  // Check for Crore/Lakh format
  const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
  const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)/i);

  let amount = 0;
  if (croreMatch) amount += parseFloat(croreMatch[1]) * 10000000;
  if (lakhMatch) amount += parseFloat(lakhMatch[1]) * 100000;
  if (thousandMatch) amount += parseFloat(thousandMatch[1]) * 1000;

  // If no unit found, parse as raw number (removing commas)
  if (amount === 0) {
    const rawAmount = cleanText.replace(/,/g, '');
    amount = parseFloat(rawAmount) || 0;
  }

  return amount;
}

// Helper: Format currency in Lakhs/Crores
export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Crores`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)} Thousand`;
  }
  return `₹${amount.toFixed(0)}`;
}

/**
 * Extract candidate profile URL from MyNeta search results
 */
function extractProfileUrlFromSearch(html: string, mlaName: string): string | null {
  // MyNeta search results contain links like:
  // <a href="/WestBengal2021/candidate.php?candidate_id=12345">CANDIDATE NAME</a>

  // Try to find West Bengal 2021 election results first (most recent)
  const wbPattern = /href="(\/WestBengal2021\/candidate\.php\?candidate_id=\d+)"[^>]*>([^<]+)</gi;
  const wbMatches = [...html.matchAll(wbPattern)];

  // Search for exact or partial name match
  const normalizedMlaName = mlaName.toLowerCase().trim();

  for (const match of wbMatches) {
    const candidateName = match[2].toLowerCase().trim();
    // Check if names match (partial match to handle variations)
    if (candidateName.includes(normalizedMlaName) || normalizedMlaName.includes(candidateName.split(' ')[0])) {
      return `https://www.myneta.info${match[1]}`;
    }
  }

  // Fallback: try any election year pattern
  const anyPattern = /href="(\/[A-Za-z]+\d+\/candidate\.php\?candidate_id=\d+)"[^>]*>([^<]+)</gi;
  const anyMatches = [...html.matchAll(anyPattern)];

  for (const match of anyMatches) {
    const candidateName = match[2].toLowerCase().trim();
    if (candidateName.includes(normalizedMlaName) || normalizedMlaName.includes(candidateName.split(' ')[0])) {
      return `https://www.myneta.info${match[1]}`;
    }
  }

  // If no exact match, return first West Bengal result if any
  if (wbMatches.length > 0) {
    return `https://www.myneta.info${wbMatches[0][1]}`;
  }

  return null;
}

/**
 * Parse MyNeta profile page HTML to extract data
 */
function parseMyNetaProfilePage(html: string): {
  criminal: CriminalRecord;
  assets: Assets;
  education: Education;
  personal: PersonalInfo;
} {
  const result = {
    criminal: {
      total_cases: 0,
      ipc_cases: 0,
      pending_cases: 0,
      convicted: false,
      case_details: [] as CriminalCase[],
    },
    assets: {
      movable: 0,
      immovable: 0,
      total: 0,
      liabilities: 0,
      net_worth: 0,
      declared_year: 2021,
    },
    education: {
      qualification: 'Not Available',
      details: '',
    },
    personal: {
      age: 0,
      gender: 'Unknown',
      profession: 'Politician',
    },
  };

  // MyNeta profile pages have tables with data
  // Criminal cases - look for patterns like "Criminal Case" followed by "Yes (X cases)" or just numbers
  const criminalCaseMatch = html.match(/Criminal\s*Case[s]?.*?(\d+)\s*case/i) ||
                            html.match(/Criminal\s*Case[s]?[^<]*<\/td>\s*<td[^>]*>[^<]*?(\d+)/i) ||
                            html.match(/(\d+)\s*Criminal\s*Case/i);
  if (criminalCaseMatch) {
    result.criminal.total_cases = parseInt(criminalCaseMatch[1]) || 0;
  }

  // Check for "No Criminal Cases" text
  if (html.match(/No\s*Criminal\s*Case/i) || html.match(/0\s*Criminal/i)) {
    result.criminal.total_cases = 0;
  }

  // IPC sections - find all IPC mentions
  const ipcMatches = html.match(/IPC\s*(?:Section\s*)?(\d+(?:[A-Z])?)/gi) || [];
  result.criminal.ipc_cases = ipcMatches.length;
  result.criminal.case_details = [...new Set(ipcMatches)].slice(0, 5).map(section => ({
    section: section.trim(),
    description: 'Details on MyNeta.info',
    status: 'pending' as const,
  }));

  // Pending cases
  const pendingMatch = html.match(/(\d+)\s*(?:case[s]?)?\s*pending/i) ||
                       html.match(/pending[^<]*(\d+)/i);
  if (pendingMatch) {
    result.criminal.pending_cases = parseInt(pendingMatch[1]) || 0;
  }

  // Check convicted status
  result.criminal.convicted = html.toLowerCase().includes('convicted');

  // Assets - MyNeta shows assets in various formats
  // Pattern 1: "Total Assets: Rs X,XX,XXX" or "Rs X Crore Y Lakh"
  // Pattern 2: Inside table cells

  // Total Assets
  const totalAssetsPatterns = [
    /Total\s*Assets[^<]*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac)[s]?)?(?:\s*[0-9,]+\s*(?:Crore|Cr|Lakh|Lac)[s]?)?)/i,
    /Assets\s*:?\s*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac)[s]?)?)/i,
    /Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac)[s]?)?)\s*(?:~|Total\s*Asset)/i,
  ];

  for (const pattern of totalAssetsPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.assets.total = parseIndianCurrency(match[1]);
      if (result.assets.total > 0) break;
    }
  }

  // Movable Assets
  const movablePatterns = [
    /Movable\s*Assets?[^<]*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac)[s]?)?(?:\s*[0-9,]+\s*(?:Crore|Cr|Lakh|Lac)[s]?)?)/i,
    /Movable[^<]*:?\s*Rs\.?\s*([0-9,]+)/i,
  ];

  for (const pattern of movablePatterns) {
    const match = html.match(pattern);
    if (match) {
      result.assets.movable = parseIndianCurrency(match[1]);
      if (result.assets.movable > 0) break;
    }
  }

  // Immovable Assets
  const immovablePatterns = [
    /Immovable\s*Assets?[^<]*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac)[s]?)?(?:\s*[0-9,]+\s*(?:Crore|Cr|Lakh|Lac)[s]?)?)/i,
    /Immovable[^<]*:?\s*Rs\.?\s*([0-9,]+)/i,
    /(?:Land|Property|House|Building)[^<]*Rs\.?\s*([0-9,]+)/i,
  ];

  for (const pattern of immovablePatterns) {
    const match = html.match(pattern);
    if (match) {
      result.assets.immovable = parseIndianCurrency(match[1]);
      if (result.assets.immovable > 0) break;
    }
  }

  // Liabilities
  const liabilityPatterns = [
    /Liabilit(?:y|ies)[^<]*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac)[s]?)?)/i,
    /Total\s*Liabilit(?:y|ies)[^<]*Rs\.?\s*([0-9,]+)/i,
  ];

  for (const pattern of liabilityPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.assets.liabilities = parseIndianCurrency(match[1]);
      if (result.assets.liabilities > 0) break;
    }
  }

  // Calculate net worth
  if (result.assets.total > 0) {
    result.assets.net_worth = result.assets.total - result.assets.liabilities;
  } else if (result.assets.movable > 0 || result.assets.immovable > 0) {
    result.assets.total = result.assets.movable + result.assets.immovable;
    result.assets.net_worth = result.assets.total - result.assets.liabilities;
  }

  // Education
  const educationPatterns = [
    /Education[^<]*<\/td>\s*<td[^>]*>([^<]+)/i,
    /Educational?\s*Qualification[^<]*:?\s*([^<\n]+)/i,
    /Qualification[^<]*:?\s*([^<\n]+)/i,
  ];

  for (const pattern of educationPatterns) {
    const match = html.match(pattern);
    if (match && match[1].trim() && !match[1].includes('Not') && !match[1].includes('N/A')) {
      result.education.qualification = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // Personal Info - Age
  const agePatterns = [
    /Age[^<]*<\/td>\s*<td[^>]*>\s*(\d+)/i,
    /Age[:\s]*(\d+)\s*(?:years?|yrs?)?/i,
    /(\d+)\s*(?:years?|yrs?)\s*(?:old)?/i,
  ];

  for (const pattern of agePatterns) {
    const match = html.match(pattern);
    if (match) {
      const age = parseInt(match[1]);
      if (age > 18 && age < 100) {
        result.personal.age = age;
        break;
      }
    }
  }

  // Gender
  const genderMatch = html.match(/(?:Sex|Gender)[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) ||
                      html.match(/(?:Sex|Gender)[:\s]*(Male|Female)/i);
  if (genderMatch) {
    const gender = genderMatch[1].trim().toLowerCase();
    result.personal.gender = gender.includes('female') ? 'Female' :
                             gender.includes('male') ? 'Male' : 'Unknown';
  }

  // Profession
  const professionMatch = html.match(/(?:Self\s*)?Profession[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) ||
                          html.match(/Profession[:\s]*([^<\n]+)/i);
  if (professionMatch && professionMatch[1].trim()) {
    result.personal.profession = professionMatch[1].trim().substring(0, 50);
  }

  return result;
}

/**
 * Scrape MyNeta.info for MLA data using two-step approach
 */
export async function scrapeMyNetaData(mlaName: string, constituencyName?: string): Promise<{
  criminal: CriminalRecord;
  assets: Assets;
  education: Education;
  personal: PersonalInfo;
  elections: ElectionRecord[];
  myneta_url: string;
  status: 'success' | 'not_found' | 'error';
}> {
  const defaultResult = {
    criminal: {
      total_cases: 0,
      ipc_cases: 0,
      pending_cases: 0,
      convicted: false,
      case_details: [],
    },
    assets: {
      movable: 0,
      immovable: 0,
      total: 0,
      liabilities: 0,
      net_worth: 0,
      declared_year: 2021,
    },
    education: {
      qualification: 'Not Available',
      details: '',
    },
    personal: {
      age: 0,
      gender: 'Unknown',
      profession: 'Politician',
    },
    elections: [],
    myneta_url: '',
    status: 'not_found' as const,
  };

  try {
    // Step 1: Search for the MLA on MyNeta
    const searchQuery = constituencyName
      ? `${mlaName} ${constituencyName}`
      : `${mlaName} West Bengal MLA`;

    const searchUrl = `https://www.myneta.info/search.php?q=${encodeURIComponent(searchQuery)}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;

    console.log(`[MLAProfile] Step 1: Searching MyNeta for: ${searchQuery}`);

    const searchResponse = await fetch(proxyUrl, {
      headers: { 'Accept': 'text/html' },
      signal: AbortSignal.timeout(15000),
    });

    if (!searchResponse.ok) {
      console.error('[MLAProfile] MyNeta search failed:', searchResponse.status);
      return { ...defaultResult, myneta_url: searchUrl, status: 'error' };
    }

    const searchHtml = await searchResponse.text();

    // Step 2: Extract profile URL from search results
    const profileUrl = extractProfileUrlFromSearch(searchHtml, mlaName);

    if (!profileUrl) {
      console.log('[MLAProfile] No profile URL found in search results');
      return { ...defaultResult, myneta_url: searchUrl, status: 'not_found' };
    }

    console.log(`[MLAProfile] Step 2: Found profile URL: ${profileUrl}`);

    // Step 3: Fetch the actual profile page
    const profileProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(profileUrl)}`;

    const profileResponse = await fetch(profileProxyUrl, {
      headers: { 'Accept': 'text/html' },
      signal: AbortSignal.timeout(15000),
    });

    if (!profileResponse.ok) {
      console.error('[MLAProfile] MyNeta profile fetch failed:', profileResponse.status);
      return { ...defaultResult, myneta_url: profileUrl, status: 'error' };
    }

    const profileHtml = await profileResponse.text();

    // Step 4: Parse the profile page
    const parsedData = parseMyNetaProfilePage(profileHtml);

    const result = {
      ...parsedData,
      elections: [] as ElectionRecord[],
      myneta_url: profileUrl,
      status: 'success' as const,
    };

    console.log(`[MLAProfile] MyNeta data parsed: ${result.criminal.total_cases} cases, ${formatIndianCurrency(result.assets.total)} assets`);

    return result;
  } catch (error) {
    console.error('[MLAProfile] MyNeta scrape error:', error);
    return { ...defaultResult, status: 'error' };
  }
}

/**
 * Fetch Wikipedia data for MLA
 */
export async function scrapeWikipediaData(mlaName: string): Promise<{
  biography: Biography;
  political_career: PoliticalCareer;
  family: Family;
  wikipedia_url: string;
  status: 'success' | 'not_found' | 'error';
}> {
  const defaultResult = {
    biography: {
      birth_date: '',
      birth_place: '',
      summary: '',
      image_url: '',
    },
    political_career: {
      positions: [],
      party_history: [],
    },
    family: {
      spouse: '',
      children: '',
      political_connections: '',
    },
    wikipedia_url: '',
    status: 'not_found' as const,
  };

  try {
    // Format name for Wikipedia URL (replace spaces with underscores)
    const wikiName = mlaName.replace(/\s+/g, '_');

    // Use Wikipedia REST API for summary
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`;

    console.log(`[MLAProfile] Fetching Wikipedia data for: ${mlaName}`);

    const response = await fetch(summaryUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[MLAProfile] Wikipedia article not found');
        return { ...defaultResult, status: 'not_found' };
      }
      console.error('[MLAProfile] Wikipedia fetch failed:', response.status);
      return { ...defaultResult, status: 'error' };
    }

    const data = await response.json();

    // Extract data from Wikipedia response
    const result = {
      biography: {
        birth_date: '',
        birth_place: '',
        summary: data.extract || '',
        image_url: data.thumbnail?.source || '',
      },
      political_career: {
        positions: [] as { title: string; period: string }[],
        party_history: [] as { party: string; period: string }[],
      },
      family: {
        spouse: '',
        children: '',
        political_connections: '',
      },
      wikipedia_url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wikiName}`,
      status: 'success' as const,
    };

    // Try to extract birth info from summary
    const birthMatch = data.extract?.match(/born\s+(?:on\s+)?(\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4})/i);
    if (birthMatch) {
      result.biography.birth_date = birthMatch[1];
    }

    const birthPlaceMatch = data.extract?.match(/born\s+[^)]*?(?:in|at)\s+([A-Z][a-zA-Z\s,]+?)(?:\)|,|\.)/);
    if (birthPlaceMatch) {
      result.biography.birth_place = birthPlaceMatch[1].trim();
    }

    // Extract party mentions
    const partyMatches = data.extract?.match(/(?:TMC|Trinamool|BJP|Bharatiya Janata|Congress|INC|CPI|CPIM|Left Front)/gi) || [];
    const uniqueParties = [...new Set(partyMatches.map((p: string) => p.trim()))];
    result.political_career.party_history = uniqueParties.map((party: string) => ({
      party,
      period: 'See Wikipedia for details',
    }));

    // Extract position mentions
    if (data.extract?.includes('MLA') || data.extract?.includes('Member of Legislative Assembly')) {
      result.political_career.positions.push({
        title: 'Member of Legislative Assembly',
        period: 'Current',
      });
    }
    if (data.extract?.includes('Minister')) {
      const ministerMatch = data.extract.match(/Minister\s+(?:of|for)\s+([A-Za-z\s&]+)/);
      if (ministerMatch) {
        result.political_career.positions.push({
          title: `Minister of ${ministerMatch[1].trim()}`,
          period: 'See Wikipedia',
        });
      }
    }
    if (data.extract?.includes('MP') || data.extract?.includes('Member of Parliament')) {
      result.political_career.positions.push({
        title: 'Member of Parliament',
        period: 'See Wikipedia',
      });
    }

    console.log(`[MLAProfile] Wikipedia data parsed: ${result.biography.summary.substring(0, 50)}...`);

    return result;
  } catch (error) {
    console.error('[MLAProfile] Wikipedia fetch error:', error);
    return { ...defaultResult, status: 'error' };
  }
}

/**
 * Fetch complete MLA profile from both sources
 */
export async function fetchMLAProfile(
  mlaName: string,
  constituencyName: string,
  party: string
): Promise<MLAProfile> {
  console.log(`[MLAProfile] Fetching complete profile for: ${mlaName}`);

  // Fetch from both sources in parallel
  const [mynetaData, wikipediaData] = await Promise.all([
    scrapeMyNetaData(mlaName, constituencyName),
    scrapeWikipediaData(mlaName),
  ]);

  const profile: MLAProfile = {
    name: mlaName,
    constituency: constituencyName,
    party,

    // MyNeta data
    criminal: mynetaData.criminal,
    assets: mynetaData.assets,
    education: mynetaData.education,
    personal: mynetaData.personal,
    elections: mynetaData.elections,

    // Wikipedia data
    biography: wikipediaData.biography,
    political_career: wikipediaData.political_career,
    family: wikipediaData.family,

    // Metadata
    myneta_url: mynetaData.myneta_url,
    wikipedia_url: wikipediaData.wikipedia_url,
    last_fetched: new Date().toISOString(),
    fetch_status: {
      myneta: mynetaData.status,
      wikipedia: wikipediaData.status,
    },
  };

  console.log(`[MLAProfile] Profile complete - MyNeta: ${mynetaData.status}, Wikipedia: ${wikipediaData.status}`);

  return profile;
}

/**
 * Get sample/mock profile for testing or fallback
 */
export function getMockMLAProfile(mlaName: string, constituencyName: string, party: string): MLAProfile {
  return {
    name: mlaName,
    constituency: constituencyName,
    party,
    criminal: {
      total_cases: 2,
      ipc_cases: 1,
      pending_cases: 2,
      convicted: false,
      case_details: [
        { section: 'IPC 420', description: 'Cheating and dishonestly inducing delivery of property', status: 'pending' },
        { section: 'IPC 506', description: 'Punishment for criminal intimidation', status: 'pending' },
      ],
    },
    assets: {
      movable: 4523456,
      immovable: 23400000,
      total: 27923456,
      liabilities: 1200000,
      net_worth: 26723456,
      declared_year: 2021,
    },
    education: {
      qualification: 'Graduate',
      details: 'B.Com from Calcutta University',
    },
    personal: {
      age: 52,
      gender: 'Male',
      profession: 'Politician / Business',
    },
    elections: [
      { year: 2021, constituency: constituencyName, party, votes: 67234, result: 'won' },
      { year: 2016, constituency: constituencyName, party, votes: 58123, result: 'won' },
      { year: 2011, constituency: constituencyName, party: 'INC', votes: 42567, result: 'lost' },
    ],
    biography: {
      birth_date: '15 March 1972',
      birth_place: 'Kolkata, West Bengal',
      summary: `${mlaName} is an Indian politician and the current MLA of ${constituencyName} constituency in West Bengal. A member of the ${party}, they have been active in state politics since the early 2000s and have served multiple terms in the state legislature.`,
      image_url: '',
    },
    political_career: {
      positions: [
        { title: 'MLA, ' + constituencyName, period: '2021 - Present' },
        { title: 'MLA, ' + constituencyName, period: '2016 - 2021' },
        { title: 'Councillor, Ward 45', period: '2010 - 2016' },
      ],
      party_history: [
        { party, period: '2011 - Present' },
        { party: 'INC', period: '2005 - 2011' },
      ],
    },
    family: {
      spouse: 'Information not available',
      children: 'Information not available',
      political_connections: 'Active in local ' + party + ' unit',
    },
    myneta_url: `https://www.myneta.info/search.php?q=${encodeURIComponent(mlaName)}`,
    wikipedia_url: `https://en.wikipedia.org/wiki/${mlaName.replace(/\s+/g, '_')}`,
    last_fetched: new Date().toISOString(),
    fetch_status: {
      myneta: 'success',
      wikipedia: 'success',
    },
  };
}

export default {
  fetchMLAProfile,
  scrapeMyNetaData,
  scrapeWikipediaData,
  getMockMLAProfile,
  formatIndianCurrency,
};
