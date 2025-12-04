/**
 * Party Sentiment Card Component
 * Shows BJP vs TMC sentiment comparison with topic-wise breakdown
 * Uses real data from DB when available
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Users, Target } from 'lucide-react';
import type { TopicSentiment, PartySentimentComparison } from '../../../../services/constituencySentimentService';

interface Props {
  partyComparison: PartySentimentComparison | null;
  topicData: TopicSentiment[];
  loading?: boolean;
  onRefresh?: () => void;
  hasRealData?: boolean;
}

export default function PartySentimentCard({
  partyComparison,
  topicData,
  loading = false,
  onRefresh,
  hasRealData = false
}: Props) {
  // Calculate who is ahead
  const bjpScore = partyComparison?.bjp.positive ?? 50;
  const tmcScore = partyComparison?.tmc.positive ?? 50;
  const leadingParty = bjpScore > tmcScore ? 'BJP' : bjpScore < tmcScore ? 'TMC' : 'TIE';
  const leadMargin = Math.abs(bjpScore - tmcScore);

  const getTopicIcon = (topic: string) => {
    switch (topic.toLowerCase()) {
      case 'development':
        return 'engineering';
      case 'law & order':
        return 'gavel';
      case 'employment':
        return 'work';
      case 'corruption':
        return 'report_problem';
      case 'minority':
        return 'groups';
      default:
        return 'trending_up';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-600';
      case 'negative':
        return 'text-rose-600';
      default:
        return 'text-slate-500';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-50 border-emerald-200';
      case 'negative':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  if (!partyComparison && topicData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Target size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Party Sentiment Analysis</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-slate-400">
          <p>No party sentiment data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">BJP vs TMC Sentiment</h3>
            <p className="text-xs text-slate-500">
              {hasRealData ? 'Based on TV & News mentions' : 'Party comparison analysis'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasRealData && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
              LIVE
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Party Comparison Cards */}
      {partyComparison && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* BJP Card */}
          <motion.div
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">BJP</span>
                </div>
                <span className="font-bold text-slate-700">BJP</span>
              </div>
              {leadingParty === 'BJP' && (
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                  AHEAD
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Positive</span>
                <span className="text-sm font-bold text-emerald-600">{partyComparison.bjp.positive}%</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${partyComparison.bjp.positive}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500">Negative</span>
                <span className="text-sm font-bold text-rose-600">{partyComparison.bjp.negative}%</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${partyComparison.bjp.negative}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>

              <div className="pt-2 border-t border-orange-200 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total Mentions</span>
                  <span className="font-bold text-slate-700">{partyComparison.bjp.total}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* TMC Card */}
          <motion.div
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TMC</span>
                </div>
                <span className="font-bold text-slate-700">TMC</span>
              </div>
              {leadingParty === 'TMC' && (
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                  AHEAD
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Positive</span>
                <span className="text-sm font-bold text-emerald-600">{partyComparison.tmc.positive}%</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${partyComparison.tmc.positive}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500">Negative</span>
                <span className="text-sm font-bold text-rose-600">{partyComparison.tmc.negative}%</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${partyComparison.tmc.negative}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>

              <div className="pt-2 border-t border-green-200 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total Mentions</span>
                  <span className="font-bold text-slate-700">{partyComparison.tmc.total}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lead Indicator */}
      {partyComparison && leadingParty !== 'TIE' && (
        <motion.div
          className={`mb-6 p-3 rounded-xl border ${
            leadingParty === 'BJP' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp
              size={16}
              className={leadingParty === 'BJP' ? 'text-orange-600' : 'text-green-600'}
            />
            <span className={`text-sm font-bold ${leadingParty === 'BJP' ? 'text-orange-700' : 'text-green-700'}`}>
              {leadingParty} leads by {leadMargin.toFixed(1)}% in positive sentiment
            </span>
          </div>
        </motion.div>
      )}

      {/* Topic-wise Breakdown */}
      {topicData.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={14} />
            Topic-wise Sentiment
          </h4>

          <div className="space-y-3">
            {topicData.map((topic, idx) => (
              <motion.div
                key={topic.topic}
                className={`p-3 rounded-lg border ${getSentimentBg(topic.overallSentiment)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-sm text-slate-500">{getTopicIcon(topic.topic)}</span>
                    <span className="font-medium text-slate-700">{topic.topic}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {topic.bjpScore > topic.tmcScore ? (
                      <TrendingUp size={12} className="text-orange-500" />
                    ) : topic.bjpScore < topic.tmcScore ? (
                      <TrendingDown size={12} className="text-green-500" />
                    ) : (
                      <Minus size={12} className="text-slate-400" />
                    )}
                    <span className={`text-xs font-bold ${getSentimentColor(topic.overallSentiment)}`}>
                      {topic.overallSentiment.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* BJP vs TMC scores */}
                <div className="flex gap-4 text-xs">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-orange-600 font-medium">BJP</span>
                      <span className="font-bold">{topic.bjpScore}%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.bjpScore}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-green-600 font-medium">TMC</span>
                      <span className="font-bold">{topic.tmcScore}%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.tmcScore}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mention counts */}
                <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                  <span>BJP mentions: {topic.bjpMentions}</span>
                  <span>TMC mentions: {topic.tmcMentions}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-10">
          <div className="flex items-center gap-2 text-slate-500">
            <RefreshCw className="animate-spin" size={20} />
            <span>Loading party data...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
