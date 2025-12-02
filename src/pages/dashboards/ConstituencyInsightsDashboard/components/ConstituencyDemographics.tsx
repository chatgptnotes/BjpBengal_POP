/**
 * Constituency Demographics Component
 * Displays detailed demographic information: population, age, gender, caste, religion
 */

import React, { useState, useEffect } from 'react';
import { Users, Loader2, Calendar, Database } from 'lucide-react';
import { GlowIcon } from '../../../../components/ui/GlowIcon';
import {
  PopulationIcon,
  LiteracyIcon,
  UrbanIcon,
  VotersIcon,
  GenderIcon,
  GeminiIconWrapper,
} from '../../../../components/ui/GeminiIcons';
import { getByConstituencyId } from '@/services/supabase/constituencyDemographics.service';
import type { ConstituencyDemographicsRow } from '@/types/database';

interface Props {
  constituencyId?: string;
}

// Progress bar component
function ProgressBar({
  value,
  color = 'bg-blue-500',
  showLabel = true
}: {
  value: number;
  color?: string;
  showLabel?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 w-12 text-right">{value.toFixed(1)}%</span>
      )}
    </div>
  );
}

// Stat item component
function StatItem({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-white">{value.toFixed(1)}%</span>
      </div>
      <ProgressBar value={value} color={color} showLabel={false} />
    </div>
  );
}

export default function ConstituencyDemographics({ constituencyId }: Props) {
  const [data, setData] = useState<ConstituencyDemographicsRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!constituencyId) {
        setData(null);
        setHasChecked(true);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getByConstituencyId(constituencyId);
        setData(result);
      } catch (error) {
        console.error('[ConstituencyDemographics] Error:', error);
        setData(null);
      } finally {
        setIsLoading(false);
        setHasChecked(true);
      }
    }

    fetchData();
  }, [constituencyId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <GeminiIconWrapper color="purple" size="sm">
            <PopulationIcon size={16} />
          </GeminiIconWrapper>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Constituency Demographics
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="text-purple-400 animate-spin" />
          <p className="text-slate-400 text-sm mt-3">Loading demographics...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (hasChecked && !data) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <GeminiIconWrapper color="purple" size="sm">
            <PopulationIcon size={16} />
          </GeminiIconWrapper>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Constituency Demographics
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <GeminiIconWrapper color="cyan" size="lg">
            <PopulationIcon size={24} />
          </GeminiIconWrapper>
          <p className="text-slate-400 text-sm text-center mt-4">
            No demographic data available
          </p>
          <p className="text-slate-500 text-xs text-center mt-1">
            Census data will appear once loaded
          </p>
        </div>
      </div>
    );
  }

  // Format population with commas
  const formatPopulation = (pop: number) => {
    return pop?.toLocaleString('en-IN') || '0';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GeminiIconWrapper color="purple" size="sm">
            <PopulationIcon size={16} />
          </GeminiIconWrapper>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Constituency Demographics
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Database size={12} />
          <span>{data?.data_source || 'Census 2011'}</span>
        </div>
      </div>

      {/* Key Stats Row - Gemini Style */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Total Population */}
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <GeminiIconWrapper color="cyan" size="md">
              <PopulationIcon size={20} />
            </GeminiIconWrapper>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Population</p>
          <p className="text-lg font-bold text-white">{formatPopulation(data?.total_population || 0)}</p>
        </div>

        {/* Literacy Rate */}
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <GeminiIconWrapper color="cyan" size="md">
              <LiteracyIcon size={20} />
            </GeminiIconWrapper>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Literacy Rate</p>
          <p className="text-lg font-bold text-cyan-400">
            {data?.literacy_rate ? `${data.literacy_rate.toFixed(1)}%` : 'N/A'}
          </p>
        </div>

        {/* Urban */}
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <GeminiIconWrapper color="cyan" size="md">
              <UrbanIcon size={20} />
            </GeminiIconWrapper>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Urban</p>
          <p className="text-lg font-bold text-cyan-400">
            {data?.urban_percentage != null ? `${data.urban_percentage.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Sex Ratio & Voters Row - Gemini Style */}
      {(data?.sex_ratio || data?.total_voters) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {data?.sex_ratio && (
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <GeminiIconWrapper color="pink" size="sm">
                  <GenderIcon size={16} />
                </GeminiIconWrapper>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Sex Ratio</p>
                  <p className="text-lg font-bold text-pink-400">{data.sex_ratio}</p>
                  <p className="text-[10px] text-slate-500">females per 1000 males</p>
                </div>
              </div>
            </div>
          )}
          {data?.total_voters && (
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <GeminiIconWrapper color="cyan" size="sm">
                  <VotersIcon size={16} />
                </GeminiIconWrapper>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Total Voters</p>
                  <p className="text-lg font-bold text-cyan-400">{formatPopulation(data.total_voters)}</p>
                  <p className="text-[10px] text-slate-500">registered electors</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Demographics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Age Distribution */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Age Distribution
          </h4>
          <div className="space-y-2">
            <StatItem label="0-18 years" value={data?.age_0_18 || 0} color="bg-cyan-500" />
            <StatItem label="18-35 years" value={data?.age_18_35 || 0} color="bg-blue-500" />
            <StatItem label="35-60 years" value={data?.age_35_60 || 0} color="bg-indigo-500" />
            <StatItem label="60+ years" value={data?.age_60_plus || 0} color="bg-purple-500" />
          </div>
        </div>

        {/* Gender Ratio */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Gender Ratio
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Male</span>
                <span className="text-sm font-semibold text-blue-400">{(data?.male_percentage || 0).toFixed(1)}%</span>
              </div>
              <ProgressBar value={data?.male_percentage || 0} color="bg-blue-500" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Female</span>
                <span className="text-sm font-semibold text-pink-400">{(data?.female_percentage || 0).toFixed(1)}%</span>
              </div>
              <ProgressBar value={data?.female_percentage || 0} color="bg-pink-500" showLabel={false} />
            </div>
          </div>

          {/* Gender ratio visual */}
          <div className="mt-4 flex h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${data?.male_percentage || 50}%` }}
            />
            <div
              className="bg-pink-500 transition-all duration-500"
              style={{ width: `${data?.female_percentage || 50}%` }}
            />
          </div>
        </div>

        {/* Caste Composition */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Caste Composition
          </h4>
          <div className="space-y-2">
            <StatItem label="SC" value={data?.sc_percentage || 0} color="bg-amber-500" />
            <StatItem label="ST" value={data?.st_percentage || 0} color="bg-orange-500" />
            <StatItem label="OBC" value={data?.obc_percentage || 0} color="bg-yellow-500" />
            <StatItem label="General" value={data?.general_percentage || 0} color="bg-lime-500" />
          </div>
        </div>

        {/* Religion */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Religion
          </h4>
          <div className="space-y-2">
            <StatItem label="Hindu" value={data?.hindu_percentage || 0} color="bg-orange-400" />
            <StatItem label="Muslim" value={data?.muslim_percentage || 0} color="bg-green-500" />
            <StatItem label="Christian" value={data?.christian_percentage || 0} color="bg-sky-500" />
            <StatItem label="Others" value={data?.others_percentage || 0} color="bg-slate-500" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-slate-700">
        <Calendar size={12} className="text-slate-500" />
        <span className="text-xs text-slate-500">
          Last updated: {data?.last_updated ? new Date(data.last_updated).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Dec 2011'}
        </span>
      </div>
    </div>
  );
}
