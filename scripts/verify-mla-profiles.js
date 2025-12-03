#!/usr/bin/env node
/**
 * Verify MLA Profile Data
 * Checks completeness of all 50 constituency profiles
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('='.repeat(70));
  console.log('MLA PROFILE VERIFICATION REPORT');
  console.log('='.repeat(70));

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('leader_profiles')
    .select('*')
    .order('leader_name');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`\nTotal profiles: ${profiles.length}\n`);

  // Calculate statistics
  let withAssets = 0;
  let withEducation = 0;
  let withPhoto = 0;
  let withBiography = 0;
  let withCriminalData = 0;
  let withAge = 0;
  let withProfession = 0;

  const crorepatis = [];
  const withCriminalCases = [];

  for (const p of profiles) {
    if (p.declared_assets_lakhs && p.declared_assets_lakhs > 0) withAssets++;
    if (p.education) withEducation++;
    if (p.photo_url) withPhoto++;
    if (p.age && p.age > 0) withAge++;
    if (p.profession) withProfession++;
    if (p.positions_held && p.positions_held.some(pos => pos.startsWith('Biography:'))) withBiography++;
    if (p.criminal_cases !== null) withCriminalData++;

    // Crorepatis (assets > 100 lakhs = 1 crore)
    if (p.declared_assets_lakhs && p.declared_assets_lakhs >= 100) {
      crorepatis.push({
        name: p.leader_name,
        party: p.party,
        assets: p.declared_assets_lakhs
      });
    }

    // Criminal cases
    if (p.criminal_cases && p.criminal_cases > 0) {
      withCriminalCases.push({
        name: p.leader_name,
        party: p.party,
        cases: p.criminal_cases
      });
    }
  }

  console.log('DATA COMPLETENESS:');
  console.log('-'.repeat(40));
  console.log(`With Assets:     ${withAssets}/50 (${(withAssets/50*100).toFixed(0)}%)`);
  console.log(`With Education:  ${withEducation}/50 (${(withEducation/50*100).toFixed(0)}%)`);
  console.log(`With Age:        ${withAge}/50 (${(withAge/50*100).toFixed(0)}%)`);
  console.log(`With Profession: ${withProfession}/50 (${(withProfession/50*100).toFixed(0)}%)`);
  console.log(`With Photo:      ${withPhoto}/50 (${(withPhoto/50*100).toFixed(0)}%)`);
  console.log(`With Biography:  ${withBiography}/50 (${(withBiography/50*100).toFixed(0)}%)`);
  console.log(`With Criminal:   ${withCriminalData}/50 (${(withCriminalData/50*100).toFixed(0)}%)`);

  console.log('\n' + '='.repeat(70));
  console.log(`CROREPATIS (Assets > Rs 1 Crore): ${crorepatis.length} MLAs`);
  console.log('-'.repeat(70));
  crorepatis
    .sort((a, b) => b.assets - a.assets)
    .slice(0, 10)
    .forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} (${m.party}) - Rs ${(m.assets / 100).toFixed(2)} Crores`);
    });

  console.log('\n' + '='.repeat(70));
  console.log(`MLAs WITH CRIMINAL CASES: ${withCriminalCases.length} MLAs`);
  console.log('-'.repeat(70));
  withCriminalCases
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10)
    .forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} (${m.party}) - ${m.cases} cases`);
    });

  console.log('\n' + '='.repeat(70));
  console.log('PARTY-WISE DISTRIBUTION');
  console.log('-'.repeat(70));
  const partyCount = {};
  for (const p of profiles) {
    partyCount[p.party] = (partyCount[p.party] || 0) + 1;
  }
  Object.entries(partyCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      console.log(`${party}: ${count} MLAs`);
    });

  console.log('\n' + '='.repeat(70));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
