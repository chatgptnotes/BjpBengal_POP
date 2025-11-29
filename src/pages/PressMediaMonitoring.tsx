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
  ExternalLink
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';
import { useNewsSentiment } from '../hooks/useNewsSentiment';
import { NewsArticle as DBNewsArticle } from '../services/newsService';

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

  return {
    id: dbArticle.id || Math.random().toString(),
    title: dbArticle.title,
    summary: dbArticle.summary || dbArticle.content.substring(0, 300) + '...',
    source: dbArticle.source,
    timestamp: new Date(dbArticle.published_at || dbArticle.created_at || new Date()),
    sentiment,
    sentimentScore: dbArticle.sentiment_score || 0,
    credibilityScore: dbArticle.credibility_score || 70,
    engagement,
    topics,
    mentions,
    region: 'West Bengal', // Default, can be enhanced with state/district lookup
    language: dbArticle.language || 'en',
    url: dbArticle.url || '#',
    isBreaking: dbArticle.is_breaking || false,
    priority: (dbArticle.priority || 'medium') as 'high' | 'medium' | 'low',
    verified: dbArticle.is_verified || false
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

const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'West Bengal Budget 2026: Focus on Education and Healthcare Infrastructure',
    summary: 'State government announces major allocation for educational reforms and healthcare modernization across all districts.',
    source: 'Malayala Manorama',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 92,
    engagement: 1245,
    topics: ['Budget', 'Education', 'Healthcare', 'Infrastructure'],
    mentions: ['Chief Minister', 'Finance Minister', 'Education Department'],
    region: 'West Bengal',
    language: 'Tamil',
    url: '#',
    isBreaking: true,
    priority: 'high',
    verified: true
  },
  {
    id: '2',
    title: 'Public Opinion Poll Shows Shift in Voter Preferences',
    summary: 'Latest survey reveals changing political landscape with emerging issues taking center stage.',
    source: 'The Hindu',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    sentiment: 'neutral',
    sentimentScore: 0.05,
    credibilityScore: 94,
    engagement: 892,
    topics: ['Election', 'Polling', 'Politics', 'Survey'],
    mentions: ['Opposition Leader', 'Political Parties', 'Voters'],
    region: 'West Bengal',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true
  },
  {
    id: '3',
    title: 'Infrastructure Development Projects Face Delays',
    summary: 'Several key infrastructure projects across the state experiencing timeline extensions due to various challenges.',
    source: 'Mathrubhumi',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    sentiment: 'negative',
    sentimentScore: -0.58,
    credibilityScore: 89,
    engagement: 654,
    topics: ['Infrastructure', 'Development', 'Government', 'Projects'],
    mentions: ['PWD', 'Contractors', 'Local Bodies'],
    region: 'West Bengal',
    language: 'Tamil',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true
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

  // Fallback to mock data if no real articles available (memoized to prevent infinite re-renders)
  const articlesSource = useMemo(() =>
    realArticles.length > 0 ? realArticles : mockArticles,
    [realArticles]
  );

  // BJP Work Categories with sentiment tracking
  const BJP_WORK_CATEGORIES = [
    { name: 'BJP Rally & Events', keywords: ['rally', 'sabha', 'meeting', 'gathering', 'event', 'program'] },
    { name: 'Modi Leadership', keywords: ['modi', 'prime minister', 'speech', 'address', 'pm'] },
    { name: 'Suvendu Campaign', keywords: ['suvendu', 'adhikari', 'nandigram', 'leader'] },
    { name: 'Bengal Elections', keywords: ['election', 'vote', 'polling', 'booth', 'candidate', 'ballot'] },
    { name: 'BJP vs TMC', keywords: ['tmc', 'trinamool', 'mamata', 'clash', 'attack', 'oppose'] },
    { name: 'Development Work', keywords: ['development', 'scheme', 'project', 'infrastructure', 'welfare'] }
  ];

  // Calculate BJP work categories with sentiment from real articles
  const trendingTopics: TrendingTopic[] = useMemo(() => {
    // Analyze all articles for BJP work categories
    const categoryStats = BJP_WORK_CATEGORIES.map((category, index) => {
      // Find articles matching this category
      const matchingArticles = articlesSource.filter(article => {
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
  }, [articlesSource]);

  // Calculate language distribution from real articles
  const languageDistribution = useMemo(() => {
    if (articlesSource.length === 0) {
      return { bengali: 0, english: 0, hindi: 0, other: 0 };
    }

    const counts = articlesSource.reduce((acc, article) => {
      const lang = article.language?.toLowerCase() || 'other';
      if (lang.includes('bengali') || lang.includes('bangla') || lang === 'bn') acc.bengali++;
      else if (lang.includes('english') || lang === 'en') acc.english++;
      else if (lang.includes('hindi') || lang === 'hi') acc.hindi++;
      else acc.other++;
      return acc;
    }, { bengali: 0, english: 0, hindi: 0, other: 0 });

    const total = articlesSource.length;
    return {
      bengali: Math.round((counts.bengali / total) * 100),
      english: Math.round((counts.english / total) * 100),
      hindi: Math.round((counts.hindi / total) * 100),
      other: Math.round((counts.other / total) * 100)
    };
  }, [articlesSource]);

  // Calculate BJP sentiment per source from real articles
  const sourcePerformance = useMemo(() => {
    // Filter only BJP-related articles
    const bjpArticles = articlesSource.filter(a => isBJPArticle(a));

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
  }, [articlesSource]);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

    setFilteredArticles(filtered);

    // Update analytics based on real data
    if (articlesSource.length > 0) {
      // Filter BJP-related articles
      const bjpArticles = articlesSource.filter(a => isBJPArticle(a));

      // All articles sentiment
      const positive = articlesSource.filter(a => a.sentiment === 'positive').length;
      const negative = articlesSource.filter(a => a.sentiment === 'negative').length;
      const neutral = articlesSource.filter(a => a.sentiment === 'neutral').length;

      // BJP articles sentiment
      const bjpPositive = bjpArticles.filter(a => a.sentiment === 'positive').length;
      const bjpNegative = bjpArticles.filter(a => a.sentiment === 'negative').length;
      const bjpNeutral = bjpArticles.filter(a => a.sentiment === 'neutral').length;

      const breaking = bjpArticles.filter(a => a.isBreaking).length;
      const avgCred = articlesSource.reduce((sum, a) => sum + a.credibilityScore, 0) / articlesSource.length;

      // Count total BJP mentions across all articles
      const bjpMentionCount = bjpArticles.length;

      setAnalytics({
        totalArticles: articlesSource.length,
        bjpArticles: bjpArticles.length,
        positivesentiment: articlesSource.length > 0 ? Math.round((positive / articlesSource.length) * 100) : 0,
        negativeSentiment: articlesSource.length > 0 ? Math.round((negative / articlesSource.length) * 100) : 0,
        neutralSentiment: articlesSource.length > 0 ? Math.round((neutral / articlesSource.length) * 100) : 0,
        bjpPositive: bjpArticles.length > 0 ? Math.round((bjpPositive / bjpArticles.length) * 100) : 0,
        bjpNegative: bjpArticles.length > 0 ? Math.round((bjpNegative / bjpArticles.length) * 100) : 0,
        bjpNeutral: bjpArticles.length > 0 ? Math.round((bjpNeutral / bjpArticles.length) * 100) : 0,
        breakingNews: breaking,
        verifiedSources: newsSources.filter(s => s.active).length,
        avgCredibility: Math.round(avgCred),
        bjpMentions: bjpMentionCount
      });
    }
  }, [searchQuery, selectedRegion, selectedLanguage, articlesSource]);

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
    { key: 'analytics', label: 'Analytics', icon: Activity }
  ];

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
            <MobileButton
              variant="outline"
              size="small"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isMonitoring ? 'Pause' : 'Resume'}
            </MobileButton>
          </div>
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
                          {new Date(article.timestamp).toLocaleTimeString()}
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-responsive">
            {/* Row 1: Overall BJP Stats and Sentiment Trend */}
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              {/* Overall BJP Stats */}
              <MobileCard padding="default" className="border-orange-100">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Overall BJP Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">{analytics.bjpArticles}</div>
                    <div className="text-xs text-orange-600">BJP Articles</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{analytics.totalArticles}</div>
                    <div className="text-xs text-gray-600">Total Articles</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-700">Positive Coverage</span>
                    <span className="font-bold text-green-700">{analytics.bjpPositive}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.bjpPositive}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Neutral Coverage</span>
                    <span className="font-bold text-gray-600">{analytics.bjpNeutral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${analytics.bjpNeutral}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-700">Negative Coverage</span>
                    <span className="font-bold text-red-700">{analytics.bjpNegative}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analytics.bjpNegative}%` }} />
                  </div>
                </div>
              </MobileCard>

              {/* BJP Sentiment Trend */}
              <MobileCard padding="default" className="border-orange-100">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  BJP Sentiment Score
                </h3>
                <div className="flex flex-col items-center justify-center py-4">
                  {(() => {
                    const netSentiment = analytics.bjpPositive - analytics.bjpNegative;
                    const isPositive = netSentiment > 0;
                    const isNegative = netSentiment < 0;
                    return (
                      <>
                        <div className={`text-5xl font-bold mb-2 ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                          {isPositive ? '+' : ''}{netSentiment}%
                        </div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                          isPositive ? 'bg-green-100 text-green-700' :
                          isNegative ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {isPositive ? 'Positive Trend' : isNegative ? 'Negative Trend' : 'Neutral'}
                        </div>
                        <div className="mt-4 w-full">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Negative</span>
                            <span>Neutral</span>
                            <span>Positive</span>
                          </div>
                          <div className="h-3 bg-gradient-to-r from-red-500 via-gray-300 to-green-500 rounded-full relative">
                            <div
                              className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full -top-0.5"
                              style={{ left: `${Math.min(Math.max((netSentiment + 100) / 2, 0), 100)}%`, transform: 'translateX(-50%)' }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Row 2: Source Performance and Language Distribution */}
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              {/* Source Performance with BJP Sentiment */}
              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Source BJP Sentiment
                </h3>
                <div className="space-y-3">
                  {sourcePerformance.slice(0, 5).map(source => {
                    const isPositive = source.bjpSentimentPercent > 0;
                    const isNegative = source.bjpSentimentPercent < 0;
                    return (
                      <div key={source.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{source.logo}</span>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-700">{source.name}</span>
                            <span className="text-xs text-gray-500">{source.bjpArticleCount || 0} BJP articles</span>
                          </div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${
                          isPositive ? 'bg-green-100 text-green-700' :
                          isNegative ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {isPositive ? '+' : ''}{source.bjpSentimentPercent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </MobileCard>

              {/* Language Distribution */}
              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Language Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Bengali</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${languageDistribution.bengali}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{languageDistribution.bengali}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">English</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${languageDistribution.english}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{languageDistribution.english}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Hindi</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${languageDistribution.hindi}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{languageDistribution.hindi}%</span>
                    </div>
                  </div>
                  {languageDistribution.other > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">Other</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${languageDistribution.other}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{languageDistribution.other}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Row 3: Top BJP Work Categories */}
            <MobileCard padding="default" className="border-orange-100">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Top BJP Work Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {trendingTopics.slice(0, 6).map(topic => {
                  const sentimentPct = (topic as any).sentimentPercent || 0;
                  const isPositive = sentimentPct > 0;
                  const isNegative = sentimentPct < 0;
                  return (
                    <div key={topic.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-1">{topic.topic}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{topic.mentions} articles</span>
                        <span className={`text-xs font-bold ${
                          isPositive ? 'text-green-600' :
                          isNegative ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {isPositive ? '+' : ''}{sentimentPct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MobileCard>
          </div>
        )}
      </div>
    </div>
  );
}