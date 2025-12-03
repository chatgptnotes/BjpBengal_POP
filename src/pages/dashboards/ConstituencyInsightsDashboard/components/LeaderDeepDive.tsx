/**
 * Leader Deep Dive Component
 * Comprehensive political intelligence view for a leader
 * Shows: Win Analysis, Opposition Intel, Daily Pulse, Runner-up Path
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  TrendingUp,
  TrendingDown,
  Target,
  Newspaper,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Award,
  Users,
  MapPin,
  BarChart3,
  Shield,
  Crosshair,
  FileWarning,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  UserCircle,
  GraduationCap,
  Briefcase,
  Scale,
  Wallet,
  History,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  getLeaderIntelligence,
  refreshLeaderNews,
  refreshAllNews,
  generateDailyBriefing,
  getAIAttackPoints,
  type LeaderIntelligence,
} from '@/services/leaderIntelligence';
import { fetchNewsForConstituency } from '@/services/leaderIntelligence/newsIntelligenceService';
import { type MLAProfile } from '@/services/leaderIntelligence/mlaProfileService';
import {
  getLeaderProfileWithBio,
  formatIndianCurrency,
  type LeaderProfile,
  type ParsedBiography,
} from '@/services/supabase/leaderProfiles.service';
import { refreshMLAProfile, calculateDataQuality } from '@/services/mlaProfileRefresh';

// Refresh progress state
interface RefreshProgress {
  stage: 'idle' | 'english' | 'bengali' | 'analyzing' | 'scoring' | 'done';
  englishCount: number;
  bengaliCount: number;
  attackPoints: number;
  newScore: number;
}

// Party colors
const PARTY_COLORS: Record<string, string> = {
  TMC: '#00BFFF',
  BJP: '#FF9933',
  INC: '#00FF00',
  CPIM: '#FF0000',
  Others: '#808080',
};

const getPartyColor = (party: string): string => PARTY_COLORS[party] || PARTY_COLORS.Others;

// Severity colors
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'text-rose-400 bg-rose-400/10';
    case 'high': return 'text-amber-400 bg-amber-400/10';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10';
    case 'low': return 'text-slate-400 bg-slate-400/10';
    default: return 'text-slate-400 bg-slate-400/10';
  }
};

// Impact badge
const getImpactBadge = (impact: string) => {
  switch (impact) {
    case 'critical': return { bg: 'bg-rose-500', text: 'CRITICAL' };
    case 'high': return { bg: 'bg-amber-500', text: 'HIGH' };
    case 'medium': return { bg: 'bg-yellow-500', text: 'MEDIUM' };
    default: return { bg: 'bg-slate-500', text: 'LOW' };
  }
};

interface Props {
  constituencyId: string;
  constituencyName?: string;
}

type TabType = 'win' | 'opposition' | 'pulse' | 'runner' | 'issues' | 'profile';

export default function LeaderDeepDive({ constituencyId, constituencyName }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('win');
  const [intel, setIntel] = useState<LeaderIntelligence | null>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<RefreshProgress>({
    stage: 'idle',
    englishCount: 0,
    bengaliCount: 0,
    attackPoints: 0,
    newScore: 0,
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mlaProfile, setMlaProfile] = useState<LeaderProfile | null>(null);
  const [mlaBiography, setMlaBiography] = useState<ParsedBiography | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    loadIntelligence();
  }, [constituencyId]);

  // Load MLA profile when profile tab is selected
  useEffect(() => {
    if (activeTab === 'profile' && intel && !mlaProfile && !profileLoading) {
      loadMlaProfile();
    }
  }, [activeTab, intel]);

  const loadMlaProfile = async () => {
    if (!intel) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      // Fetch from Supabase (cached data from scraper)
      const { profile, biography } = await getLeaderProfileWithBio(intel.constituency_id);
      setMlaProfile(profile);
      setMlaBiography(biography);

      if (!profile) {
        setProfileError('Profile data not available. Run the MLA scraper to populate data.');
      }
    } catch (error) {
      console.error('[LeaderDeepDive] Error loading profile:', error);
      setProfileError('Failed to load profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      const data = await getLeaderIntelligence(constituencyId);
      setIntel(data);

      if (data) {
        const brief = await generateDailyBriefing(constituencyId);
        setBriefing(brief);
      }
    } catch (error) {
      console.error('[LeaderDeepDive] Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNews = async () => {
    if (!intel) return;
    setRefreshing(true);
    setRefreshProgress({ stage: 'english', englishCount: 0, bengaliCount: 0, attackPoints: 0, newScore: 0 });

    try {
      // Enhanced refresh: English + Bengali + AI analysis
      const result = await refreshAllNews(intel.constituency_id);

      setRefreshProgress({
        stage: 'done',
        englishCount: result.englishStored,
        bengaliCount: result.bengaliStored,
        attackPoints: result.attackPointsGenerated,
        newScore: result.newVulnerabilityScore,
      });

      console.log(`[LeaderDeepDive] Enhanced refresh: EN=${result.englishStored}, BN=${result.bengaliStored}, AP=${result.attackPointsGenerated}, VS=${result.newVulnerabilityScore}`);

      setLastRefresh(new Date());
      await loadIntelligence();

      // Reset progress after 3 seconds
      setTimeout(() => {
        setRefreshProgress({ stage: 'idle', englishCount: 0, bengaliCount: 0, attackPoints: 0, newScore: 0 });
      }, 3000);
    } catch (error) {
      console.error('[LeaderDeepDive] Refresh error:', error);
      setRefreshProgress({ stage: 'idle', englishCount: 0, bengaliCount: 0, attackPoints: 0, newScore: 0 });
    } finally {
      setRefreshing(false);
    }
  };

  // Get refresh stage label
  const getRefreshLabel = () => {
    switch (refreshProgress.stage) {
      case 'english': return 'Fetching English news...';
      case 'bengali': return 'Fetching Bengali news...';
      case 'analyzing': return 'Analyzing & generating attack points...';
      case 'scoring': return 'Calculating vulnerability score...';
      case 'done':
        return `Done: ${refreshProgress.englishCount + refreshProgress.bengaliCount} articles, ${refreshProgress.attackPoints} attack points`;
      default: return 'Refresh News';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  if (!intel) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
        <AlertTriangle size={40} className="mx-auto mb-3 text-amber-500 opacity-70" />
        <p className="text-slate-300 font-medium">No intelligence data available</p>
        <p className="text-slate-500 text-sm mt-1">Run migration 17 in Supabase</p>
      </div>
    );
  }

  const tabs = [
    { id: 'win' as TabType, label: 'Win Analysis', icon: Award },
    { id: 'opposition' as TabType, label: 'Opposition Intel', icon: Target },
    { id: 'pulse' as TabType, label: 'Daily Pulse', icon: Newspaper },
    { id: 'runner' as TabType, label: 'Runner-up Path', icon: Crosshair },
    { id: 'issues' as TabType, label: 'Issues', icon: FileWarning },
    { id: 'profile' as TabType, label: 'MLA Profile', icon: UserCircle },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900 px-4 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: getPartyColor(intel.current_mla_party) }}
            >
              {intel.current_mla_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{intel.current_mla_name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    backgroundColor: `${getPartyColor(intel.current_mla_party)}20`,
                    color: getPartyColor(intel.current_mla_party),
                  }}
                >
                  {intel.current_mla_party}
                </span>
                <span className="text-slate-400">{intel.constituency_name}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-500">{intel.district}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshNews}
              disabled={refreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                refreshProgress.stage === 'done' ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {getRefreshLabel()}
            </button>
            <div className={`px-2 py-1 rounded text-xs font-bold ${
              intel.vulnerability_score >= 70 ? 'bg-rose-500/20 text-rose-400' :
              intel.vulnerability_score >= 40 ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              Vuln: {intel.vulnerability_score}/100
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          <div className="bg-slate-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{intel.current_mla_votes.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 uppercase">Votes</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-emerald-400">+{intel.current_mla_margin.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 uppercase">Margin</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{intel.current_mla_vote_share}%</p>
            <p className="text-[10px] text-slate-500 uppercase">Vote Share</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{intel.turnout?.toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500 uppercase">Turnout</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-3 py-2 text-center">
            <p className={`text-lg font-bold ${
              intel.tracking_tier === 1 ? 'text-emerald-400' :
              intel.tracking_tier === 2 ? 'text-amber-400' : 'text-slate-400'
            }`}>Tier {intel.tracking_tier}</p>
            <p className="text-[10px] text-slate-500 uppercase">Priority</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-slate-900/50 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Win Analysis Tab */}
        {activeTab === 'win' && (
          <div className="space-y-4">
            {/* Why They Won */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
                <Award size={14} />
                Why {intel.current_mla_name.split(' ')[0]} Won
              </h3>
              <div className="space-y-2">
                {intel.winning_factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-lg">
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      factor.impact === 'critical' ? 'bg-emerald-500 text-white' :
                      factor.impact === 'high' ? 'bg-emerald-500/50 text-emerald-200' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {factor.impact.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{factor.factor}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                ))}
                {intel.winning_factors.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No win analysis data available</p>
                )}
              </div>
            </div>

            {/* Demographic Support */}
            {Object.keys(intel.demographic_support).length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Users size={14} />
                  Demographic Support
                </h3>
                <div className="space-y-2">
                  {Object.entries(intel.demographic_support).map(([group, data]) => (
                    <div key={group} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-32 capitalize">
                        {group.replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all"
                          style={{ width: `${data.support}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-10">{data.support}%</span>
                      {data.swing_from_2016 !== undefined && (
                        <span className={`text-xs w-12 ${
                          data.swing_from_2016 > 0 ? 'text-emerald-400' :
                          data.swing_from_2016 < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {data.swing_from_2016 > 0 ? '+' : ''}{data.swing_from_2016}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Margin Category */}
            {intel.margin_category && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Win Category</p>
                    <p className={`text-lg font-bold capitalize ${
                      intel.margin_category === 'landslide' ? 'text-emerald-400' :
                      intel.margin_category === 'comfortable' ? 'text-blue-400' :
                      intel.margin_category === 'close' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {intel.margin_category.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase">Anti-incumbency</p>
                    <p className={`text-lg font-bold capitalize ${
                      intel.anti_incumbency_factor === 'none' ? 'text-emerald-400' :
                      intel.anti_incumbency_factor === 'weak' ? 'text-blue-400' :
                      intel.anti_incumbency_factor === 'moderate' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {intel.anti_incumbency_factor || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Opposition Intel Tab */}
        {activeTab === 'opposition' && (
          <div className="space-y-4">
            {/* Executive Alert */}
            {briefing && briefing.alerts.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                <h3 className="text-sm font-bold text-rose-400 uppercase mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Active Alerts
                </h3>
                <div className="space-y-2">
                  {briefing.alerts.map((alert: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        alert.severity === 'high' ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-slate-300">{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attack Points */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-bold text-rose-400 uppercase mb-3 flex items-center gap-2">
                <Crosshair size={14} />
                Attack Points ({intel.attack_points.length})
              </h3>
              <div className="space-y-3">
                {intel.attack_points.map((ap, idx) => {
                  const badge = getImpactBadge(ap.impact);
                  return (
                    <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <div className="flex items-start gap-2">
                        <span className={`${badge.bg} px-1.5 py-0.5 rounded text-[10px] font-bold text-white`}>
                          {badge.text}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{ap.point}</p>
                          <p className="text-xs text-slate-500 mt-1">Evidence: {ap.evidence}</p>
                          {ap.voter_groups && ap.voter_groups.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {ap.voter_groups.map((g, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {intel.attack_points.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No attack points identified</p>
                )}
              </div>
            </div>

            {/* Unfulfilled Promises */}
            {intel.unfulfilled_promises.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                  <XCircle size={14} />
                  Unfulfilled Promises ({intel.unfulfilled_promises.length})
                </h3>
                <div className="space-y-2">
                  {intel.unfulfilled_promises.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {p.status === 'unfulfilled' ? (
                          <XCircle size={14} className="text-rose-400" />
                        ) : (
                          <Clock size={14} className="text-amber-400" />
                        )}
                        <span className="text-sm text-slate-300">{p.promise}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{p.date}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          p.public_anger === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          p.public_anger === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {p.public_anger} anger
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public Grievances */}
            {intel.public_grievances.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <FileWarning size={14} />
                  Public Grievances
                </h3>
                <div className="space-y-2">
                  {intel.public_grievances.map((g, idx) => (
                    <div key={idx} className="p-2 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getSeverityColor(g.severity)}`}>
                          {g.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-white">{g.issue}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Affected: {g.affected_areas?.join(', ') || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Pulse Tab */}
        {activeTab === 'pulse' && (
          <div className="space-y-4">
            {/* AI Briefing */}
            {briefing && (
              <div className="bg-gradient-to-r from-indigo-900/30 to-slate-900/50 rounded-xl p-4 border border-indigo-500/30">
                <h3 className="text-sm font-bold text-indigo-400 uppercase mb-2 flex items-center gap-2">
                  <Lightbulb size={14} />
                  Daily Briefing
                </h3>
                <p className="text-sm text-slate-300">{briefing.executive_summary}</p>

                {briefing.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 uppercase mb-2">Recommendations</p>
                    {briefing.recommendations.map((r: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          r.priority === 'high' ? 'bg-rose-400' :
                          r.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'
                        }`} />
                        <span className="text-slate-300">{r.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* News Summary */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">7-Day News Summary</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-xl font-bold text-white">{intel.news_summary.total}</p>
                  <p className="text-[10px] text-slate-500">Total</p>
                </div>
                <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                  <p className="text-xl font-bold text-emerald-400">{intel.news_summary.positive}</p>
                  <p className="text-[10px] text-slate-500">Positive</p>
                </div>
                <div className="text-center p-2 bg-rose-500/10 rounded-lg">
                  <p className="text-xl font-bold text-rose-400">{intel.news_summary.negative}</p>
                  <p className="text-[10px] text-slate-500">Negative</p>
                </div>
                <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                  <p className="text-xl font-bold text-slate-300">{intel.news_summary.neutral}</p>
                  <p className="text-[10px] text-slate-500">Neutral</p>
                </div>
              </div>
            </div>

            {/* Sentiment Trend */}
            {intel.sentiment_trend.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Sentiment Trend</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={intel.sentiment_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="sentiment" stroke="#6366f1" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent News */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Recent News</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {intel.recent_news.map((news: any, idx: number) => (
                  <a
                    key={idx}
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        news.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                        news.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {news.sentiment}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white line-clamp-2">{news.headline}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{news.source_name}</p>
                      </div>
                      <ExternalLink size={12} className="text-slate-600 flex-shrink-0" />
                    </div>
                  </a>
                ))}
                {intel.recent_news.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No recent news. Click "Refresh News" to fetch latest.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Runner-up Path Tab */}
        {activeTab === 'runner' && (
          <div className="space-y-4">
            {/* Runner-up Info */}
            {intel.runner_up_name ? (
              <>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getPartyColor(intel.runner_up_party || 'Others') }}
                    >
                      {intel.runner_up_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{intel.runner_up_name}</h3>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: `${getPartyColor(intel.runner_up_party || 'Others')}20`,
                            color: getPartyColor(intel.runner_up_party || 'Others'),
                          }}
                        >
                          {intel.runner_up_party}
                        </span>
                        <span className="text-xs text-slate-400">Runner-up 2021</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-lg font-bold text-white">{intel.runner_up_votes?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">Votes</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-lg font-bold text-white">{intel.runner_up_vote_share}%</p>
                      <p className="text-[10px] text-slate-500">Vote Share</p>
                    </div>
                    <div className="text-center p-2 bg-rose-500/10 rounded-lg">
                      <p className="text-lg font-bold text-rose-400">-{intel.current_mla_margin.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">Gap</p>
                    </div>
                  </div>
                </div>

                {/* Why They Lost */}
                {intel.losing_factors.length > 0 && (
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-rose-400 uppercase mb-3">Why They Lost</h3>
                    <div className="space-y-2">
                      {intel.losing_factors.map((factor, idx) => (
                        <div key={idx} className="p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              factor.impact === 'critical' ? 'bg-rose-500 text-white' :
                              factor.impact === 'high' ? 'bg-amber-500 text-white' :
                              'bg-slate-600 text-slate-300'
                            }`}>
                              {factor.impact.toUpperCase()}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-white">{factor.factor}</p>
                              {factor.votes_lost_est && (
                                <p className="text-xs text-slate-500">Est. votes lost: ~{factor.votes_lost_est.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Path to Victory */}
                {intel.path_to_victory && (
                  <div className="bg-gradient-to-r from-emerald-900/20 to-slate-900/50 rounded-xl p-4 border border-emerald-500/30">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
                      <TrendingUp size={14} />
                      Path to Victory
                    </h3>
                    <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Votes Needed</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {intel.path_to_victory.votes_needed.toLocaleString()}
                        </span>
                      </div>
                      {intel.path_to_victory.swing_needed_pct && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-400">Swing Needed</span>
                          <span className="text-sm font-bold text-white">
                            {intel.path_to_victory.swing_needed_pct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {intel.path_to_victory.strategies && intel.path_to_victory.strategies.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 uppercase">Recommended Strategies</p>
                        {intel.path_to_victory.strategies.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <ChevronRight size={12} className="text-emerald-400" />
                              <span className="text-xs text-slate-300">{s.strategy}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">
                              +{s.potential_votes.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {intel.path_to_victory.key_booths_to_flip && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-xs text-slate-500 uppercase mb-2">Key Booths to Flip</p>
                        <div className="flex flex-wrap gap-1">
                          {intel.path_to_victory.key_booths_to_flip.map((booth, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
                              {booth}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Demographic Weakness */}
                {Object.keys(intel.demographic_weakness).length > 0 && (
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Demographic Weakness</h3>
                    <div className="space-y-2">
                      {Object.entries(intel.demographic_weakness).map(([group, data]) => (
                        <div key={group} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                          <span className="text-xs text-slate-400 capitalize">{group.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white">{data.support}%</span>
                            <span className="text-xs text-rose-400">Gap: {data.gap || data.swing}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Crosshair size={32} className="mx-auto mb-2 opacity-50" />
                <p>No runner-up data available</p>
              </div>
            )}
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <FileWarning size={14} />
                Constituency Issues ({intel.issues.length})
              </h3>
              <div className="space-y-3">
                {intel.issues.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-white">{issue.issue_title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        issue.public_anger_level === 'boiling' ? 'bg-rose-500/20 text-rose-400' :
                        issue.public_anger_level === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {issue.public_anger_level} anger
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Category: <span className="text-slate-400 capitalize">{issue.issue_category}</span>
                      </span>
                      <span className={`${
                        issue.government_response === 'none' ? 'text-rose-400' :
                        issue.government_response === 'partial' ? 'text-amber-400' :
                        issue.government_response === 'in_progress' ? 'text-blue-400' :
                        'text-emerald-400'
                      }`}>
                        Response: {issue.government_response || 'None'}
                      </span>
                    </div>
                    {issue.affected_areas && issue.affected_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {issue.affected_areas.map((area, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {intel.issues.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No issues recorded for this constituency</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {profileLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw size={32} className="animate-spin text-indigo-500 mb-4" />
                <p className="text-slate-400 text-sm">Loading profile from database...</p>
              </div>
            )}

            {profileError && !profileLoading && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <AlertCircle size={24} className="text-amber-400 mx-auto mb-2" />
                <p className="text-amber-400 text-sm mb-3">{profileError}</p>
                <p className="text-slate-500 text-xs mb-3">
                  Profile data can be fetched from MyNeta.info and Wikipedia.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={loadMlaProfile}
                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={async () => {
                      setProfileLoading(true);
                      setProfileError(null);
                      try {
                        const result = await refreshMLAProfile(
                          intel.constituency_id,
                          intel.current_mla_name,
                          intel.constituency_name
                        );
                        if (result.success && result.profile) {
                          setMlaProfile(result.profile);
                        } else {
                          setProfileError(result.error || 'Failed to fetch profile');
                        }
                      } catch (err) {
                        setProfileError('Failed to scrape profile data');
                      } finally {
                        setProfileLoading(false);
                      }
                    }}
                    className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Scrape Now
                  </button>
                </div>
              </div>
            )}

            {mlaProfile && !profileLoading && (
              <>
                {/* Criminal Records */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Scale size={14} />
                      Criminal Records
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                      mlaProfile.criminal_cases > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {mlaProfile.criminal_cases} CASES
                    </span>
                  </h3>
                  {mlaProfile.criminal_cases > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <p className="text-lg font-bold text-rose-400">{mlaProfile.criminal_cases}</p>
                          <p className="text-[10px] text-slate-500">Total Cases</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <p className="text-lg font-bold text-amber-400">{mlaProfile.serious_criminal_cases || 0}</p>
                          <p className="text-[10px] text-slate-500">Serious Cases</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-emerald-400 text-sm flex items-center gap-2">
                      <CheckCircle size={14} /> No criminal cases declared
                    </p>
                  )}
                </div>

                {/* Assets & Liabilities */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Wallet size={14} />
                    Declared Assets (2021)
                  </h3>
                  <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-400 mb-1">Total Declared Assets</p>
                    <p className="text-lg font-bold text-indigo-400">
                      {formatIndianCurrency(mlaProfile.declared_assets_lakhs)}
                    </p>
                  </div>
                </div>

                {/* Education & Personal */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <GraduationCap size={14} />
                    Education & Personal Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <span className="text-xs text-slate-500">Education</span>
                      <span className="text-sm text-white">{mlaProfile.education || 'Not Available'}</span>
                    </div>
                    {mlaProfile.age && mlaProfile.age > 0 && (
                      <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                        <span className="text-xs text-slate-500">Age</span>
                        <span className="text-sm text-white">{mlaProfile.age} years</span>
                      </div>
                    )}
                    {mlaProfile.profession && (
                      <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                        <span className="text-xs text-slate-500">Profession</span>
                        <span className="text-sm text-white">{mlaProfile.profession}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <span className="text-xs text-slate-500">Party</span>
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getPartyColor(mlaProfile.party)}20`,
                          color: getPartyColor(mlaProfile.party),
                        }}
                      >
                        {mlaProfile.party}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biography (from Wikipedia via positions_held) */}
                {mlaBiography?.summary && (
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <User size={14} />
                      Biography
                    </h3>
                    <div className="flex gap-4">
                      {mlaProfile.photo_url && (
                        <img
                          src={mlaProfile.photo_url}
                          alt={mlaProfile.leader_name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        {mlaBiography.birthDate && (
                          <p className="text-xs text-slate-500 mb-1">
                            Born: <span className="text-slate-400">{mlaBiography.birthDate}</span>
                            {mlaBiography.birthPlace && ` in ${mlaBiography.birthPlace}`}
                          </p>
                        )}
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                          {mlaBiography.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Source Links */}
                <div className="flex gap-3 pt-2">
                  {mlaBiography?.mynetaUrl && (
                    <a
                      href={mlaBiography.mynetaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      <ExternalLink size={12} />
                      View on MyNeta.info
                    </a>
                  )}
                  {mlaBiography?.wikipediaUrl && (
                    <a
                      href={mlaBiography.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      <ExternalLink size={12} />
                      View on Wikipedia
                    </a>
                  )}
                </div>

                {/* Data Quality Score */}
                {(() => {
                  const qualityScore = calculateDataQuality(mlaProfile);
                  return (
                    <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Data Quality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              qualityScore >= 70 ? 'bg-emerald-500' :
                              qualityScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${qualityScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${
                          qualityScore >= 70 ? 'text-emerald-400' :
                          qualityScore >= 40 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {qualityScore}%
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Last Updated */}
                {mlaProfile.updated_at && (
                  <p className="text-center text-[10px] text-slate-600">
                    Last updated: {new Date(mlaProfile.updated_at).toLocaleString()}
                  </p>
                )}

                {/* Refresh Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMlaProfile(null);
                      setMlaBiography(null);
                      loadMlaProfile();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    <RefreshCw size={12} />
                    Reload Cache
                  </button>
                  <button
                    onClick={async () => {
                      setProfileLoading(true);
                      try {
                        const result = await refreshMLAProfile(
                          intel.constituency_id,
                          intel.current_mla_name,
                          intel.constituency_name
                        );
                        if (result.success && result.profile) {
                          setMlaProfile(result.profile);
                          const bio = result.profile.positions_held
                            ? {
                                summary: result.profile.positions_held.find(p => p.startsWith('Biography:'))?.replace('Biography: ', '') || null,
                                birthDate: result.profile.positions_held.find(p => p.startsWith('Birth:'))?.replace('Birth: ', '') || null,
                                birthPlace: result.profile.positions_held.find(p => p.startsWith('Place:'))?.replace('Place: ', '') || null,
                                mynetaUrl: result.profile.positions_held.find(p => p.startsWith('MyNeta:'))?.replace('MyNeta: ', '') || null,
                                wikipediaUrl: result.profile.positions_held.find(p => p.startsWith('Wikipedia:'))?.replace('Wikipedia: ', '') || null,
                              }
                            : { summary: null, birthDate: null, birthPlace: null, mynetaUrl: null, wikipediaUrl: null };
                          setMlaBiography(bio);
                        }
                      } catch (err) {
                        console.error('Failed to scrape profile:', err);
                      } finally {
                        setProfileLoading(false);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs transition-colors"
                  >
                    <RefreshCw size={12} />
                    Scrape Fresh Data
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
