#!/usr/bin/env node
/**
 * MLA PROFILE SCRAPER
 * Scrapes comprehensive MLA data from MyNeta.info and Wikipedia
 * for 50 West Bengal constituencies
 *
 * Features:
 * - MyNeta.info scraping (criminal records, assets, education)
 * - Wikipedia REST API (biography, photos)
 * - Multi-source photo fetching
 * - Rate limiting & retry logic
 * - Stores in Supabase leader_profiles table
 *
 * Usage:
 *   node scripts/mla-profile-scraper.js
 *   node scripts/mla-profile-scraper.js --test  (test with 5 constituencies)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// ================== CONFIGURATION ==================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials!');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_SECRET');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Rate limiting configuration
const RATE_LIMITS = {
  myneta: 3000,    // 3 seconds between MyNeta requests
  wikipedia: 1000, // 1 second between Wikipedia requests
};

// Bengali surname variants for name matching
const BENGALI_SURNAME_VARIANTS = {
  'Banerjee': ['Bandyopadhyay', 'Banerji', 'Bandopadhyay', 'Bennerjee'],
  'Chatterjee': ['Chattopadhyay', 'Chatterji', 'Chatterjea', 'Chaterjee'],
  'Mukherjee': ['Mukhopadhyay', 'Mookerjee', 'Mukerji', 'Mookherji'],
  'Bhattacharya': ['Bhattacharyya', 'Bhattacharjee', 'Bhattacherjee'],
  'Ghosh': ['Ghose', 'Gosh'],
  'Das': ['Dass', 'Doss'],
  'Roy': ['Ray', 'Rai'],
  'Dey': ['De'],
  'Biswas': ['Viswas', 'Bishwas'],
  'Mondal': ['Mandal', 'Mandol'],
  'Sarkar': ['Sircar', 'Sarker'],
  'Pal': ['Paul', 'Paal'],
  'Chakraborty': ['Chakrabarti', 'Chakrabortty', 'Chakravarty'],
};

// ================== UTILITY FUNCTIONS ==================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...options.headers,
        },
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        return response;
      }

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 5000;
        console.log(`  Rate limited, waiting ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }

      if (response.status === 404) {
        return null;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`  Failed after ${maxRetries} attempts: ${error.message}`);
        return null;
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`  Retry ${attempt}/${maxRetries} after ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
  return null;
}

function parseIndianCurrency(text) {
  if (!text) return 0;

  // Handle Crore/Lakh format
  const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
  const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)/i);

  let amount = 0;
  if (croreMatch) amount += parseFloat(croreMatch[1]) * 10000000;
  if (lakhMatch) amount += parseFloat(lakhMatch[1]) * 100000;
  if (thousandMatch) amount += parseFloat(thousandMatch[1]) * 1000;

  // If no unit found, parse raw number
  if (amount === 0) {
    const cleanText = text.replace(/[^\d.]/g, '');
    amount = parseFloat(cleanText) || 0;
  }

  return amount;
}

function normalizeConstituencyName(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/north|uttar/gi, 'n')
    .replace(/south|dakshin/gi, 's')
    .replace(/east|purba/gi, 'e')
    .replace(/west|paschim/gi, 'w')
    .trim();
}

function generateNameVariants(name) {
  const variants = [name];
  const parts = name.split(' ');

  // Check each surname part for variants
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

// ================== MYNETA SCRAPING ==================

async function scrapeMyNetaWinnersList() {
  console.log('\n[MyNeta] Fetching West Bengal 2021 winners list...');

  const url = 'https://www.myneta.info/WestBengal2021/index.php?action=show_winners&sort=default';
  const response = await fetchWithRetry(url);

  if (!response) {
    console.error('[MyNeta] Failed to fetch winners list');
    return [];
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const winners = [];

  // MyNeta uses tables with candidate data
  $('table tr').each((index, row) => {
    if (index === 0) return; // Skip header

    const cells = $(row).find('td');
    if (cells.length < 6) return;

    const nameCell = $(cells[1]);
    const nameLink = nameCell.find('a');
    const constituencyCell = $(cells[2]);

    const winner = {
      candidateName: nameLink.text().trim() || nameCell.text().trim(),
      profileUrl: nameLink.attr('href') ? `https://www.myneta.info${nameLink.attr('href')}` : null,
      constituency: constituencyCell.text().trim(),
      party: $(cells[3]).text().trim(),
      criminalCases: parseInt($(cells[4]).text().trim()) || 0,
      education: $(cells[5]).text().trim(),
      totalAssets: parseIndianCurrency($(cells[6]).text()),
      liabilities: parseIndianCurrency($(cells[7]).text()),
    };

    if (winner.candidateName && winner.constituency) {
      winners.push(winner);
    }
  });

  console.log(`[MyNeta] Found ${winners.length} winners`);
  return winners;
}

function matchMyNetaWinner(constituency, mynetaWinners) {
  const normalizedConstituency = normalizeConstituencyName(constituency.constituency_name);

  // Try exact match first
  let match = mynetaWinners.find(w =>
    normalizeConstituencyName(w.constituency) === normalizedConstituency
  );

  if (match) return match;

  // Try partial match
  match = mynetaWinners.find(w => {
    const normalizedMyNeta = normalizeConstituencyName(w.constituency);
    return normalizedMyNeta.includes(normalizedConstituency) ||
           normalizedConstituency.includes(normalizedMyNeta);
  });

  if (match) return match;

  // Try by MLA name match
  const nameVariants = generateNameVariants(constituency.current_mla_name);
  match = mynetaWinners.find(w => {
    const candidateName = w.candidateName.toLowerCase();
    return nameVariants.some(v => candidateName.includes(v.toLowerCase()));
  });

  return match || null;
}

async function scrapeMyNetaDetailedProfile(profileUrl) {
  if (!profileUrl) return null;

  const response = await fetchWithRetry(profileUrl);
  if (!response) return null;

  const html = await response.text();
  const $ = cheerio.load(html);

  const details = {
    age: null,
    gender: null,
    profession: null,
    movableAssets: 0,
    immovableAssets: 0,
    ipcCases: 0,
    pendingCases: 0,
    isConvicted: false,
    caseDetails: [],
  };

  // Parse HTML for detailed info
  const text = $('body').text();

  // Age
  const ageMatch = text.match(/Age[:\s]*(\d{2,3})/i);
  if (ageMatch) details.age = parseInt(ageMatch[1]);

  // Gender
  if (text.toLowerCase().includes('female')) {
    details.gender = 'Female';
  } else if (text.toLowerCase().includes('male')) {
    details.gender = 'Male';
  }

  // Profession
  const professionMatch = text.match(/(?:Self\s*)?Profession[:\s]*([^\n<]+)/i);
  if (professionMatch) details.profession = professionMatch[1].trim().substring(0, 100);

  // Movable/Immovable assets
  const movableMatch = text.match(/Movable\s*Assets?[:\s]*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac))?)/i);
  if (movableMatch) details.movableAssets = parseIndianCurrency(movableMatch[1]);

  const immovableMatch = text.match(/Immovable\s*Assets?[:\s]*Rs\.?\s*([0-9,]+(?:\s*(?:Crore|Cr|Lakh|Lac))?)/i);
  if (immovableMatch) details.immovableAssets = parseIndianCurrency(immovableMatch[1]);

  // IPC cases
  const ipcMatches = text.match(/IPC\s*(?:Section\s*)?(\d+[A-Z]?)/gi) || [];
  details.ipcCases = ipcMatches.length;
  details.caseDetails = [...new Set(ipcMatches)].slice(0, 10).map(section => ({
    section: section.trim(),
    status: 'pending',
  }));

  // Pending cases
  const pendingMatch = text.match(/(\d+)\s*(?:case[s]?)?\s*pending/i);
  if (pendingMatch) details.pendingCases = parseInt(pendingMatch[1]);

  // Convicted
  details.isConvicted = text.toLowerCase().includes('convicted');

  return details;
}

// ================== WIKIPEDIA SCRAPING ==================

async function fetchWikipediaSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  const response = await fetchWithRetry(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response) return null;

  try {
    const data = await response.json();
    if (data.type === 'disambiguation') return null;
    return data;
  } catch {
    return null;
  }
}

async function findWikipediaArticle(mlaName) {
  // Try different name formats
  const searchVariants = [
    mlaName.replace(/\s+/g, '_'),
    `${mlaName.replace(/\s+/g, '_')}_(politician)`,
    `${mlaName.replace(/\s+/g, '_')}_(Indian_politician)`,
    ...generateNameVariants(mlaName).map(v => v.replace(/\s+/g, '_')),
  ];

  for (const variant of searchVariants) {
    await sleep(RATE_LIMITS.wikipedia);
    const summary = await fetchWikipediaSummary(variant);

    if (summary?.extract) {
      const extract = summary.extract.toLowerCase();
      // Verify it's about a politician from Bengal
      if (extract.includes('politician') ||
          extract.includes('mla') ||
          extract.includes('bengal') ||
          extract.includes('legislative')) {
        return {
          title: summary.title,
          summary: summary.extract,
          imageUrl: summary.thumbnail?.source || null,
          pageUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${variant}`,
          birthDate: extractBirthDate(summary.extract),
          birthPlace: extractBirthPlace(summary.extract),
        };
      }
    }
  }

  return null;
}

function extractBirthDate(text) {
  const match = text.match(/born\s+(?:on\s+)?(\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4})/i);
  return match ? match[1] : null;
}

function extractBirthPlace(text) {
  const match = text.match(/born\s+[^)]*?(?:in|at)\s+([A-Z][a-zA-Z\s,]+?)(?:\)|,|\.)/);
  return match ? match[1].trim() : null;
}

// ================== MULTI-SOURCE PHOTO FETCHING ==================

async function fetchMlaPhoto(mlaName, wikiImageUrl) {
  // Priority 1: Wikipedia image (already fetched)
  if (wikiImageUrl) {
    return wikiImageUrl;
  }

  // Priority 2: Try West Bengal Assembly website
  // Note: Would require specific implementation for assembly site

  // Priority 3: Return null (no photo found)
  return null;
}

// ================== DATABASE OPERATIONS ==================

async function loadConstituencyLeaders() {
  console.log('\n[DB] Loading constituency leaders from database...');

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

async function upsertLeaderProfile(profile) {
  // Check if profile already exists
  const { data: existing } = await supabase
    .from('leader_profiles')
    .select('id')
    .eq('constituency_id', profile.constituency_id)
    .single();

  let error;

  if (existing) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('leader_profiles')
      .update(profile)
      .eq('constituency_id', profile.constituency_id);
    error = updateError;
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from('leader_profiles')
      .insert(profile);
    error = insertError;
  }

  if (error) {
    console.error(`[DB] Error upserting profile for ${profile.leader_name}:`, error.message);
    return false;
  }
  return true;
}

// ================== MAIN SCRAPING LOGIC ==================

function calculateDataQuality(profile) {
  let score = 0;
  if (profile.photo_url) score += 15;
  if (profile.education) score += 10;
  if (profile.total_assets_lakhs > 0) score += 20;
  if (profile.criminal_cases !== null) score += 15;
  if (profile.biography_summary) score += 20;
  if (profile.age > 0) score += 10;
  if (profile.profession) score += 10;
  return Math.min(100, score);
}

async function scrapeAllMlaProfiles(testMode = false) {
  console.log('='.repeat(60));
  console.log('MLA PROFILE SCRAPER');
  console.log('Scraping data from MyNeta.info and Wikipedia');
  console.log('='.repeat(60));

  // Step 1: Load constituencies
  const constituencies = await loadConstituencyLeaders();
  if (constituencies.length === 0) {
    console.error('No constituencies found in database!');
    return;
  }

  // Step 2: Scrape MyNeta winners list (single request)
  const mynetaWinners = await scrapeMyNetaWinnersList();

  // Limit for test mode
  const targetConstituencies = testMode ? constituencies.slice(0, 5) : constituencies;
  console.log(`\n[Scraper] Processing ${targetConstituencies.length} constituencies...`);

  const results = {
    total: targetConstituencies.length,
    success: 0,
    failed: [],
    mynetaMatched: 0,
    wikipediaFound: 0,
    photosFound: 0,
  };

  // Step 3: Process each constituency
  for (let i = 0; i < targetConstituencies.length; i++) {
    const constituency = targetConstituencies[i];
    console.log(`\n[${i + 1}/${targetConstituencies.length}] ${constituency.constituency_name} - ${constituency.current_mla_name}`);

    try {
      // Match MyNeta data
      const mynetaMatch = matchMyNetaWinner(constituency, mynetaWinners);
      let mynetaDetails = null;

      if (mynetaMatch) {
        console.log(`  MyNeta: Matched (${mynetaMatch.criminalCases} cases, Rs ${(mynetaMatch.totalAssets / 100000).toFixed(2)} Lakhs)`);
        results.mynetaMatched++;

        // Fetch detailed profile if URL available
        if (mynetaMatch.profileUrl) {
          await sleep(RATE_LIMITS.myneta);
          mynetaDetails = await scrapeMyNetaDetailedProfile(mynetaMatch.profileUrl);
        }
      } else {
        console.log('  MyNeta: No match found');
      }

      // Fetch Wikipedia data
      await sleep(RATE_LIMITS.wikipedia);
      const wikiData = await findWikipediaArticle(constituency.current_mla_name);

      if (wikiData) {
        console.log(`  Wikipedia: Found (${wikiData.summary.substring(0, 50)}...)`);
        results.wikipediaFound++;
      } else {
        console.log('  Wikipedia: Not found');
      }

      // Fetch photo
      const photoUrl = await fetchMlaPhoto(constituency.current_mla_name, wikiData?.imageUrl);
      if (photoUrl) results.photosFound++;

      // Build profile object (using columns from migration 17)
      // Note: Extended columns from migration 20 can be added after running the migration
      const profile = {
        constituency_id: constituency.constituency_id,
        leader_name: constituency.current_mla_name,
        leader_name_bengali: constituency.current_mla_name_bengali,
        party: constituency.current_mla_party,

        // MyNeta criminal data
        criminal_cases: mynetaMatch?.criminalCases || 0,
        serious_criminal_cases: mynetaDetails?.ipcCases || 0,

        // Assets (convert to lakhs)
        declared_assets_lakhs: mynetaMatch ? Math.round(mynetaMatch.totalAssets / 100000 * 100) / 100 : null,

        // Personal info (from existing columns in migration 17)
        education: mynetaMatch?.education || null,
        profession: mynetaDetails?.profession || null,
        age: mynetaDetails?.age || constituency.current_mla_age || null,

        // Photo from Wikipedia
        photo_url: photoUrl,

        // Store extended data in positions_held as JSON string for now
        // This preserves data until migration 20 is applied
        positions_held: wikiData?.summary ? [
          `Biography: ${wikiData.summary.substring(0, 500)}`,
          wikiData.birthDate ? `Birth: ${wikiData.birthDate}` : null,
          wikiData.birthPlace ? `Place: ${wikiData.birthPlace}` : null,
          mynetaMatch?.profileUrl ? `MyNeta: ${mynetaMatch.profileUrl}` : null,
          wikiData?.pageUrl ? `Wikipedia: ${wikiData.pageUrl}` : null,
        ].filter(Boolean) : [],

        // Timestamps
        updated_at: new Date().toISOString(),
      };

      // Calculate data quality score (for logging only, not saved until migration 20)
      const qualityScore = calculateDataQuality(profile);

      // Save to database
      const saved = await upsertLeaderProfile(profile);
      if (saved) {
        console.log(`  Saved: Quality score ${qualityScore}/100`);
        results.success++;
      } else {
        results.failed.push(constituency.constituency_name);
      }

      // Rate limit before next constituency
      await sleep(1000);

    } catch (error) {
      console.error(`  Error: ${error.message}`);
      results.failed.push(constituency.constituency_name);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SCRAPING COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total constituencies: ${results.total}`);
  console.log(`Successfully saved: ${results.success}`);
  console.log(`MyNeta matched: ${results.mynetaMatched}`);
  console.log(`Wikipedia found: ${results.wikipediaFound}`);
  console.log(`Photos found: ${results.photosFound}`);

  if (results.failed.length > 0) {
    console.log(`\nFailed (${results.failed.length}):`);
    results.failed.forEach(name => console.log(`  - ${name}`));
  }
}

// ================== ENTRY POINT ==================

const testMode = process.argv.includes('--test');

scrapeAllMlaProfiles(testMode)
  .then(() => {
    console.log('\nScraper finished.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
