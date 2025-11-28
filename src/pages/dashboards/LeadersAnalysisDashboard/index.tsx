/**
 * Leader's Analysis Dashboard
 * Comprehensive political leader analysis with sentiment, voting trends, and party strength
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react';

// Components
import LeaderPerformanceGrid from './components/LeaderPerformanceGrid';
import SentimentTrendChart from './components/SentimentTrendChart';
import PartyStrengthChart from './components/PartyStrengthChart';
import HistoricalVotingChart from './components/HistoricalVotingChart';

// Data and Types
import {
  generateLeaderCardData,
  getPartyStrengthData,
  getVotingTrendData,
  generateSentimentTrendData,
  politicalLeaders,
  PARTY_COLORS,
} from './data/leadersData';
import { LeaderCardData, SentimentTrendData, PartyStrength, VotingTrendData } from './types';

export default function LeadersAnalysisDashboard() {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Data state
  const [leaderData, setLeaderData] = useState<LeaderCardData[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrendData[]>([]);
  const [partyStrength, setPartyStrength] = useState<PartyStrength[]>([]);
  const [votingTrend, setVotingTrend] = useState<VotingTrendData[]>([]);

  // Selected leader for detail view
  const [selectedLeader, setSelectedLeader] = useState<LeaderCardData | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when time range changes
  useEffect(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    setSentimentTrend(generateSentimentTrendData(days));
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data (currently using mock data)
      const leaders = generateLeaderCardData();
      const strength = getPartyStrengthData();
      const voting = getVotingTrendData();
      const sentiment = generateSentimentTrendData(30);

      setLeaderData(leaders);
      setPartyStrength(strength);
      setVotingTrend(voting);
      setSentimentTrend(sentiment);
    } catch (error) {
      console.error('Failed to load leader data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLeaderClick = (leader: LeaderCardData) => {
    setSelectedLeader(leader);
    // Could open a modal or navigate to detail view
    console.log('Selected leader:', leader);
  };

  // Filter leaders by party
  const filteredLeaders = selectedParty === 'all'
    ? leaderData
    : leaderData.filter(l => l.party === selectedParty);

  // Calculate summary stats
  const totalLeaders = leaderData.length;
  const avgApproval = leaderData.length > 0
    ? (leaderData.reduce((sum, l) => sum + l.approval_rating, 0) / leaderData.length).toFixed(1)
    : '0';
  const trendingUp = leaderData.filter(l => l.trend === 'up').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Leader Analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-indigo-400" />
              Leader's Analysis
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Political leader performance, sentiment analysis, and voting trends for West Bengal
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Party Filter */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="bg-transparent text-sm text-white border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Parties</option>
                <option value="TMC">TMC</option>
                <option value="BJP">BJP</option>
                <option value="INC">INC</option>
                <option value="CPIM">CPIM</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="text-sm">Refresh</span>
            </button>

            {/* Export Button */}
            <button
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              <Users size={14} />
              <span>Total Leaders</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalLeaders}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              <BarChart3 size={14} />
              <span>Avg Approval</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{avgApproval}%</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              <TrendingUp size={14} />
              <span>Trending Up</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{trendingUp}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              <PieChart size={14} />
              <span>Parties Tracked</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">4</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Leader Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leader Performance Grid */}
          <LeaderPerformanceGrid
            leaders={filteredLeaders}
            onLeaderClick={handleLeaderClick}
          />

          {/* Historical Voting Chart */}
          <HistoricalVotingChart data={votingTrend} />
        </div>

        {/* Right Column - Charts */}
        <div className="space-y-6">
          {/* Party Strength Chart */}
          <PartyStrengthChart
            data={partyStrength}
            title="Party Strength (2021)"
            showSeats={true}
          />

          {/* Sentiment Trend Chart */}
          <SentimentTrendChart
            data={sentimentTrend}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>Data sourced from news articles, social media, and election commission records</p>
        <p className="mt-1">Last updated: {new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}
