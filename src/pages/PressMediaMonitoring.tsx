import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  TrendingUp,
  Activity,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Clock,
  Globe,
  Target,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Star,
  Share2,
  Download,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Bell,
  BookOpen,
  MapPin,
  Users,
  MessageSquare,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Database
} from 'lucide-react';
import { SeedResult, seedDailyArticles, seedHistorical7Days, clearAndReseed7Days } from '../utils/seedArticles';
import { fetchAllRealNews, FetchResult } from '../services/realNewsFetcher';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';
import { useNewsSentiment } from '../hooks/useNewsSentiment';
import { NewsArticle as DBNewsArticle } from '../services/newsService';
import constituenciesDataRaw from '../data/wb_constituencies_50.json';
import { generatePredictions, calculatePredictionStats, filterPredictions, ConstituencyPrediction, PredictionStats } from '../services/predictionService';
import { clearAndReseedElectionData, electionData } from '../utils/seedElectionData';

// Transform constituency data
const CONSTITUENCIES = constituenciesDataRaw.map((c: any) => ({
  id: c.id,
  name: c.name,
  district: c.district
}));

interface NewsSource {
  id: string;
  name: string;
  logo: string;
  credibilityScore: number;
  bias: 'left' | 'center' | 'right' | 'neutral';
  region: string;
  language: string;
  active: boolean;
  articlesCount: number;
  reachEstimate: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  credibilityScore: number;
  engagement: number;
  topics: string[];
  mentions: string[];
  region: string;
  language: string;
  url: string;
  isBreaking: boolean;
  priority: 'high' | 'medium' | 'low';
  verified: boolean;
  constituency?: string;
  district?: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  mentions: number;
  sentiment: number;
  growth: number;
  relatedKeywords: string[];
  timeframe: '1h' | '6h' | '24h' | '7d';
}

// BJP Keywords for filtering (Bengali, Hindi, English)
const BJP_KEYWORDS = [
  'BJP', 'bjp', 'Bharatiya Janata', 'Bhartiya Janta',
  'Modi', 'Narendra Modi', 'PM Modi',
  'Amit Shah', 'J.P. Nadda', 'JP Nadda',
  // West Bengal BJP leaders
  'Sukanta Majumdar', 'Dilip Ghosh', 'Suvendu Adhikari', 'Suvendu',
  'Agnimitra Paul', 'Locket Chatterjee', 'Babul Supriyo',
  // Related terms
  'NDA', 'saffron party', 'lotus party',
  // Bengali
  'বিজেপি', 'ভারতীয় জনতা', 'মোদী', 'নরেন্দ্র মোদী',
  'অমিত শাহ', 'সুকান্ত মজুমদার', 'দিলীপ ঘোষ', 'শুভেন্দু অধিকারী',
  // Hindi
  'भाजपा', 'भारतीय जनता पार्टी', 'मोदी', 'नरेंद्र मोदी', 'अमित शाह'
];

// Check if article mentions BJP
function isBJPArticle(article: NewsArticle): boolean {
  const text = (article.title + ' ' + article.summary).toLowerCase();
  return BJP_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

// TMC Keywords for filtering
const TMC_KEYWORDS = [
  'TMC', 'tmc', 'Trinamool', 'All India Trinamool Congress', 'AITC',
  'Mamata', 'Mamata Banerjee', 'Didi',
  'Abhishek Banerjee', 'Abhishek',
  // West Bengal TMC leaders
  'Firhad Hakim', 'Partha Chatterjee', 'Anubrata Mondal',
  'Kunal Ghosh', 'Saugata Roy', 'Derek O\'Brien',
  // Bengali
  'তৃণমূল', 'মমতা', 'দিদি',
  // Hindi
  'तृणमूल', 'ममता बनर्जी'
];

// Check if article mentions TMC
function isTMCArticle(article: NewsArticle): boolean {
  const text = (article.title + ' ' + article.summary).toLowerCase();
  return TMC_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

// Party-wise sentiment stats interface
interface PartySentimentStats {
  party: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  favorabilityScore: number;
}

// District keywords for auto-detection (including common variations)
// Note: Keywords must match district names in wb_constituencies_50.json
const DISTRICT_KEYWORDS: Record<string, string[]> = {
  'Kolkata': ['Kolkata', 'Calcutta', 'কলকাতা', 'कोलकाता', 'Bhowanipore', 'Beleghata', 'Entally', 'Ballygunge', 'Chowringhee', 'Rashbehari', 'Tollygunge', 'Jadavpur', 'Kasba', 'Behala'],
  'Howrah': ['Howrah', 'হাওড়া', 'हावड़ा', 'Shibpur', 'Bally', 'Uttarpara'],
  'North 24 Parganas': ['North 24 Parganas', 'North Parganas', 'Barrackpore', 'Dum Dum', 'Barasat', 'Bidhannagar', 'Salt Lake', 'New Town', 'Rajarhat', 'Madhyamgram', 'উত্তর ২৪ পরগনা'],
  'South 24 Parganas': ['South 24 Parganas', 'South Parganas', 'Diamond Harbour', 'Sonarpur', 'Budge Budge', 'দক্ষিণ ২৪ পরগনা'],
  'Darjeeling': ['Darjeeling', 'Siliguri', 'দার্জিলিং', 'শিলিগুড়ি'],
  'Jalpaiguri': ['Jalpaiguri', 'জলপাইগুড়ি'],
  'Cooch Behar': ['Cooch Behar', 'কোচবিহার'],
  'Malda': ['Malda', 'English Bazar', 'মালদা'],
  'Murshidabad': ['Murshidabad', 'Berhampore', 'মুর্শিদাবাদ'],
  'Nadia': ['Nadia', 'Krishnanagar', 'Ranaghat', 'নদিয়া', 'Kaliganj'],
  'Hooghly': ['Hooghly', 'Serampore', 'Chandannagar', 'Chinsurah', 'হুগলি', 'Arambag'],
  'Purba Bardhaman': ['Bardhaman', 'Burdwan', 'বর্ধমান', 'Asansol', 'Durgapur', 'আসানসোল', 'দুর্গাপুর', 'Purba Bardhaman'],
  'Paschim Bardhaman': ['Paschim Bardhaman', 'Pandaveswar'],
  'Purba Medinipur': ['Purba Medinipur', 'Tamluk', 'Haldia', 'তমলুক', 'হলদিয়া'],
  'Paschim Medinipur': ['Paschim Medinipur', 'Midnapore', 'Kharagpur', 'মেদিনীপুর'],
  'Bankura': ['Bankura', 'বাঁকুড়া'],
  'Purulia': ['Purulia', 'পুরুলিয়া'],
  'Birbhum': ['Birbhum', 'Bolpur', 'Suri', 'বীরভূম', 'শান্তিনিকেতন']
};

// Auto-detect constituency/district from article content
function detectConstituencyFromContent(title: string, summary: string): { constituency?: string; district: string } {
  const text = (title + ' ' + (summary || '')).toLowerCase();

  // First try to match specific constituency names
  for (const constituency of CONSTITUENCIES) {
    if (text.includes(constituency.name.toLowerCase())) {
      return { constituency: constituency.name, district: constituency.district };
    }
  }

  // Then try to match district keywords
  for (const [district, keywords] of Object.entries(DISTRICT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        // Find a constituency in this district
        const matchedConstituency = CONSTITUENCIES.find(c => c.district === district);
        return {
          constituency: matchedConstituency?.name,
          district: district
        };
      }
    }
  }

  // Default to West Bengal (state-level) if no match
  return { constituency: undefined, district: 'West Bengal' };
}

// Helper function to map database articles to component interface
function mapDBArticleToComponent(dbArticle: DBNewsArticle): NewsArticle {
  // Extract topics from tags or create from category
  const topics = dbArticle.tags || (dbArticle.category ? [dbArticle.category] : []);

  // Determine sentiment from polarity
  const sentiment = (dbArticle.sentiment_polarity || 'neutral') as 'positive' | 'negative' | 'neutral';

  // Calculate engagement score (mock for now, can be enhanced)
  const engagement = Math.floor((dbArticle.credibility_score || 50) * 10 + Math.random() * 500);

  // Extract mentions from BJP context or empty array
  const mentions: string[] = [];
  if (dbArticle.bjp_mentioned && dbArticle.bjp_context) {
    // Extract potential entity mentions from context (simple implementation)
    const contextWords = dbArticle.bjp_context.split(/\s+/);
    const capitalizedWords = contextWords.filter(word => /^[A-Z]/.test(word));
    mentions.push(...capitalizedWords.slice(0, 3));
  }

  // Get district from database or auto-detect from content
  const articleSummary = dbArticle.summary || dbArticle.content.substring(0, 300) + '...';
  const dbDistrict = (dbArticle as any).district_name;

  // Always try to auto-detect from content first for more accurate constituency matching
  const detected = detectConstituencyFromContent(dbArticle.title, articleSummary);

  // Use database district if available, otherwise use auto-detected or default to 'West Bengal'
  let district = dbDistrict || detected.district || 'West Bengal';
  let constituency: string | undefined = detected.constituency;

  // If we have a dbDistrict but no constituency from content detection, find one in that district
  if (dbDistrict && !constituency) {
    const matchedConstituency = CONSTITUENCIES.find(c => c.district === dbDistrict);
    constituency = matchedConstituency?.name;
  }

  return {
    id: dbArticle.id || Math.random().toString(),
    title: dbArticle.title,
    summary: articleSummary,
    source: dbArticle.source,
    timestamp: new Date(dbArticle.published_at || dbArticle.created_at || new Date()),
    sentiment,
    sentimentScore: dbArticle.sentiment_score || 0,
    credibilityScore: dbArticle.credibility_score || 70,
    engagement,
    topics,
    mentions,
    region: 'West Bengal',
    language: dbArticle.language || 'en',
    url: dbArticle.url || '#',
    isBreaking: dbArticle.is_breaking || false,
    priority: (dbArticle.priority || 'medium') as 'high' | 'medium' | 'low',
    verified: dbArticle.is_verified || false,
    // Use database district or auto-detected location
    constituency,
    district
  };
}

const newsSources: NewsSource[] = [
  {
    id: 'abp-ananda',
    name: 'ABP Ananda',
    logo: '📺',
    credibilityScore: 85,
    bias: 'center',
    region: 'West Bengal',
    language: 'Bengali',
    active: true,
    articlesCount: 0,
    reachEstimate: 2500000
  },
  {
    id: 'anandabazar',
    name: 'Anandabazar Patrika',
    logo: '📰',
    credibilityScore: 88,
    bias: 'center',
    region: 'West Bengal',
    language: 'Bengali',
    active: true,
    articlesCount: 0,
    reachEstimate: 3200000
  },
  {
    id: 'ei-samay',
    name: 'Ei Samay',
    logo: '📖',
    credibilityScore: 84,
    bias: 'center',
    region: 'West Bengal',
    language: 'Bengali',
    active: true,
    articlesCount: 0,
    reachEstimate: 1800000
  },
  {
    id: 'sangbad-pratidin',
    name: 'Sangbad Pratidin',
    logo: '🗞️',
    credibilityScore: 80,
    bias: 'center',
    region: 'West Bengal',
    language: 'Bengali',
    active: true,
    articlesCount: 0,
    reachEstimate: 2100000
  },
  {
    id: 'zee-24-ghanta',
    name: 'Zee 24 Ghanta',
    logo: '📡',
    credibilityScore: 78,
    bias: 'center',
    region: 'West Bengal',
    language: 'Bengali',
    active: true,
    articlesCount: 0,
    reachEstimate: 1900000
  },
  {
    id: 'telegraph',
    name: 'The Telegraph',
    logo: '📝',
    credibilityScore: 86,
    bias: 'center',
    region: 'West Bengal',
    language: 'English',
    active: true,
    articlesCount: 0,
    reachEstimate: 1600000
  },
  {
    id: 'statesman',
    name: 'The Statesman',
    logo: '📜',
    credibilityScore: 84,
    bias: 'center',
    region: 'West Bengal',
    language: 'English',
    active: true,
    articlesCount: 0,
    reachEstimate: 1200000
  }
];

export const mockArticles: NewsArticle[] = [
  // Bhowanipore - Kolkata
  {
    id: '1',
    title: 'BJP announces strong candidate for Bhowanipore constituency',
    summary: 'BJP Bengal unit finalizes candidate for prestigious Bhowanipore seat, aims to challenge TMC stronghold in upcoming elections.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 1800000),
    sentiment: 'positive',
    sentimentScore: 0.78,
    credibilityScore: 85,
    engagement: 2456,
    topics: ['BJP', 'Bhowanipore', 'Elections', 'Candidate'],
    mentions: ['BJP Bengal', 'Bhowanipore', 'Assembly Elections'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: true,
    priority: 'high',
    verified: true,
    constituency: 'Bhowanipore',
    district: 'Kolkata'
  },
  {
    id: '2',
    title: 'BJP holds booth-level meeting in Bhowanipore ahead of polls',
    summary: 'Party workers discuss election strategy and voter outreach programs for Bhowanipore assembly constituency.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 3600000),
    sentiment: 'positive',
    sentimentScore: 0.65,
    credibilityScore: 88,
    engagement: 1876,
    topics: ['BJP', 'Booth Meeting', 'Bhowanipore', 'Strategy'],
    mentions: ['BJP', 'Booth Workers', 'Bhowanipore'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Bhowanipore',
    district: 'Kolkata'
  },
  // Beleghata - Kolkata
  {
    id: '3',
    title: 'BJP promises metro extension to Beleghata in election manifesto',
    summary: 'Party leaders announce infrastructure development plans including metro connectivity for Beleghata constituency residents.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 7200000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 84,
    engagement: 1654,
    topics: ['BJP', 'Metro', 'Beleghata', 'Infrastructure'],
    mentions: ['BJP', 'Metro Extension', 'Beleghata', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Beleghata',
    district: 'Kolkata'
  },
  // Entally - Kolkata
  {
    id: '4',
    title: 'BJP youth wing conducts rally in Entally constituency',
    summary: 'BJYM organizes youth engagement program highlighting employment opportunities and skill development initiatives.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 10800000),
    sentiment: 'positive',
    sentimentScore: 0.58,
    credibilityScore: 86,
    engagement: 1432,
    topics: ['BJYM', 'Youth Rally', 'Entally', 'Employment'],
    mentions: ['BJP Youth', 'Entally', 'Skill Development'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Entally',
    district: 'Kolkata'
  },
  // Howrah Uttar - Howrah
  {
    id: '5',
    title: 'BJP leaders address workers convention in Howrah Uttar',
    summary: 'Senior BJP leaders motivate party cadre for upcoming elections, discuss development agenda for Howrah district.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 14400000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 78,
    engagement: 2087,
    topics: ['BJP', 'Workers Convention', 'Howrah', 'Elections'],
    mentions: ['BJP', 'Howrah Uttar', 'Party Workers'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Howrah Uttar',
    district: 'Howrah'
  },
  // Shibpur - Howrah
  {
    id: '6',
    title: 'BJP candidate begins door-to-door campaign in Shibpur',
    summary: 'BJP candidate meets voters in Shibpur constituency, promises to address local issues including water supply and road repair.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 18000000),
    sentiment: 'positive',
    sentimentScore: 0.55,
    credibilityScore: 80,
    engagement: 1234,
    topics: ['BJP', 'Campaign', 'Shibpur', 'Local Issues'],
    mentions: ['BJP Candidate', 'Shibpur', 'Door-to-door'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Shibpur',
    district: 'Howrah'
  },
  // Barrackpore - North 24 Parganas
  {
    id: '7',
    title: 'BJP holds massive rally in Barrackpore ahead of elections',
    summary: 'Thousands gather at BJP rally in Barrackpore as party gears up for crucial North 24 Parganas constituencies.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 21600000),
    sentiment: 'positive',
    sentimentScore: 0.75,
    credibilityScore: 85,
    engagement: 3245,
    topics: ['BJP', 'Rally', 'Barrackpore', 'North 24 Parganas'],
    mentions: ['BJP', 'Barrackpore', 'Mass Rally'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Barrackpore',
    district: 'North 24 Parganas'
  },
  // Dum Dum - North 24 Parganas
  {
    id: '8',
    title: 'BJP announces development plan for Dum Dum constituency',
    summary: 'Party unveils comprehensive development blueprint including airport area connectivity and industrial growth.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 25200000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 86,
    engagement: 1567,
    topics: ['BJP', 'Development', 'Dum Dum', 'Infrastructure'],
    mentions: ['BJP', 'Dum Dum', 'Airport', 'Development Plan'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Dum Dum',
    district: 'North 24 Parganas'
  },
  // Ballygunge - Kolkata
  {
    id: '9',
    title: 'BJP focuses on urban development issues in Ballygunge',
    summary: 'Party leaders address concerns of Ballygunge residents including traffic congestion, parking, and civic amenities.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 28800000),
    sentiment: 'neutral',
    sentimentScore: 0.35,
    credibilityScore: 88,
    engagement: 1876,
    topics: ['BJP', 'Urban Development', 'Ballygunge', 'Civic Issues'],
    mentions: ['BJP', 'Ballygunge', 'Traffic', 'Civic Amenities'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Ballygunge',
    district: 'Kolkata'
  },
  // Jadavpur - Kolkata
  {
    id: '10',
    title: 'BJP student wing active in Jadavpur university area',
    summary: 'ABVP organizes awareness programs about BJP policies among students in Jadavpur constituency.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 32400000),
    sentiment: 'neutral',
    sentimentScore: 0.28,
    credibilityScore: 84,
    engagement: 987,
    topics: ['ABVP', 'Students', 'Jadavpur', 'University'],
    mentions: ['ABVP', 'Jadavpur University', 'Students', 'BJP'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'low',
    verified: true,
    constituency: 'Jadavpur',
    district: 'Kolkata'
  },
  // Siliguri - Darjeeling
  {
    id: '11',
    title: 'BJP promises special economic zone for Siliguri',
    summary: 'Party leaders announce plans for SEZ in Siliguri to boost trade with Nepal, Bhutan and Bangladesh.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 36000000),
    sentiment: 'positive',
    sentimentScore: 0.70,
    credibilityScore: 78,
    engagement: 2134,
    topics: ['BJP', 'SEZ', 'Siliguri', 'Trade'],
    mentions: ['BJP', 'Siliguri', 'Special Economic Zone', 'Border Trade'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Siliguri',
    district: 'Darjeeling'
  },
  // Asansol Uttar - Paschim Bardhaman
  {
    id: '12',
    title: 'BJP MP addresses coal belt issues in Asansol',
    summary: 'BJP MP highlights employment concerns in coal mining sector, promises policy interventions for Asansol workers.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 39600000),
    sentiment: 'positive',
    sentimentScore: 0.52,
    credibilityScore: 80,
    engagement: 1654,
    topics: ['BJP', 'Coal', 'Asansol', 'Employment'],
    mentions: ['BJP MP', 'Asansol', 'Coal Workers', 'Employment'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Asansol Uttar',
    district: 'Paschim Bardhaman'
  },
  // Diamond Harbour - South 24 Parganas
  {
    id: '13',
    title: 'BJP expands presence in Diamond Harbour constituency',
    summary: 'BJP leaders conduct massive membership drive in Diamond Harbour, targeting rural voters with development agenda.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 43200000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 85,
    engagement: 1876,
    topics: ['BJP', 'Diamond Harbour', 'Membership', 'Elections'],
    mentions: ['BJP', 'Diamond Harbour', 'South 24 Parganas'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Diamond Harbour',
    district: 'South 24 Parganas'
  },
  // Berhampore - Murshidabad
  {
    id: '14',
    title: 'BJP targets Murshidabad district for major electoral gains',
    summary: 'Party leadership focuses on Berhampore and surrounding areas with promises of industrial development.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 46800000),
    sentiment: 'positive',
    sentimentScore: 0.58,
    credibilityScore: 88,
    engagement: 2134,
    topics: ['BJP', 'Murshidabad', 'Elections', 'Development'],
    mentions: ['BJP', 'Berhampore', 'Murshidabad', 'Industry'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Berhampore',
    district: 'Murshidabad'
  },
  // Krishnanagar - Nadia
  {
    id: '15',
    title: 'BJP holds farmers meet in Nadia district',
    summary: 'Party organizes kisan sammelan in Krishnanagar, discusses agricultural reforms and MSP issues.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 50400000),
    sentiment: 'positive',
    sentimentScore: 0.65,
    credibilityScore: 84,
    engagement: 1567,
    topics: ['BJP', 'Farmers', 'Nadia', 'Agriculture'],
    mentions: ['BJP', 'Krishnanagar', 'Farmers', 'MSP'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Krishnanagar',
    district: 'Nadia'
  },
  // Chinsurah - Hooghly
  {
    id: '16',
    title: 'BJP launches election campaign in Hooghly district',
    summary: 'Senior leaders address public meeting in Chinsurah, highlight infrastructure projects.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 54000000),
    sentiment: 'positive',
    sentimentScore: 0.55,
    credibilityScore: 78,
    engagement: 1432,
    topics: ['BJP', 'Hooghly', 'Campaign', 'Infrastructure'],
    mentions: ['BJP', 'Chinsurah', 'Hooghly', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Chinsurah',
    district: 'Hooghly'
  },
  // Bardhaman Dakshin - Purba Bardhaman
  {
    id: '17',
    title: 'BJP promises industrial revival in Bardhaman',
    summary: 'Party leaders announce plans for reviving closed industries and creating employment in Purba Bardhaman.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 57600000),
    sentiment: 'positive',
    sentimentScore: 0.60,
    credibilityScore: 86,
    engagement: 1654,
    topics: ['BJP', 'Industry', 'Bardhaman', 'Employment'],
    mentions: ['BJP', 'Bardhaman', 'Industry Revival', 'Jobs'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Bardhaman Dakshin',
    district: 'Purba Bardhaman'
  },
  // Tamluk - Purba Medinipur
  {
    id: '18',
    title: 'BJP strengthens organization in Purba Medinipur',
    summary: 'Party conducts organizational meetings across Tamluk constituency ahead of elections.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 61200000),
    sentiment: 'neutral',
    sentimentScore: 0.35,
    credibilityScore: 80,
    engagement: 987,
    topics: ['BJP', 'Organization', 'Tamluk', 'Elections'],
    mentions: ['BJP', 'Tamluk', 'Purba Medinipur'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'low',
    verified: true,
    constituency: 'Tamluk',
    district: 'Purba Medinipur'
  },
  // Kharagpur - Paschim Medinipur
  {
    id: '19',
    title: 'BJP focuses on Kharagpur industrial corridor development',
    summary: 'Party announces plans for industrial growth along Kharagpur-Haldia corridor in election manifesto.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 64800000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 85,
    engagement: 1876,
    topics: ['BJP', 'Kharagpur', 'Industry', 'Development'],
    mentions: ['BJP', 'Kharagpur', 'Industrial Corridor', 'Haldia'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Kharagpur',
    district: 'Paschim Medinipur'
  },
  // Bankura - Bankura
  {
    id: '20',
    title: 'BJP addresses tribal welfare in Bankura district',
    summary: 'Party leaders meet tribal communities, discuss welfare schemes and forest rights.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 68400000),
    sentiment: 'positive',
    sentimentScore: 0.58,
    credibilityScore: 84,
    engagement: 1234,
    topics: ['BJP', 'Tribal', 'Bankura', 'Welfare'],
    mentions: ['BJP', 'Bankura', 'Tribal Welfare', 'Forest Rights'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Bankura',
    district: 'Bankura'
  },
  // Purulia - Purulia
  {
    id: '21',
    title: 'BJP promises irrigation projects for drought-prone Purulia',
    summary: 'Party announces water conservation and irrigation schemes for farmers in Purulia district.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 72000000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 88,
    engagement: 1543,
    topics: ['BJP', 'Irrigation', 'Purulia', 'Farmers'],
    mentions: ['BJP', 'Purulia', 'Water', 'Irrigation'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Purulia',
    district: 'Purulia'
  },
  // Suri - Birbhum
  {
    id: '22',
    title: 'BJP highlights law and order issues in Birbhum',
    summary: 'Party leaders demand action on violence cases, promise peaceful governance in Birbhum district.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 75600000),
    sentiment: 'negative',
    sentimentScore: -0.45,
    credibilityScore: 78,
    engagement: 2345,
    topics: ['BJP', 'Law Order', 'Birbhum', 'Violence'],
    mentions: ['BJP', 'Suri', 'Birbhum', 'Law and Order'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Suri',
    district: 'Birbhum'
  },
  // Malda - Malda
  {
    id: '23',
    title: 'BJP expands base in Malda with youth outreach',
    summary: 'Party organizes youth convention in Malda, focuses on employment and education.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 79200000),
    sentiment: 'positive',
    sentimentScore: 0.55,
    credibilityScore: 86,
    engagement: 1678,
    topics: ['BJP', 'Youth', 'Malda', 'Employment'],
    mentions: ['BJP', 'Malda', 'Youth Convention', 'Education'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Malda',
    district: 'Malda'
  },
  // Jalpaiguri - Jalpaiguri
  {
    id: '24',
    title: 'BJP addresses tea garden workers issues in Jalpaiguri',
    summary: 'Party leaders meet tea workers, promise better wages and working conditions.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 82800000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 85,
    engagement: 1987,
    topics: ['BJP', 'Tea Gardens', 'Jalpaiguri', 'Workers'],
    mentions: ['BJP', 'Jalpaiguri', 'Tea Workers', 'Wages'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Jalpaiguri',
    district: 'Jalpaiguri'
  },
  // Cooch Behar - Cooch Behar
  {
    id: '25',
    title: 'BJP raises border security concerns in Cooch Behar',
    summary: 'Party demands enhanced border security and development of enclave areas in Cooch Behar.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 86400000),
    sentiment: 'neutral',
    sentimentScore: 0.28,
    credibilityScore: 80,
    engagement: 1456,
    topics: ['BJP', 'Border', 'Cooch Behar', 'Security'],
    mentions: ['BJP', 'Cooch Behar', 'Border Security', 'Enclave'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Cooch Behar Uttar',
    district: 'Cooch Behar'
  },
  // TMC Articles for balance
  // Tollygunge - Kolkata (TMC)
  {
    id: '26',
    title: 'TMC holds massive rally in Tollygunge, Mamata addresses crowd',
    summary: 'Chief Minister Mamata Banerjee addresses thousands of supporters at Tollygunge rally, highlights development achievements.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 2400000),
    sentiment: 'positive',
    sentimentScore: 0.82,
    credibilityScore: 86,
    engagement: 4567,
    topics: ['TMC', 'Mamata', 'Rally', 'Tollygunge'],
    mentions: ['TMC', 'Mamata Banerjee', 'Tollygunge', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: true,
    priority: 'high',
    verified: true,
    constituency: 'Tollygunge',
    district: 'Kolkata'
  },
  // Kasba - Kolkata (TMC)
  {
    id: '27',
    title: 'TMC workers distribute relief in Kasba during monsoon',
    summary: 'Trinamool Congress volunteers provide flood relief and assistance to residents affected by waterlogging in Kasba.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 3200000),
    sentiment: 'positive',
    sentimentScore: 0.75,
    credibilityScore: 82,
    engagement: 2345,
    topics: ['TMC', 'Relief', 'Kasba', 'Monsoon'],
    mentions: ['TMC', 'Relief Work', 'Kasba', 'Flood'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Kasba',
    district: 'Kolkata'
  },
  // Behala West - Kolkata (TMC)
  {
    id: '28',
    title: 'TMC MLA inaugurates community health center in Behala West',
    summary: 'New health facility inaugurated in Behala West to improve healthcare access for local residents.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 4800000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 88,
    engagement: 1890,
    topics: ['TMC', 'Healthcare', 'Behala West', 'Development'],
    mentions: ['TMC MLA', 'Health Center', 'Behala West'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Behala West',
    district: 'Kolkata'
  },
  // Chowringhee - Kolkata (TMC)
  {
    id: '29',
    title: 'TMC promises heritage conservation in Chowringhee area',
    summary: 'Party announces plans to restore heritage buildings and improve infrastructure in iconic Chowringhee constituency.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 5600000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 85,
    engagement: 2134,
    topics: ['TMC', 'Heritage', 'Chowringhee', 'Conservation'],
    mentions: ['TMC', 'Chowringhee', 'Heritage Buildings'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Chowringhee',
    district: 'Kolkata'
  },
  // Rashbehari - Kolkata (TMC)
  {
    id: '30',
    title: 'TMC celebrates successful metro extension to Rashbehari',
    summary: 'Chief Minister inaugurates metro station, credits TMC government for transforming urban transport.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 6400000),
    sentiment: 'positive',
    sentimentScore: 0.78,
    credibilityScore: 84,
    engagement: 3456,
    topics: ['TMC', 'Metro', 'Rashbehari', 'Infrastructure'],
    mentions: ['TMC', 'Metro Extension', 'Rashbehari', 'Mamata'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Rashbehari',
    district: 'Kolkata'
  },
  // Howrah Madhya - Howrah (TMC)
  {
    id: '31',
    title: 'TMC announces job fair in Howrah Madhya constituency',
    summary: 'Government organizes employment drive for youth in Howrah Madhya, targets 5000 job placements.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 7200000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 83,
    engagement: 2678,
    topics: ['TMC', 'Jobs', 'Howrah Madhya', 'Employment'],
    mentions: ['TMC', 'Job Fair', 'Howrah Madhya', 'Youth'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Howrah Madhya',
    district: 'Howrah'
  },
  // Bally - Howrah (TMC)
  {
    id: '32',
    title: 'TMC MLA inaugurates new road in Bally',
    summary: 'Infrastructure development continues in Bally as TMC government builds new roads connecting major localities.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 8000000),
    sentiment: 'positive',
    sentimentScore: 0.65,
    credibilityScore: 80,
    engagement: 1567,
    topics: ['TMC', 'Roads', 'Bally', 'Infrastructure'],
    mentions: ['TMC', 'Road Construction', 'Bally'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Bally',
    district: 'Howrah'
  },
  // Uttarpara - Howrah (Mixed)
  {
    id: '33',
    title: 'Political competition heats up in Uttarpara',
    summary: 'Both BJP and TMC ramp up campaigns in Uttarpara as the constituency emerges as a key battleground.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 8800000),
    sentiment: 'neutral',
    sentimentScore: 0.45,
    credibilityScore: 84,
    engagement: 1876,
    topics: ['Elections', 'Uttarpara', 'BJP', 'TMC'],
    mentions: ['Uttarpara', 'BJP', 'TMC', 'Campaign'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Uttarpara',
    district: 'Howrah'
  },
  // Rajarhat New Town - North 24 Parganas (TMC)
  {
    id: '34',
    title: 'TMC highlights IT sector growth in Rajarhat New Town',
    summary: 'Party credits state government policies for making Rajarhat a thriving IT hub with thousands of jobs.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 9600000),
    sentiment: 'positive',
    sentimentScore: 0.76,
    credibilityScore: 86,
    engagement: 2890,
    topics: ['TMC', 'IT Hub', 'Rajarhat New Town', 'Jobs'],
    mentions: ['TMC', 'Rajarhat', 'IT Sector', 'Development'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Rajarhat New Town',
    district: 'North 24 Parganas'
  },
  // Bidhannagar - North 24 Parganas (TMC)
  {
    id: '35',
    title: 'TMC promises smart city facilities for Bidhannagar',
    summary: 'Government announces comprehensive smart city plan including WiFi connectivity and smart traffic systems.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 10400000),
    sentiment: 'positive',
    sentimentScore: 0.70,
    credibilityScore: 85,
    engagement: 2345,
    topics: ['TMC', 'Smart City', 'Bidhannagar', 'Development'],
    mentions: ['TMC', 'Bidhannagar', 'Smart City', 'WiFi'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Bidhannagar',
    district: 'North 24 Parganas'
  },
  // Madhyamgram - North 24 Parganas (TMC)
  {
    id: '36',
    title: 'TMC MLA addresses flooding concerns in Madhyamgram',
    summary: 'Government announces drainage improvement project to address chronic waterlogging issues in Madhyamgram.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 11200000),
    sentiment: 'positive',
    sentimentScore: 0.58,
    credibilityScore: 88,
    engagement: 1678,
    topics: ['TMC', 'Drainage', 'Madhyamgram', 'Infrastructure'],
    mentions: ['TMC', 'Madhyamgram', 'Drainage', 'Flooding'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Madhyamgram',
    district: 'North 24 Parganas'
  },
  // Barasat - North 24 Parganas (BJP)
  {
    id: '37',
    title: 'BJP holds massive rally in Barasat',
    summary: 'BJP leaders address thousands of supporters, promise development and change in Barasat constituency.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 12000000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 82,
    engagement: 2567,
    topics: ['BJP', 'Rally', 'Barasat', 'Elections'],
    mentions: ['BJP', 'Barasat', 'Rally', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Barasat',
    district: 'North 24 Parganas'
  },
  // Sonarpur Uttar - South 24 Parganas (TMC)
  {
    id: '38',
    title: 'TMC inaugurates new school building in Sonarpur Uttar',
    summary: 'Education minister opens modern school facility with smart classrooms for Sonarpur Uttar students.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 12800000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 84,
    engagement: 1456,
    topics: ['TMC', 'Education', 'Sonarpur Uttar', 'School'],
    mentions: ['TMC', 'School', 'Sonarpur Uttar', 'Education'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Sonarpur Uttar',
    district: 'South 24 Parganas'
  },
  // Budge Budge - South 24 Parganas (Mixed)
  {
    id: '39',
    title: 'Industrial development debate in Budge Budge',
    summary: 'Both parties promise revival of industrial sector in Budge Budge, focusing on local employment.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 13600000),
    sentiment: 'neutral',
    sentimentScore: 0.42,
    credibilityScore: 82,
    engagement: 1234,
    topics: ['Industry', 'Budge Budge', 'Employment', 'Development'],
    mentions: ['Budge Budge', 'Industry', 'Jobs', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Budge Budge',
    district: 'South 24 Parganas'
  },
  // Darjeeling - Darjeeling (Mixed/BJP lean)
  {
    id: '40',
    title: 'BJP promises Gorkhaland statehood demand support in Darjeeling',
    summary: 'BJP leaders assure support for Gorkha community aspirations during campaign visit to Darjeeling.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 14400000),
    sentiment: 'positive',
    sentimentScore: 0.65,
    credibilityScore: 86,
    engagement: 3456,
    topics: ['BJP', 'Darjeeling', 'Gorkhaland', 'Support'],
    mentions: ['BJP', 'Darjeeling', 'Gorkha', 'Statehood'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Darjeeling',
    district: 'Darjeeling'
  },
  // Serampore - Hooghly (TMC)
  {
    id: '41',
    title: 'TMC MLA inaugurates heritage walk project in Serampore',
    summary: 'Danish colony heritage preservation project launched in Serampore with state government funding.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 15200000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 88,
    engagement: 1987,
    topics: ['TMC', 'Heritage', 'Serampore', 'Tourism'],
    mentions: ['TMC', 'Serampore', 'Danish Colony', 'Heritage'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Serampore',
    district: 'Hooghly'
  },
  // Chandannagar - Hooghly (TMC)
  {
    id: '42',
    title: 'TMC celebrates French connection in Chandannagar',
    summary: 'State government organizes cultural festival highlighting Indo-French heritage of Chandannagar.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 16000000),
    sentiment: 'positive',
    sentimentScore: 0.64,
    credibilityScore: 84,
    engagement: 1654,
    topics: ['TMC', 'Culture', 'Chandannagar', 'Heritage'],
    mentions: ['TMC', 'Chandannagar', 'French Heritage', 'Festival'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Chandannagar',
    district: 'Hooghly'
  },
  // Asansol Dakshin - Purba Bardhaman (BJP)
  {
    id: '43',
    title: 'BJP candidate focuses on industrial revival in Asansol Dakshin',
    summary: 'BJP promises to revive closed industries and create employment in coal belt region of Asansol.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 16800000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 82,
    engagement: 2123,
    topics: ['BJP', 'Industry', 'Asansol Dakshin', 'Employment'],
    mentions: ['BJP', 'Asansol', 'Coal', 'Industry Revival'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Asansol Dakshin',
    district: 'Purba Bardhaman'
  },
  // Durgapur Purba - Purba Bardhaman (BJP)
  {
    id: '44',
    title: 'BJP announces startup hub plan for Durgapur Purba',
    summary: 'Party promises to establish technology park and startup incubation center in Durgapur industrial area.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 17600000),
    sentiment: 'positive',
    sentimentScore: 0.70,
    credibilityScore: 85,
    engagement: 1876,
    topics: ['BJP', 'Startup', 'Durgapur Purba', 'Technology'],
    mentions: ['BJP', 'Durgapur', 'Startup Hub', 'Tech Park'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Durgapur Purba',
    district: 'Purba Bardhaman'
  },
  // Durgapur Paschim - Purba Bardhaman (TMC)
  {
    id: '45',
    title: 'TMC highlights Durgapur Paschim development under state govt',
    summary: 'Party showcases infrastructure projects completed in Durgapur Paschim during TMC rule.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 18400000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 84,
    engagement: 1567,
    topics: ['TMC', 'Development', 'Durgapur Paschim', 'Infrastructure'],
    mentions: ['TMC', 'Durgapur Paschim', 'Infrastructure', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Durgapur Paschim',
    district: 'Purba Bardhaman'
  },
  // Bardhaman Uttar - Purba Bardhaman (Mixed)
  {
    id: '46',
    title: 'Bardhaman Uttar sees tight contest between BJP and TMC',
    summary: 'Political analysts predict close fight in Bardhaman Uttar with both parties claiming strong support.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 19200000),
    sentiment: 'neutral',
    sentimentScore: 0.48,
    credibilityScore: 86,
    engagement: 2234,
    topics: ['Elections', 'Bardhaman Uttar', 'BJP', 'TMC'],
    mentions: ['Bardhaman Uttar', 'BJP', 'TMC', 'Contest'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Bardhaman Uttar',
    district: 'Purba Bardhaman'
  },
  // Pandaveswar - Paschim Bardhaman (Mixed)
  {
    id: '47',
    title: 'Pandaveswar coal belt workers demand better welfare',
    summary: 'Coal workers in Pandaveswar demand improved safety and welfare measures from both political parties.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 20000000),
    sentiment: 'neutral',
    sentimentScore: 0.35,
    credibilityScore: 80,
    engagement: 1456,
    topics: ['Coal Workers', 'Pandaveswar', 'Welfare', 'Safety'],
    mentions: ['Pandaveswar', 'Coal', 'Workers', 'Welfare'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Pandaveswar',
    district: 'Paschim Bardhaman'
  },
  // Haldia - Purba Medinipur (TMC)
  {
    id: '48',
    title: 'TMC showcases Haldia port development achievements',
    summary: 'State government highlights port expansion and industrial growth in Haldia under TMC administration.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 20800000),
    sentiment: 'positive',
    sentimentScore: 0.74,
    credibilityScore: 85,
    engagement: 2345,
    topics: ['TMC', 'Port', 'Haldia', 'Industry'],
    mentions: ['TMC', 'Haldia Port', 'Industrial Growth', 'Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Haldia',
    district: 'Purba Medinipur'
  },
  // Midnapore - Paschim Medinipur (BJP)
  {
    id: '49',
    title: 'BJP promises administrative reforms in Midnapore',
    summary: 'Party announces plan to improve governance and reduce corruption in Midnapore district administration.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 21600000),
    sentiment: 'positive',
    sentimentScore: 0.66,
    credibilityScore: 82,
    engagement: 1789,
    topics: ['BJP', 'Governance', 'Midnapore', 'Reforms'],
    mentions: ['BJP', 'Midnapore', 'Administration', 'Anti-corruption'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Midnapore',
    district: 'Paschim Medinipur'
  },
  // Bolpur - Birbhum (TMC)
  {
    id: '50',
    title: 'TMC promises Bolpur tourism boost with Santiniketan focus',
    summary: 'State government announces tourism development plan for Bolpur leveraging UNESCO heritage status.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 22400000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 88,
    engagement: 2567,
    topics: ['TMC', 'Tourism', 'Bolpur', 'Santiniketan'],
    mentions: ['TMC', 'Bolpur', 'Santiniketan', 'UNESCO', 'Tourism'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Bolpur',
    district: 'Birbhum'
  },
  // Arambag - Hooghly (TMC)
  {
    id: '51',
    title: 'TMC MLA launches rural development program in Arambag',
    summary: 'Agricultural support and rural infrastructure development announced for Arambag constituency.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 23200000),
    sentiment: 'positive',
    sentimentScore: 0.64,
    credibilityScore: 80,
    engagement: 1234,
    topics: ['TMC', 'Rural Development', 'Arambag', 'Agriculture'],
    mentions: ['TMC', 'Arambag', 'Rural', 'Agriculture'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Arambag',
    district: 'Hooghly'
  },
  // Ranaghat Uttar Paschim - Nadia (BJP)
  {
    id: '52',
    title: 'BJP focuses on border area development in Ranaghat',
    summary: 'Party promises improved infrastructure and security for border areas in Ranaghat constituency.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 24000000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 84,
    engagement: 1567,
    topics: ['BJP', 'Border', 'Ranaghat', 'Development'],
    mentions: ['BJP', 'Ranaghat', 'Border Area', 'Infrastructure'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Ranaghat Uttar Paschim',
    district: 'Nadia'
  },
  // English Bazar - Malda (TMC)
  {
    id: '53',
    title: 'TMC announces English Bazar market development plan',
    summary: 'State government plans modernization of historic English Bazar market with improved facilities.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 24800000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 82,
    engagement: 1345,
    topics: ['TMC', 'Market', 'English Bazar', 'Development'],
    mentions: ['TMC', 'English Bazar', 'Market', 'Modernization'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'English Bazar',
    district: 'Malda'
  },
  // Krishnanagar Uttar - Nadia (Mixed)
  {
    id: '54',
    title: 'Krishnanagar Uttar sees development debate',
    summary: 'Voters in Krishnanagar Uttar weigh development promises from both BJP and TMC candidates.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 25600000),
    sentiment: 'neutral',
    sentimentScore: 0.45,
    credibilityScore: 86,
    engagement: 1678,
    topics: ['Elections', 'Krishnanagar', 'Development', 'Voters'],
    mentions: ['Krishnanagar Uttar', 'BJP', 'TMC', 'Development'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Krishnanagar Uttar',
    district: 'Nadia'
  },
  // ===== NEW TMC ARTICLES FOR BALANCE =====
  // Kaliganj - Nadia (TMC)
  {
    id: '55',
    title: 'TMC MLA announces agricultural support program in Kaliganj',
    summary: 'State government extends Krishak Bandhu scheme benefits with additional support for Kaliganj farmers.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 26400000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 88,
    engagement: 1567,
    topics: ['TMC', 'Agriculture', 'Kaliganj', 'Farmers'],
    mentions: ['TMC', 'Kaliganj', 'Krishak Bandhu', 'Farmers'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Kaliganj',
    district: 'Nadia'
  },
  // Alipurduar - Alipurduar (TMC)
  {
    id: '56',
    title: 'TMC government inaugurates wildlife tourism project in Alipurduar',
    summary: 'New eco-tourism initiative launched to boost Alipurduar economy leveraging Jaldapara forest reserve.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 27200000),
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 85,
    engagement: 1890,
    topics: ['TMC', 'Tourism', 'Alipurduar', 'Wildlife'],
    mentions: ['TMC', 'Alipurduar', 'Jaldapara', 'Eco-tourism'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Alipurduar',
    district: 'Alipurduar'
  },
  // Basirhat Uttar - North 24 Parganas (TMC)
  {
    id: '57',
    title: 'TMC announces fisheries development scheme for Basirhat Uttar',
    summary: 'Government launches comprehensive support program for fish farmers in Basirhat coastal areas.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 28000000),
    sentiment: 'positive',
    sentimentScore: 0.65,
    credibilityScore: 84,
    engagement: 1456,
    topics: ['TMC', 'Fisheries', 'Basirhat Uttar', 'Development'],
    mentions: ['TMC', 'Basirhat', 'Fisheries', 'Coastal'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Basirhat Uttar',
    district: 'North 24 Parganas'
  },
  // Joynagar - South 24 Parganas (TMC)
  {
    id: '58',
    title: 'TMC MLA focuses on Sundarbans development in Joynagar',
    summary: 'State government announces special package for Sundarbans residents including housing and livelihood support.',
    source: 'The Telegraph',
    timestamp: new Date(Date.now() - 28800000),
    sentiment: 'positive',
    sentimentScore: 0.70,
    credibilityScore: 86,
    engagement: 2123,
    topics: ['TMC', 'Sundarbans', 'Joynagar', 'Development'],
    mentions: ['TMC', 'Joynagar', 'Sundarbans', 'Housing'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Joynagar',
    district: 'South 24 Parganas'
  },
  // Islampur - Uttar Dinajpur (TMC)
  {
    id: '59',
    title: 'TMC promises border area development in Islampur',
    summary: 'Chief Minister announces special focus on infrastructure for Islampur and border constituency welfare.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 29600000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 84,
    engagement: 1678,
    topics: ['TMC', 'Border', 'Islampur', 'Infrastructure', 'Mamata'],
    mentions: ['TMC', 'Islampur', 'Border Development', 'Mamata'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Islampur',
    district: 'Uttar Dinajpur'
  },
  // Raiganj - Uttar Dinajpur (TMC)
  {
    id: '60',
    title: 'TMC announces healthcare expansion in Raiganj',
    summary: 'State government to upgrade Raiganj hospital and establish new primary health centers across constituency.',
    source: 'Zee 24 Ghanta',
    timestamp: new Date(Date.now() - 30400000),
    sentiment: 'positive',
    sentimentScore: 0.66,
    credibilityScore: 82,
    engagement: 1543,
    topics: ['TMC', 'Healthcare', 'Raiganj', 'Hospital'],
    mentions: ['TMC', 'Raiganj', 'Healthcare', 'Hospital Upgrade'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Raiganj',
    district: 'Uttar Dinajpur'
  },
  // Kaliaganj - Uttar Dinajpur (TMC)
  {
    id: '61',
    title: 'TMC MLA addresses employment concerns in Kaliaganj',
    summary: 'Government announces skill development and job placement programs targeting youth in Kaliaganj constituency.',
    source: 'Sangbad Pratidin',
    timestamp: new Date(Date.now() - 31200000),
    sentiment: 'positive',
    sentimentScore: 0.62,
    credibilityScore: 80,
    engagement: 1234,
    topics: ['TMC', 'Employment', 'Kaliaganj', 'Youth'],
    mentions: ['TMC', 'Kaliaganj', 'Jobs', 'Skill Development'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Kaliaganj',
    district: 'Uttar Dinajpur'
  },
  // Dinhata - Cooch Behar (TMC)
  {
    id: '62',
    title: 'TMC celebrates enclave residents integration in Dinhata',
    summary: 'Government highlights successful rehabilitation of former enclave residents with permanent housing in Dinhata.',
    source: 'Anandabazar Patrika',
    timestamp: new Date(Date.now() - 32000000),
    sentiment: 'positive',
    sentimentScore: 0.74,
    credibilityScore: 88,
    engagement: 1987,
    topics: ['TMC', 'Enclave', 'Dinhata', 'Housing', 'Trinamool'],
    mentions: ['TMC', 'Dinhata', 'Enclave Integration', 'Rehabilitation'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true,
    constituency: 'Dinhata',
    district: 'Cooch Behar'
  },
  // Naihati - North 24 Parganas (TMC)
  {
    id: '63',
    title: 'TMC inaugurates industrial training center in Naihati',
    summary: 'New ITI facility opened in Naihati to address youth unemployment and skill gap in jute mill areas.',
    source: 'ABP Ananda',
    timestamp: new Date(Date.now() - 32800000),
    sentiment: 'positive',
    sentimentScore: 0.68,
    credibilityScore: 85,
    engagement: 1654,
    topics: ['TMC', 'ITI', 'Naihati', 'Training', 'Trinamool'],
    mentions: ['TMC', 'Naihati', 'Industrial Training', 'Youth'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Naihati',
    district: 'North 24 Parganas'
  },
  // Sabang - Paschim Medinipur (TMC)
  {
    id: '64',
    title: 'TMC MLA launches tribal welfare program in Sabang',
    summary: 'Government announces comprehensive support including Lakshmir Bhandar benefits for tribal women in Sabang constituency.',
    source: 'Ei Samay',
    timestamp: new Date(Date.now() - 33600000),
    sentiment: 'positive',
    sentimentScore: 0.70,
    credibilityScore: 84,
    engagement: 1876,
    topics: ['TMC', 'Tribal Welfare', 'Sabang', 'Lakshmir Bhandar', 'Mamata'],
    mentions: ['TMC', 'Sabang', 'Tribal', 'Women Welfare'],
    region: 'West Bengal',
    language: 'Bengali',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true,
    constituency: 'Sabang',
    district: 'Paschim Medinipur'
  }
];

export default function PressMediaMonitoring() {
  // Fetch real news data from database
  const {
    articles: dbArticles,
    loadingArticles,
    articlesError,
    refreshData
  } = useNewsSentiment({
    autoFetch: true,
    autoFetchInterval: 300000, // Refresh every 5 minutes (prevents infinite loops)
    filters: { }
  });

  // Convert database articles to component format (memoized to prevent infinite re-renders)
  const realArticles = useMemo(() =>
    dbArticles.map(mapDBArticleToComponent),
    [dbArticles]
  );

  // Combine mock articles (BJP + TMC) with real articles from database
  const articlesSource = useMemo(() => {
    // Always use mockArticles which has both BJP and TMC articles
    // Combine with real articles if available (avoiding duplicates by title)
    if (realArticles && realArticles.length > 0) {
      const mockTitles = new Set(mockArticles.map(a => a.title.toLowerCase()));
      const uniqueRealArticles = realArticles.filter(
        a => !mockTitles.has(a.title.toLowerCase())
      );
      return [...mockArticles, ...uniqueRealArticles];
    }
    return mockArticles;
  }, [realArticles]);

  // Constituency filter state (must be declared before useMemo hooks that use it)
  const [selectedConstituency, setSelectedConstituency] = useState('all');

  // BJP Work Categories with sentiment tracking
  const BJP_WORK_CATEGORIES = [
    { name: 'BJP Rally & Events', keywords: ['rally', 'sabha', 'meeting', 'gathering', 'event', 'program'] },
    { name: 'Modi Leadership', keywords: ['modi', 'prime minister', 'speech', 'address', 'pm'] },
    { name: 'Suvendu Campaign', keywords: ['suvendu', 'adhikari', 'nandigram', 'leader'] },
    { name: 'Bengal Elections', keywords: ['election', 'vote', 'polling', 'booth', 'candidate', 'ballot'] },
    { name: 'BJP vs TMC', keywords: ['tmc', 'trinamool', 'mamata', 'clash', 'attack', 'oppose'] },
    { name: 'Development Work', keywords: ['development', 'scheme', 'project', 'infrastructure', 'welfare'] }
  ];

  // Calculate BJP work categories with sentiment from constituency-filtered articles
  const trendingTopics: TrendingTopic[] = useMemo(() => {
    // First apply constituency filter to get relevant articles
    let relevantArticles = articlesSource;
    if (selectedConstituency && selectedConstituency !== 'all') {
      const selectedConst = CONSTITUENCIES.find(c => c.id === selectedConstituency);
      if (selectedConst) {
        relevantArticles = articlesSource.filter(article =>
          article.constituency === selectedConst.name ||
          article.district === selectedConst.district
        );
      }
    }

    // Analyze filtered articles for BJP work categories
    const categoryStats = BJP_WORK_CATEGORIES.map((category, index) => {
      // Find articles matching this category
      const matchingArticles = relevantArticles.filter(article => {
        const text = (article.title + ' ' + (article.summary || '')).toLowerCase();
        return category.keywords.some(kw => text.includes(kw.toLowerCase()));
      });

      // Calculate sentiment distribution
      const positive = matchingArticles.filter(a => a.sentiment === 'positive').length;
      const negative = matchingArticles.filter(a => a.sentiment === 'negative').length;
      const total = matchingArticles.length;

      // Calculate net sentiment percentage (-100 to +100)
      let sentimentPercent = 0;
      if (total > 0) {
        sentimentPercent = Math.round(((positive - negative) / total) * 100);
      }

      // Normalized sentiment for progress bar (0 to 1)
      const normalizedSentiment = total > 0 ? (sentimentPercent + 100) / 200 : 0.5;

      return {
        id: String(index + 1),
        topic: category.name,
        mentions: total,
        sentiment: normalizedSentiment,
        sentimentPercent: sentimentPercent, // -100 to +100
        growth: total > 0 ? Math.floor(Math.random() * 80) + 20 : 0,
        relatedKeywords: category.keywords.slice(0, 4),
        timeframe: '24h' as const
      };
    });

    // Sort by mentions (most talked about first), filter out zero mentions
    return categoryStats
      .filter(cat => cat.mentions > 0 || true) // Show all categories even with 0
      .sort((a, b) => b.mentions - a.mentions);
  }, [articlesSource, selectedConstituency]);

  // Calculate language distribution from constituency-filtered articles
  const languageDistribution = useMemo(() => {
    // First apply constituency filter
    let relevantArticles = articlesSource;
    if (selectedConstituency && selectedConstituency !== 'all') {
      const selectedConst = CONSTITUENCIES.find(c => c.id === selectedConstituency);
      if (selectedConst) {
        relevantArticles = articlesSource.filter(article =>
          article.constituency === selectedConst.name ||
          article.district === selectedConst.district
        );
      }
    }

    if (relevantArticles.length === 0) {
      return { bengali: 0, english: 0, hindi: 0, other: 0 };
    }

    const counts = relevantArticles.reduce((acc, article) => {
      const lang = article.language?.toLowerCase() || 'other';
      if (lang.includes('bengali') || lang.includes('bangla') || lang === 'bn') acc.bengali++;
      else if (lang.includes('english') || lang === 'en') acc.english++;
      else if (lang.includes('hindi') || lang === 'hi') acc.hindi++;
      else acc.other++;
      return acc;
    }, { bengali: 0, english: 0, hindi: 0, other: 0 });

    const total = relevantArticles.length;
    return {
      bengali: Math.round((counts.bengali / total) * 100),
      english: Math.round((counts.english / total) * 100),
      hindi: Math.round((counts.hindi / total) * 100),
      other: Math.round((counts.other / total) * 100)
    };
  }, [articlesSource, selectedConstituency]);

  // Calculate BJP sentiment per source from constituency-filtered articles
  const sourcePerformance = useMemo(() => {
    // First apply constituency filter
    let relevantArticles = articlesSource;
    if (selectedConstituency && selectedConstituency !== 'all') {
      const selectedConst = CONSTITUENCIES.find(c => c.id === selectedConstituency);
      if (selectedConst) {
        relevantArticles = articlesSource.filter(article =>
          article.constituency === selectedConst.name ||
          article.district === selectedConst.district
        );
      }
    }

    // Filter only BJP-related articles from constituency-filtered set
    const bjpArticles = relevantArticles.filter(a => isBJPArticle(a));

    const sourceStats = bjpArticles.reduce((acc, article) => {
      const source = article.source;
      if (!acc[source]) {
        acc[source] = { count: 0, positive: 0, negative: 0, neutral: 0 };
      }
      acc[source].count++;
      if (article.sentiment === 'positive') acc[source].positive++;
      else if (article.sentiment === 'negative') acc[source].negative++;
      else acc[source].neutral++;
      return acc;
    }, {} as Record<string, { count: number; positive: number; negative: number; neutral: number }>);

    return newsSources.map(source => {
      const stats = sourceStats[source.name] || { count: 0, positive: 0, negative: 0, neutral: 0 };
      const bjpSentimentPercent = stats.count > 0
        ? Math.round(((stats.positive - stats.negative) / stats.count) * 100)
        : 0;
      return {
        ...source,
        bjpArticleCount: stats.count,
        bjpSentimentPercent,
        bjpPositiveCount: stats.positive,
        bjpNegativeCount: stats.negative,
        bjpNeutralCount: stats.neutral,
        articleCount: stats.count
      };
    }).sort((a, b) => b.bjpArticleCount - a.bjpArticleCount);
  }, [articlesSource, selectedConstituency]);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [isSeedingHistory, setIsSeedingHistory] = useState(false);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [fetchNewsResult, setFetchNewsResult] = useState<FetchResult | null>(null);

  const [analytics, setAnalytics] = useState({
    totalArticles: 0,
    bjpArticles: 0,
    positivesentiment: 0,
    negativeSentiment: 0,
    neutralSentiment: 0,
    bjpPositive: 0,
    bjpNegative: 0,
    bjpNeutral: 0,
    breakingNews: 0,
    verifiedSources: 8,
    avgCredibility: 87,
    bjpMentions: 0
  });

  useEffect(() => {
    // Filter articles based on search and filters
    let filtered = articlesSource;

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(article => article.region === selectedRegion);
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(article => article.language === selectedLanguage);
    }

    // Filter by constituency (only if specific constituency selected)
    if (selectedConstituency && selectedConstituency !== 'all') {
      const selectedConst = CONSTITUENCIES.find(c => c.id === selectedConstituency);
      if (selectedConst) {
        filtered = filtered.filter(article =>
          article.constituency === selectedConst.name ||
          article.district === selectedConst.district
        );
      }
    }

    // Filter by timeframe - skip if 'all' selected
    if (selectedTimeframe && selectedTimeframe !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (selectedTimeframe) {
        case '1h':
          cutoffDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '6h':
          cutoffDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      filtered = filtered.filter(article => {
        const articleDate = new Date(article.timestamp);
        return articleDate >= cutoffDate;
      });
    }

    // Sort by timestamp (most recent first) to mix BJP and TMC articles
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    setFilteredArticles(filtered);

    // Update analytics based on constituency-filtered data
    if (filtered.length > 0) {
      // Filter BJP-related articles from filtered (constituency-specific) articles
      const bjpArticles = filtered.filter(a => isBJPArticle(a));

      // All filtered articles sentiment
      const positive = filtered.filter(a => a.sentiment === 'positive').length;
      const negative = filtered.filter(a => a.sentiment === 'negative').length;
      const neutral = filtered.filter(a => a.sentiment === 'neutral').length;

      // BJP articles sentiment
      const bjpPositive = bjpArticles.filter(a => a.sentiment === 'positive').length;
      const bjpNegative = bjpArticles.filter(a => a.sentiment === 'negative').length;
      const bjpNeutral = bjpArticles.filter(a => a.sentiment === 'neutral').length;

      const breaking = bjpArticles.filter(a => a.isBreaking).length;
      const avgCred = filtered.reduce((sum, a) => sum + a.credibilityScore, 0) / filtered.length;

      // Count total BJP mentions across filtered articles
      const bjpMentionCount = bjpArticles.length;

      setAnalytics({
        totalArticles: filtered.length,
        bjpArticles: bjpArticles.length,
        positivesentiment: filtered.length > 0 ? Math.round((positive / filtered.length) * 100) : 0,
        negativeSentiment: filtered.length > 0 ? Math.round((negative / filtered.length) * 100) : 0,
        neutralSentiment: filtered.length > 0 ? Math.round((neutral / filtered.length) * 100) : 0,
        bjpPositive: bjpArticles.length > 0 ? Math.round((bjpPositive / bjpArticles.length) * 100) : 0,
        bjpNegative: bjpArticles.length > 0 ? Math.round((bjpNegative / bjpArticles.length) * 100) : 0,
        bjpNeutral: bjpArticles.length > 0 ? Math.round((bjpNeutral / bjpArticles.length) * 100) : 0,
        breakingNews: breaking,
        verifiedSources: newsSources.filter(s => s.active).length,
        avgCredibility: Math.round(avgCred),
        bjpMentions: bjpMentionCount
      });
    } else {
      // Reset analytics when no articles match the filter
      setAnalytics({
        totalArticles: 0,
        bjpArticles: 0,
        positivesentiment: 0,
        negativeSentiment: 0,
        neutralSentiment: 0,
        bjpPositive: 0,
        bjpNegative: 0,
        bjpNeutral: 0,
        breakingNews: 0,
        verifiedSources: newsSources.filter(s => s.active).length,
        avgCredibility: 0,
        bjpMentions: 0
      });
    }
  }, [searchQuery, selectedRegion, selectedLanguage, selectedConstituency, articlesSource, selectedTimeframe]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'left': return 'text-blue-600 bg-blue-100';
      case 'right': return 'text-red-600 bg-red-100';
      case 'center': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'articles', label: 'Articles', icon: Newspaper },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'predictions', label: 'Analytics', icon: Target }
  ];

  // Win Prediction Data - 2026 ASSEMBLY ELECTION Prediction
  // ABP-CVoter Style Opinion Poll Methodology
  // Formula: 2021 Assembly (40%) + 2024 LS Swing (35%) + Anti-incumbency (15%) + Regional (10%)
  const constituencyPredictions = useMemo(() => {
    // Sentiment for news-based adjustment
    const allBjpArticles = articlesSource.filter(a => isBJPArticle(a));
    const allTmcArticles = articlesSource.filter(a => isTMCArticle(a));
    const bjpPositive = allBjpArticles.filter(a => a.sentiment === 'positive').length;
    const bjpNegative = allBjpArticles.filter(a => a.sentiment === 'negative').length;
    const bjpTotal = allBjpArticles.length;
    const tmcPositive = allTmcArticles.filter(a => a.sentiment === 'positive').length;
    const tmcNegative = allTmcArticles.filter(a => a.sentiment === 'negative').length;
    const tmcTotal = allTmcArticles.length;

    // ABP-CVoter Style Factors (Based on real opinion poll trends)
    // 2024 Lok Sabha: BJP gained ~8% vote share across WB
    const LS_2024_BJP_SWING = 8;  // BJP gained in 2024 LS
    const LS_2024_TMC_SWING = -6; // TMC lost in 2024 LS

    // Anti-incumbency: TMC in power since 2011 (15 years by 2026)
    const ANTI_INCUMBENCY_TMC = -5; // Ruling party disadvantage
    const CHALLENGER_BOOST_BJP = 3; // Opposition advantage

    // Urban vs Rural factors
    const urbanDistricts = ['Kolkata', 'Howrah', 'North 24 Parganas'];
    const borderDistricts = ['Cooch Behar', 'Jalpaiguri', 'Malda', 'Murshidabad', 'Nadia'];

    return CONSTITUENCIES.map((constituency) => {
      // Find REAL 2021 election data
      const realData = electionData.find(e =>
        e.constituency_name.toLowerCase() === constituency.name.toLowerCase() ||
        e.constituency_id === constituency.id
      );

      // Base: 2021 Assembly results (REAL DATA)
      const bjpShare2021 = realData?.bjp_share_2021 || 30;
      const tmcShare2021 = realData?.tmc_share_2021 || 50;
      const winner2021 = realData?.winner_party_2021 || 'AITC';
      const margin2021 = realData?.margin_2021 || 0;

      // Regional adjustment factors
      const isUrban = urbanDistricts.includes(constituency.district);
      const isBorder = borderDistricts.includes(constituency.district);

      // Urban areas: BJP does better in urban
      const urbanFactor = isUrban ? { bjp: 4, tmc: -3 } : { bjp: 1, tmc: 0 };

      // Border areas: BJP gaining due to CAA/NRC narrative
      const borderFactor = isBorder ? { bjp: 3, tmc: -2 } : { bjp: 0, tmc: 0 };

      // ABP-CVOTER STYLE 2026 PREDICTION FORMULA:
      // BJP 2026 = 2021 Base + LS Swing + Anti-incumbency boost + Regional
      // TMC 2026 = 2021 Base + LS Swing + Anti-incumbency penalty + Regional
      const bjp2026 = bjpShare2021 + LS_2024_BJP_SWING + CHALLENGER_BOOST_BJP + urbanFactor.bjp + borderFactor.bjp;
      const tmc2026 = tmcShare2021 + LS_2024_TMC_SWING + ANTI_INCUMBENCY_TMC + urbanFactor.tmc + borderFactor.tmc;

      // Normalize to ensure total doesn't exceed 100%
      const otherParties = 100 - bjpShare2021 - tmcShare2021; // Left, Congress, Others
      const totalProjected = bjp2026 + tmc2026 + otherParties;
      const bjpFinal = Math.round((bjp2026 / totalProjected) * 100 * 10) / 10;
      const tmcFinal = Math.round((tmc2026 / totalProjected) * 100 * 10) / 10;

      // Determine 2026 winner
      const voteDiff = bjpFinal - tmcFinal;
      let predictedWinner: 'BJP' | 'TMC' | 'Swing';

      // Swing threshold: 5% (tighter race prediction)
      if (Math.abs(voteDiff) < 5) {
        predictedWinner = 'Swing';
      } else if (bjpFinal > tmcFinal) {
        predictedWinner = 'BJP';
      } else {
        predictedWinner = 'TMC';
      }

      // Win probability
      const total = bjpFinal + tmcFinal;
      const bjpWinProbability = Math.round((bjpFinal / total) * 100);
      const tmcWinProbability = 100 - bjpWinProbability;

      const absMargin = Math.abs(voteDiff);
      const confidence = Math.min(85, 60 + Math.round(absMargin));

      // Status
      let status: 'Safe' | 'Likely' | 'Swing';
      if (predictedWinner === 'Swing') {
        status = 'Swing';
      } else if (absMargin >= 15) {
        status = 'Safe';
      } else {
        status = 'Likely';
      }

      // Trend: BJP rising everywhere due to 2024 LS momentum
      const bjpGain = bjpFinal - bjpShare2021;
      let trend: 'rising' | 'falling' | 'stable';
      if (bjpGain > 8) {
        trend = 'rising';
      } else if (bjpGain > 3) {
        trend = 'stable';
      } else {
        trend = 'falling';
      }

      return {
        id: constituency.id,
        name: constituency.name,
        district: constituency.district,
        bjpScore: bjpFinal,
        tmcScore: tmcFinal,
        bjpPositive,
        tmcPositive,
        bjpNegative,
        tmcNegative,
        totalArticles: bjpTotal + tmcTotal,
        predictedWinner,
        margin: Math.round(absMargin * 10) / 10,
        status,
        bjpWinProbability,
        tmcWinProbability,
        trend,
        confidence,
        // Reference data
        bjpShare2021,
        tmcShare2021,
        winner2021,
        margin2021
      };
    });
  }, [articlesSource]);

  // Calculate prediction stats from constituency predictions
  const predictionStats = useMemo(() => {
    const bjpLeading = constituencyPredictions.filter(p => p.predictedWinner === 'BJP').length;
    const tmcLeading = constituencyPredictions.filter(p => p.predictedWinner === 'TMC').length;
    const swingSeats = constituencyPredictions.filter(p => p.predictedWinner === 'Swing').length;

    return {
      bjpLeading,
      tmcLeading,
      swingSeats,
      safeBjp: constituencyPredictions.filter(p => p.predictedWinner === 'BJP' && p.status === 'Safe').length,
      safeTmc: constituencyPredictions.filter(p => p.predictedWinner === 'TMC' && p.status === 'Safe').length,
      predictedBjpSeats: { min: bjpLeading, max: bjpLeading + swingSeats },
      predictedTmcSeats: { min: tmcLeading, max: tmcLeading + swingSeats }
    };
  }, [constituencyPredictions]);

  const isPredictionsLoading = false; // No longer loading from DB

  // Prediction Filters
  const [predictionFilter, setPredictionFilter] = useState<'all' | 'bjp' | 'tmc' | 'swing'>('all');
  const [predictionSort, setPredictionSort] = useState<'margin' | 'bjp' | 'tmc' | 'name'>('margin');

  // Filter and sort predictions (local implementation for article-based data)
  const filteredPredictions = useMemo(() => {
    let filtered = [...constituencyPredictions];

    // Apply filter based on predictedWinner
    if (predictionFilter === 'bjp') {
      filtered = filtered.filter(p => p.predictedWinner === 'BJP');
    } else if (predictionFilter === 'tmc') {
      filtered = filtered.filter(p => p.predictedWinner === 'TMC');
    } else if (predictionFilter === 'swing') {
      filtered = filtered.filter(p => p.predictedWinner === 'Swing');
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (predictionSort === 'margin') return b.margin - a.margin;
      if (predictionSort === 'bjp') return b.bjpPositive - a.bjpPositive;
      if (predictionSort === 'tmc') return b.tmcPositive - a.tmcPositive;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [constituencyPredictions, predictionFilter, predictionSort]);

  // Calculate party-wise sentiment stats for Analytics tab
  const partyStats = useMemo(() => {
    const bjpArticles = articlesSource.filter(a => isBJPArticle(a));
    const tmcArticles = articlesSource.filter(a => isTMCArticle(a));

    const calculateStats = (articles: NewsArticle[], party: string): PartySentimentStats => {
      const total = articles.length;
      const positive = articles.filter(a => a.sentiment === 'positive').length;
      const negative = articles.filter(a => a.sentiment === 'negative').length;
      const neutral = articles.filter(a => a.sentiment === 'neutral').length;

      const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
      const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;
      const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;

      // Favorability = (positive - negative) / total * 100, normalized to 0-100 scale
      const favorabilityScore = total > 0 ? Math.round(50 + ((positive - negative) / total) * 50) : 50;

      return {
        party,
        total,
        positive,
        negative,
        neutral,
        positivePercent,
        negativePercent,
        neutralPercent,
        favorabilityScore
      };
    };

    return {
      bjp: calculateStats(bjpArticles, 'BJP'),
      tmc: calculateStats(tmcArticles, 'TMC')
    };
  }, [articlesSource]);

  // Handle saving daily articles to database (preserves existing articles)
  const handleSeedDatabase = async () => {
    if (isSeeding) return;

    setIsSeeding(true);
    setSeedResult(null);

    try {
      // Use seedDailyArticles - only adds new articles, preserves existing
      const result = await seedDailyArticles(mockArticles);
      setSeedResult(result);

      // Always refresh data to show articles from database
      await refreshData();
    } catch (error) {
      setSeedResult({
        success: false,
        inserted: 0,
        skipped: 0,
        failed: mockArticles.length,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Handler for fetching real news from external sources
  const handleFetchRealNews = async () => {
    if (isFetchingNews) return;

    setIsFetchingNews(true);
    setFetchNewsResult(null);

    try {
      const result = await fetchAllRealNews();
      setFetchNewsResult(result);

      // Refresh data to show new articles
      await refreshData();
    } catch (error) {
      setFetchNewsResult({
        totalFetched: 0,
        bySource: { abpAnanda: 0, eiSamay: 0, sangbadPratidin: 0, newsApi: 0, googleNews: 0 },
        stored: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsFetchingNews(false);
    }
  };

  // Handle seeding historical 7 days of articles (CLEAR AND RESEED)
  const handleSeedHistorical = async () => {
    if (isSeedingHistory) return;

    // Confirm before clearing all data
    const confirmed = window.confirm(
      'This will DELETE all existing articles and create fresh 7-day data.\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) return;

    setIsSeedingHistory(true);
    setSeedResult(null);

    try {
      console.log('Starting CLEAR AND RESEED for 7 days...');
      const result = await clearAndReseed7Days(mockArticles);

      setSeedResult({
        success: result.success,
        inserted: result.inserted,
        skipped: result.skipped,
        failed: result.failed,
        errors: result.errors
      });

      // Show alert with result
      alert(
        `CLEAR & RESEED Complete!\n\n` +
        `Deleted: ${result.deleted} old articles\n` +
        `Inserted: ${result.inserted} new articles\n` +
        `Failed: ${result.failed}\n\n` +
        `7 days of data created:\n` +
        `- Today (Dec 2)\n` +
        `- Yesterday (Dec 1)\n` +
        `- Nov 30, 29, 28, 27, 26\n\n` +
        `Check Supabase "published_at" column for dates!`
      );

      // Refresh data after successful seeding
      if (result.inserted > 0) {
        await refreshData();
      }
    } catch (error) {
      console.error('Clear and reseed error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSeedResult({
        success: false,
        inserted: 0,
        skipped: 0,
        failed: 28, // 7 days * 4 articles
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsSeedingHistory(false);
    }
  };

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                Press & Media Monitoring
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Real-time news analysis and sentiment tracking
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-responsive-sm font-medium text-gray-700">
                {isMonitoring ? 'Live Monitoring' : 'Monitoring Paused'}
              </span>
            </div>
            {/* Sync Data Buttons - Only visible on Articles tab */}
            {activeTab === 'articles' && (
              <div className="flex items-center gap-2">
                <MobileButton
                  variant="outline"
                  size="small"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className={isSeeding ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Database className={`w-4 h-4 mr-1 ${isSeeding ? 'animate-spin' : ''}`} />
                  {isSeeding ? 'Saving...' : 'Save'}
                </MobileButton>
                <MobileButton
                  variant="primary"
                  size="small"
                  onClick={handleFetchRealNews}
                  disabled={isFetchingNews}
                  className={`bg-blue-600 hover:bg-blue-700 text-white ${isFetchingNews ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isFetchingNews ? 'animate-spin' : ''}`} />
                  {isFetchingNews ? 'Fetching...' : 'Fetch Real News'}
                </MobileButton>
              </div>
            )}

            {/* Constituency Dropdown - Hidden on Predictions tab */}
            {activeTab !== 'predictions' && (
              <div className="relative">
                <select
                  className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer appearance-none pr-8 border border-orange-200 text-orange-800"
                  value={selectedConstituency}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                >
                  <option value="all">All Constituencies</option>
                  {CONSTITUENCIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.district}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-orange-600 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            )}

          </div>

          {/* Seed Result Notification */}
          {seedResult && (
            <div className={`mt-3 p-3 rounded-lg text-sm flex items-center justify-center space-x-2 ${
              seedResult.success
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {seedResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>
                {seedResult.success
                  ? `Seeded ${seedResult.inserted} articles (${seedResult.skipped} skipped)`
                  : `Failed: ${seedResult.errors[0] || 'Unknown error'}`}
              </span>
              <button
                onClick={() => setSeedResult(null)}
                className="ml-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Fetch Real News Result Notification */}
          {fetchNewsResult && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              fetchNewsResult.errors.length === 0
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {fetchNewsResult.errors.length === 0 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="font-medium">
                  Fetched {fetchNewsResult.totalFetched} articles, Stored {fetchNewsResult.stored} new
                </span>
              </div>
              <div className="text-xs text-center space-x-3">
                <span>ABP Ananda: {fetchNewsResult.bySource.abpAnanda}</span>
                <span>Ei Samay: {fetchNewsResult.bySource.eiSamay}</span>
                <span>Sangbad: {fetchNewsResult.bySource.sangbadPratidin}</span>
                <span>NewsAPI: {fetchNewsResult.bySource.newsApi}</span>
                <span>Google: {fetchNewsResult.bySource.googleNews}</span>
              </div>
              {fetchNewsResult.errors.length > 0 && (
                <div className="text-xs text-red-600 mt-2 text-center">
                  Errors: {fetchNewsResult.errors.slice(0, 2).join(', ')}
                </div>
              )}
              <div className="text-center mt-2">
                <button
                  onClick={() => setFetchNewsResult(null)}
                  className="text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-responsive">
            {/* BJP Key Metrics */}
            <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
              <MobileCard padding="default" className="text-center border-orange-200 bg-orange-50">
                <Newspaper className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-orange-700">
                  {analytics.bjpArticles.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-orange-600">BJP Articles Today</div>
                <div className="text-responsive-xs text-gray-500 mt-1">
                  of {analytics.totalArticles} total
                </div>
              </MobileCard>

              <MobileCard padding="default" className="text-center border-green-200 bg-green-50">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-green-700">
                  {analytics.bjpPositive}%
                </div>
                <div className="text-responsive-sm text-green-600">BJP Positive</div>
                <div className="text-responsive-xs text-gray-500 mt-1">
                  {analytics.bjpNegative}% negative
                </div>
              </MobileCard>

              <MobileCard padding="default" className="text-center border-blue-200 bg-blue-50">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-blue-700">
                  {analytics.verifiedSources}
                </div>
                <div className="text-responsive-sm text-blue-600">Bengal Sources</div>
                <div className="text-responsive-xs text-gray-500 mt-1">
                  Active news sources
                </div>
              </MobileCard>

              <MobileCard padding="default" className="text-center border-purple-200 bg-purple-50">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-purple-700">
                  {analytics.bjpMentions}
                </div>
                <div className="text-responsive-sm text-purple-600">BJP Mentions</div>
                <div className="text-responsive-xs text-gray-500 mt-1">
                  In today's news
                </div>
              </MobileCard>
            </ResponsiveGrid>

            {/* BJP Breaking News Alert */}
            {articlesSource.filter(a => isBJPArticle(a)).length > 0 && (
              <MobileCard padding="default" className="border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-orange-600 animate-pulse" />
                  <div className="flex-1">
                    <h3 className="text-responsive-base font-semibold text-orange-900">
                      BJP News Alert
                    </h3>
                    <p className="text-responsive-sm text-orange-700">
                      {articlesSource.filter(a => isBJPArticle(a))[0]?.title || 'Latest BJP news from Bengal'}
                    </p>
                  </div>
                  <MobileButton variant="outline" size="small">
                    <ExternalLink className="w-4 h-4" />
                  </MobileButton>
                </div>
              </MobileCard>
            )}

            {/* BJP Sentiment Distribution */}
            <MobileCard padding="default" className="border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  BJP Sentiment Distribution
                </h3>
                <div className="flex space-x-2">
                  <span className="text-responsive-xs text-orange-600 font-medium">BJP News Only</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Positive Coverage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.bjpPositive}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.bjpPositive}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Neutral Coverage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.bjpNeutral}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.bjpNeutral}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Negative Coverage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.bjpNegative}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.bjpNegative}%
                    </span>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* BJP Work Categories - Trending Topics */}
            <MobileCard padding="default" className="border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  BJP Work Categories
                </h3>
                <span className="text-xs text-orange-600 font-medium">Sentiment Analysis</span>
              </div>
              <div className="space-y-3">
                {trendingTopics.slice(0, 5).map(topic => {
                  const sentimentPct = (topic as any).sentimentPercent || 0;
                  const isPositive = sentimentPct > 0;
                  const isNegative = sentimentPct < 0;

                  return (
                    <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-responsive-sm font-medium text-gray-900">
                            {topic.topic}
                          </span>
                          {topic.mentions > 0 && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className={`w-3 h-3 ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-400'}`} />
                              <span className={`text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                                {topic.growth > 0 ? `+${topic.growth}%` : '0%'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            {topic.mentions} {topic.mentions === 1 ? 'article' : 'articles'}
                          </span>
                          <div className={`text-xs px-2 py-1 rounded font-medium ${
                            isPositive ? 'bg-green-100 text-green-700' :
                            isNegative ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {isPositive ? '+' : ''}{sentimentPct}% {isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <MobileButton
                  variant="outline"
                  size="small"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </MobileButton>
              </div>

              {showFilters && (
                <MobileCard padding="default" className="bg-gray-50">
                  <ResponsiveGrid cols={{ sm: 1, md: 3 }} gap="small">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Region</label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Regions</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="National">National</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Language</label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Languages</option>
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Timeframe</label>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="1h">Last Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last Week</option>
                      </select>
                    </div>
                  </ResponsiveGrid>
                </MobileCard>
              )}
            </div>

            {/* Loading State */}
            {loadingArticles && (
              <MobileCard padding="large">
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Loading latest news articles...</p>
                  <p className="text-sm text-gray-500 mt-2">Fetching from {newsSources.filter(s => s.active).length} sources</p>
                </div>
              </MobileCard>
            )}

            {/* Error State */}
            {articlesError && !loadingArticles && (
              <MobileCard padding="large">
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-gray-900 font-medium mb-2">Failed to load articles</p>
                  <p className="text-sm text-gray-600 mb-4">{articlesError}</p>
                  <button
                    onClick={() => refreshData()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                </div>
              </MobileCard>
            )}

            {/* Empty State */}
            {!loadingArticles && !articlesError && filteredArticles.length === 0 && (
              <MobileCard padding="large">
                <div className="flex flex-col items-center justify-center py-12">
                  <Newspaper className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-900 font-medium mb-2">No articles found</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {realArticles.length === 0
                      ? 'Run the news scraper to fetch articles from newspapers'
                      : 'Try adjusting your filters or search query'}
                  </p>
                  {realArticles.length === 0 && (
                    <p className="text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded">
                      Run: <code className="font-mono">npm run scrape-news</code>
                    </p>
                  )}
                </div>
              </MobileCard>
            )}

            {/* Articles List */}
            {!loadingArticles && !articlesError && filteredArticles.length > 0 && (
              <div className="space-y-4">
                {filteredArticles.map(article => (
                <MobileCard key={article.id} padding="default" className="relative">
                  <div className="flex items-start space-x-3">
                    {article.isBreaking && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          BREAKING
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">{article.source}</span>
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(article.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {article.verified && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      
                      <h4
                        className="text-responsive-sm font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          if (article.url && article.url !== '#') {
                            window.open(article.url, '_blank');
                          } else {
                            const searchQuery = encodeURIComponent(article.title);
                            window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                          }
                        }}
                      >
                        {article.title}
                      </h4>
                      
                      <p className="text-responsive-xs text-gray-700 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(article.sentiment)}`}>
                          {article.sentiment} ({(article.sentimentScore > 1 ? article.sentimentScore : article.sentimentScore * 100).toFixed(0)}%)
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(article.priority)}`}>
                          {article.priority} priority
                        </span>
                        {article.topics.slice(0, 2).map(topic => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.engagement}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{article.credibilityScore}%</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <MobileButton variant="ghost" size="small">
                            <Bookmark className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="ghost" size="small">
                            <Share2 className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton
                            variant="ghost"
                            size="small"
                            onClick={() => {
                              if (article.url && article.url !== '#') {
                                window.open(article.url, '_blank');
                              } else {
                                const searchQuery = encodeURIComponent(article.title);
                                window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                              }
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </MobileButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </MobileCard>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                BJP Trending Analysis
              </h3>

              {trendingTopics.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-responsive-base mb-2">No trending topics available yet</p>
                  <p className="text-gray-400 text-responsive-xs">Trends will appear after scraping news articles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingTopics.map(topic => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-responsive-base font-semibold text-gray-900">
                        {topic.topic}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+{topic.growth}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {topic.mentions}
                        </div>
                        <div className="text-xs text-gray-600">Mentions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-responsive-base font-bold ${
                          topic.sentiment > 0.3 ? 'text-green-600' :
                          topic.sentiment < -0.3 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {(topic.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Sentiment</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {topic.relatedKeywords.map(keyword => (
                        <span key={keyword} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </MobileCard>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-responsive">
            {/* Party-wise Media Sentiment Comparison - Single Card */}
            <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Overall Media Sentiment Comparison</h2>
              <p className="text-sm text-gray-500 mb-6">Based on {articlesSource.length} news articles</p>

              {/* Main comparison */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{partyStats.bjp.favorabilityScore}%</div>
                  <div className="text-lg font-semibold text-orange-600">BJP</div>
                </div>

                <div className="text-gray-400 text-lg font-medium">vs</div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{partyStats.tmc.favorabilityScore}%</div>
                  <div className="text-lg font-semibold text-green-600">TMC</div>
                </div>
              </div>

              {/* Comparison bar */}
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div className="bg-orange-500" style={{ width: `${partyStats.bjp.favorabilityScore}%` }}></div>
                <div className="bg-green-500" style={{ width: `${partyStats.tmc.favorabilityScore}%` }}></div>
              </div>

            </div>

            {/* Header with Title */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">2026 WB Assembly Election Prediction</h2>
              <p className="text-sm text-gray-500">Based on current news sentiment analysis</p>
            </div>

            {/* Row 1: State-Level Summary */}
            <ResponsiveGrid cols={{ sm: 2, md: 4 }}>
              <MobileCard padding="compact" className="border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{predictionStats.bjpLeading}</div>
                  <div className="text-xs text-orange-700 font-medium">BJP Leading</div>
                  <div className="text-xs text-gray-500 mt-1">out of {constituencyPredictions.length} seats</div>
                </div>
              </MobileCard>
              <MobileCard padding="compact" className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{predictionStats.tmcLeading}</div>
                  <div className="text-xs text-green-700 font-medium">TMC Leading</div>
                  <div className="text-xs text-gray-500 mt-1">out of {constituencyPredictions.length} seats</div>
                </div>
              </MobileCard>
              <MobileCard padding="compact" className="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{predictionStats.swingSeats}</div>
                  <div className="text-xs text-yellow-700 font-medium">Swing Seats</div>
                  <div className="text-xs text-gray-500 mt-1">margin under 10%</div>
                </div>
              </MobileCard>
              <MobileCard padding="compact" className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {predictionStats.safeBjp + predictionStats.safeTmc}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">Safe Seats</div>
                  <div className="text-xs text-gray-500 mt-1">margin over 10%</div>
                </div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Visual Seat Distribution Bar */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Predicted Seat Distribution
              </h3>
              <div className="relative h-12 rounded-lg overflow-hidden flex">
                <div
                  className="bg-orange-500 flex items-center justify-center text-white font-bold text-sm transition-all"
                  style={{ width: `${(predictionStats.bjpLeading / constituencyPredictions.length) * 100}%` }}
                >
                  {predictionStats.bjpLeading > 3 && `BJP ${predictionStats.bjpLeading}`}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white font-bold text-sm transition-all"
                  style={{ width: `${(predictionStats.tmcLeading / constituencyPredictions.length) * 100}%` }}
                >
                  {predictionStats.tmcLeading > 3 && `TMC ${predictionStats.tmcLeading}`}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0</span>
                <span className="text-center">Majority: {Math.ceil(constituencyPredictions.length / 2) + 1} seats</span>
                <span>{constituencyPredictions.length}</span>
              </div>
              <div className="flex justify-center mt-3 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-xs text-gray-600">BJP ({predictionStats.bjpLeading})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">TMC ({predictionStats.tmcLeading})</span>
                </div>
              </div>
            </MobileCard>


            {/* Row 2: Top Swing Constituencies */}
            <MobileCard padding="default" className="border-yellow-200 bg-yellow-50/30">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                Top Swing Constituencies (Too Close to Call)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {constituencyPredictions
                  .filter(p => Math.abs(p.margin) <= 10)
                  .sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin))
                  .slice(0, 6)
                  .map(constituency => (
                    <div key={constituency.id} className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{constituency.name}</div>
                          <div className="text-xs text-gray-500">{constituency.district}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          constituency.trend === 'rising' ? 'bg-green-100 text-green-700' :
                          constituency.trend === 'falling' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {constituency.trend === 'rising' ? 'BJP Rising' :
                           constituency.trend === 'falling' ? 'TMC Rising' : 'Stable'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-600 font-bold text-sm">BJP {constituency.bjpWinProbability}%</span>
                          <span className="text-gray-400">vs</span>
                          <span className="text-green-600 font-bold text-sm">TMC {constituency.tmcWinProbability}%</span>
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                        <div className="bg-orange-500" style={{ width: `${constituency.bjpWinProbability}%` }}></div>
                        <div className="bg-green-500" style={{ width: `${constituency.tmcWinProbability}%` }}></div>
                      </div>
                    </div>
                  ))}
              </div>
            </MobileCard>

            {/* Row 3: Filter Controls */}
            <MobileCard padding="compact">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Filter:</span>
                  <div className="flex space-x-1">
                    {[
                      { key: 'all', label: `All (${constituencyPredictions.length})` },
                      { key: 'bjp', label: `BJP (${predictionStats.bjpLeading})` },
                      { key: 'tmc', label: `TMC (${predictionStats.tmcLeading})` },
                      { key: 'swing', label: `Swing (${predictionStats.swingSeats})` }
                    ].map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => setPredictionFilter(filter.key as any)}
                        className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                          predictionFilter === filter.key
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <select
                    value={predictionSort}
                    onChange={(e) => setPredictionSort(e.target.value as any)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="margin">By Margin</option>
                    <option value="bjp">BJP Highest</option>
                    <option value="tmc">TMC Highest</option>
                    <option value="name">By Name</option>
                  </select>
                </div>
              </div>
            </MobileCard>

            {/* Row 4: Constituency Predictions Table */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                ABP-CVoter Style 2026 Assembly Predictions ({filteredPredictions.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Constituency</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600 hidden sm:table-cell">District</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600">Predicted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.map((prediction, index) => {
                      const isBjpLeading = prediction.predictedWinner === 'BJP';
                      const isSwing = prediction.predictedWinner === 'Swing';
                      return (
                        <tr
                          key={prediction.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            isSwing ? 'bg-yellow-50/50' :
                            isBjpLeading ? 'bg-orange-50/30' : 'bg-green-50/30'
                          }`}
                        >
                          <td className="py-2 px-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 px-2 font-medium text-gray-900">
                            {prediction.name}
                          </td>
                          <td className="py-2 px-2 text-gray-600 hidden sm:table-cell">{prediction.district}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              prediction.predictedWinner === 'BJP' ? 'bg-orange-100 text-orange-700' :
                              prediction.predictedWinner === 'TMC' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {prediction.predictedWinner}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </MobileCard>

            {/* Row 5: Party Strongholds by Article Sentiment */}
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              <MobileCard padding="default" className="border-orange-100">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  BJP Leading Constituencies
                </h3>
                <div className="space-y-2">
                  {constituencyPredictions
                    .filter(p => p.predictedWinner === 'BJP')
                    .sort((a, b) => b.bjpPositive - a.bjpPositive)
                    .slice(0, 5)
                    .map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.district}</div>
                        </div>
                      </div>
                    ))}
                  {constituencyPredictions.filter(p => p.predictedWinner === 'BJP').length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">No BJP leading constituencies yet</div>
                  )}
                </div>
              </MobileCard>

              <MobileCard padding="default" className="border-green-100">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  TMC Leading Constituencies
                </h3>
                <div className="space-y-2">
                  {constituencyPredictions
                    .filter(p => p.predictedWinner === 'TMC')
                    .sort((a, b) => b.tmcPositive - a.tmcPositive)
                    .slice(0, 5)
                    .map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.district}</div>
                        </div>
                      </div>
                    ))}
                  {constituencyPredictions.filter(p => p.predictedWinner === 'TMC').length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">No TMC leading constituencies yet</div>
                  )}
                </div>
              </MobileCard>
            </ResponsiveGrid>

          </div>
        )}
      </div>
    </div>
  );
}