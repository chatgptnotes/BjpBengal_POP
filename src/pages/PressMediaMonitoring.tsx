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

// Helper function to map database articles to component interface
function mapDBArticleToComponent(dbArticle: DBNewsArticle): NewsArticle {
  // Extract topics from tags or create from category
  const topics = dbArticle.tags || (dbArticle.category ? [dbArticle.category] : []);

  // Determine sentiment from polarity
  const sentiment = (dbArticle.sentiment_polarity || 'neutral') as 'positive' | 'negative' | 'neutral';

  // Calculate engagement score (mock for now, can be enhanced)
  const engagement = Math.floor((dbArticle.credibility_score || 50) * 10 + Math.random() * 500);

  // Extract mentions from TVK context or empty array
  const mentions: string[] = [];
  if (dbArticle.tvk_mentioned && dbArticle.tvk_context) {
    // Extract potential entity mentions from context (simple implementation)
    const contextWords = dbArticle.tvk_context.split(/\s+/);
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
    region: 'Tamil Nadu', // Default, can be enhanced with state/district lookup
    language: dbArticle.language || 'en',
    url: dbArticle.url || '#',
    isBreaking: dbArticle.is_breaking || false,
    priority: (dbArticle.priority || 'medium') as 'high' | 'medium' | 'low',
    verified: dbArticle.is_verified || false
  };
}

const newsSources: NewsSource[] = [
  {
    id: 'manorama',
    name: 'Malayala Manorama',
    logo: '📰',
    credibilityScore: 92,
    bias: 'center',
    region: 'Tamil Nadu',
    language: 'Tamil',
    active: true,
    articlesCount: 1247,
    reachEstimate: 2800000
  },
  {
    id: 'mathrubhumi',
    name: 'Mathrubhumi',
    logo: '📖',
    credibilityScore: 89,
    bias: 'center',
    region: 'Tamil Nadu',
    language: 'Tamil',
    active: true,
    articlesCount: 1156,
    reachEstimate: 2200000
  },
  {
    id: 'hindu',
    name: 'The Hindu',
    logo: '🗞️',
    credibilityScore: 94,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 892,
    reachEstimate: 1800000
  },
  {
    id: 'times',
    name: 'Times of India',
    logo: '⏰',
    credibilityScore: 78,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 2341,
    reachEstimate: 4200000
  },
  {
    id: 'indian-express',
    name: 'Indian Express',
    logo: '🚂',
    credibilityScore: 87,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 756,
    reachEstimate: 1600000
  },
  {
    id: 'asianet',
    name: 'Asianet News',
    logo: '📺',
    credibilityScore: 82,
    bias: 'center',
    region: 'Tamil Nadu',
    language: 'Tamil',
    active: true,
    articlesCount: 1689,
    reachEstimate: 1900000
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    logo: '📹',
    credibilityScore: 85,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 1123,
    reachEstimate: 2100000
  },
  {
    id: 'aaj-tak',
    name: 'Aaj Tak',
    logo: '🎯',
    credibilityScore: 75,
    bias: 'center',
    region: 'National',
    language: 'Hindi',
    active: true,
    articlesCount: 1834,
    reachEstimate: 3200000
  }
];

const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Tamil Nadu Budget 2026: Focus on Education and Healthcare Infrastructure',
    summary: 'State government announces major allocation for educational reforms and healthcare modernization across all districts.',
    source: 'Malayala Manorama',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 92,
    engagement: 1245,
    topics: ['Budget', 'Education', 'Healthcare', 'Infrastructure'],
    mentions: ['Chief Minister', 'Finance Minister', 'Education Department'],
    region: 'Tamil Nadu',
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
    region: 'Tamil Nadu',
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
    region: 'Tamil Nadu',
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

  // Calculate trending topics from real articles
  const trendingTopics: TrendingTopic[] = useMemo(() => {
    if (articlesSource.length === 0) return [];

    // Common words to filter out
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'of', 'to', 'for', 'with', 'from', 'by', 'in', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once']);

    // Extract topics from article titles and content
    const topicMap = new Map<string, {
      count: number;
      sentiments: number[];
      keywords: Set<string>;
    }>();

    articlesSource.forEach(article => {
      // Extract topics from title and summary
      const text = (article.title + ' ' + (article.summary || '')).toLowerCase();
      const words = text.split(/\W+/).filter(word =>
        word.length > 3 && !stopWords.has(word.toLowerCase())
      );

      // Get unique meaningful words as topics
      const articleTopics = Array.from(new Set(words)).slice(0, 5);

      articleTopics.forEach(topic => {
        if (!topicMap.has(topic)) {
          topicMap.set(topic, { count: 0, sentiments: [], keywords: new Set() });
        }
        const data = topicMap.get(topic)!;
        data.count++;

        // Convert sentiment to number (positive=1, neutral=0, negative=-1)
        const sentimentValue =
          article.sentiment === 'positive' ? 1 :
          article.sentiment === 'negative' ? -1 : 0;
        data.sentiments.push(sentimentValue);

        // Add other topics from this article as keywords
        articleTopics.forEach(kw => {
          if (kw !== topic && data.keywords.size < 4) {
            data.keywords.add(kw.toLowerCase());
          }
        });
      });
    });

    // Convert to array and calculate averages
    const topics = Array.from(topicMap.entries()).map(([topic, data], index) => {
      const avgSentiment = data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length;
      // Normalize sentiment from [-1, 1] to [0, 1]
      const normalizedSentiment = (avgSentiment + 1) / 2;

      return {
        id: String(index + 1),
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        mentions: data.count,
        sentiment: normalizedSentiment,
        growth: Math.floor(Math.random() * 150) + 10, // Simulated growth (would need historical data)
        relatedKeywords: Array.from(data.keywords).slice(0, 4),
        timeframe: '24h'
      };
    });

    // Sort by mentions and return top 5
    return topics.sort((a, b) => b.mentions - a.mentions).slice(0, 5);
  }, [articlesSource]);

  // Calculate language distribution from real articles
  const languageDistribution = useMemo(() => {
    if (articlesSource.length === 0) {
      return { tamil: 0, english: 0, malayalam: 0, hindi: 0, other: 0 };
    }

    const counts = articlesSource.reduce((acc, article) => {
      const lang = article.language?.toLowerCase() || 'other';
      if (lang.includes('tamil') || lang === 'ta') acc.tamil++;
      else if (lang.includes('english') || lang === 'en') acc.english++;
      else if (lang.includes('malayalam') || lang === 'ml') acc.malayalam++;
      else if (lang.includes('hindi') || lang === 'hi') acc.hindi++;
      else acc.other++;
      return acc;
    }, { tamil: 0, english: 0, malayalam: 0, hindi: 0, other: 0 });

    const total = articlesSource.length;
    return {
      tamil: Math.round((counts.tamil / total) * 100),
      english: Math.round((counts.english / total) * 100),
      malayalam: Math.round((counts.malayalam / total) * 100),
      hindi: Math.round((counts.hindi / total) * 100),
      other: Math.round((counts.other / total) * 100)
    };
  }, [articlesSource]);

  // Calculate source performance from real articles
  const sourcePerformance = useMemo(() => {
    const sourceCounts = articlesSource.reduce((acc, article) => {
      acc[article.source] = (acc[article.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return newsSources.map(source => ({
      ...source,
      articleCount: sourceCounts[source.name] || 0
    })).sort((a, b) => b.articleCount - a.articleCount);
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
    totalArticles: 12456,
    positivesentiment: 62,
    negativeSentiment: 23,
    neutralSentiment: 15,
    breakingNews: 5,
    verifiedSources: 28,
    avgCredibility: 87,
    totalReach: 18500000
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
      const positive = articlesSource.filter(a => a.sentiment === 'positive').length;
      const negative = articlesSource.filter(a => a.sentiment === 'negative').length;
      const neutral = articlesSource.filter(a => a.sentiment === 'neutral').length;
      const breaking = articlesSource.filter(a => a.isBreaking).length;
      const verified = articlesSource.filter(a => a.verified).length;
      const avgCred = articlesSource.reduce((sum, a) => sum + a.credibilityScore, 0) / articlesSource.length;

      setAnalytics({
        totalArticles: articlesSource.length,
        positivesentiment: Math.round((positive / articlesSource.length) * 100),
        negativeSentiment: Math.round((negative / articlesSource.length) * 100),
        neutralSentiment: Math.round((neutral / articlesSource.length) * 100),
        breakingNews: breaking,
        verifiedSources: newsSources.filter(s => s.active).length,
        avgCredibility: Math.round(avgCred),
        totalReach: 18500000 // Keep mock for now
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
            {/* Key Metrics */}
            <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
              <MobileCard padding="default" className="text-center">
                <Newspaper className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.totalArticles.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Articles Today</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.positivesentiment}%
                </div>
                <div className="text-responsive-sm text-gray-600">Positive Sentiment</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.verifiedSources}
                </div>
                <div className="text-responsive-sm text-gray-600">Verified Sources</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Eye className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.totalReach / 1000000).toFixed(1)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Total Reach</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Breaking News Alert */}
            {mockArticles.some(article => article.isBreaking) && (
              <MobileCard padding="default" className="border-red-200 bg-red-50">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-red-600 animate-pulse" />
                  <div className="flex-1">
                    <h3 className="text-responsive-base font-semibold text-red-900">
                      Breaking News Alert
                    </h3>
                    <p className="text-responsive-sm text-red-700">
                      {mockArticles.find(article => article.isBreaking)?.title}
                    </p>
                  </div>
                  <MobileButton variant="outline" size="small">
                    <ExternalLink className="w-4 h-4" />
                  </MobileButton>
                </div>
              </MobileCard>
            )}

            {/* Sentiment Distribution */}
            <MobileCard padding="default">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Sentiment Distribution
                </h3>
                <div className="flex space-x-2">
                  <span className="text-responsive-xs text-gray-500">Last 24h</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Positive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.positivesentiment}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.positivesentiment}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Neutral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.neutralSentiment}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.neutralSentiment}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Negative</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.negativeSentiment}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.negativeSentiment}%
                    </span>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* Top Trending Topics */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.slice(0, 3).map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-responsive-sm font-medium text-gray-900">
                          {topic.topic}
                        </span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+{topic.growth}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                          {topic.mentions} mentions
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          topic.sentiment > 0.3 ? 'bg-green-100 text-green-700' :
                          topic.sentiment < -0.3 ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {topic.sentiment > 0 ? '+' : ''}{(topic.sentiment * 100).toFixed(0)}% sentiment
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-responsive">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-responsive-lg font-semibold text-gray-900">
                News Sources
              </h3>
              <MobileButton variant="outline" size="small">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </MobileButton>
            </div>

            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
              {newsSources.map(source => (
                <MobileCard key={source.id} padding="default" className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{source.logo}</div>
                      <div>
                        <h4 className="text-responsive-sm font-semibold text-gray-900">
                          {source.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${getBiasColor(source.bias)}`}>
                            {source.bias}
                          </span>
                          <span className="text-xs text-gray-500">{source.language}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Credibility</span>
                      <span className="font-medium text-gray-900">{source.credibilityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${source.credibilityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{source.articlesCount}</div>
                      <div className="text-gray-600">Articles</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{(source.reachEstimate / 1000000).toFixed(1)}M</div>
                      <div className="text-gray-600">Reach</div>
                    </div>
                  </div>
                </MobileCard>
              ))}
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
                        <option value="Tamil Nadu">Tamil Nadu</option>
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
                Trending Topics Analysis
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
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Source Performance
                </h3>
                <div className="space-y-3">
                  {sourcePerformance.slice(0, 5).map(source => (
                    <div key={source.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{source.logo}</span>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-700">{source.name}</span>
                          <span className="text-xs text-gray-500">{source.articleCount || 0} articles</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${source.credibilityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 w-8">
                          {source.credibilityScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCard>

              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Language Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Tamil</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${languageDistribution.tamil}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{languageDistribution.tamil}%</span>
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
                  {languageDistribution.malayalam > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">Malayalam</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${languageDistribution.malayalam}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{languageDistribution.malayalam}%</span>
                      </div>
                    </div>
                  )}
                  {languageDistribution.hindi > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">Hindi</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${languageDistribution.hindi}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{languageDistribution.hindi}%</span>
                      </div>
                    </div>
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