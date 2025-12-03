/**
 * News API Tab - India Political News
 * Real-time political news from NewsAPI.org
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Newspaper,
  Search,
  Source,
  Analytics,
  Refresh,
  OpenInNew,
  TrendingUp,
  TrendingDown,
  Remove,
  FilterList,
  Circle
} from '@mui/icons-material';

import { newsApiService, NewsApiArticle, NewsApiSource } from '../services/newsApiService';

// Tab types
type TabType = 'headlines' | 'search' | 'sources' | 'analytics';

// West Bengal Constituencies
const CONSTITUENCIES = [
  { id: 'all', name: 'All West Bengal' },
  // Kolkata
  { id: 'wb_kolkata_bhowanipore', name: 'Bhowanipore' },
  { id: 'wb_kolkata_ballygunge', name: 'Ballygunge' },
  { id: 'wb_kolkata_jadavpur', name: 'Jadavpur' },
  { id: 'wb_kolkata_kasba', name: 'Kasba' },
  { id: 'wb_kolkata_tollygunge', name: 'Tollygunge' },
  { id: 'wb_kolkata_entally', name: 'Entally' },
  { id: 'wb_kolkata_chowringhee', name: 'Chowringhee' },
  // Howrah
  { id: 'wb_howrah_howrah_uttar', name: 'Howrah Uttar' },
  { id: 'wb_howrah_howrah_madhya', name: 'Howrah Madhya' },
  { id: 'wb_howrah_shibpur', name: 'Shibpur' },
  { id: 'wb_howrah_bally', name: 'Bally' },
  // North 24 Parganas
  { id: 'wb_north_24_parganas_barrackpore', name: 'Barrackpore' },
  { id: 'wb_north_24_parganas_dum_dum', name: 'Dum Dum' },
  { id: 'wb_north_24_parganas_rajarhat_new_town', name: 'Rajarhat New Town' },
  { id: 'wb_north_24_parganas_bidhannagar', name: 'Bidhannagar (Salt Lake)' },
  { id: 'wb_north_24_parganas_barasat', name: 'Barasat' },
  // South 24 Parganas
  { id: 'wb_south_24_parganas_diamond_harbour', name: 'Diamond Harbour' },
  { id: 'wb_south_24_parganas_sonarpur_uttar', name: 'Sonarpur Uttar' },
  { id: 'wb_south_24_parganas_budge_budge', name: 'Budge Budge' },
  // North Bengal
  { id: 'wb_darjeeling_darjeeling', name: 'Darjeeling' },
  { id: 'wb_darjeeling_siliguri', name: 'Siliguri' },
  { id: 'wb_jalpaiguri_jalpaiguri', name: 'Jalpaiguri' },
  { id: 'wb_cooch_behar_cooch_behar_uttar', name: 'Cooch Behar' },
  // Industrial Belt
  { id: 'wb_purba_bardhaman_asansol_uttar', name: 'Asansol Uttar' },
  { id: 'wb_purba_bardhaman_durgapur_purba', name: 'Durgapur' },
  { id: 'wb_purba_bardhaman_bardhaman_uttar', name: 'Bardhaman' },
  // Others
  { id: 'wb_malda_english_bazar', name: 'Malda (English Bazar)' },
  { id: 'wb_murshidabad_berhampore', name: 'Berhampore' },
  { id: 'wb_nadia_krishnanagar_uttar', name: 'Krishnanagar' },
  { id: 'wb_hooghly_serampore', name: 'Serampore' },
  { id: 'wb_hooghly_chandannagar', name: 'Chandannagar' },
  { id: 'wb_purba_medinipur_tamluk', name: 'Tamluk' },
  { id: 'wb_purba_medinipur_haldia', name: 'Haldia' },
];

// Sentiment colors
const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive': return 'text-green-600 bg-green-100';
    case 'negative': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return <TrendingUp className="w-4 h-4" />;
    case 'negative': return <TrendingDown className="w-4 h-4" />;
    default: return <Remove className="w-4 h-4" />;
  }
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// News Card Component
const NewsCard = ({ article }: { article: NewsApiArticle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {article.urlToImage && (
        <div className="h-40 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {article.source.name}
          </span>
          <div className="flex items-center gap-2">
            {article.bjpMentioned && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                BJP
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${getSentimentColor(article.sentiment || 'neutral')}`}>
              {getSentimentIcon(article.sentiment || 'neutral')}
              {article.sentiment}
            </span>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
          {article.title}
        </h3>
        <p className="text-gray-600 text-xs line-clamp-2 mb-3">
          {article.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatDate(article.publishedAt)}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
          >
            Read more <OpenInNew className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtext, color }: {
  icon: typeof Newspaper;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function NewsApiTab() {
  const [activeTab, setActiveTab] = useState<TabType>('headlines');
  const [articles, setArticles] = useState<NewsApiArticle[]>([]);
  const [sources, setSources] = useState<NewsApiSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch news based on constituency selection
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (selectedConstituency === 'all') {
        response = await newsApiService.getPoliticalNews(100);
      } else {
        response = await newsApiService.getConstituencyNews(selectedConstituency);
      }
      if (response.status === 'ok') {
        setArticles(response.articles);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch news. Please try again.');
      }
    } catch (err) {
      setError('Error fetching news. Check your connection.');
    }
    setLoading(false);
  }, [selectedConstituency]);

  // Fetch sources
  const fetchSources = useCallback(async () => {
    try {
      const sourcesData = await newsApiService.getSources();
      setSources(sourcesData);
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await newsApiService.searchNews(searchQuery);
      if (response.status === 'ok') {
        setArticles(response.articles);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchNews();
    fetchSources();
  }, [fetchNews, fetchSources]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchNews, 60000); // Every minute
    return () => clearInterval(interval);
  }, [autoRefresh, fetchNews]);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    if (selectedSource !== 'all' && article.source.name !== selectedSource) return false;
    if (selectedSentiment !== 'all' && article.sentiment !== selectedSentiment) return false;
    return true;
  });

  // Calculate stats
  const stats = {
    total: articles.length,
    sources: new Set(articles.map(a => a.source.name)).size,
    positive: articles.filter(a => a.sentiment === 'positive').length,
    negative: articles.filter(a => a.sentiment === 'negative').length,
    neutral: articles.filter(a => a.sentiment === 'neutral').length,
    bjpMentions: articles.filter(a => a.bjpMentioned).length
  };

  const sentimentPercentage = stats.total > 0
    ? Math.round((stats.positive / stats.total) * 100)
    : 0;

  // Tabs
  const tabs = [
    { id: 'headlines' as TabType, label: 'Headlines', icon: Newspaper },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'sources' as TabType, label: 'Sources', icon: Source },
    { id: 'analytics' as TabType, label: 'Analytics', icon: Analytics }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Newspaper className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bengal Local News</h1>
              <p className="text-sm text-gray-500">
                {selectedConstituency === 'all'
                  ? 'Real-time West Bengal news tracking and analysis'
                  : `News for ${CONSTITUENCIES.find(c => c.id === selectedConstituency)?.name || selectedConstituency}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Constituency Selector */}
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {CONSTITUENCIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Circle className={`w-3 h-3 ${autoRefresh ? 'text-green-500' : 'text-gray-300'}`} />
              <span className="text-sm text-gray-500">
                {autoRefresh ? 'Live Monitoring' : 'Manual Refresh'}
              </span>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {autoRefresh ? 'Pause' : 'Auto-Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Newspaper}
            label="Total Articles"
            value={stats.total}
            subtext="In current feed"
            color="bg-blue-500"
          />
          <StatCard
            icon={Source}
            label="News Sources"
            value={stats.sources}
            subtext="Active sources"
            color="bg-purple-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Sentiment"
            value={`${sentimentPercentage}%`}
            subtext="Positive coverage"
            color="bg-green-500"
          />
          <StatCard
            icon={Analytics}
            label="BJP Mentions"
            value={stats.bjpMentions}
            subtext="Articles with BJP"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {activeTab === 'headlines' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <FilterList className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Sources</option>
                  {Array.from(new Set(articles.map(a => a.source.name))).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
                <button
                  onClick={fetchNews}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  <Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-xs text-gray-400 ml-auto">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            )}

            {/* News Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredArticles.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No articles found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search political news (e.g., BJP, Modi, Parliament, Elections...)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Quick search:</span>
                {['West Bengal', 'Kolkata', 'Mamata Banerjee', 'TMC', 'BJP Bengal', 'Howrah'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      setTimeout(handleSearch, 100);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {!loading && articles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {articles.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map(source => (
              <div key={source.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{source.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{source.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{source.category}</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                  >
                    Visit <OpenInNew className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
            {sources.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Source className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading sources...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Positive</span>
                    <span className="text-sm font-medium text-green-600">{stats.positive}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.positive / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Neutral</span>
                    <span className="text-sm font-medium text-gray-600">{stats.neutral}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-400 h-3 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Negative</span>
                    <span className="text-sm font-medium text-red-600">{stats.negative}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.negative / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Sources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Top News Sources</h3>
              <div className="space-y-3">
                {Object.entries(
                  articles.reduce((acc, article) => {
                    acc[article.source.name] = (acc[article.source.name] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{source}</span>
                      <span className="text-sm font-medium text-gray-900">{count} articles</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* BJP Coverage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">BJP Coverage Analysis</h3>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {stats.total > 0 ? Math.round((stats.bjpMentions / stats.total) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-500">of articles mention BJP</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-700">{stats.bjpMentions}</div>
                    <div className="text-orange-600">BJP Articles</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-700">{stats.total - stats.bjpMentions}</div>
                    <div className="text-gray-600">Other News</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {articles.slice(0, 5).map(article => (
                  <div key={article.id} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      article.sentiment === 'positive' ? 'bg-green-500' :
                      article.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-700 line-clamp-1">{article.title}</p>
                      <p className="text-xs text-gray-400">{article.source.name} - {formatDate(article.publishedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-400 text-center">
          v1.0 - 2025-12-02 | Powered by NewsAPI.org
        </p>
      </div>
    </div>
  );
}
