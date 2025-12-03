/**
 * MLA Profile Refresh Service
 * On-demand scraping of MLA profile data from MyNeta.info and Wikipedia
 */

import { supabaseAdmin } from '../lib/supabase';
import { LeaderProfile } from './supabase/leaderProfiles.service';

// Rate limiting
const RATE_LIMITS = {
  myneta: 3000,
  wikipedia: 1000,
};

// Bengali surname variants for name matching
const BENGALI_SURNAME_VARIANTS: Record<string, string[]> = {
  'Banerjee': ['Bandyopadhyay', 'Banerji', 'Bandopadhyay'],
  'Chatterjee': ['Chattopadhyay', 'Chatterji', 'Chatterjea'],
  'Mukherjee': ['Mukhopadhyay', 'Mookerjee', 'Mukerji'],
  'Ghosh': ['Ghose', 'Gosh'],
  'Ghosal': ['Ghoshal', 'Goshal'],
  'Mullick': ['Mallick', 'Mallik', 'Mulik'],
  'Chakraborty': ['Chakrabarti', 'Chakrabortty', 'Chakravarty'],
  'Mondal': ['Mandal', 'Mandol'],
  'Bose': ['Basu', 'Bosu'],
  'Dutta': ['Datta', 'Dutt'],
  'Majumder': ['Majumdar', 'Mazumder', 'Mazumdar'],
  'Roy': ['Ray', 'Rai'],
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateNameVariants(name: string): string[] {
  const variants = [name];
  for (const [surname, alternates] of Object.entries(BENGALI_SURNAME_VARIANTS)) {
    if (name.includes(surname)) {
      for (const alt of alternates) {
        variants.push(name.replace(surname, alt));
      }
    }
    for (const alt of alternates) {
      if (name.includes(alt)) {
        variants.push(name.replace(alt, surname));
      }
    }
  }
  return [...new Set(variants)];
}

function parseIndianCurrency(text: string): number {
  if (!text) return 0;
  const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
  let amount = 0;
  if (croreMatch) amount += parseFloat(croreMatch[1]) * 10000000;
  if (lakhMatch) amount += parseFloat(lakhMatch[1]) * 100000;
  if (amount === 0) {
    const cleanText = text.replace(/[^\d.]/g, '');
    amount = parseFloat(cleanText) || 0;
  }
  return amount;
}

interface MyNetaProfile {
  candidateName: string;
  profileUrl: string | null;
  constituency: string;
  party: string;
  criminalCases: number;
  education: string;
  totalAssets: number;
  liabilities: number;
  age?: number;
  profession?: string;
}

interface WikipediaData {
  title: string;
  summary: string;
  imageUrl: string | null;
  pageUrl: string;
  birthDate: string | null;
  birthPlace: string | null;
}

/**
 * Search MyNeta.info for an MLA profile
 */
async function searchMyNeta(
  mlaName: string,
  constituencyName: string
): Promise<MyNetaProfile | null> {
  try {
    // Use CORS proxy for client-side requests
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://www.myneta.info/WestBengal2021/index.php?action=show_winners&sort=default`
    )}`;

    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('[MyNeta] Failed to fetch winners list');
      return null;
    }

    const html = await response.text();

    // Parse HTML to find matching candidate
    const normalizedName = mlaName.toLowerCase().trim();
    const normalizedConstituency = constituencyName.toLowerCase().trim();

    // Simple regex-based extraction from the HTML table
    const candidatePattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;

    while ((match = candidatePattern.exec(html)) !== null) {
      const row = match[1];
      const nameMatch = row.match(/>([^<]+)<\/a>/);
      const constituencyMatch = row.match(/<td[^>]*>([^<]+)<\/td>/g);

      if (nameMatch && constituencyMatch) {
        const candidateName = nameMatch[1].trim();
        const rowConstituency = constituencyMatch[1]?.replace(/<[^>]*>/g, '').trim() || '';

        // Check if this matches our target
        if (
          candidateName.toLowerCase().includes(normalizedName.split(' ')[0]) ||
          rowConstituency.toLowerCase().includes(normalizedConstituency)
        ) {
          // Extract profile URL
          const urlMatch = row.match(/href="([^"]+)"/);
          const profileUrl = urlMatch ? `https://www.myneta.info${urlMatch[1]}` : null;

          // Extract other data
          const cells = row.match(/<td[^>]*>([^<]*)<\/td>/g) || [];
          const cellValues = cells.map(c => c.replace(/<[^>]*>/g, '').trim());

          return {
            candidateName,
            profileUrl,
            constituency: rowConstituency,
            party: cellValues[2] || '',
            criminalCases: parseInt(cellValues[3]) || 0,
            education: cellValues[4] || '',
            totalAssets: parseIndianCurrency(cellValues[5] || '0'),
            liabilities: parseIndianCurrency(cellValues[6] || '0'),
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[MyNeta] Search error:', error);
    return null;
  }
}

/**
 * Fetch Wikipedia summary for an MLA
 */
async function fetchWikipediaSummary(mlaName: string): Promise<WikipediaData | null> {
  const searchVariants = [
    mlaName.replace(/\s+/g, '_'),
    `${mlaName.replace(/\s+/g, '_')}_(politician)`,
    `${mlaName.replace(/\s+/g, '_')}_(Indian_politician)`,
    ...generateNameVariants(mlaName).map(v => v.replace(/\s+/g, '_')),
  ];

  for (const variant of searchVariants) {
    try {
      await sleep(RATE_LIMITS.wikipedia);

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
      // Verify it's about a politician
      if (
        extract.includes('politician') ||
        extract.includes('mla') ||
        extract.includes('bengal') ||
        extract.includes('legislative') ||
        extract.includes('actor')
      ) {
        // Extract birth info from text
        const birthDateMatch = data.extract?.match(
          /born\s+(?:on\s+)?(\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4})/i
        );
        const birthPlaceMatch = data.extract?.match(
          /born\s+[^)]*?(?:in|at)\s+([A-Z][a-zA-Z\s,]+?)(?:\)|,|\.)/
        );

        return {
          title: data.title,
          summary: data.extract,
          imageUrl: data.thumbnail?.source || null,
          pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${variant}`,
          birthDate: birthDateMatch ? birthDateMatch[1] : null,
          birthPlace: birthPlaceMatch ? birthPlaceMatch[1].trim() : null,
        };
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

/**
 * Refresh MLA profile data from external sources
 */
export async function refreshMLAProfile(
  constituencyId: string,
  mlaName: string,
  constituencyName: string
): Promise<{ success: boolean; profile: LeaderProfile | null; error?: string }> {
  console.log(`[MLA Refresh] Starting refresh for ${mlaName} (${constituencyName})`);

  try {
    // Step 1: Search MyNeta
    console.log('[MLA Refresh] Fetching MyNeta data...');
    const mynetaData = await searchMyNeta(mlaName, constituencyName);

    await sleep(RATE_LIMITS.myneta);

    // Step 2: Fetch Wikipedia
    console.log('[MLA Refresh] Fetching Wikipedia data...');
    const wikiData = await fetchWikipediaSummary(mlaName);

    // Step 3: Build profile object
    const profile: Partial<LeaderProfile> = {
      constituency_id: constituencyId,
      leader_name: mlaName,
      party: mynetaData?.party || 'Unknown',
      criminal_cases: mynetaData?.criminalCases || 0,
      declared_assets_lakhs: mynetaData
        ? Math.round((mynetaData.totalAssets / 100000) * 100) / 100
        : null,
      education: mynetaData?.education || null,
      profession: mynetaData?.profession || null,
      age: mynetaData?.age || null,
      photo_url: wikiData?.imageUrl || null,
      positions_held: wikiData?.summary
        ? [
            `Biography: ${wikiData.summary.substring(0, 500)}`,
            wikiData.birthDate ? `Birth: ${wikiData.birthDate}` : null,
            wikiData.birthPlace ? `Place: ${wikiData.birthPlace}` : null,
            mynetaData?.profileUrl ? `MyNeta: ${mynetaData.profileUrl}` : null,
            wikiData?.pageUrl ? `Wikipedia: ${wikiData.pageUrl}` : null,
          ].filter(Boolean) as string[]
        : [],
      updated_at: new Date().toISOString(),
    };

    // Step 4: Upsert to database
    console.log('[MLA Refresh] Saving to database...');

    const { data: existing } = await supabaseAdmin
      .from('leader_profiles')
      .select('id')
      .eq('constituency_id', constituencyId)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('leader_profiles')
        .update(profile)
        .eq('constituency_id', constituencyId);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('leader_profiles')
        .insert(profile);

      if (error) throw error;
    }

    // Step 5: Fetch and return the updated profile
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('leader_profiles')
      .select('*')
      .eq('constituency_id', constituencyId)
      .single();

    if (fetchError) throw fetchError;

    console.log('[MLA Refresh] Profile refreshed successfully!');
    return {
      success: true,
      profile: updatedProfile as LeaderProfile,
    };
  } catch (error) {
    console.error('[MLA Refresh] Error:', error);
    return {
      success: false,
      profile: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get data quality score for a profile
 */
export function calculateDataQuality(profile: LeaderProfile | null): number {
  if (!profile) return 0;

  let score = 0;
  if (profile.photo_url) score += 15;
  if (profile.education) score += 10;
  if (profile.declared_assets_lakhs && profile.declared_assets_lakhs > 0) score += 20;
  if (profile.criminal_cases !== null) score += 15;
  if (profile.positions_held && profile.positions_held.length > 0) score += 20;
  if (profile.age && profile.age > 0) score += 10;
  if (profile.profession) score += 10;

  return Math.min(100, score);
}

export default {
  refreshMLAProfile,
  calculateDataQuality,
};
