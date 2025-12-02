/**
 * Constituency Infographic Card Component
 * Based on user-provided political-intelligence-dashboard design
 * Dark slate theme with recharts visualizations
 */

import React from 'react';
import {
  Users,
  Vote,
  BookOpen,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  AlertTriangle,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ArrowUpRight,
  Briefcase,
  Scale,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge } from '@/components/ui/Gauge';
import { useInfographicData } from '../../hooks/useInfographicData';

interface ConstituencyInfographicCardProps {
  constituencyId: string;
}

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('en-IN');
};

const formatVoters = (num: number): string => {
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  return formatNumber(num);
};

// Party colors
const PARTY_COLORS: Record<string, string> = {
  'TMC': '#22c55e',
  'AITC': '#22c55e',
  'BJP': '#f97316',
  'CPI(M)': '#ef4444',
  'CPIM': '#ef4444',
  'INC': '#3b82f6',
  'Others': '#94a3b8',
};

const getPartyColor = (party: string): string => PARTY_COLORS[party] || '#94a3b8';

// Trend icon helper
const TrendIcon = ({ trend, className }: { trend: 'up' | 'down' | 'stable'; className?: string }) => {
  if (trend === 'up') return <ArrowUpRight size={16} className={`text-red-500 ${className}`} />;
  if (trend === 'down') return <TrendingDown size={16} className={`text-green-500 ${className}`} />;
  return <Minus size={16} className={`text-gray-500 ${className}`} />;
};

// Concern color helper
const getConcernColor = (label: string): string => {
  if (label.toLowerCase().includes('unemployment') || label.toLowerCase().includes('job')) return 'bg-gradient-to-r from-blue-400 to-red-400';
  if (label.toLowerCase().includes('price') || label.toLowerCase().includes('inflation')) return 'bg-purple-500';
  if (label.toLowerCase().includes('civic') || label.toLowerCase().includes('infrastructure')) return 'bg-gray-400';
  if (label.toLowerCase().includes('law')) return 'bg-green-500';
  return 'bg-orange-400';
};

// Concern icon helper
const ConcernIcon = ({ label }: { label: string }) => {
  if (label.toLowerCase().includes('unemployment') || label.toLowerCase().includes('job')) return <AlertTriangle size={14} className="text-red-500" />;
  if (label.toLowerCase().includes('price') || label.toLowerCase().includes('inflation')) return <Scale size={14} className="text-purple-500" />;
  if (label.toLowerCase().includes('infrastructure') || label.toLowerCase().includes('civic')) return <Building2 size={14} className="text-gray-500" />;
  if (label.toLowerCase().includes('law')) return <User size={14} className="text-green-500" />;
  if (label.toLowerCase().includes('education')) return <BookOpen size={14} className="text-orange-500" />;
  return null;
};

export default function ConstituencyInfographicCard({
  constituencyId,
}: ConstituencyInfographicCardProps) {
  const {
    constituency,
    demographics,
    electionHistory,
    partyStrength,
    currentLeader,
    voterSentiment,
    topIssues,
    infrastructure,
    socialMedia,
    isLoading,
    error,
  } = useInfographicData(constituencyId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] bg-slate-900 p-6 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={48} />
          <p className="text-slate-400 font-medium">Loading constituency data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !constituency) {
    return (
      <div className="min-h-[400px] bg-slate-900 p-6 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-white font-bold mb-2">Failed to load data</p>
          <p className="text-slate-400 text-sm">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Prepare demographic data for charts
  const religionData = demographics ? [
    { label: 'Hindu', value: demographics.hindu_percentage, color: '#f97316' },
    { label: 'Muslim', value: demographics.muslim_percentage, color: '#22c55e' },
    { label: 'Christian', value: demographics.christian_percentage, color: '#3b82f6' },
    { label: 'Others', value: demographics.others_percentage, color: '#94a3b8' },
  ].filter(d => d.value > 0) : [];

  const casteData = demographics ? [
    { label: 'General', value: demographics.general_percentage, color: '#f59e0b' },
    { label: 'OBC', value: demographics.obc_percentage, color: '#22c55e' },
    { label: 'SC', value: demographics.sc_percentage, color: '#ef4444' },
    { label: 'ST', value: demographics.st_percentage, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  const ageData = demographics ? [
    { label: '0-18', value: demographics.age_0_18, color: '#3b82f6' },
    { label: '18-35', value: demographics.age_18_35, color: '#8b5cf6' },
    { label: '35-60', value: demographics.age_35_60, color: '#f59e0b' },
    { label: '60+', value: demographics.age_60_plus, color: '#ef4444' },
  ] : [];

  // Stats data
  const population = demographics?.total_population || 0;
  const totalVoters = demographics?.total_voters || constituency.totalVoters;
  const literacyRate = demographics?.literacy_rate || 0;
  const urbanPercentage = demographics?.urban_percentage || (constituency.isUrban ? 100 : 50);

  return (
    <div className="min-h-screen bg-slate-900 p-2 md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* --- HEADER --- */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 md:p-6 text-white shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{constituency.name}</h1>
            <div className="mt-2 text-slate-300 text-sm md:text-base flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span>District: <span className="text-white font-medium">{constituency.district}</span></span>
              <span className="hidden md:inline">|</span>
              <span>Cluster: <span className="text-white font-medium">{constituency.cluster}</span></span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-slate-700/50 backdrop-blur-sm p-3 rounded-lg border border-slate-600 flex items-center gap-3">
            <Building2 className="text-blue-400" size={32} />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Type</p>
              <p className="font-bold text-lg">{constituency.isUrban ? 'Urban Constituency' : 'Rural Constituency'}</p>
            </div>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Population', value: population > 0 ? formatNumber(population) : 'N/A', icon: Users, color: 'border-t-red-500' },
            { label: 'Total Voters', value: formatVoters(totalVoters), icon: Vote, color: 'border-t-blue-500' },
            { label: 'Literacy Rate', value: literacyRate > 0 ? `${literacyRate.toFixed(0)}%` : 'N/A', icon: BookOpen, color: 'border-t-purple-500' },
            { label: 'Urban', value: `${urbanPercentage.toFixed(0)}%`, icon: Building2, color: 'border-t-cyan-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow-md p-4 border-t-4 ${stat.color} flex items-center justify-between`}>
              <div>
                <div className="text-slate-500 text-xs uppercase font-bold tracking-wide">{stat.label}</div>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">{stat.value}</div>
              </div>
              <stat.icon className="text-slate-400 opacity-50" size={32} />
            </div>
          ))}
        </div>

        {/* --- MIDDLE SECTION: MLA, HISTORY, CONCERNS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* MLA CARD */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-5 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b pb-2">Current MLA</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentLeader?.current_mla_photo_url ? (
                  <img src={currentLeader.current_mla_photo_url} alt={currentLeader.current_mla_name} className="w-20 h-20 rounded-full border-4 border-green-100 object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-green-100 bg-slate-200 flex items-center justify-center">
                    <User size={32} className="text-slate-400" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 text-white p-1 rounded-full border-2 border-white" style={{ backgroundColor: getPartyColor(currentLeader?.current_mla_party || electionHistory?.year2021?.party || 'TMC') }}>
                  <div className="text-[8px] font-bold">{currentLeader?.current_mla_party || electionHistory?.year2021?.party || 'TMC'}</div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {currentLeader?.current_mla_name || electionHistory?.year2021?.winner || 'Unknown'}
                </h2>
                <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                  Party: <span className="font-bold" style={{ color: getPartyColor(currentLeader?.current_mla_party || electionHistory?.year2021?.party || '') }}>
                    {currentLeader?.current_mla_party || electionHistory?.year2021?.party || 'N/A'}
                  </span>
                </p>
                <p className="text-sm mt-1 text-slate-600">
                  Victory Margin: <span className="font-bold text-slate-900">
                    {currentLeader?.current_mla_margin ? `${formatNumber(currentLeader.current_mla_margin)} votes` : electionHistory?.year2021?.margin || 'N/A'}
                  </span>
                  <span className="ml-1 inline-block bg-green-100 text-green-700 rounded-full p-[2px]"><TrendingUp size={12} /></span>
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-sm text-slate-500">
              Runner-up: <span className="font-semibold text-slate-700">
                {currentLeader?.runner_up_name || 'N/A'} ({currentLeader?.runner_up_party || 'N/A'})
              </span>
              {currentLeader?.runner_up_party === 'BJP' && <span className="text-orange-500 ml-1">*</span>}
            </div>
          </div>

          {/* ELECTION HISTORY */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b pb-2 text-center">Election History</h3>
            <div className="space-y-3">
              {electionHistory ? (
                <>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">2021 Election</span>
                      <span className="text-xs text-slate-500">Margin:</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Winner: <span className="font-semibold">{electionHistory.year2021.winner.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded text-white text-[10px]" style={{ backgroundColor: getPartyColor(electionHistory.year2021.party) }}>
                          {electionHistory.year2021.party}
                        </span>
                      </div>
                      <span className="font-bold text-green-600">{electionHistory.year2021.margin}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">2016 Election</span>
                      <span className="text-xs text-slate-500">Margin:</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Winner: <span className="font-semibold">{electionHistory.year2016.winner.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded text-white text-[10px]" style={{ backgroundColor: getPartyColor(electionHistory.year2016.party) }}>
                          {electionHistory.year2016.party}
                        </span>
                      </div>
                      <span className="font-bold text-green-600">{electionHistory.year2016.margin}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-sm text-center">No election history available</p>
              )}
            </div>
          </div>

          {/* VOTER CONCERNS */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-md p-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b pb-2 text-right">Top 5 Voter Concerns</h3>
            <div className="space-y-3">
              {topIssues && topIssues.length > 0 ? (
                topIssues.map((concern, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-5 text-slate-400 font-bold">{i + 1}.</div>
                    <div className="w-32 truncate font-medium text-slate-700">{concern.issue}</div>
                    <div className="flex items-center gap-1 w-24">
                      <TrendIcon trend={concern.trend} className="ml-1" />
                      <span className="text-xs font-bold">{concern.score}%</span>
                      <span className="text-[10px] text-slate-400">({concern.trend === 'up' ? 'Rising' : concern.trend === 'down' ? 'Declining' : 'Stable'})</span>
                    </div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${getConcernColor(concern.issue)}`} style={{ width: `${concern.score}%` }}></div>
                    </div>
                    <div className="w-6 flex justify-end">
                      <ConcernIcon label={concern.issue} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm text-center">No issue data available</p>
              )}
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* DEMOGRAPHICS */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-5 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-2">Demographics</h3>
            <p className="text-xs text-slate-500 mb-4">Age Distribution</p>

            {/* Age Bars */}
            <div className="space-y-2 mb-6">
              {ageData.map((age, i) => (
                <div key={i} className="flex items-center text-xs">
                  <div className="w-4 text-center">
                    {i === 0 && <User size={12} className="mx-auto text-blue-500" />}
                    {i === 1 && <Briefcase size={12} className="mx-auto text-purple-500" />}
                    {i === 2 && <User size={12} className="mx-auto text-orange-500" />}
                    {i === 3 && <User size={12} className="mx-auto text-red-500" />}
                  </div>
                  <div className="w-20 pl-2 font-medium text-slate-600">{age.label} years</div>
                  <div className="flex-1 h-4 bg-slate-100 rounded-r-md relative">
                    <div
                      className="absolute top-0 left-0 h-full rounded-r-md flex items-center justify-end pr-1 text-[10px] text-white font-bold"
                      style={{ width: `${age.value * 2.5}%`, backgroundColor: age.color }}
                    >
                      {age.value.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 h-full">
              {/* Religion Donut */}
              <div>
                <p className="text-xs text-slate-500 font-bold mb-2">Religion</p>
                <div className="h-32 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={religionData}
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="label"
                      >
                        {religionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="text-[10px] space-y-1 mt-[-20px]">
                  {religionData.map((r, i) => (
                    <li key={i} className="flex items-center justify-between px-2">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></span> {r.label}</span>
                      <span className="font-bold">{r.value.toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Caste Composition */}
              <div>
                <p className="text-xs text-slate-500 font-bold mb-2 text-right">Caste Composition</p>
                <div className="h-full flex flex-col justify-end items-end pr-4">
                  {/* Simplified visual representation of caste stack */}
                  <div className="w-12 h-40 bg-slate-100 rounded-t-lg flex flex-col-reverse overflow-hidden shadow-inner">
                    {casteData.map((c, i) => (
                      <div key={i} className="w-full flex items-center justify-center text-[10px] text-white font-bold border-b border-white/20" style={{ height: `${c.value}%`, backgroundColor: c.color }}>
                        {c.value > 10 ? `${c.value.toFixed(0)}%` : ''}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 text-[9px] mt-2 flex-wrap justify-end">
                    {casteData.map((c, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SENTIMENT & PARTY */}
          <div className="lg:col-span-8 space-y-4">

            {/* Sentiments */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 text-center">Voter Segment Sentiment</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {voterSentiment && voterSentiment.length > 0 ? (
                  voterSentiment.slice(0, 4).map((s, i) => (
                    <Gauge
                      key={i}
                      label={s.category}
                      score={s.positive}
                      change={`${s.positive > s.negative ? '+' : ''}${(s.positive - s.negative).toFixed(0)}%`}
                      color={s.positive > 50 ? '#22c55e' : '#ef4444'}
                    />
                  ))
                ) : (
                  <div className="col-span-4 text-center text-slate-400 text-sm py-4">No sentiment data available</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party Strength */}
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">Party Strength</h3>
                <div className="w-full h-8 bg-slate-200 rounded-md flex overflow-hidden mb-4">
                  {partyStrength.map((p, i) => (
                    <div key={i} style={{ width: `${p.val}%`, backgroundColor: getPartyColor(p.name) }} className="h-full border-r border-white/20"></div>
                  ))}
                </div>
                <div className="space-y-2">
                  {partyStrength.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-1 rounded hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: getPartyColor(p.name) }}>{p.name[0]}</span>
                        <span className="font-semibold text-slate-700">{p.name}</span>
                      </div>
                      <span className="font-bold">{p.val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-800 uppercase">Social Media Pulse</h3>
                  <div className="flex gap-1">
                    <Facebook size={16} className="text-blue-600" />
                    <Twitter size={16} className="text-sky-500" />
                    <Instagram size={16} className="text-pink-600" />
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-slate-500">Total Mentions</p>
                  <p className="text-2xl font-bold text-slate-800">{socialMedia.totalMentions}</p>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Sentiment Analysis</p>
                  <div className="text-sm">
                    <span className="text-green-600 font-bold">Positive {socialMedia.sentimentSplit[0]}%</span>,
                    <span className="text-red-500 ml-1">Negative {socialMedia.sentimentSplit[1]}%</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Trending Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {socialMedia.hashtags.map((t, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- FOOTER INFRASTRUCTURE --- */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap justify-between items-center text-sm shadow-sm">
          <h4 className="font-bold text-slate-700 uppercase mr-4">Infrastructure Quick Stats</h4>
          <div className="flex gap-4 md:gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              <span className="text-slate-600">Wards: <span className="font-bold text-slate-900">{infrastructure.wards}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-slate-500" />
              <span className="text-slate-600">Polling Booths: <span className="font-bold text-slate-900">{infrastructure.booths}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" />
              <span className="text-slate-600">Sensitive Booths: <span className="font-bold text-slate-900">{infrastructure.sensitiveBooths}</span></span>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 mt-4 pb-4">
          Bengal Pulse of People | Political Intelligence Report | Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

      </div>
    </div>
  );
}
