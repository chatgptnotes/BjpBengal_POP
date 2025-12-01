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
import { seedMockArticles, SeedResult } from '../utils/seedArticles';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';
import { useNewsSentiment } from '../hooks/useNewsSentiment';
import { NewsArticle as DBNewsArticle } from '../services/newsService';
import constituenciesDataRaw from '../data/wb_constituencies_50.json';
import { generatePredictions, calculatePredictionStats, filterPredictions, ConstituencyPrediction, PredictionStats } from '../services/predictionService';
import { seedElectionData } from '../utils/seedElectionData';

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
    constituency: 'Cooch Behar',
    district: 'Cooch Behar'
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

  // Use real articles from database, with fallback to mock if empty
  const articlesSource = useMemo(() => {
    // Prefer real articles from database
    if (realArticles && realArticles.length > 0) {
      return realArticles;
    }
    // Fallback to mock articles if no real data available
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);

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
  }, [searchQuery, selectedRegion, selectedLanguage, selectedConstituency, articlesSource]);

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
    { key: 'sources', label: 'Sources', icon: BookOpen },
    { key: 'articles', label: 'Articles', icon: Newspaper },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'predictions', label: 'Analytics', icon: Target }
  ];

  // Win Prediction Data - Real data from 2021 Assembly + 2024 Lok Sabha results
  const [constituencyPredictions, setConstituencyPredictions] = useState<ConstituencyPrediction[]>([]);
  const [predictionStats, setPredictionStats] = useState<PredictionStats>({
    bjpLeading: 0,
    tmcLeading: 0,
    swingSeats: 0,
    safeBjp: 0,
    safeTmc: 0,
    predictedBjpSeats: { min: 0, max: 0 },
    predictedTmcSeats: { min: 0, max: 0 }
  });
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(true);
  const [isSeedingElection, setIsSeedingElection] = useState(false);

  // Load real prediction data on mount
  useEffect(() => {
    async function loadPredictions() {
      setIsPredictionsLoading(true);
      try {
        const predictions = await generatePredictions(50, 50); // Default sentiment scores
        setConstituencyPredictions(predictions);
        setPredictionStats(calculatePredictionStats(predictions));
      } catch (error) {
        console.error('Error loading predictions:', error);
      } finally {
        setIsPredictionsLoading(false);
      }
    }
    loadPredictions();
  }, []);

  // Handle seeding election data
  const handleSeedElectionData = async () => {
    if (isSeedingElection) return;
    setIsSeedingElection(true);
    try {
      const result = await seedElectionData();
      if (result.success) {
        // Reload predictions after seeding
        const predictions = await generatePredictions(50, 50);
        setConstituencyPredictions(predictions);
        setPredictionStats(calculatePredictionStats(predictions));
        alert(`Seeded ${result.inserted} constituencies with real 2021+2024+2025 election data!`);
      } else {
        alert(`Seeding failed: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSeedingElection(false);
    }
  };

  // Prediction Filters
  const [predictionFilter, setPredictionFilter] = useState<'all' | 'bjp' | 'tmc' | 'swing'>('all');
  const [predictionSort, setPredictionSort] = useState<'margin' | 'bjp' | 'tmc' | 'name'>('margin');

  // Filter and sort predictions using service
  const filteredPredictions = useMemo(() => {
    return filterPredictions(constituencyPredictions, predictionFilter, predictionSort);
  }, [constituencyPredictions, predictionFilter, predictionSort]);

  // Handle seeding mock articles to database
  const handleSeedDatabase = async () => {
    if (isSeeding) return;

    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedMockArticles(mockArticles);
      setSeedResult(result);

      // Refresh data after successful seeding
      if (result.inserted > 0) {
        await refreshData();
      }
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
            {/* Sync Data Button - Only visible on Articles tab */}
            {activeTab === 'articles' && (
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

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-responsive">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-responsive-lg font-semibold text-gray-900">
                West Bengal News Sources
              </h3>
              <span className="text-xs text-orange-600 font-medium">BJP Coverage Sentiment</span>
            </div>

            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
              {sourcePerformance.map(source => {
                const isPositive = source.bjpSentimentPercent > 0;
                const isNegative = source.bjpSentimentPercent < 0;
                const sentimentColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
                const sentimentBgColor = isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-gray-400';
                const sentimentBarWidth = Math.min(Math.abs(source.bjpSentimentPercent), 100);

                return (
                  <MobileCard key={source.id} padding="default" className="relative border-orange-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{source.logo}</div>
                        <div>
                          <h4 className="text-responsive-sm font-semibold text-gray-900">
                            {source.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                              {source.language}
                            </span>
                            <span className="text-xs text-gray-500">{source.region}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>

                    {/* BJP Sentiment Section */}
                    <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 font-medium">BJP Sentiment</span>
                        <span className={`font-bold ${sentimentColor}`}>
                          {isPositive ? '+' : ''}{source.bjpSentimentPercent}% {isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${sentimentBgColor} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${sentimentBarWidth}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{source.bjpArticleCount} BJP articles</span>
                        <span>{source.bjpPositiveCount} pos / {source.bjpNegativeCount} neg</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-medium text-blue-700">{source.credibilityScore}%</div>
                        <div className="text-blue-600">Credibility</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="font-medium text-purple-700">{(source.reachEstimate / 1000000).toFixed(1)}M</div>
                        <div className="text-purple-600">Reach</div>
                      </div>
                    </div>
                  </MobileCard>
                );
              })}
            </ResponsiveGrid>
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
                      
                      <h4 className="text-responsive-sm font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h4>
                      
                      <p className="text-responsive-xs text-gray-700 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(article.sentiment)}`}>
                          {article.sentiment} ({(article.sentimentScore * 100).toFixed(0)}%)
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
                          <MobileButton variant="ghost" size="small">
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
            {/* Header with Title and Seed Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">2026 WB Assembly Election Prediction</h2>
                <p className="text-sm text-gray-500">Based on 2021 Assembly + 2024 Lok Sabha + 2025 By-Election results</p>
              </div>
              <div className="flex items-center gap-2">
                {isPredictionsLoading && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                )}
                <button
                  onClick={handleSeedElectionData}
                  disabled={isSeedingElection}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  {isSeedingElection ? 'Loading...' : 'Load Historical Data'}
                </button>
              </div>
            </div>

            {/* Row 1: State-Level Summary */}
            <ResponsiveGrid cols={{ sm: 2, md: 4 }}>
              <MobileCard padding="compact" className="border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{predictionStats.bjpLeading}</div>
                  <div className="text-xs text-orange-700 font-medium">BJP Leading</div>
                  <div className="text-xs text-gray-500 mt-1">out of 50 seats</div>
                </div>
              </MobileCard>
              <MobileCard padding="compact" className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{predictionStats.tmcLeading}</div>
                  <div className="text-xs text-green-700 font-medium">TMC Leading</div>
                  <div className="text-xs text-gray-500 mt-1">out of 50 seats</div>
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
                  style={{ width: `${(predictionStats.bjpLeading / 50) * 100}%` }}
                >
                  {predictionStats.bjpLeading > 3 && `BJP ${predictionStats.bjpLeading}`}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white font-bold text-sm transition-all"
                  style={{ width: `${(predictionStats.tmcLeading / 50) * 100}%` }}
                >
                  {predictionStats.tmcLeading > 3 && `TMC ${predictionStats.tmcLeading}`}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0</span>
                <span className="text-center">Majority: 26 seats</span>
                <span>50</span>
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
                      { key: 'all', label: 'All (50)' },
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
                Constituency-wise Predictions ({filteredPredictions.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Constituency</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600 hidden sm:table-cell">District</th>
                      <th className="text-center py-2 px-2 font-semibold text-orange-600">BJP %</th>
                      <th className="text-center py-2 px-2 font-semibold text-green-600">TMC %</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600">Margin</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600 hidden md:table-cell">Trend</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600 hidden lg:table-cell">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.map((prediction, index) => {
                      const isBjpLeading = prediction.bjpWinProbability > prediction.tmcWinProbability;
                      const isSwing = Math.abs(prediction.margin) <= 10;
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
                            <span className="flex items-center gap-1">
                              {prediction.name}
                              {prediction.has2025Data && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                  2025
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-gray-600 hidden sm:table-cell">{prediction.district}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`font-bold ${isBjpLeading ? 'text-orange-600' : 'text-orange-400'}`}>
                              {prediction.bjpWinProbability}%
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`font-bold ${!isBjpLeading ? 'text-green-600' : 'text-green-400'}`}>
                              {prediction.tmcWinProbability}%
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`font-bold ${
                              prediction.margin > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {prediction.margin > 0 ? '+' : ''}{prediction.margin}%
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center hidden md:table-cell">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              prediction.trend === 'rising' ? 'bg-green-100 text-green-700' :
                              prediction.trend === 'falling' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {prediction.trend}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center hidden lg:table-cell">
                            <span className="text-gray-600">{prediction.confidence}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </MobileCard>

            {/* Row 5: Factor Analysis */}
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              <MobileCard padding="default" className="border-orange-100">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  BJP Strongholds (Safe Seats)
                </h3>
                <div className="space-y-2">
                  {constituencyPredictions
                    .filter(p => p.bjpWinProbability >= 55)
                    .sort((a, b) => b.bjpWinProbability - a.bjpWinProbability)
                    .slice(0, 5)
                    .map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.district}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-orange-600">{c.bjpWinProbability}%</div>
                          <div className="text-xs text-gray-500">+{c.margin}% margin</div>
                        </div>
                      </div>
                    ))}
                </div>
              </MobileCard>

              <MobileCard padding="default" className="border-green-100">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  TMC Strongholds (Safe Seats)
                </h3>
                <div className="space-y-2">
                  {constituencyPredictions
                    .filter(p => p.tmcWinProbability >= 55)
                    .sort((a, b) => b.tmcWinProbability - a.tmcWinProbability)
                    .slice(0, 5)
                    .map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.district}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">{c.tmcWinProbability}%</div>
                          <div className="text-xs text-gray-500">{c.margin}% margin</div>
                        </div>
                      </div>
                    ))}
                </div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Row 6: Key Prediction Factors */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Prediction Factors Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">40%</div>
                  <div className="text-xs text-blue-700 font-medium">Media Sentiment</div>
                  <div className="text-xs text-gray-500 mt-1">News coverage analysis</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">25%</div>
                  <div className="text-xs text-purple-700 font-medium">Social Buzz</div>
                  <div className="text-xs text-gray-500 mt-1">Social media trends</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">20%</div>
                  <div className="text-xs text-green-700 font-medium">Ground Reports</div>
                  <div className="text-xs text-gray-500 mt-1">Field survey data</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">15%</div>
                  <div className="text-xs text-orange-700 font-medium">Historical</div>
                  <div className="text-xs text-gray-500 mt-1">Past voting patterns</div>
                </div>
              </div>
            </MobileCard>
          </div>
        )}
      </div>
    </div>
  );
}