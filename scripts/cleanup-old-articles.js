#!/usr/bin/env node
/**
 * Cleanup Script - Delete Old Tamil Nadu/TVK Articles
 * Removes articles from previous project that are not relevant to West Bengal BJP
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

async function cleanupOldArticles() {
  console.log('Starting cleanup of old Tamil Nadu/TVK articles...\n');

  // Keywords to identify old Tamil Nadu articles
  const tamilKeywords = [
    'chennai', 'tamil', 'tvk', 'thalapathy', 'vijay',
    'coimbatore', 'madurai', 'திருச்சி', 'தமிழ்நாடு'
  ];

  try {
    // First, count articles to be deleted
    const { data: countData, error: countError } = await supabase
      .from('news_articles')
      .select('id, title, source', { count: 'exact' });

    if (countError) {
      console.error('Error fetching articles:', countError.message);
      return;
    }

    console.log(`Total articles in database: ${countData?.length || 0}\n`);

    // Find articles matching Tamil Nadu keywords
    const articlesToDelete = countData?.filter(article => {
      const text = ((article.title || '') + ' ' + (article.source || '')).toLowerCase();
      return tamilKeywords.some(kw => text.includes(kw.toLowerCase()));
    }) || [];

    console.log(`Found ${articlesToDelete.length} articles to delete:\n`);

    // Show articles to be deleted
    articlesToDelete.forEach((article, i) => {
      console.log(`${i + 1}. [${article.source}] ${article.title?.substring(0, 60)}...`);
    });

    if (articlesToDelete.length === 0) {
      console.log('\nNo Tamil Nadu articles found to delete.');
      return;
    }

    // Delete the articles
    console.log('\nDeleting articles...');

    const idsToDelete = articlesToDelete.map(a => a.id);

    const { error: deleteError } = await supabase
      .from('news_articles')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting articles:', deleteError.message);
      return;
    }

    console.log(`\nSuccessfully deleted ${articlesToDelete.length} articles!`);

    // Count remaining articles
    const { count: remaining } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });

    console.log(`Remaining articles in database: ${remaining}`);

  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run cleanup
cleanupOldArticles();
