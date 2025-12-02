import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Instagram,
  Facebook,
  Twitter,
  Newspaper,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  BarChart3,
  Users,
  Hash,
  Clock,
  AlertCircle
} from 'lucide-react';
import { bengalPoliticalDataService, BengalPoliticalData, AnalyzedPost, TwitterPost, NewsArticle } from '../services/bengalPoliticalDataService';

type Platform = 'all' | 'instagram' | 'facebook' | 'twitter' | 'news';
type PartyFilter = 'all' | 'bjp' | 'tmc';
type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

export default function SocialIntelligenceDashboard() {
  const [data, setData] = useState<BengalPoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('all');
  const [partyFilter, setPartyFilter] = useState<PartyFilter>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bengalPoliticalDataService.getAllData(forceRefresh);
      setData(result);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('[Dashboard] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-sky-500" />;
      default: return <Newspaper className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            <TrendingUp className="w-3 h-3" /> Positive
          </span>
        );
      case 'negative':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
            <TrendingDown className="w-3 h-3" /> Negative
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            <Minus className="w-3 h-3" /> Neutral
          </span>
        );
    }
  };

  const getStanceBadge = (stance?: string) => {
    switch (stance) {
      case 'pro-bjp':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Pro-BJP</span>;
      case 'pro-tmc':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Pro-TMC</span>;
      case 'anti-bjp':
        return <span className="px-2 py-0.5 bg-orange-50 text-orange-500 text-xs rounded-full font-medium">Anti-BJP</span>;
      case 'anti-tmc':
        return <span className="px-2 py-0.5 bg-green-50 text-green-500 text-xs rounded-full font-medium">Anti-TMC</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Neutral</span>;
    }
  };

  const filterPosts = () => {
    if (!data) return [];

    let posts: any[] = [];

    if (platform === 'all' || platform === 'instagram') {
      posts = [...posts, ...data.instagram];
    }
    if (platform === 'all' || platform === 'facebook') {
      posts = [...posts, ...data.facebook];
    }
    if (platform === 'all' || platform === 'twitter') {
      posts = [...posts, ...data.twitter];
    }
    if (platform === 'all' || platform === 'news') {
      posts = [...posts, ...data.news.map(n => ({ ...n, platform: 'news' as const }))];
    }

    // Filter by party
    if (partyFilter !== 'all') {
      posts = posts.filter(post => {
        const stance = post.analysis?.politicalStance;
        if (partyFilter === 'bjp') {
          return stance?.bjpMention || stance?.stance === 'pro-bjp';
        }
        if (partyFilter === 'tmc') {
          return stance?.tmcMention || stance?.stance === 'pro-tmc';
        }
        return true;
      });
    }

    // Filter by sentiment
    if (sentimentFilter !== 'all') {
      posts = posts.filter(post => {
        return post.analysis?.sentiment?.sentiment === sentimentFilter;
      });
    }

    // Sort by timestamp
    posts.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.publishedAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.publishedAt || 0).getTime();
      return timeB - timeA;
    });

    return posts;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderPostCard = (post: any, index: number) => {
    const isNews = post.platform === 'news' || post.title;

    return (
      <div key={post.id || index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getPlatformIcon(post.platform)}
            <span className="font-medium text-gray-900 text-sm">
              {isNews ? post.source : `@${post.username}`}
            </span>
            {post.displayName && !isNews && (
              <span className="text-gray-500 text-xs">({post.displayName})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getSentimentBadge(post.analysis?.sentiment?.sentiment)}
            {getStanceBadge(post.analysis?.politicalStance?.stance)}
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          {isNews ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{post.description}</p>
            </>
          ) : (
            <p className="text-gray-700 text-sm line-clamp-3">{post.content}</p>
          )}
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.slice(0, 5).map((tag: string, i: number) => (
              <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Topics */}
        {post.analysis?.topics?.topics && post.analysis.topics.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.analysis.topics.topics.slice(0, 3).map((topic: string, i: number) => (
              <span key={i} className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {post.likes !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> {post.likes.toLocaleString()}
              </span>
            )}
            {post.comments !== undefined && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> {post.comments.toLocaleString()}
              </span>
            )}
            {post.shares !== undefined && (
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" /> {post.shares.toLocaleString()}
              </span>
            )}
            {post.retweets !== undefined && (
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" /> {post.retweets.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(post.timestamp || post.publishedAt)}
            </span>
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading social intelligence data...</p>
        </div>
      </div>
    );
  }

  const filteredPosts = filterPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Social Intelligence</h1>
              <p className="text-sm text-gray-500">Bengal Political Data - Instagram, Facebook, Twitter, News</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Posts</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{data.analytics.totalPosts}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">BJP Mentions</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{data.analytics.bjpMentions}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">TMC Mentions</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{data.analytics.tmcMentions}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Positive</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{data.analytics.sentimentBreakdown.positive}</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">Negative</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{data.analytics.sentimentBreakdown.negative}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Minus className="w-4 h-4" />
                  <span className="text-xs font-medium">Neutral</span>
                </div>
                <p className="text-2xl font-bold text-gray-700">{data.analytics.sentimentBreakdown.neutral}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {/* Platform Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Platform:</span>
              <div className="flex gap-1">
                {(['all', 'instagram', 'facebook', 'twitter', 'news'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 text-xs rounded-full capitalize ${
                      platform === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p === 'all' ? 'All' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Party Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Party:</span>
              <div className="flex gap-1">
                {(['all', 'bjp', 'tmc'] as PartyFilter[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPartyFilter(p)}
                    className={`px-3 py-1.5 text-xs rounded-full uppercase ${
                      partyFilter === p
                        ? p === 'bjp' ? 'bg-orange-500 text-white' :
                          p === 'tmc' ? 'bg-green-500 text-white' :
                          'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sentiment:</span>
              <div className="flex gap-1">
                {(['all', 'positive', 'negative', 'neutral'] as SentimentFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSentimentFilter(s)}
                    className={`px-3 py-1.5 text-xs rounded-full capitalize ${
                      sentimentFilter === s
                        ? s === 'positive' ? 'bg-green-500 text-white' :
                          s === 'negative' ? 'bg-red-500 text-white' :
                          s === 'neutral' ? 'bg-gray-500 text-white' :
                          'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Posts ({filteredPosts.length})
              </h2>
              {data && (
                <span className="text-xs text-gray-500">
                  Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No posts found matching filters</p>
              </div>
            ) : (
              filteredPosts.map((post, index) => renderPostCard(post, index))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Platform Breakdown */}
            {data && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Platform Breakdown
                </h3>
                <div className="space-y-2">
                  {Object.entries(data.analytics.platformBreakdown).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(platform)}
                        <span className="text-sm text-gray-600 capitalize">{platform}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Hashtags */}
            {data && data.analytics.topHashtags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Top Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.analytics.topHashtags.map(({ tag, count }) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                    >
                      #{tag} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            {data && data.analytics.trendingTopics.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  {data.analytics.trendingTopics.map((topic, index) => (
                    <div
                      key={topic}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          v1.5 - 2025-12-02 | Social Intelligence Dashboard - Bengal Political Monitoring
        </div>
      </div>
    </div>
  );
}
