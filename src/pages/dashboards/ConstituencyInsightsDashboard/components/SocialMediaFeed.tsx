/**
 * Real-Time Social Media Feed Component
 * Shows Twitter/Facebook posts with sentiment analysis
 */

import React, { useState } from 'react';
import { Twitter, Facebook, Heart, MessageCircle, Share2, TrendingUp, Filter } from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'facebook';
  author: string;
  content: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  hashtags?: string[];
  verified?: boolean;
}

interface Props {
  posts: SocialPost[];
  onLoadMore?: () => void;
}

export default function SocialMediaFeed({ posts, onLoadMore }: Props) {
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'twitter' | 'facebook'>('all');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  const filteredPosts = posts.filter(post => {
    const platformMatch = filterPlatform === 'all' || post.platform === filterPlatform;
    const sentimentMatch = filterSentiment === 'all' || post.sentiment === filterSentiment;
    return platformMatch && sentimentMatch;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'negative': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😠';
      default: return '😐';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Social Media Pulse</h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">{filteredPosts.length} posts</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Platform Filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterPlatform === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPlatform('twitter')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterPlatform === 'twitter'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Twitter size={12} /> Twitter
            </button>
            <button
              onClick={() => setFilterPlatform('facebook')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterPlatform === 'facebook'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Facebook size={12} /> Facebook
            </button>
          </div>

          {/* Sentiment Filter */}
          <div className="flex gap-1 border-l border-slate-200 pl-3">
            <button
              onClick={() => setFilterSentiment('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterSentiment === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSentiment('positive')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterSentiment === 'positive'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              😊 Positive
            </button>
            <button
              onClick={() => setFilterSentiment('negative')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterSentiment === 'negative'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              😠 Negative
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No posts match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-slate-50 transition-colors">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {post.platform === 'twitter' ? (
                      <Twitter size={16} className="text-sky-500" />
                    ) : (
                      <Facebook size={16} className="text-blue-600" />
                    )}
                    <span className="text-sm font-bold text-slate-800">
                      {post.author}
                      {post.verified && <span className="text-blue-500 ml-1">✓</span>}
                    </span>
                    <span className="text-xs text-slate-400">• {post.timestamp}</span>
                  </div>

                  {/* Sentiment Badge */}
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSentimentColor(post.sentiment)}`}>
                    {getSentimentIcon(post.sentiment)} {post.sentiment.toUpperCase()}
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-blue-600 hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Engagement Metrics */}
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Heart size={14} className="text-rose-400" />
                    <span>{post.engagement.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <MessageCircle size={14} className="text-blue-400" />
                    <span>{post.engagement.comments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Share2 size={14} className="text-emerald-400" />
                    <span>{post.engagement.shares.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {onLoadMore && filteredPosts.length > 0 && (
        <div className="border-t border-slate-200 p-4 text-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}

// Generate mock social media data
export function generateMockSocialPosts(): SocialPost[] {
  return [
    {
      id: '1',
      platform: 'twitter',
      author: 'Rajesh Kumar',
      content: 'Great to see infrastructure development in our area! New roads are making a real difference. #Development #Bhowanipur',
      timestamp: '2 mins ago',
      sentiment: 'positive',
      engagement: { likes: 45, comments: 12, shares: 8 },
      hashtags: ['Development', 'Bhowanipur'],
      verified: false,
    },
    {
      id: '2',
      platform: 'facebook',
      author: 'Priya Chatterjee',
      content: 'Water supply issues continue in our locality. When will this be fixed? The monsoon is approaching and we are still struggling.',
      timestamp: '15 mins ago',
      sentiment: 'negative',
      engagement: { likes: 89, comments: 34, shares: 23 },
      verified: false,
    },
    {
      id: '3',
      platform: 'twitter',
      author: 'Mamata Banerjee',
      content: 'Met with local business owners today to discuss economic growth opportunities. Together we will build a stronger West Bengal! 🚀',
      timestamp: '1 hour ago',
      sentiment: 'positive',
      engagement: { likes: 1250, comments: 234, shares: 456 },
      hashtags: ['WestBengal', 'Development'],
      verified: true,
    },
    {
      id: '4',
      platform: 'twitter',
      author: 'Ankit Sen',
      content: 'The healthcare facilities in our area need urgent attention. Long waiting times and staff shortage are major concerns.',
      timestamp: '2 hours ago',
      sentiment: 'negative',
      engagement: { likes: 67, comments: 28, shares: 15 },
      hashtags: ['Healthcare', 'Kolkata'],
      verified: false,
    },
    {
      id: '5',
      platform: 'facebook',
      author: 'Local Citizens Forum',
      content: 'Community cleanup drive was a huge success! Thank you to all 200+ volunteers who participated. This is how we build our city together.',
      timestamp: '3 hours ago',
      sentiment: 'positive',
      engagement: { likes: 234, comments: 45, shares: 67 },
      verified: false,
    },
  ];
}
