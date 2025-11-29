import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Heart, Share2, RefreshCw, ExternalLink } from 'lucide-react';
import { Tweet, fetchTweetReplies } from '../services/twitterScraper';

interface TweetCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweet: Tweet | null;
}

export default function TweetCommentsModal({ isOpen, onClose, tweet }: TweetCommentsModalProps) {
  const [replies, setReplies] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tweet) {
      loadReplies();
    }
  }, [isOpen, tweet]);

  const loadReplies = async () => {
    if (!tweet) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchTweetReplies(tweet.id);
      if (response.data) {
        setReplies(response.data);
      } else {
        setReplies([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load replies');
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !tweet) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openTweetOnTwitter = () => {
    window.open(`https://twitter.com/i/status/${tweet.id}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
            <span className="text-sm text-gray-500">
              ({tweet.public_metrics?.reply_count || 0})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openTweetOnTwitter}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
              title="View on Twitter"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Original Tweet */}
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {tweet.author?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 truncate">
                  {tweet.author?.name || 'Unknown User'}
                </span>
                <span className="text-gray-500 text-sm">
                  @{tweet.author?.username || 'unknown'}
                </span>
              </div>
              <p className="text-gray-800 mt-1 text-sm leading-relaxed">{tweet.text}</p>
              <div className="flex items-center space-x-4 mt-2 text-gray-500 text-xs">
                <span>{formatDate(tweet.created_at)}</span>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{tweet.public_metrics?.like_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-3 h-3" />
                  <span>{tweet.public_metrics?.retweet_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-500 mt-3">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={loadReplies}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          ) : replies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-medium">No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment on Twitter</p>
              <button
                onClick={openTweetOnTwitter}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open on Twitter</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {replies.map((reply) => (
                <div key={reply.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {reply.author?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {reply.author?.name || 'Unknown User'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          @{reply.author?.username || 'unknown'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDate(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1 text-sm leading-relaxed">{reply.text}</p>
                      <div className="flex items-center space-x-4 mt-2 text-gray-400 text-xs">
                        <div className="flex items-center space-x-1 hover:text-red-500 cursor-pointer">
                          <Heart className="w-3 h-3" />
                          <span>{reply.public_metrics?.like_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer">
                          <MessageCircle className="w-3 h-3" />
                          <span>{reply.public_metrics?.reply_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-green-500 cursor-pointer">
                          <Share2 className="w-3 h-3" />
                          <span>{reply.public_metrics?.retweet_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={loadReplies}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <span className="text-xs text-gray-400">
            v1.8 - 2025-11-29
          </span>
        </div>
      </div>
    </div>
  );
}
