/**
 * Party Sentiment Analytics Component
 * Shows BJP vs TMC sentiment analysis with topic-wise election impact
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, Zap, Target, BarChart3, MapPin, Search, X, ChevronDown } from 'lucide-react';
import supabase from '../lib/supabase';
import constituenciesData from '../data/wb_constituencies_50.json';

interface Constituency {
  id: number;
  name: string;
  district: string;
  city_cluster: string;
  total_voters: number;
  is_urban: boolean;
  social_media_activity: string;
}

interface PartyStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  recentMentions: Array<{
    text: string;
    sentiment: string;
    timestamp: string;
    channel: string;
  }>;
}

interface TopicStats {
  topic: string;
  topicLabel: string;
  bjpPositive: number;
  bjpNegative: number;
  bjpNeutral: number;
  tmcPositive: number;
  tmcNegative: number;
  tmcNeutral: number;
  totalMentions: number;
  bjpSeatImpact: number;
  tmcSeatImpact: number;
}

const TOPIC_LABELS: Record<string, string> = {
  development: 'Development & Infrastructure',
  law_order: 'Law & Order',
  employment: 'Employment & Jobs',
  corruption: 'Corruption Allegations',
  minority: 'Minority Welfare'
};

export default function PartySentimentAnalytics() {
  const [bjpStats, setBjpStats] = useState<PartyStats>({
    total: 0, positive: 0, negative: 0, neutral: 0, recentMentions: []
  });
  const [tmcStats, setTmcStats] = useState<PartyStats>({
    total: 0, positive: 0, negative: 0, neutral: 0, recentMentions: []
  });
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBjpSeatImpact, setTotalBjpSeatImpact] = useState(0);
  const [totalTmcSeatImpact, setTotalTmcSeatImpact] = useState(0);

  // Constituency filter state
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConstituencies, setFilteredConstituencies] = useState<Constituency[]>(
    constituenciesData as Constituency[]
  );

  // Filter constituencies based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConstituencies(constituenciesData as Constituency[]);
    } else {
      const filtered = (constituenciesData as Constituency[]).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConstituencies(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAllStats();
    const interval = setInterval(fetchAllStats, 30000);
    return () => clearInterval(interval);
  }, [selectedConstituency]);

  const fetchAllStats = async () => {
    setLoading(true);
    await Promise.all([
      fetchPartyStats(),
      fetchTopicStats()
    ]);
    setLoading(false);
  };

  const fetchPartyStats = async () => {
    try {
      // Build BJP query
      let bjpQuery = supabase
        .from('tv_transcripts')
        .select('*')
        .eq('bjp_mention', true)
        .order('created_at', { ascending: false })
        .limit(100);

      // Build TMC query
      let tmcQuery = supabase
        .from('tv_transcripts')
        .select('*')
        .eq('tmc_mention', true)
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter by constituency if selected
      if (selectedConstituency) {
        bjpQuery = bjpQuery.eq('constituency', selectedConstituency.name);
        tmcQuery = tmcQuery.eq('constituency', selectedConstituency.name);
      }

      const { data: bjpData } = await bjpQuery;
      const { data: tmcData } = await tmcQuery;

      if (bjpData) {
        setBjpStats({
          total: bjpData.length,
          positive: bjpData.filter(r => r.sentiment === 'positive').length,
          negative: bjpData.filter(r => r.sentiment === 'negative').length,
          neutral: bjpData.filter(r => r.sentiment === 'neutral').length,
          recentMentions: bjpData.slice(0, 5).map(r => ({
            text: r.english_text || r.hindi_text || r.bengali_text || '',
            sentiment: r.sentiment,
            timestamp: r.created_at,
            channel: r.channel_name
          }))
        });
      }

      if (tmcData) {
        setTmcStats({
          total: tmcData.length,
          positive: tmcData.filter(r => r.sentiment === 'positive').length,
          negative: tmcData.filter(r => r.sentiment === 'negative').length,
          neutral: tmcData.filter(r => r.sentiment === 'neutral').length,
          recentMentions: tmcData.slice(0, 5).map(r => ({
            text: r.english_text || r.hindi_text || r.bengali_text || '',
            sentiment: r.sentiment,
            timestamp: r.created_at,
            channel: r.channel_name
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching party stats:', error);
    }
  };

  const fetchTopicStats = async () => {
    try {
      // Build topic query
      let topicQuery = supabase
        .from('election_topic_mentions')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by constituency if selected
      if (selectedConstituency) {
        topicQuery = topicQuery.eq('constituency', selectedConstituency.name);
      }

      const { data: topicData } = await topicQuery;

      if (topicData && topicData.length > 0) {
        const topics = ['development', 'law_order', 'employment', 'corruption', 'minority'];
        const stats: TopicStats[] = topics.map(topic => {
          const topicMentions = topicData.filter(m => m.topic === topic);
          const bjpMentions = topicMentions.filter(m => m.party === 'BJP');
          const tmcMentions = topicMentions.filter(m => m.party === 'TMC');

          const bjpPos = bjpMentions.filter(m => m.impact === 'positive').length;
          const bjpNeg = bjpMentions.filter(m => m.impact === 'negative').length;
          const bjpNeu = bjpMentions.filter(m => m.impact === 'neutral').length;

          const tmcPos = tmcMentions.filter(m => m.impact === 'positive').length;
          const tmcNeg = tmcMentions.filter(m => m.impact === 'negative').length;
          const tmcNeu = tmcMentions.filter(m => m.impact === 'neutral').length;

          // Calculate seat impact
          const bjpSeatImpact = (bjpPos * 0.1) - (bjpNeg * 0.15);
          const tmcSeatImpact = (tmcPos * 0.1) - (tmcNeg * 0.15);

          return {
            topic,
            topicLabel: TOPIC_LABELS[topic] || topic,
            bjpPositive: bjpPos,
            bjpNegative: bjpNeg,
            bjpNeutral: bjpNeu,
            tmcPositive: tmcPos,
            tmcNegative: tmcNeg,
            tmcNeutral: tmcNeu,
            totalMentions: topicMentions.length,
            bjpSeatImpact: Math.round(bjpSeatImpact * 10) / 10,
            tmcSeatImpact: Math.round(tmcSeatImpact * 10) / 10
          };
        });

        setTopicStats(stats);

        // Calculate total seat impact
        const totalBjp = stats.reduce((sum, s) => sum + s.bjpSeatImpact, 0);
        const totalTmc = stats.reduce((sum, s) => sum + s.tmcSeatImpact, 0);
        setTotalBjpSeatImpact(Math.round(totalBjp * 10) / 10);
        setTotalTmcSeatImpact(Math.round(totalTmc * 10) / 10);
      } else {
        // Set default stats if no data
        setTopicStats([
          { topic: 'development', topicLabel: 'Development & Infrastructure', bjpPositive: 0, bjpNegative: 0, bjpNeutral: 0, tmcPositive: 0, tmcNegative: 0, tmcNeutral: 0, totalMentions: 0, bjpSeatImpact: 0, tmcSeatImpact: 0 },
          { topic: 'law_order', topicLabel: 'Law & Order', bjpPositive: 0, bjpNegative: 0, bjpNeutral: 0, tmcPositive: 0, tmcNegative: 0, tmcNeutral: 0, totalMentions: 0, bjpSeatImpact: 0, tmcSeatImpact: 0 },
          { topic: 'employment', topicLabel: 'Employment & Jobs', bjpPositive: 0, bjpNegative: 0, bjpNeutral: 0, tmcPositive: 0, tmcNegative: 0, tmcNeutral: 0, totalMentions: 0, bjpSeatImpact: 0, tmcSeatImpact: 0 },
          { topic: 'corruption', topicLabel: 'Corruption Allegations', bjpPositive: 0, bjpNegative: 0, bjpNeutral: 0, tmcPositive: 0, tmcNegative: 0, tmcNeutral: 0, totalMentions: 0, bjpSeatImpact: 0, tmcSeatImpact: 0 },
          { topic: 'minority', topicLabel: 'Minority Welfare', bjpPositive: 0, bjpNegative: 0, bjpNeutral: 0, tmcPositive: 0, tmcNegative: 0, tmcNeutral: 0, totalMentions: 0, bjpSeatImpact: 0, tmcSeatImpact: 0 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching topic stats:', error);
    }
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getSentimentIcon = (positive: number, negative: number) => {
    if (positive > negative) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (negative > positive) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactBg = (impact: number) => {
    if (impact > 0) return 'bg-green-100';
    if (impact < 0) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getWinner = (bjp: number, tmc: number) => {
    if (bjp > tmc) return { party: 'BJP', color: 'text-orange-600' };
    if (tmc > bjp) return { party: 'TMC', color: 'text-green-600' };
    return { party: 'Tie', color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Constituency Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full md:w-96 px-4 py-3 bg-white border border-gray-300 rounded-lg text-left hover:border-blue-400 transition-colors flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              {selectedConstituency ? (
                <>
                  <div className="font-semibold text-gray-900">{selectedConstituency.name}</div>
                  <div className="text-xs text-gray-600">{selectedConstituency.district}</div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-gray-900">All Constituencies</div>
                  <div className="text-xs text-gray-600">West Bengal - All 50 Constituencies</div>
                </>
              )}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Panel */}
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
              {/* Search Box */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search constituencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* All Constituencies Option */}
              <button
                onClick={() => {
                  setSelectedConstituency(null);
                  setIsDropdownOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-200 ${
                  !selectedConstituency ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">All Constituencies</div>
                    <div className="text-xs text-gray-600">Show data from all 50 constituencies</div>
                  </div>
                </div>
              </button>

              {/* Constituency List */}
              <div className="overflow-y-auto flex-1">
                {filteredConstituencies.length > 0 ? (
                  filteredConstituencies.map((constituency) => (
                    <button
                      key={constituency.id}
                      onClick={() => {
                        setSelectedConstituency(constituency);
                        setIsDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                        selectedConstituency?.id === constituency.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{constituency.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{constituency.district}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No constituencies found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 text-center">
                {filteredConstituencies.length} of {(constituenciesData as Constituency[]).length} constituencies
              </div>
            </div>
          </>
        )}
      </div>

      {/* Seat Impact Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Estimated Seat Impact (Based on Media Coverage)</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${getImpactBg(totalBjpSeatImpact)}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">BJP</span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${getImpactColor(totalBjpSeatImpact)}`}>
                  {totalBjpSeatImpact > 0 ? '+' : ''}{totalBjpSeatImpact} seats
                </p>
                <p className="text-xs text-gray-600">Projected impact</p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${getImpactBg(totalTmcSeatImpact)}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">TMC</span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${getImpactColor(totalTmcSeatImpact)}`}>
                  {totalTmcSeatImpact > 0 ? '+' : ''}{totalTmcSeatImpact} seats
                </p>
                <p className="text-xs text-gray-600">Projected impact</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Party Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BJP Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">BJP</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Bharatiya Janata Party</h3>
                <p className="text-sm text-gray-600">{bjpStats.total} mentions</p>
              </div>
            </div>
            <Users className="w-6 h-6 text-orange-500" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700 font-medium">Positive</span>
                <span className="font-bold">{getPercentage(bjpStats.positive, bjpStats.total)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(bjpStats.positive, bjpStats.total)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-700 font-medium">Negative</span>
                <span className="font-bold">{getPercentage(bjpStats.negative, bjpStats.total)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(bjpStats.negative, bjpStats.total)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Neutral</span>
                <span className="font-bold">{getPercentage(bjpStats.neutral, bjpStats.total)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(bjpStats.neutral, bjpStats.total)}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-orange-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{bjpStats.positive}</p>
              <p className="text-xs text-gray-600">Positive</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{bjpStats.negative}</p>
              <p className="text-xs text-gray-600">Negative</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{bjpStats.neutral}</p>
              <p className="text-xs text-gray-600">Neutral</p>
            </div>
          </div>
        </div>

        {/* TMC Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">TMC</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Trinamool Congress</h3>
                <p className="text-sm text-gray-600">{tmcStats.total} mentions</p>
              </div>
            </div>
            <Users className="w-6 h-6 text-green-600" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700 font-medium">Positive</span>
                <span className="font-bold">{getPercentage(tmcStats.positive, tmcStats.total)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(tmcStats.positive, tmcStats.total)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-700 font-medium">Negative</span>
                <span className="font-bold">{getPercentage(tmcStats.negative, tmcStats.total)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(tmcStats.negative, tmcStats.total)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Neutral</span>
                <span className="font-bold">{getPercentage(tmcStats.neutral, tmcStats.total)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(tmcStats.neutral, tmcStats.total)}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{tmcStats.positive}</p>
              <p className="text-xs text-gray-600">Positive</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{tmcStats.negative}</p>
              <p className="text-xs text-gray-600">Negative</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{tmcStats.neutral}</p>
              <p className="text-xs text-gray-600">Neutral</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topic-wise Election Impact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-gray-900">Topic-wise Election Impact - BJP vs TMC</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Topic</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-orange-600">BJP Impact</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-green-600">TMC Impact</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Mentions</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-blue-600">Winner</th>
              </tr>
            </thead>
            <tbody>
              {topicStats.map((topic, index) => {
                const winner = getWinner(topic.bjpSeatImpact, topic.tmcSeatImpact);
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(topic.bjpPositive + topic.tmcPositive, topic.bjpNegative + topic.tmcNegative)}
                        <span className="font-medium text-gray-900">{topic.topicLabel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-bold ${getImpactColor(topic.bjpSeatImpact)}`}>
                          {topic.bjpSeatImpact > 0 ? '+' : ''}{topic.bjpSeatImpact}
                        </span>
                        <span className="text-xs text-gray-500">
                          +{topic.bjpPositive} / -{topic.bjpNegative}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-bold ${getImpactColor(topic.tmcSeatImpact)}`}>
                          {topic.tmcSeatImpact > 0 ? '+' : ''}{topic.tmcSeatImpact}
                        </span>
                        <span className="text-xs text-gray-500">
                          +{topic.tmcPositive} / -{topic.tmcNegative}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-bold text-gray-700">{topic.totalMentions}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${winner.color}`}>{winner.party}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <strong>Formula:</strong> Positive mention = +0.1 seat | Negative mention = -0.15 seat
        </div>
      </div>

      {/* Key Debate Topics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-gray-900">Key Debate Topics - Sentiment Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicStats.map((topic, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">{topic.topicLabel}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-600 font-medium">BJP</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">+{topic.bjpPositive}</span>
                    <span className="text-red-600">-{topic.bjpNegative}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-medium">TMC</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">+{topic.tmcPositive}</span>
                    <span className="text-red-600">-{topic.tmcNegative}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Mentions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <h4 className="font-semibold text-gray-900">Recent BJP Mentions</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {bjpStats.recentMentions.length > 0 ? (
              bjpStats.recentMentions.map((mention, index) => (
                <div key={index} className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-gray-700 line-clamp-2">{mention.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{mention.channel}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(mention.sentiment)}`}>
                      {mention.sentiment}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No BJP mentions yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-green-500" />
            <h4 className="font-semibold text-gray-900">Recent TMC Mentions</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tmcStats.recentMentions.length > 0 ? (
              tmcStats.recentMentions.map((mention, index) => (
                <div key={index} className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-700 line-clamp-2">{mention.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{mention.channel}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(mention.sentiment)}`}>
                      {mention.sentiment}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No TMC mentions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
