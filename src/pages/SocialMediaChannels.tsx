import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Hash,
  TrendingUp,
  Users,
  Heart,
  Share2,
  Eye,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Globe,
  Clock,
  Target,
  Activity,
  Search,
  Filter,
  Play,
  Pause,
  Settings,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  Camera,
  Video,
  Mic,
  Image,
  Link,
  RefreshCw,
  Bell,
  MapPin,
  Calendar,
  UserPlus,
  Bookmark
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';
import { socialMediaService, type SocialMediaPost as DBSocialMediaPost } from '../services/supabase/socialMedia.service';
import { supabase } from '../lib/supabase';
import {
  fetchBJPBengalFeed,
  startAutoRefresh,
  stopAutoRefresh,
  subscribeToUpdates,
  getTwitterConfig,
  getRemainingAPICalls,
  isAPILimitReached,
  BJP_BENGAL_CONFIG,
  type Tweet,
  type BJPBengalFeed
} from '../services/twitterScraper';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  followers: number;
  dailyPosts: number;
  engagement: number;
  sentiment: number;
  reach: number;
  isActive: boolean;
  apiStatus: 'connected' | 'limited' | 'error' | 'maintenance';
  lastUpdated: Date;
}

interface SocialPost {
  id: string;
  platform: string;
  author: string;
  authorFollowers: number;
  content: string;
  timestamp: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  topics: string[];
  mentions: string[];
  hashtags: string[];
  mediaType: 'text' | 'image' | 'video' | 'link';
  isVerified: boolean;
  location?: string;
  language: string;
  influence: number;
  viralPotential: number;
  category: 'political' | 'social' | 'economic' | 'general';
}

interface TrendingHashtag {
  id: string;
  hashtag: string;
  platform: string;
  mentions: number;
  growth: number;
  sentiment: number;
  associatedTopics: string[];
  timeframe: '1h' | '6h' | '24h' | '7d';
  peakTime: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Globe,
    color: 'bg-blue-600',
    followers: 4200000,
    dailyPosts: 15600,
    engagement: 78,
    sentiment: 68,
    reach: 12500000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Camera,
    color: 'bg-pink-600',
    followers: 2800000,
    dailyPosts: 8900,
    engagement: 85,
    sentiment: 72,
    reach: 8900000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 180000) // 3 minutes ago
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: MessageCircle,
    color: 'bg-black',
    followers: 3500000,
    dailyPosts: 24500,
    engagement: 65,
    sentiment: 58,
    reach: 15600000,
    isActive: true,
    apiStatus: 'limited',
    lastUpdated: new Date(Date.now() - 420000) // 7 minutes ago
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Play,
    color: 'bg-red-600',
    followers: 1900000,
    dailyPosts: 450,
    engagement: 82,
    sentiment: 75,
    reach: 6700000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 240000) // 4 minutes ago
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'bg-green-600',
    followers: 8500000,
    dailyPosts: 45000,
    engagement: 92,
    sentiment: 69,
    reach: 18200000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 150000) // 2.5 minutes ago
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Zap,
    color: 'bg-blue-500',
    followers: 1200000,
    dailyPosts: 3200,
    engagement: 76,
    sentiment: 64,
    reach: 4800000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 360000) // 6 minutes ago
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: UserPlus,
    color: 'bg-blue-700',
    followers: 680000,
    dailyPosts: 890,
    engagement: 71,
    sentiment: 78,
    reach: 2100000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 480000) // 8 minutes ago
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Mic,
    color: 'bg-black',
    followers: 1800000,
    dailyPosts: 1200,
    engagement: 89,
    sentiment: 71,
    reach: 5400000,
    isActive: true,
    apiStatus: 'limited',
    lastUpdated: new Date(Date.now() - 600000) // 10 minutes ago
  }
];

const mockSocialPosts: SocialPost[] = [
  {
    id: '1',
    platform: 'Facebook',
    author: 'West Bengal State News',
    authorFollowers: 450000,
    content: 'Breaking: West Bengal Budget 2026 allocates ₹15,000 crores for education sector modernization. This historic investment will benefit over 45 lakh students across the state. #West BengalBudget2026 #Education #Development',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    engagement: {
      likes: 12500,
      shares: 3200,
      comments: 890,
      views: 125000
    },
    sentiment: 'positive',
    sentimentScore: 0.78,
    topics: ['Budget', 'Education', 'Development'],
    mentions: ['West Bengal State', 'Education Department'],
    hashtags: ['#West BengalBudget2026', '#Education', '#Development'],
    mediaType: 'image',
    isVerified: true,
    location: 'Thiruvananthapuram',
    language: 'English',
    influence: 85,
    viralPotential: 78,
    category: 'political'
  },
  {
    id: '2',
    platform: 'Instagram',
    author: 'YouthWest BengalNow',
    authorFollowers: 180000,
    content: 'Young voters are speaking up! Our generation cares about climate action, job opportunities, and digital infrastructure. Time for leaders to listen 🗳️ #YouthVoice #West Bengal2026',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    engagement: {
      likes: 8500,
      shares: 1200,
      comments: 450,
      views: 95000
    },
    sentiment: 'positive',
    sentimentScore: 0.65,
    topics: ['Youth', 'Climate', 'Employment', 'Digital Infrastructure'],
    mentions: ['Youth Voters', 'Leaders'],
    hashtags: ['#YouthVoice', '#West Bengal2026'],
    mediaType: 'video',
    isVerified: false,
    location: 'Kochi',
    language: 'English',
    influence: 72,
    viralPotential: 85,
    category: 'social'
  },
  {
    id: '3',
    platform: 'Twitter/X',
    author: 'West BengalPolitics',
    authorFollowers: 75000,
    content: 'Infrastructure projects timeline extended again. Citizens deserve transparent updates on project status and realistic completion dates. #Accountability #Infrastructure',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    engagement: {
      likes: 2800,
      shares: 1100,
      comments: 340,
      views: 45000
    },
    sentiment: 'negative',
    sentimentScore: -0.45,
    topics: ['Infrastructure', 'Accountability', 'Government'],
    mentions: ['Citizens', 'Government'],
    hashtags: ['#Accountability', '#Infrastructure'],
    mediaType: 'text',
    isVerified: true,
    location: 'West Bengal',
    language: 'English',
    influence: 68,
    viralPotential: 62,
    category: 'political'
  }
];

const trendingHashtags: TrendingHashtag[] = [
  {
    id: '1',
    hashtag: '#West BengalBudget2026',
    platform: 'Multiple',
    mentions: 45600,
    growth: 185,
    sentiment: 0.68,
    associatedTopics: ['Budget', 'Education', 'Healthcare', 'Infrastructure'],
    timeframe: '24h',
    peakTime: '20:00'
  },
  {
    id: '2',
    hashtag: '#YouthVoice',
    platform: 'Instagram',
    mentions: 12400,
    growth: 95,
    sentiment: 0.72,
    associatedTopics: ['Youth', 'Employment', 'Climate', 'Digital'],
    timeframe: '24h',
    peakTime: '18:30'
  },
  {
    id: '3',
    hashtag: '#Accountability',
    platform: 'Twitter/X',
    mentions: 8900,
    growth: 76,
    sentiment: 0.34,
    associatedTopics: ['Government', 'Transparency', 'Projects'],
    timeframe: '24h',
    peakTime: '21:15'
  }
];

export default function SocialMediaChannels() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalPosts: 98750,
    totalEngagement: 15600000,
    avgSentiment: 67,
    viralPosts: 23,
    activePlatforms: 8,
    trendingTopics: 15,
    realTimeAlerts: 5,
    crossPlatformReach: 68500000
  });

  // State for real posts from Supabase
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // BJP Bengal Twitter state
  const [bjpBengalTweets, setBjpBengalTweets] = useState<Tweet[]>([]);
  const [bjpBengalLoading, setBjpBengalLoading] = useState(false);
  const [bjpBengalError, setBjpBengalError] = useState<string | null>(null);
  const [twitterApiStatus, setTwitterApiStatus] = useState({
    remainingCalls: 1500,
    limitReached: false,
    fromCache: false,
    lastFetch: null as Date | null
  });

  // Fetch real posts from Supabase
  useEffect(() => {
    fetchSocialPosts();
  }, []);

  // BJP Bengal Twitter auto-refresh
  useEffect(() => {
    if (activeTab === 'bjp-bengal' && isMonitoring) {
      fetchBJPBengalData();

      // Subscribe to updates
      const unsubscribe = subscribeToUpdates((data) => {
        if (data.data) {
          setBjpBengalTweets(data.data);
          setTwitterApiStatus({
            remainingCalls: getRemainingAPICalls(),
            limitReached: isAPILimitReached(),
            fromCache: data.fromCache || false,
            lastFetch: new Date()
          });
        }
        if (data.error) {
          setBjpBengalError(data.error);
        }
      });

      // Start auto-refresh (every 5 minutes)
      startAutoRefresh();

      return () => {
        unsubscribe();
        stopAutoRefresh();
      };
    }
  }, [activeTab, isMonitoring]);

  const fetchBJPBengalData = async () => {
    setBjpBengalLoading(true);
    setBjpBengalError(null);
    try {
      const data = await fetchBJPBengalFeed(20);
      if (data.data) {
        setBjpBengalTweets(data.data);
      }
      if (data.error) {
        setBjpBengalError(data.error);
      }
      setTwitterApiStatus({
        remainingCalls: getRemainingAPICalls(),
        limitReached: isAPILimitReached(),
        fromCache: data.fromCache || false,
        lastFetch: new Date()
      });
    } catch (error: any) {
      setBjpBengalError(error.message || 'Failed to fetch BJP Bengal tweets');
    } finally {
      setBjpBengalLoading(false);
    }
  };

  const fetchSocialPosts = async () => {
    try {
      setLoadingPosts(true);
      console.log('[SocialMediaChannels] Starting to fetch posts from Supabase...');

      // Check if user is authenticated (required by RLS policy)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[SocialMediaChannels] Error getting session:', sessionError);
      }

      if (!session) {
        console.warn('[SocialMediaChannels] User not authenticated. RLS policy requires authentication to view posts.');
        console.warn('[SocialMediaChannels] Using mock data as fallback.');
        setSocialPosts(mockSocialPosts);
        setLoadingPosts(false);
        return;
      }

      console.log('[SocialMediaChannels] User authenticated. User ID:', session.user.id);
      console.log('[SocialMediaChannels] Fetching posts...');

      const dbPosts = await socialMediaService.fetchPosts(undefined, 50);
      console.log('[SocialMediaChannels] Fetched posts count:', dbPosts.length);

      if (dbPosts.length === 0) {
        console.warn('[SocialMediaChannels] No posts found in database. Make sure to run insert_social_media_posts.sql');
        setSocialPosts([]);
        setLoadingPosts(false);
        return;
      }

      console.log('[SocialMediaChannels] Transforming', dbPosts.length, 'posts to component format...');

      // Transform database posts to component format
      const transformedPosts: SocialPost[] = dbPosts.map((dbPost) => ({
        id: dbPost.id,
        platform: dbPost.platform.charAt(0).toUpperCase() + dbPost.platform.slice(1),
        author: dbPost.platform === 'facebook' ? 'West Bengal State News' :
                dbPost.platform === 'instagram' ? 'YouthWestBengalNow' :
                'TN Updates',
        authorFollowers: 450000,
        content: dbPost.post_content,
        timestamp: new Date(dbPost.posted_at),
        engagement: {
          likes: dbPost.likes,
          shares: dbPost.shares,
          comments: dbPost.comments_count,
          views: dbPost.reach
        },
        sentiment: socialMediaService.getSentimentLabel(dbPost.sentiment_score),
        sentimentScore: dbPost.sentiment_score,
        topics: [],
        mentions: dbPost.mentions || [],
        hashtags: dbPost.hashtags || [],
        mediaType: 'text',
        isVerified: true,
        location: 'West Bengal',
        language: 'en',
        influence: socialMediaService.calculateInfluenceScore(dbPost),
        viralPotential: socialMediaService.calculateViralScore(dbPost),
        category: 'political'
      }));

      console.log('[SocialMediaChannels] Successfully transformed', transformedPosts.length, 'posts');
      setSocialPosts(transformedPosts);

    } catch (error) {
      console.error('[SocialMediaChannels] ERROR fetching social posts:', error);

      if (error instanceof Error) {
        console.error('[SocialMediaChannels] Error message:', error.message);
        console.error('[SocialMediaChannels] Error stack:', error.stack);
      }

      // Fall back to mock data if fetch fails
      console.warn('[SocialMediaChannels] Falling back to mock data due to error');
      setSocialPosts(mockSocialPosts);
    } finally {
      setLoadingPosts(false);
      console.log('[SocialMediaChannels] Fetch complete. Loading state:', false);
    }
  };

  useEffect(() => {
    // Update analytics based on platform data
    const totalFollowers = socialPlatforms.reduce((sum, platform) => sum + platform.followers, 0);
    const totalDailyPosts = socialPlatforms.reduce((sum, platform) => sum + platform.dailyPosts, 0);
    const totalReach = socialPlatforms.reduce((sum, platform) => sum + platform.reach, 0);
    const avgSentiment = Math.round(socialPlatforms.reduce((sum, platform) => sum + platform.sentiment, 0) / socialPlatforms.length);
    
    setAnalytics(prev => ({
      ...prev,
      totalPosts: totalDailyPosts,
      avgSentiment,
      crossPlatformReach: totalReach
    }));
  }, []);

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'limited': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'link': return Link;
      default: return MessageSquare;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'political': return 'text-blue-600 bg-blue-100';
      case 'social': return 'text-green-600 bg-green-100';
      case 'economic': return 'text-purple-600 bg-purple-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'bjp-bengal', label: 'BJP Bengal', icon: Target },
    { key: 'platforms', label: 'Platforms', icon: Globe },
    { key: 'posts', label: 'Posts', icon: MessageCircle },
    { key: 'hashtags', label: 'Hashtags', icon: Hash },
    { key: 'insights', label: 'Insights', icon: Activity }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                Social Media Channels
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Multi-platform social media monitoring & analysis
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
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.totalPosts.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Daily Posts</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.totalEngagement / 1000000).toFixed(1)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Engagement</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.avgSentiment}%
                </div>
                <div className="text-responsive-sm text-gray-600">Avg Sentiment</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.crossPlatformReach / 1000000).toFixed(0)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Total Reach</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Platform Overview */}
            <MobileCard padding="default">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Platform Performance
                </h3>
                <MobileButton variant="outline" size="small">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </MobileButton>
              </div>

              <ResponsiveGrid cols={{ sm: 2, lg: 4 }} gap="small">
                {socialPlatforms.slice(0, 8).map(platform => {
                  const PlatformIcon = platform.icon;
                  return (
                  <div key={platform.id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <PlatformIcon className="w-6 h-6 mr-2" />
                      <div className={`w-2 h-2 rounded-full ${
                        platform.apiStatus === 'connected' ? 'bg-green-500' :
                        platform.apiStatus === 'limited' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-responsive-xs font-medium text-gray-900 mb-1">
                      {platform.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {(platform.followers / 1000000).toFixed(1)}M followers
                    </div>
                    <div className="flex justify-center space-x-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{platform.engagement}%</div>
                        <div className="text-gray-500">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${platform.sentiment > 60 ? 'text-green-600' : platform.sentiment < 40 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {platform.sentiment}%
                        </div>
                        <div className="text-gray-500">Sentiment</div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </ResponsiveGrid>
            </MobileCard>

            {/* Trending Topics */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Hashtags
              </h3>
              
              <div className="space-y-3">
                {trendingHashtags.slice(0, 3).map(hashtag => (
                  <div key={hashtag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Hash className="w-4 h-4 text-blue-600" />
                        <span className="text-responsive-sm font-medium text-gray-900">
                          {hashtag.hashtag}
                        </span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+{hashtag.growth}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{hashtag.mentions.toLocaleString()} mentions</span>
                        <span>{hashtag.platform}</span>
                        <span>Peak: {hashtag.peakTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hashtag.associatedTopics.slice(0, 3).map(topic => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded ${
                        hashtag.sentiment > 0.5 ? 'bg-green-100 text-green-700' :
                        hashtag.sentiment < -0.5 ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(hashtag.sentiment * 100).toFixed(0)}% sentiment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* BJP Bengal Tab */}
        {activeTab === 'bjp-bengal' && (
          <div className="space-responsive">
            {/* API Status Bar */}
            <MobileCard padding="compact" className={`${twitterApiStatus.limitReached ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${twitterApiStatus.limitReached ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
                  <span className="text-responsive-sm font-medium">
                    {twitterApiStatus.limitReached ? 'API Limit Reached - Using Cached Data' : 'Twitter API Connected'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>API Calls: {twitterApiStatus.remainingCalls}/1500</span>
                  {twitterApiStatus.fromCache && <span className="text-blue-600">From Cache</span>}
                  {twitterApiStatus.lastFetch && (
                    <span>Last: {twitterApiStatus.lastFetch.toLocaleTimeString()}</span>
                  )}
                  <MobileButton variant="outline" size="small" onClick={fetchBJPBengalData}>
                    <RefreshCw className={`w-4 h-4 ${bjpBengalLoading ? 'animate-spin' : ''}`} />
                  </MobileButton>
                </div>
              </div>
            </MobileCard>

            {/* BJP Bengal Header */}
            <MobileCard padding="default">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-responsive-lg font-semibold text-gray-900">BJP Bengal Twitter Feed</h3>
                    <p className="text-responsive-sm text-gray-600">Real-time tweets about BJP West Bengal</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-responsive-xl font-bold text-gray-900">{bjpBengalTweets.length}</div>
                  <div className="text-responsive-sm text-gray-600">Tweets</div>
                </div>
              </div>

              {/* Tracked Hashtags */}
              <div className="mb-4">
                <h4 className="text-responsive-sm font-medium text-gray-700 mb-2">Tracked Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {BJP_BENGAL_CONFIG.hashtags.slice(0, 8).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tracked Keywords */}
              <div>
                <h4 className="text-responsive-sm font-medium text-gray-700 mb-2">Tracked Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {BJP_BENGAL_CONFIG.keywords.slice(0, 6).map(keyword => (
                    <span key={keyword} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </MobileCard>

            {/* Error Message */}
            {bjpBengalError && (
              <MobileCard padding="compact" className="bg-red-50 border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-responsive-sm text-red-700">{bjpBengalError}</span>
                </div>
              </MobileCard>
            )}

            {/* Loading State */}
            {bjpBengalLoading && bjpBengalTweets.length === 0 && (
              <MobileCard padding="default" className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-responsive-sm text-gray-600">Loading BJP Bengal tweets...</p>
              </MobileCard>
            )}

            {/* Tweets Feed */}
            {bjpBengalTweets.length > 0 && (
              <div className="space-y-4">
                {bjpBengalTweets.map(tweet => (
                  <MobileCard key={tweet.id} padding="default" className="hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      {/* Author Avatar */}
                      <div className="flex-shrink-0">
                        {tweet.author?.profile_image_url ? (
                          <img
                            src={tweet.author.profile_image_url}
                            alt={tweet.author.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Tweet Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate">
                            {tweet.author?.name || 'Unknown'}
                          </span>
                          {tweet.author?.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-gray-500">@{tweet.author?.username || 'unknown'}</span>
                        </div>

                        <p className="text-responsive-sm text-gray-800 mb-3 whitespace-pre-wrap">
                          {tweet.text}
                        </p>

                        {/* Hashtags */}
                        {tweet.entities?.hashtags && tweet.entities.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {tweet.entities.hashtags.map((h, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                                #{h.tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Engagement Metrics */}
                        <div className="flex items-center space-x-6 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{tweet.public_metrics?.reply_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-4 h-4" />
                            <span className="text-xs">{tweet.public_metrics?.retweet_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span className="text-xs">{tweet.public_metrics?.like_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">
                              {new Date(tweet.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {/* Hide View link for mock/demo tweets */}
                          {tweet.id.startsWith('mock_') ? (
                            <span className="flex items-center space-x-1 text-gray-400">
                              <Star className="w-4 h-4" />
                              <span className="text-xs">Demo</span>
                            </span>
                          ) : (
                            <a
                              href={`https://twitter.com/i/status/${tweet.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-xs">View</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                ))}
              </div>
            )}

            {/* No Tweets */}
            {!bjpBengalLoading && bjpBengalTweets.length === 0 && !bjpBengalError && (
              <MobileCard padding="default" className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-responsive-sm text-gray-600">No tweets found. Click refresh to fetch latest BJP Bengal tweets.</p>
                <MobileButton variant="primary" size="small" onClick={fetchBJPBengalData} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fetch Tweets
                </MobileButton>
              </MobileCard>
            )}
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="space-responsive">
            <div className="grid gap-4">
              {socialPlatforms.map(platform => {
                const PlatformIcon = platform.icon;
                return (
                <MobileCard key={platform.id} padding="default">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <PlatformIcon className="w-10 h-10" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-responsive-base font-semibold text-gray-900">
                            {platform.name}
                          </h4>
                          <div className={`w-3 h-3 rounded-full ${
                            platform.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                          <span>{(platform.followers / 1000000).toFixed(1)}M followers</span>
                          <span>{platform.dailyPosts.toLocaleString()} daily posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${getApiStatusColor(platform.apiStatus)}`}>
                            {platform.apiStatus}
                          </span>
                          <span className="text-xs text-gray-500">
                            Updated {Math.floor((Date.now() - platform.lastUpdated.getTime()) / 60000)}m ago
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-gray-900">{platform.engagement}%</div>
                          <div className="text-gray-600">Engagement</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className={`font-bold ${
                            platform.sentiment > 60 ? 'text-green-600' :
                            platform.sentiment < 40 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {platform.sentiment}%
                          </div>
                          <div className="text-gray-600">Sentiment</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <MobileButton variant="outline" size="small">
                          <Settings className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="primary" size="small">
                          <Eye className="w-4 h-4" />
                        </MobileButton>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Reach:</strong> {(platform.reach / 1000000).toFixed(1)}M users
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${platform.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${platform.engagement}%` }}
                      />
                    </div>
                  </div>
                </MobileCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
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
                  <ResponsiveGrid cols={{ sm: 1, md: 4 }} gap="small">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Platform</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Platforms</option>
                        {socialPlatforms.map(platform => (
                          <option key={platform.id} value={platform.name}>{platform.name}</option>
                        ))}
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
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
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
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Media Type</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-sm">
                        <option value="all">All Types</option>
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                  </ResponsiveGrid>
                </MobileCard>
              )}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {loadingPosts ? (
                <div className="text-center py-8 text-gray-500">
                  Loading posts...
                </div>
              ) : socialPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No posts available. Run the insert_social_media_posts.sql file to add sample data.
                </div>
              ) : (
                socialPosts.map(post => {
                const MediaIcon = getMediaIcon(post.mediaType);
                const platformData = socialPlatforms.find(p => p.name === post.platform);
                const PostPlatformIcon = platformData?.icon || MessageCircle;

                return (
                  <MobileCard key={post.id} padding="default">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <PostPlatformIcon className="w-5 h-5" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-responsive-sm font-semibold text-gray-900">
                              {post.author}
                            </span>
                            {post.isVerified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{post.platform}</span>
                            <span>•</span>
                            <span>{(post.authorFollowers / 1000).toLocaleString()}K followers</span>
                            <span>•</span>
                            <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MediaIcon className="w-4 h-4 text-gray-400" />
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(post.sentiment)}`}>
                          {post.sentiment}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-responsive-sm text-gray-800 mb-3 leading-relaxed">
                      {post.content}
                    </p>
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{post.engagement.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-3 h-3" />
                        <span>{post.engagement.shares.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.engagement.comments.toLocaleString()}</span>
                      </div>
                      {post.engagement.views && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.engagement.views.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Topics and Categories */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      {post.topics.slice(0, 3).map(topic => (
                        <span key={topic} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.map(hashtag => (
                          <span key={hashtag} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Influence: {post.influence}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Viral: {post.viralPotential}%</span>
                        </div>
                        {post.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <MobileButton variant="ghost" size="small">
                          <Bookmark className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="ghost" size="small">
                          <ExternalLink className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="ghost" size="small">
                          <Download className="w-4 h-4" />
                        </MobileButton>
                      </div>
                    </div>
                  </MobileCard>
                );
              })
              )}
            </div>
          </div>
        )}

        {/* Hashtags Tab */}
        {activeTab === 'hashtags' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Hashtags Analysis
              </h3>
              
              <div className="space-y-4">
                {trendingHashtags.map(hashtag => (
                  <div key={hashtag.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-5 h-5 text-blue-600" />
                        <h4 className="text-responsive-base font-semibold text-gray-900">
                          {hashtag.hashtag}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+{hashtag.growth}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {hashtag.mentions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Mentions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-responsive-base font-bold ${
                          hashtag.sentiment > 0.5 ? 'text-green-600' :
                          hashtag.sentiment < -0.5 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {(hashtag.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Sentiment</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {hashtag.platform}
                        </div>
                        <div className="text-xs text-gray-600">Platform</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {hashtag.peakTime}
                        </div>
                        <div className="text-xs text-gray-600">Peak Time</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Associated Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        {hashtag.associatedTopics.map(topic => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                AI-Generated Social Media Insights
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Cross-Platform Trends
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Budget-related discussions are trending across all platforms with 85% positive sentiment. 
                    Facebook and Instagram showing highest engagement rates, while Twitter drives policy discussions.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Audience Demographics
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Youth engagement (18-35) increased by 45% this week, primarily on Instagram and TikTok. 
                    Education and employment topics resonate most with this demographic.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Optimal Posting Times
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Peak engagement occurs between 7-9 PM across Tamil content, while English content 
                    performs best during 11 AM-2 PM and 6-8 PM slots.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Emerging Issues
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Infrastructure delays generating negative sentiment on Twitter. Recommend proactive 
                    communication strategy with timeline updates and transparency measures.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Content Recommendations
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Video content showing 3x higher engagement than text posts. Consider increasing visual 
                    content, especially infographics explaining policy benefits and project progress.
                  </p>
                </div>
              </div>
            </MobileCard>
          </div>
        )}
      </div>
    </div>
  );
}