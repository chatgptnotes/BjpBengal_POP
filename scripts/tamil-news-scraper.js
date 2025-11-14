#!/usr/bin/env node
/**
 * TAMIL NEWS SCRAPER
 * Scrapes Tamil news sources for TVK mentions and political sentiment
 *
 * Features:
 * - RSS feed parsing (Dinamalar, Dinakaran, etc.)
 * - Web scraping for sites without RSS
 * - OpenAI/Claude sentiment analysis
 * - Auto-stores in Supabase news_articles table
 *
 * Usage:
 *   node scripts/tamil-news-scraper.js
 *   node scripts/tamil-news-scraper.js --once  (single run, no loop)
 */

import 'dotenv/config';
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ================== CONFIGURATION ==================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_SECRET');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8,ta;q=0.7'
  }
});

// Tamil Nadu News Sources
const NEWS_SOURCES = [
  {
    id: 'dinamalar',
    name: 'Dinamalar',
    language: 'ta',
    rss: 'https://www.dinamalar.com/rss/headlines_ta.xml',
    baseUrl: 'https://www.dinamalar.com',
    credibility: 0.85
  },
  {
    id: 'dinakaran',
    name: 'Dinakaran',
    language: 'ta',
    rss: 'https://www.dinakaran.com/rss_dkn.asp',
    baseUrl: 'https://www.dinakaran.com',
    credibility: 0.80
  },
  {
    id: 'tamil-oneindia',
    name: 'Tamil Oneindia',
    language: 'ta',
    rss: 'https://tamil.oneindia.com/rss/tamil-news.xml',
    baseUrl: 'https://tamil.oneindia.com',
    credibility: 0.80
  },
  {
    id: 'daily-thanthi',
    name: 'Daily Thanthi',
    language: 'ta',
    rss: 'http://www.dailythanthi.com/RSS/SectionRss.aspx',
    baseUrl: 'https://www.dailythanthi.com',
    credibility: 0.86
  },
  {
    id: 'hindu-tamil',
    name: 'The Hindu Tamil',
    language: 'ta',
    rss: 'https://tamil.thehindu.com/news/feeder/default.rss',
    baseUrl: 'https://tamil.thehindu.com',
    credibility: 0.90
  },
  {
    id: 'thehindu',
    name: 'The Hindu',
    language: 'en',
    rss: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss',
    baseUrl: 'https://www.thehindu.com',
    credibility: 0.92
  },
  {
    id: 'toi-chennai',
    name: 'Times of India - Chennai',
    language: 'en',
    rss: 'https://timesofindia.indiatimes.com/rssfeeds/2950623.cms',
    baseUrl: 'https://timesofindia.indiatimes.com',
    credibility: 0.78
  },
  {
    id: 'manorama',
    name: 'Malayala Manorama',
    language: 'ml',
    rss: 'https://www.onmanorama.com/news/india.feeds.onmrss.xml',
    baseUrl: 'https://www.onmanorama.com',
    credibility: 0.88
  },
  {
    id: 'mathrubhumi',
    name: 'Mathrubhumi',
    language: 'ml',
    rss: 'http://feeds.feedburner.com/mathrubhumi',
    baseUrl: 'https://www.mathrubhumi.com',
    credibility: 0.87
  },
  {
    id: 'indian-express',
    name: 'Indian Express - Tamil Nadu',
    language: 'en',
    rss: 'https://indianexpress.com/section/cities/chennai/feed/',
    baseUrl: 'https://indianexpress.com',
    credibility: 0.90
  },
  {
    id: 'deccan-chronicle',
    name: 'Deccan Chronicle',
    language: 'en',
    rss: 'https://www.deccanchronicle.com/rss_feed/chennai',
    baseUrl: 'https://www.deccanchronicle.com',
    credibility: 0.76
  },
  {
    id: 'newindian-express',
    name: 'New Indian Express - Tamil Nadu',
    language: 'en',
    rss: 'https://www.newindianexpress.com/states/tamil-nadu?widgetName=rssfeed&widgetId=1216758&getXmlFeed=true',
    baseUrl: 'https://www.newindianexpress.com',
    credibility: 0.84
  },
  {
    id: 'amar-ujala',
    name: 'Amar Ujala',
    language: 'hi',
    rss: 'https://www.amarujala.com/rss/india-news.xml',
    baseUrl: 'https://www.amarujala.com',
    credibility: 0.85
  },
  {
    id: 'dainik-jagran',
    name: 'Dainik Jagran',
    language: 'hi',
    rss: 'http://rss.jagran.com/rss/news/national.xml',
    baseUrl: 'https://www.jagran.com',
    credibility: 0.88
  },
  {
    id: 'aaj-tak',
    name: 'Aaj Tak',
    language: 'hi',
    rss: 'https://www.aajtak.in/rssfeeds/?id=home',
    baseUrl: 'https://www.aajtak.in',
    credibility: 0.78
  },
  {
    id: 'zee-news-hindi',
    name: 'Zee News Hindi',
    language: 'hi',
    rss: 'https://zeenews.india.com/hindi/rss.xml',
    baseUrl: 'https://zeenews.india.com/hindi',
    credibility: 0.82
  },
  {
    id: 'hindi-oneindia',
    name: 'Hindi Oneindia',
    language: 'hi',
    rss: 'https://hindi.oneindia.com/rss/hindi-news.xml',
    baseUrl: 'https://hindi.oneindia.com',
    credibility: 0.80
  }
];

// TVK Keywords for detection
const TVK_KEYWORDS = {
  party: ['TVK', 'தமிழக வெற்றி கழகம்', 'Tamilaga Vettri Kazhagam', 'தவக', 'தமிழக வெற்றிக் கழகம்'],
  leader: ['Vijay', 'விஜய்', 'Thalapathy', 'தளபதி', 'Thalapathy Vijay', 'தளபதி விஜய்', 'Joseph Vijay', 'Actor Vijay'],
  related: ['TVK party', 'Vijay party', 'விஜய் கட்சி', 'தமிழக அரசியல்']
};

const ALL_TVK_KEYWORDS = [...TVK_KEYWORDS.party, ...TVK_KEYWORDS.leader, ...TVK_KEYWORDS.related];

// ================== HELPER FUNCTIONS ==================

/**
 * Strip HTML tags and decode HTML entities from text
 * @param {string} html - Text potentially containing HTML
 * @returns {string} Clean text without HTML tags
 */
function stripHtmlTags(html) {
  if (!html) return '';

  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')  // Remove script tags and content
    .replace(/<style[^>]*>.*?<\/style>/gi, '')    // Remove style tags and content
    .replace(/<[^>]+>/g, '')                       // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')                       // Replace &nbsp; with space
    .replace(/&amp;/g, '&')                        // Decode &amp;
    .replace(/&lt;/g, '<')                         // Decode &lt;
    .replace(/&gt;/g, '>')                         // Decode &gt;
    .replace(/&quot;/g, '"')                       // Decode &quot;
    .replace(/&#39;/g, "'")                        // Decode &#39;
    .replace(/&apos;/g, "'")                       // Decode &apos;
    .replace(/\s+/g, ' ')                          // Normalize multiple spaces
    .trim();                                        // Remove leading/trailing whitespace
}

function containsTVKMention(text) {
  if (!text) return false;
  return ALL_TVK_KEYWORDS.some(keyword => text.includes(keyword));
}

function countTVKMentions(text) {
  if (!text) return 0;
  let count = 0;
  ALL_TVK_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

function extractTVKContext(text) {
  if (!text) return null;

  // Find sentences containing TVK keywords
  const sentences = text.split(/[।.!?]+/);
  const tvkSentences = sentences.filter(s => containsTVKMention(s));

  if (tvkSentences.length === 0) return null;

  // Return first 3 sentences with TVK mention
  return tvkSentences.slice(0, 3).join('. ').trim();
}

async function analyzeSentimentWithAI(text, language) {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback keyword analysis');
    return keywordBasedSentiment(text);
  }

  try {
    const languageMap = {
      'ta': 'Tamil',
      'ml': 'Malayalam',
      'en': 'English',
      'hi': 'Hindi'
    };

    const languageName = languageMap[language] || 'English';

    const prompt = `Analyze the sentiment of this ${languageName} news article text.

Text: "${text}"

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "sentiment_score": <number between -1 and 1>,
  "sentiment_polarity": "<positive/negative/neutral>",
  "emotion": "<anger/trust/fear/hope/pride/joy/sadness/surprise/disgust/neutral>",
  "confidence": <number between 0 and 1>,
  "summary": "<2-3 sentence summary in English>"
}

Rules:
- sentiment_score: -1 (very negative) to +1 (very positive)
- confidence: How confident you are in the analysis
- If the text is about TVK/Vijay party or Kerala/Tamil Nadu politics, focus on sentiment towards them specifically
- For Malayalam text, provide analysis about political sentiment relevant to South Indian politics`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a political sentiment analysis expert specializing in Tamil Nadu politics. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(jsonStr);

    return {
      sentiment_score: result.sentiment_score,
      sentiment_polarity: result.sentiment_polarity,
      emotion: result.emotion,
      confidence: result.confidence,
      summary: result.summary
    };
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    return keywordBasedSentiment(text);
  }
}

function keywordBasedSentiment(text) {
  // Fallback: Simple keyword-based sentiment
  const positiveWords = ['good', 'great', 'excellent', 'success', 'win', 'அருமை', 'நல்ல', 'வெற்றி'];
  const negativeWords = ['bad', 'terrible', 'fail', 'corruption', 'scandal', 'கெட்ட', 'மோசம்', 'ஊழல்'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.some(p => word.includes(p))) score += 0.1;
    if (negativeWords.some(n => word.includes(n))) score -= 0.1;
  });

  score = Math.max(-1, Math.min(1, score));

  return {
    sentiment_score: score,
    sentiment_polarity: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
    emotion: 'neutral',
    confidence: 0.5
  };
}

// ================== SCRAPING FUNCTIONS ==================

async function scrapeRSSFeed(source) {
  console.log(`📰 Scraping ${source.name} (${source.language.toUpperCase()})...`);

  try {
    const feed = await rssParser.parseURL(source.rss);
    const articles = [];

    for (const item of feed.items.slice(0, 20)) { // Latest 20 articles
      const tvkMentioned = containsTVKMention(item.title + ' ' + (item.contentSnippet || item.content || ''));

      // Only process articles with TVK mention OR major political/regional news
      const isPoliticalNews = item.title.toLowerCase().includes('tamil nadu') ||
                             item.title.toLowerCase().includes('kerala') ||
                             item.title.toLowerCase().includes('chennai') ||
                             item.title.toLowerCase().includes('thiruvananthapuram') ||
                             item.title.toLowerCase().includes('കേരളം') ||
                             item.title.toLowerCase().includes('തമിഴ്‌നാട്');

      if (!tvkMentioned && !isPoliticalNews && source.language !== 'ml') {
        continue;
      }

      // For Malayalam sources, take more articles since they cover broader South Indian news
      if (source.language === 'ml' && !isPoliticalNews) {
        continue;
      }

      // Extract content and strip HTML tags
      const rawContent = item.contentSnippet || item.content || item.summary || '';
      const content = stripHtmlTags(rawContent);
      const fullText = item.title + ' ' + content;

      console.log(`  📄 ${item.title.substring(0, 80)}...`);

      // Analyze sentiment
      const sentiment = await analyzeSentimentWithAI(fullText, source.language);

      // TVK-specific analysis if mentioned
      let tvkSentiment = null;
      if (tvkMentioned) {
        const tvkContext = extractTVKContext(fullText);
        if (tvkContext) {
          tvkSentiment = await analyzeSentimentWithAI(tvkContext, source.language);
        }
      }

      // Clean summary from sentiment or create from cleaned content
      const cleanSummary = sentiment.summary
        ? stripHtmlTags(sentiment.summary)
        : content.substring(0, 300) + (content.length > 300 ? '...' : '');

      articles.push({
        title: item.title,
        content: content,
        summary: cleanSummary,
        url: item.link,
        source: source.name,
        author: item.creator || item.author || null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),

        // Sentiment
        sentiment_score: sentiment.sentiment_score,
        sentiment_polarity: sentiment.sentiment_polarity,
        emotion: sentiment.emotion,
        confidence: sentiment.confidence,

        // TVK Specific
        tvk_mentioned: tvkMentioned,
        tvk_mention_count: tvkMentioned ? countTVKMentions(fullText) : 0,
        tvk_context: tvkMentioned ? extractTVKContext(fullText) : null,
        tvk_sentiment_score: tvkSentiment?.sentiment_score || null,
        tvk_sentiment_polarity: tvkSentiment?.sentiment_polarity || null,

        language: source.language,
        credibility_score: source.credibility,
        analyzed_at: new Date().toISOString()
      });

      // Rate limiting (OpenAI has 3 RPM limit on free tier)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`  ✅ Scraped ${articles.length} articles from ${source.name}`);
    return articles;

  } catch (error) {
    console.error(`  ❌ Error scraping ${source.name}:`, error.message);
    return [];
  }
}

async function saveArticlesToDatabase(articles) {
  if (articles.length === 0) {
    console.log('ℹ️  No articles to save');
    return { inserted: 0, skipped: 0 };
  }

  console.log(`💾 Saving ${articles.length} articles to database...`);

  let inserted = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      // Check if article already exists by URL
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('url', article.url)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Insert new article
      const { error } = await supabase
        .from('news_articles')
        .insert([article]);

      if (error) {
        console.error(`  ❌ Error inserting article:`, error.message);
      } else {
        inserted++;
        if (article.tvk_mentioned) {
          console.log(`  ✅ Saved TVK article: ${article.title.substring(0, 60)}...`);
        }
      }

    } catch (error) {
      console.error(`  ❌ Database error:`, error.message);
    }
  }

  console.log(`  📊 Results: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  return { inserted, skipped };
}

// ================== MAIN SCRAPING LOOP ==================

async function scrapeAllSources() {
  console.log('🚀 Starting Tamil News Scraper...');
  console.log(`⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`);

  const allArticles = [];

  for (const source of NEWS_SOURCES) {
    const articles = await scrapeRSSFeed(source);
    allArticles.push(...articles);

    // Wait between sources to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save all articles to database
  const stats = await saveArticlesToDatabase(allArticles);

  console.log('\n📈 SUMMARY:');
  console.log(`  Total articles scraped: ${allArticles.length}`);
  console.log(`  TVK mentions: ${allArticles.filter(a => a.tvk_mentioned).length}`);
  console.log(`  Inserted: ${stats.inserted}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Avg sentiment: ${(allArticles.reduce((sum, a) => sum + a.sentiment_score, 0) / allArticles.length).toFixed(2)}`);

  const tvkArticles = allArticles.filter(a => a.tvk_mentioned);
  if (tvkArticles.length > 0) {
    const tvkAvgSentiment = tvkArticles.reduce((sum, a) => sum + (a.tvk_sentiment_score || 0), 0) / tvkArticles.length;
    console.log(`  TVK avg sentiment: ${tvkAvgSentiment.toFixed(2)} (${tvkAvgSentiment > 0 ? 'Positive' : 'Negative'})`);
  }

  console.log('\n✅ Scraping complete!\n');
}

// ================== SCHEDULER ==================

async function main() {
  const runOnce = process.argv.includes('--once');

  if (runOnce) {
    console.log('📍 Running in single-run mode\n');
    await scrapeAllSources();
    process.exit(0);
  }

  // Continuous mode: Run every 15 minutes
  console.log('🔄 Running in continuous mode (every 15 minutes)');
  console.log('   Press Ctrl+C to stop\n');

  await scrapeAllSources();

  setInterval(async () => {
    console.log('\n' + '='.repeat(60));
    await scrapeAllSources();
  }, 15 * 60 * 1000); // 15 minutes
}

// Start scraper
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
