#!/usr/bin/env node
/**
 * Reset and Re-scrape Script
 * Clears all articles from database and runs a fresh scrape
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function clearAllArticles() {
  console.log('Clearing all articles from database...\n');

  try {
    // Get count before delete
    const { count: beforeCount } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });

    console.log(`Articles before: ${beforeCount}`);

    // Delete all articles
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq on impossible value)

    if (error) {
      console.error('Error deleting articles:', error.message);
      return false;
    }

    // Get count after delete
    const { count: afterCount } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });

    console.log(`Articles after: ${afterCount}`);
    console.log(`\nSuccessfully deleted ${beforeCount - afterCount} articles!\n`);

    return true;

  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Run
clearAllArticles().then(success => {
  if (success) {
    console.log('Database cleared! Now run the scraper:');
    console.log('  node scripts/bengal-news-scraper.js --once');
  }
});
