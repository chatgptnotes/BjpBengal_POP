#!/usr/bin/env node
/**
 * BENGAL NEWS SCRAPER
 * Scrapes West Bengal news sources for BJP mentions and political sentiment
 *
 * Features:
 * - RSS feed parsing (ABP Ananda, Bartaman, Sangbad Pratidin, etc.)
 * - OpenAI/Claude sentiment analysis
 * - Auto-stores in Supabase news_articles table
 *
 * Usage:
 *   node scripts/bengal-news-scraper.js
 *   node scripts/bengal-news-scraper.js --once  (single run, no loop)
 */

import 'dotenv/config';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ================== CONFIGURATION ==================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials!');
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
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8,hi;q=0.7'
  }
});

// West Bengal News Sources (verified working RSS feeds)
const NEWS_SOURCES = [
  // English Sources - West Bengal focused (most reliable)
  {
    id: 'indian-express-kolkata',
    name: 'Indian Express - Kolkata',
    language: 'en',
    rss: 'https://indianexpress.com/section/cities/kolkata/feed/',
    baseUrl: 'https://indianexpress.com',
    credibility: 0.88
  },
  {
    id: 'toi-kolkata',
    name: 'Times of India - Kolkata',
    language: 'en',
    rss: 'https://timesofindia.indiatimes.com/rssfeeds/2128817.cms',
    baseUrl: 'https://timesofindia.indiatimes.com',
    credibility: 0.80
  },
  {
    id: 'hindustan-times-bengal',
    name: 'Hindustan Times - Bengal',
    language: 'en',
    rss: 'https://www.hindustantimes.com/feeds/rss/bengal/rssfeed.xml',
    baseUrl: 'https://www.hindustantimes.com',
    credibility: 0.82
  },
  {
    id: 'thehindu-national',
    name: 'The Hindu',
    language: 'en',
    rss: 'https://www.thehindu.com/news/national/feeder/default.rss',
    baseUrl: 'https://www.thehindu.com',
    credibility: 0.92
  },
  {
    id: 'deccan-herald',
    name: 'Deccan Herald',
    language: 'en',
    rss: 'https://www.deccanherald.com/rss/national',
    baseUrl: 'https://www.deccanherald.com',
    credibility: 0.84
  },
  {
    id: 'firstpost',
    name: 'Firstpost',
    language: 'en',
    rss: 'https://www.firstpost.com/rss/india.xml',
    baseUrl: 'https://www.firstpost.com',
    credibility: 0.78
  },
  {
    id: 'news18-india',
    name: 'News18 India',
    language: 'en',
    rss: 'https://www.news18.com/rss/india.xml',
    baseUrl: 'https://www.news18.com',
    credibility: 0.76
  },
  // Hindi Sources - National coverage with Bengal relevance
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
    id: 'navbharat-times',
    name: 'Navbharat Times',
    language: 'hi',
    rss: 'https://navbharattimes.indiatimes.com/rssfeedstopstories.cms',
    baseUrl: 'https://navbharattimes.indiatimes.com',
    credibility: 0.80
  },
  {
    id: 'hindi-oneindia',
    name: 'Oneindia Hindi',
    language: 'hi',
    rss: 'https://hindi.oneindia.com/rss/hindi-news.xml',
    baseUrl: 'https://hindi.oneindia.com',
    credibility: 0.75
  },
  // Bengali Sources - West Bengal regional (verified working)
  {
    id: 'sangbad-pratidin',
    name: 'Sangbad Pratidin',
    language: 'bn',
    rss: 'https://www.sangbadpratidin.in/feed/',
    baseUrl: 'https://www.sangbadpratidin.in',
    credibility: 0.78
  },
  {
    id: 'bartaman',
    name: 'Bartaman Patrika',
    language: 'bn',
    rss: 'https://bartamanpatrika.com/feed',
    baseUrl: 'https://bartamanpatrika.com',
    credibility: 0.80
  },
  {
    id: 'bengali-news18',
    name: 'News18 Bengali',
    language: 'bn',
    rss: 'https://bengali.news18.com/rss/west-bengal.xml',
    baseUrl: 'https://bengali.news18.com',
    credibility: 0.76
  },
  {
    id: 'kolkata247',
    name: 'Kolkata 24x7',
    language: 'bn',
    rss: 'https://kolkata24x7.com/feed',
    baseUrl: 'https://kolkata24x7.com',
    credibility: 0.72
  },
  {
    id: 'bengali-oneindia',
    name: 'Oneindia Bengali',
    language: 'bn',
    rss: 'https://bengali.oneindia.com/rss/feeds/oneindia-bengali-fb.xml',
    baseUrl: 'https://bengali.oneindia.com',
    credibility: 0.74
  },
  // ================== DISTRICT-SPECIFIC GOOGLE NEWS FEEDS ==================
  // These feeds search for election/BJP news specific to each district
  {
    id: 'google-kolkata-bjp',
    name: 'Google News - Kolkata BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Kolkata+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Kolkata'
  },
  {
    id: 'google-howrah-election',
    name: 'Google News - Howrah Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Howrah+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Howrah'
  },
  {
    id: 'google-siliguri-bjp',
    name: 'Google News - Siliguri BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Siliguri+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Darjeeling'
  },
  {
    id: 'google-barrackpore-election',
    name: 'Google News - Barrackpore Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Barrackpore+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'North 24 Parganas'
  },
  {
    id: 'google-diamond-harbour',
    name: 'Google News - Diamond Harbour',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Diamond+Harbour+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'South 24 Parganas'
  },
  {
    id: 'google-malda-election',
    name: 'Google News - Malda Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Malda+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Malda'
  },
  {
    id: 'google-murshidabad-bjp',
    name: 'Google News - Murshidabad BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Murshidabad+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Murshidabad'
  },
  {
    id: 'google-hooghly-election',
    name: 'Google News - Hooghly Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Hooghly+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Hooghly'
  },
  {
    id: 'google-asansol-bjp',
    name: 'Google News - Asansol BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Asansol+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Purba Bardhaman'
  },
  {
    id: 'google-durgapur-election',
    name: 'Google News - Durgapur Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Durgapur+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Purba Bardhaman'
  },
  {
    id: 'google-nadia-bjp',
    name: 'Google News - Nadia BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Nadia+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Nadia'
  },
  {
    id: 'google-jalpaiguri-election',
    name: 'Google News - Jalpaiguri Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Jalpaiguri+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Jalpaiguri'
  },
  {
    id: 'google-coochbehar-bjp',
    name: 'Google News - Cooch Behar BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Cooch+Behar+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Cooch Behar'
  },
  {
    id: 'google-bankura-election',
    name: 'Google News - Bankura Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Bankura+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Bankura'
  },
  {
    id: 'google-purulia-bjp',
    name: 'Google News - Purulia BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Purulia+BJP+election&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Purulia'
  },
  {
    id: 'google-birbhum-election',
    name: 'Google News - Birbhum Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Birbhum+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Birbhum'
  },
  {
    id: 'google-medinipur-bjp',
    name: 'Google News - Medinipur BJP',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Medinipur+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Paschim Medinipur'
  },
  {
    id: 'google-bardhaman-election',
    name: 'Google News - Bardhaman Election',
    language: 'en',
    rss: 'https://news.google.com/rss/search?q=Bardhaman+election+BJP&hl=en-IN&gl=IN&ceid=IN:en',
    baseUrl: 'https://news.google.com',
    credibility: 0.80,
    district: 'Purba Bardhaman'
  }
];

// BJP Keywords for detection (Bengali, Hindi, English)
const BJP_KEYWORDS = {
  party: [
    'BJP', 'bjp',
    'Bharatiya Janata Party',
    'Bharatiya Janata',
    'Bhartiya Janta Party',
    // Bengali
    'বিজেপি',
    'ভারতীয় জনতা পার্টি',
    'ভারতীয় জনতা দল',
    // Hindi
    'भाजपा',
    'भारतीय जनता पार्टी'
  ],
  leaders: [
    // National leaders
    'Narendra Modi', 'Modi', 'PM Modi', 'নরেন্দ্র মোদী', 'মোদী', 'नरेंद्र मोदी', 'मोदी',
    'Amit Shah', 'অমিত শাহ', 'अमित शाह',
    'J.P. Nadda', 'JP Nadda', 'জে.পি. নাড্ডা', 'जे.पी. नड्डा',
    // West Bengal BJP leaders
    'Sukanta Majumdar', 'সুকান্ত মজুমদার',
    'Dilip Ghosh', 'দিলীপ ঘোষ',
    'Suvendu Adhikari', 'শুভেন্দু অধিকারী',
    'Agnimitra Paul', 'অগ্নিমিত্র পাল',
    'Locket Chatterjee', 'লকেট চ্যাটার্জি',
    'Babul Supriyo', 'বাবুল সুপ্রিয়'
  ],
  related: [
    'NDA',
    'saffron party',
    'lotus party',
    'কমল দল',
    'গেরুয়া দল',
    'West Bengal BJP',
    'পশ্চিমবঙ্গ বিজেপি',
    'Bengal BJP',
    'বাংলা বিজেপি'
  ],
  opponents: [
    // TMC
    'TMC', 'Trinamool', 'তৃণমূল', 'All India Trinamool Congress',
    'Mamata Banerjee', 'মমতা বন্দ্যোপাধ্যায়', 'Didi',
    'Abhishek Banerjee', 'অভিষেক বন্দ্যোপাধ্যায়',
    // Congress
    'Congress', 'INC', 'কংগ্রেস',
    // CPM
    'CPM', 'CPI(M)', 'সিপিএম', 'Left Front', 'বামফ্রন্ট'
  ]
};

const ALL_BJP_KEYWORDS = [...BJP_KEYWORDS.party, ...BJP_KEYWORDS.leaders, ...BJP_KEYWORDS.related];
const POLITICAL_KEYWORDS = [...ALL_BJP_KEYWORDS, ...BJP_KEYWORDS.opponents];

// ================== HELPER FUNCTIONS ==================

/**
 * Strip HTML tags and decode HTML entities from text
 */
function stripHtmlTags(html) {
  if (!html) return '';

  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function containsBJPMention(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return ALL_BJP_KEYWORDS.some(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    return lowerText.includes(lowerKeyword) || text.includes(keyword);
  });
}

function countBJPMentions(text) {
  if (!text) return 0;
  let count = 0;
  ALL_BJP_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

function extractBJPContext(text) {
  if (!text) return null;

  // Find sentences containing BJP keywords
  const sentences = text.split(/[।.!?]+/);
  const bjpSentences = sentences.filter(s => containsBJPMention(s));

  if (bjpSentences.length === 0) return null;

  // Return first 3 sentences with BJP mention
  return bjpSentences.slice(0, 3).join('. ').trim();
}

function isPoliticalNews(text, source) {
  if (!text) return false;
  const lowerText = text.toLowerCase();

  // West Bengal geographic keywords
  const bengalKeywords = [
    'west bengal', 'পশ্চিমবঙ্গ', 'পশ্চিম বাংলা',
    'kolkata', 'কলকাতা', 'calcutta',
    'bengal', 'বাংলা',
    'howrah', 'হাওড়া',
    'siliguri', 'শিলিগুড়ি',
    'darjeeling', 'দার্জিলিং',
    'asansol', 'আসানসোল',
    'durgapur', 'দুর্গাপুর'
  ];

  // Check for Bengal-related content
  const hasBengalContext = bengalKeywords.some(k => lowerText.includes(k.toLowerCase()));

  // Check for political content
  const hasPoliticalContext = POLITICAL_KEYWORDS.some(k => {
    const lowerK = k.toLowerCase();
    return lowerText.includes(lowerK) || text.includes(k);
  });

  // For Bengali sources, be more inclusive
  if (source.language === 'bn') {
    return hasBengalContext || hasPoliticalContext;
  }

  // For other sources, require Bengal or political context
  return hasBengalContext || hasPoliticalContext;
}

async function analyzeSentimentWithAI(text, language) {
  if (!openai) {
    console.warn('  OpenAI not configured, using fallback keyword analysis');
    return keywordBasedSentiment(text);
  }

  try {
    const languageMap = {
      'bn': 'Bengali',
      'en': 'English',
      'hi': 'Hindi'
    };

    const languageName = languageMap[language] || 'English';

    const prompt = `Analyze the sentiment of this ${languageName} news article text about West Bengal politics.

Text: "${text.substring(0, 1500)}"

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
- If the text is about BJP in West Bengal, focus on sentiment towards BJP specifically
- For Bengali text, provide analysis about political sentiment relevant to West Bengal politics`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a political sentiment analysis expert specializing in West Bengal and Indian politics. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0].message.content.trim();
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
    console.error('  OpenAI API error:', error.message);
    return keywordBasedSentiment(text);
  }
}

function keywordBasedSentiment(text) {
  const positiveWords = [
    'good', 'great', 'excellent', 'success', 'win', 'victory', 'growth', 'development',
    'ভালো', 'উন্নয়ন', 'জয়', 'সাফল্য', 'অগ্রগতি',
    'अच्छा', 'विकास', 'जीत', 'सफलता'
  ];
  const negativeWords = [
    'bad', 'terrible', 'fail', 'corruption', 'scandal', 'violence', 'protest', 'crisis',
    'খারাপ', 'দুর্নীতি', 'কেলেঙ্কারি', 'হিংসা', 'সংকট',
    'बुरा', 'भ्रष्टाचार', 'हिंसा', 'विरोध'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.some(p => word.includes(p.toLowerCase()))) score += 0.1;
    if (negativeWords.some(n => word.includes(n.toLowerCase()))) score -= 0.1;
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
  console.log(`Scraping ${source.name} (${source.language.toUpperCase()})...`);

  try {
    const feed = await rssParser.parseURL(source.rss);
    const articles = [];

    for (const item of feed.items.slice(0, 20)) {
      const rawContent = item.contentSnippet || item.content || item.summary || '';
      const content = stripHtmlTags(rawContent);
      const fullText = item.title + ' ' + content;

      const bjpMentioned = containsBJPMention(fullText);

      // Filter: Only process BJP-related or political/regional news
      if (!bjpMentioned && !isPoliticalNews(fullText, source)) {
        continue;
      }

      console.log(`  Found: ${item.title.substring(0, 70)}...`);

      // Analyze sentiment
      const sentiment = await analyzeSentimentWithAI(fullText, source.language);

      // BJP-specific analysis if mentioned
      let bjpSentiment = null;
      if (bjpMentioned) {
        const bjpContext = extractBJPContext(fullText);
        if (bjpContext) {
          bjpSentiment = await analyzeSentimentWithAI(bjpContext, source.language);
        }
      }

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

        // Metadata
        language: source.language,
        credibility_score: source.credibility,

        // District tag (from district-specific feeds)
        district_name: source.district || null
      });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`  Scraped ${articles.length} articles from ${source.name}`);
    return articles;

  } catch (error) {
    console.error(`  Error scraping ${source.name}:`, error.message);
    return [];
  }
}

async function saveArticlesToDatabase(articles) {
  if (articles.length === 0) {
    console.log('No articles to save');
    return { inserted: 0, skipped: 0 };
  }

  console.log(`Saving ${articles.length} articles to database...`);

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
        console.error(`  Error inserting article:`, error.message);
      } else {
        inserted++;
        if (article.bjp_mentioned) {
          console.log(`  Saved BJP article: ${article.title.substring(0, 60)}...`);
        }
      }

    } catch (error) {
      console.error(`  Database error:`, error.message);
    }
  }

  console.log(`  Results: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  return { inserted, skipped };
}

// ================== MAIN SCRAPING LOOP ==================

async function scrapeAllSources() {
  console.log('Starting Bengal News Scraper...');
  console.log(`Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`);

  const allArticles = [];

  for (const source of NEWS_SOURCES) {
    const articles = await scrapeRSSFeed(source);
    allArticles.push(...articles);

    // Wait between sources to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save all articles to database
  const stats = await saveArticlesToDatabase(allArticles);

  console.log('\nSUMMARY:');
  console.log(`  Total articles scraped: ${allArticles.length}`);
  console.log(`  BJP mentions: ${allArticles.filter(a => a.bjp_mentioned).length}`);
  console.log(`  Inserted: ${stats.inserted}`);
  console.log(`  Skipped: ${stats.skipped}`);

  if (allArticles.length > 0) {
    const avgSentiment = allArticles.reduce((sum, a) => sum + a.sentiment_score, 0) / allArticles.length;
    console.log(`  Avg sentiment: ${avgSentiment.toFixed(2)}`);

    const bjpArticles = allArticles.filter(a => a.bjp_mentioned);
    if (bjpArticles.length > 0) {
      const bjpAvgSentiment = bjpArticles.reduce((sum, a) => sum + (a.bjp_sentiment_score || 0), 0) / bjpArticles.length;
      console.log(`  BJP avg sentiment: ${bjpAvgSentiment.toFixed(2)} (${bjpAvgSentiment > 0 ? 'Positive' : bjpAvgSentiment < 0 ? 'Negative' : 'Neutral'})`);
    }
  }

  console.log('\nScraping complete!\n');
}

// ================== SCHEDULER ==================

async function main() {
  const runOnce = process.argv.includes('--once');

  if (runOnce) {
    console.log('Running in single-run mode\n');
    await scrapeAllSources();
    process.exit(0);
  }

  // Continuous mode: Run every 15 minutes
  console.log('Running in continuous mode (every 15 minutes)');
  console.log('Press Ctrl+C to stop\n');

  await scrapeAllSources();

  setInterval(async () => {
    console.log('\n' + '='.repeat(60));
    await scrapeAllSources();
  }, 15 * 60 * 1000); // 15 minutes
}

// Start scraper
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
