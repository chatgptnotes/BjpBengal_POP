import React, { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CampaignIcon from '@mui/icons-material/Campaign';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CircularProgress from '@mui/material/CircularProgress';

import {
  calculateCompetitorMetrics,
  calculateIssueSentiment,
  fetchCompetitorCampaigns,
  fetchCompetitorAlerts,
  syncCompetitorDataFromTwitter,
  type CompetitorMetrics,
  type CompetitorIssue,
  type CompetitorCampaign,
  type CompetitorAlert
} from '../services/competitorService';

interface CompetitorTrackingProps {
  dateRange?: '1d' | '7d' | '30d';
  onDateRangeChange?: (range: '1d' | '7d' | '30d') => void;
}

export default function CompetitorTracking({
  dateRange: propDateRange,
  onDateRangeChange
}: CompetitorTrackingProps) {
  const [competitors, setCompetitors] = useState<CompetitorMetrics[]>([]);
  const [issues, setIssues] = useState<CompetitorIssue[]>([]);
  const [campaigns, setCampaigns] = useState<CompetitorCampaign[]>([]);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'1d' | '7d' | '30d'>(propDateRange || '7d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefresh, setNextRefresh] = useState<number>(300); // 5 minutes in seconds

  // Load data on mount and when date range changes
  useEffect(() => {
    loadAllData();
  }, [dateRange]);

  // Auto-refresh every 5 minutes for real-time updates
  useEffect(() => {
    const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

    // Countdown timer
    const countdownId = setInterval(() => {
      setNextRefresh(prev => {
        if (prev <= 1) {
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-refresh interval
    const refreshId = setInterval(() => {
      console.log('[CompetitorTracking] Auto-refreshing data...');
      loadAllData();
      setNextRefresh(300); // Reset countdown
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      clearInterval(countdownId);
      clearInterval(refreshId);
    };
  }, [dateRange]);

  // Update internal state when prop changes
  useEffect(() => {
    if (propDateRange && propDateRange !== dateRange) {
      setDateRange(propDateRange);
    }
  }, [propDateRange]);

  async function loadAllData() {
    setLoading(true);
    setError(null);

    try {
      const [metricsData, issuesData, campaignsData, alertsData] = await Promise.all([
        calculateCompetitorMetrics(dateRange),
        calculateIssueSentiment(dateRange),
        fetchCompetitorCampaigns(),
        fetchCompetitorAlerts()
      ]);

      setCompetitors(metricsData);
      setIssues(issuesData);
      setCampaigns(campaignsData);
      setAlerts(alertsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading competitor data:', err);
      setError('Failed to load competitor data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await syncCompetitorDataFromTwitter();
      await loadAllData();
    } catch (err) {
      console.error('Error syncing data:', err);
      setError('Failed to sync data from Twitter.');
    } finally {
      setSyncing(false);
    }
  }

  function handleDateRangeChange(range: '1d' | '7d' | '30d') {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  }

  function getTrendIcon(trend: 'up' | 'down' | 'stable') {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="w-5 h-5" />;
      case 'down':
        return <TrendingDownIcon className="w-5 h-5" />;
      default:
        return <TrendingFlatIcon className="w-5 h-5" />;
    }
  }

  function getTrendColor(trend: 'up' | 'down' | 'stable') {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  function getSentimentColor(sentiment: number) {
    if (sentiment > 0.6) return 'text-green-600';
    if (sentiment > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getSeverityStyles(severity: string) {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-50 border-red-400';
      case 'medium':
        return 'bg-yellow-50 border-yellow-400';
      default:
        return 'bg-blue-50 border-blue-400';
    }
  }

  function getSeverityDotColor(severity: string) {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-400';
      case 'medium':
        return 'bg-yellow-400';
      default:
        return 'bg-blue-400';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CircularProgress size={40} />
          <p className="mt-4 text-gray-600">Loading competitor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadAllData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FilterListIcon className="w-5 h-5 text-gray-500" />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['1d', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range === '1d' ? '24h' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {lastUpdated && (
              <span>
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Next refresh: {Math.floor(nextRefresh / 60)}:{(nextRefresh % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Competitor Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {competitors.map((competitor) => (
          <div
            key={competitor.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            style={{ borderTopColor: competitor.color_code, borderTopWidth: '3px' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
                <p className="text-xs text-gray-500">{competitor.leader_name}</p>
              </div>
              <div className={`flex items-center ${getTrendColor(competitor.trend)}`}>
                {getTrendIcon(competitor.trend)}
                <span className="ml-1 text-sm font-medium">
                  {competitor.change > 0 ? '+' : ''}{competitor.change}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sentiment</span>
                <span className={`font-medium ${getSentimentColor(competitor.sentiment)}`}>
                  {Math.round(competitor.sentiment * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mentions</span>
                <span className="font-medium">{competitor.mentions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reach</span>
                <span className="font-medium">
                  {competitor.reach >= 1000
                    ? `${(competitor.reach / 1000).toFixed(0)}K`
                    : competitor.reach.toLocaleString()
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement</span>
                <span className="font-medium">{competitor.engagement}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Performance Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Performance Comparison</h3>
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  style={{ borderLeftColor: item.color_code, borderLeftWidth: '3px' }}
                >
                  <div>
                    <div className="font-medium text-gray-900">{item.issue}</div>
                    <div className="text-sm text-gray-600">
                      {item.party} - {item.volume} mentions
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getSentimentColor(item.sentiment)}`}>
                    {Math.round(item.sentiment * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No issue data available</p>
          )}
        </div>

        {/* Competitor Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CampaignIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Competitor Campaigns</h3>
          </div>
          {campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4"
                  style={{ borderLeftColor: campaign.color_code, borderLeftWidth: '3px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{campaign.campaign}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{campaign.competitor}</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Reach</div>
                      <div className="font-medium">
                        {campaign.reach >= 1000
                          ? `${(campaign.reach / 1000).toFixed(0)}K`
                          : campaign.reach.toLocaleString()
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Engagement</div>
                      <div className="font-medium">{campaign.engagement}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Sentiment</div>
                      <div className={`font-medium ${getSentimentColor(campaign.sentiment)}`}>
                        {Math.round(campaign.sentiment * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active campaigns detected</p>
          )}
        </div>
      </div>

      {/* Competitive Intelligence Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <NotificationsActiveIcon className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Competitive Intelligence Alerts</h3>
        </div>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start p-3 rounded-lg border-l-4 ${getSeverityStyles(alert.severity)}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${getSeverityDotColor(alert.severity)}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {alert.competitor && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {alert.competitor}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No alerts at this time</p>
        )}
      </div>
    </div>
  );
}
