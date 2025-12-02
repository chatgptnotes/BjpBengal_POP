/**
 * Supabase Seeding Script for Constituency Data
 *
 * This script seeds verified election results and demographics data
 * for all 50 West Bengal constituencies into Supabase.
 *
 * Usage: npx tsx scripts/seed-constituency-data.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mmmvpotyplosbsodnxwn.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbXZwb3R5cGxvc2Jzb2RueHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjI5NjksImV4cCI6MjA3OTUzODk2OX0.DLWA5p-9jcl1q2yaQIuIeqJ7Ys1dDBg0I0YqfLV8Bcs';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET || '';

// Use service role key if available (bypasses RLS), otherwise fallback to anon key
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseKey);

console.log(`Using ${SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE ROLE' : 'ANON'} key`);

// Load JSON data files
function loadJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, 'data-collection', 'verified-data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

interface ElectionResult2021 {
  constituency_id: string;
  constituency_name: string;
  district: string;
  winner_2021: string;
  winner_party_2021: string;
  margin_2021: number;
  runner_up_2021: string;
  runner_up_party_2021: string;
  total_votes_2021?: number;
  notes?: string;
}

interface ElectionResult2016 {
  constituency_id: string;
  constituency_name: string;
  district: string;
  winner_2016: string;
  winner_party_2016: string;
  margin_2016: number;
  runner_up_2016: string;
  runner_up_party_2016: string;
  notes?: string;
}

interface Demographics {
  constituency_id: string;
  constituency_name: string;
  district: string;
  total_population: number;
  total_voters: number;
  literacy_rate: number;
  urban_percentage: number;
  hindu_percentage: number;
  muslim_percentage: number;
  christian_percentage: number;
  others_percentage: number;
  sc_percentage: number;
  st_percentage: number;
  obc_percentage: number;
  general_percentage: number;
  age_0_18: number;
  age_18_35: number;
  age_35_60: number;
  age_60_plus: number;
  male_percentage: number;
  female_percentage: number;
}

async function seedElectionResults(): Promise<void> {
  console.log('\n=== Seeding Election Results ===\n');

  const results2021 = loadJsonFile<ElectionResult2021[]>('election-results-2021.json');
  const results2016 = loadJsonFile<ElectionResult2016[]>('election-results-2016.json');

  // Create a map of 2016 results by constituency_id
  const results2016Map = new Map<string, ElectionResult2016>();
  for (const result of results2016) {
    results2016Map.set(result.constituency_id, result);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const result2021 of results2021) {
    const result2016 = results2016Map.get(result2021.constituency_id);

    // Merge 2021 and 2016 data
    const mergedResult = {
      constituency_id: result2021.constituency_id,
      constituency_name: result2021.constituency_name,
      district: result2021.district,
      // 2021 data
      winner_2021: result2021.winner_2021,
      winner_party_2021: result2021.winner_party_2021,
      margin_2021: result2021.margin_2021,
      runner_up_2021: result2021.runner_up_2021,
      runner_up_party_2021: result2021.runner_up_party_2021,
      total_votes_2021: result2021.total_votes_2021 || 0,
      // 2016 data
      winner_2016: result2016?.winner_2016 || null,
      winner_party_2016: result2016?.winner_party_2016 || null,
      margin_2016: result2016?.margin_2016 || 0,
      runner_up_2016: result2016?.runner_up_2016 || null,
      runner_up_party_2016: result2016?.runner_up_party_2016 || null,
      // Initialize other fields with defaults
      bjp_votes_2021: 0,
      tmc_votes_2021: 0,
      cpim_votes_2021: 0,
      inc_votes_2021: 0,
      others_votes_2021: 0,
      bjp_share_2021: 0,
      tmc_share_2021: 0,
      bjp_swing: 0,
      tmc_swing: 0,
    };

    try {
      const { error } = await supabase
        .from('election_results')
        .upsert(mergedResult, {
          onConflict: 'constituency_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error upserting ${result2021.constituency_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`[OK] ${result2021.constituency_name} - ${result2021.winner_party_2021} (margin: ${result2021.margin_2021})`);
        successCount++;
      }
    } catch (err) {
      console.error(`Exception for ${result2021.constituency_name}:`, err);
      errorCount++;
    }
  }

  console.log(`\nElection Results: ${successCount} succeeded, ${errorCount} failed`);
}

async function seedDemographics(): Promise<void> {
  console.log('\n=== Seeding Demographics ===\n');

  const demographics = loadJsonFile<Demographics[]>('demographics.json');

  let successCount = 0;
  let errorCount = 0;

  for (const demo of demographics) {
    const demoRecord = {
      constituency_id: demo.constituency_id,
      total_population: demo.total_population,
      total_voters: demo.total_voters,
      literacy_rate: demo.literacy_rate,
      urban_percentage: demo.urban_percentage,
      rural_percentage: 100 - demo.urban_percentage,
      hindu_percentage: demo.hindu_percentage,
      muslim_percentage: demo.muslim_percentage,
      christian_percentage: demo.christian_percentage,
      others_percentage: demo.others_percentage,
      sc_percentage: demo.sc_percentage,
      st_percentage: demo.st_percentage,
      obc_percentage: demo.obc_percentage,
      general_percentage: demo.general_percentage,
      age_0_18: demo.age_0_18,
      age_18_35: demo.age_18_35,
      age_35_60: demo.age_35_60,
      age_60_plus: demo.age_60_plus,
      male_percentage: demo.male_percentage,
      female_percentage: demo.female_percentage,
      data_source: 'Census 2011 / Verified Data',
    };

    try {
      const { error } = await supabase
        .from('constituency_demographics')
        .upsert(demoRecord, {
          onConflict: 'constituency_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error upserting demographics for ${demo.constituency_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`[OK] ${demo.constituency_name} - Pop: ${demo.total_population.toLocaleString()}, Voters: ${demo.total_voters.toLocaleString()}`);
        successCount++;
      }
    } catch (err) {
      console.error(`Exception for ${demo.constituency_name}:`, err);
      errorCount++;
    }
  }

  console.log(`\nDemographics: ${successCount} succeeded, ${errorCount} failed`);
}

async function verifyData(): Promise<void> {
  console.log('\n=== Verifying Seeded Data ===\n');

  // Check election_results count
  const { count: electionCount, error: electionError } = await supabase
    .from('election_results')
    .select('*', { count: 'exact', head: true });

  if (electionError) {
    console.error('Error checking election_results:', electionError.message);
  } else {
    console.log(`election_results table: ${electionCount} rows`);
  }

  // Check constituency_demographics count
  const { count: demoCount, error: demoError } = await supabase
    .from('constituency_demographics')
    .select('*', { count: 'exact', head: true });

  if (demoError) {
    console.error('Error checking constituency_demographics:', demoError.message);
  } else {
    console.log(`constituency_demographics table: ${demoCount} rows`);
  }

  // Sample verification - Bidhannagar
  const { data: bidhannagar, error: bdError } = await supabase
    .from('election_results')
    .select('*')
    .eq('constituency_id', 'wb_north_24_parganas_bidhannagar')
    .single();

  if (bdError) {
    console.log('\nBidhannagar verification: Not found or error');
  } else if (bidhannagar) {
    console.log('\n--- Sample: Bidhannagar ---');
    console.log(`Winner 2021: ${bidhannagar.winner_2021} (${bidhannagar.winner_party_2021})`);
    console.log(`Margin 2021: ${bidhannagar.margin_2021}`);
    console.log(`Winner 2016: ${bidhannagar.winner_2016} (${bidhannagar.winner_party_2016})`);
    console.log(`Margin 2016: ${bidhannagar.margin_2016}`);
  }

  // Sample demographics verification
  const { data: bdDemo, error: bdDemoError } = await supabase
    .from('constituency_demographics')
    .select('*')
    .eq('constituency_id', 'wb_north_24_parganas_bidhannagar')
    .single();

  if (!bdDemoError && bdDemo) {
    console.log(`Population: ${bdDemo.total_population?.toLocaleString()}`);
    console.log(`Voters: ${bdDemo.total_voters?.toLocaleString()}`);
    console.log(`Literacy: ${bdDemo.literacy_rate}%`);
    console.log(`Urban: ${bdDemo.urban_percentage}%`);
  }
}

async function main(): Promise<void> {
  console.log('==========================================');
  console.log('  Constituency Data Seeding Script');
  console.log('  West Bengal - 50 Constituencies');
  console.log('==========================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    await seedElectionResults();
    await seedDemographics();
    await verifyData();

    console.log('\n==========================================');
    console.log('  Seeding Complete!');
    console.log('==========================================\n');
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
}

main();
