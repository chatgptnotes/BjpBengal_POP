import React, { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CampaignIcon from '@mui/icons-material/Campaign';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MessageIcon from '@mui/icons-material/Message';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import InfoIcon from '@mui/icons-material/Info';
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

// Animated Number Counter Component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    let current = 0;
    const increment = value / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span className="counter-value">{count.toLocaleString()}{suffix}</span>;
}

// Mini Circular Gauge Component
function MiniGauge({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = size / 2 - 6;
  const circumference = Math.PI * radius;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 5 }}>
        <svg width={size} height={size / 2 + 5} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <div className="text-lg font-bold" style={{ color }}>
            {normalizedValue.toFixed(0)}%
          </div>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5">Sentiment</div>
    </div>
  );
}

// Get gradient class based on party name
function getPartyGradient(name: string): string {
  const gradients: Record<string, string> = {
    'BJP': 'bg-gradient-bjp',
    'TMC': 'bg-gradient-tmc',
    'Congress': 'bg-gradient-congress',
    'CPIM': 'bg-gradient-cpim',
    'ISF': 'bg-gradient-isf'
  };
  return gradients[name] || '';
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
  // Auto-refresh disabled - manual sync only via "Sync Data" button
  useEffect(() => {
    loadAllData();
  }, [dateRange]);

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
        return <TrendingUpIcon className="w-4 h-4" />;
      case 'down':
        return <TrendingDownIcon className="w-4 h-4" />;
      default:
        return <TrendingFlatIcon className="w-4 h-4" />;
    }
  }

  function getTrendColor(trend: 'up' | 'down' | 'stable') {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function getSentimentColor(sentiment: number) {
    if (sentiment > 0.6) return '#10b981';
    if (sentiment > 0.4) return '#f59e0b';
    return '#ef4444';
  }

  function getSeverityStyles(severity: string) {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-50/80 border-red-400';
      case 'medium':
        return 'bg-yellow-50/80 border-yellow-400';
      default:
        return 'bg-blue-50/80 border-blue-400';
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CircularProgress size={40} sx={{ color: '#FF9933' }} />
          <p className="mt-4 text-gray-600">Loading competitor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadAllData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if all competitors have zero data
  const hasNoData = competitors.every(c => c.mentions === 0 && c.reach === 0 && c.engagement === 0);

  return (
    <div className="space-y-6">
      {/* No Data Warning Banner */}
      {hasNoData && (
        <div className="glass-card p-4 border-l-4 border-red-500 bg-red-50/50 animate-fadeInUp">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Twitter API Monthly Limit Reached</h4>
              <p className="text-sm text-red-700 mb-2">
                Twitter Free API has a <strong>monthly cap of ~1500 tweets</strong>. This limit resets at the start of each month.
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Free tier limit has been exhausted for this month</li>
                <li>Options: Wait until next month OR upgrade to Twitter Basic API ($100/month)</li>
                <li>Consider using alternative data sources for competitor analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fadeInUp">
        <div className="flex items-center gap-2">
          <FilterListIcon className="w-5 h-5 text-gray-500" />
          <div className="flex rounded-xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/50">
            {(['1d', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  dateRange === range
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:bg-white'
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
              <span className="hidden sm:inline">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RefreshIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Competitor Overview Cards - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {competitors.map((competitor, index) => (
          <div
            key={competitor.id}
            className={`glass-card p-5 animate-fadeInUp ${getPartyGradient(competitor.name)}`}
            style={{
              animationDelay: `${index * 100}ms`,
              borderTop: `3px solid ${competitor.color_code}`
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  style={{ backgroundColor: competitor.color_code }}
                >
                  {competitor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{competitor.name}</h3>
                  <p className="text-xs text-gray-500">{competitor.leader_name}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(competitor.trend)}`}>
                {getTrendIcon(competitor.trend)}
                <span>{competitor.change > 0 ? '+' : ''}{competitor.change}%</span>
              </div>
            </div>

            {/* Gauge */}
            <div className="flex justify-center my-3">
              <MiniGauge
                value={competitor.sentiment * 100}
                color={getSentimentColor(competitor.sentiment)}
                size={90}
              />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                <MessageIcon className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <div className="text-sm font-bold text-gray-900">
                  <AnimatedNumber value={competitor.mentions} />
                </div>
                <div className="text-[10px] text-gray-500">Mentions</div>
              </div>
              <div className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                <VisibilityIcon className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                <div className="text-sm font-bold text-gray-900">
                  {formatNumber(competitor.reach)}
                </div>
                <div className="text-[10px] text-gray-500">Reach</div>
              </div>
              <div className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                <TouchAppIcon className="w-4 h-4 mx-auto text-green-500 mb-1" />
                <div className="text-sm font-bold text-gray-900">
                  {competitor.engagement}%
                </div>
                <div className="text-[10px] text-gray-500">Engage</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Performance Comparison - With Animated Bars */}
        <div className="glass-card p-6 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Performance Comparison</h3>
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${600 + index * 50}ms` }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color_code }}
                      ></span>
                      <span className="font-medium text-gray-900 text-sm">{item.issue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{item.party}</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: getSentimentColor(item.sentiment) }}
                      >
                        {Math.round(item.sentiment * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full animate-progress"
                      style={{
                        width: `${item.sentiment * 100}%`,
                        backgroundColor: item.color_code,
                        animationDelay: `${700 + index * 100}ms`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No issue data available</p>
          )}
        </div>

        {/* Competitor Campaigns - Glass Cards */}
        <div className="glass-card p-6 animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <CampaignIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Competitor Campaigns</h3>
          </div>
          {campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.slice(0, 4).map((campaign, index) => (
                <div
                  key={campaign.id}
                  className="glass-card-subtle p-4 animate-fadeInUp"
                  style={{
                    animationDelay: `${700 + index * 100}ms`,
                    borderLeft: `3px solid ${campaign.color_code}`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{campaign.campaign}</h4>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">{campaign.competitor}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-base font-bold text-gray-900">{formatNumber(campaign.reach)}</div>
                      <div className="text-[10px] text-gray-500">Reach</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-base font-bold text-gray-900">{campaign.engagement}%</div>
                      <div className="text-[10px] text-gray-500">Engage</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div
                        className="text-base font-bold"
                        style={{ color: getSentimentColor(campaign.sentiment) }}
                      >
                        {Math.round(campaign.sentiment * 100)}%
                      </div>
                      <div className="text-[10px] text-gray-500">Sentiment</div>
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
      <div className="glass-card p-6 animate-fadeInUp" style={{ animationDelay: '800ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <NotificationsActiveIcon className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Competitive Intelligence Alerts</h3>
        </div>
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`flex items-start p-3 rounded-xl border-l-4 backdrop-blur-sm animate-fadeInUp ${getSeverityStyles(alert.severity)}`}
                style={{ animationDelay: `${900 + index * 50}ms` }}
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {alert.competitor && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${competitors.find(c => c.name === alert.competitor)?.color_code}20`,
                          color: competitors.find(c => c.name === alert.competitor)?.color_code
                        }}
                      >
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
