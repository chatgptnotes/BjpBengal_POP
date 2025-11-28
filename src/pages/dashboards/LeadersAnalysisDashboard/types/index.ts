/**
 * TypeScript Types for Leader's Analysis Dashboard
 */

export interface PoliticalLeader {
  id: string;
  name: string;
  name_bengali?: string;
  party: string;
  party_color: string;
  position: string;
  constituency?: string;
  photo_url?: string;
  twitter_handle?: string;
  facebook_page?: string;
  instagram_handle?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeaderMetrics {
  id: string;
  leader_id: string;
  date: string;

  // Mentions & Reach
  total_mentions: number;
  news_mentions: number;
  social_mentions: number;

  // Sentiment Breakdown
  positive_mentions: number;
  negative_mentions: number;
  neutral_mentions: number;
  sentiment_score: number; // -1.00 to +1.00

  // Approval Rating
  approval_rating: number; // 0-100%
  approval_change: number; // Change from yesterday

  // Engagement
  social_engagement: number;
  trending_rank?: number; // 1-10 ranking

  // Joined leader data
  political_leaders?: PoliticalLeader;
}

export interface ElectionResult {
  id: string;
  constituency: string;
  election_year: number;
  election_type: 'Assembly' | 'Lok Sabha' | 'By-election';

  // Winner Details
  winner_name: string;
  winner_party: string;
  winner_votes: number;
  winner_vote_share: number;

  // Runner-up Details
  runner_up_name?: string;
  runner_up_party?: string;
  runner_up_votes?: number;

  // Third Place
  third_name?: string;
  third_party?: string;
  third_votes?: number;

  // Overall Stats
  total_votes: number;
  valid_votes?: number;
  rejected_votes?: number;
  turnout_percentage: number;
  margin: number;

  created_at?: string;
}

export interface LeaderSentimentLog {
  id: string;
  leader_id: string;
  source_type: 'news' | 'twitter' | 'facebook' | 'instagram';
  source_url?: string;
  content_snippet: string;

  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  analyzed_by: 'keyword' | 'gemini' | 'manual';

  published_at?: string;
  created_at: string;
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  reason?: string;
}

export interface PartyStrength {
  party: string;
  party_color: string;
  seats_won: number;
  total_seats: number;
  vote_share: number;
  sentiment_score: number;
}

export interface LeaderCardData {
  id: string;
  name: string;
  party: string;
  party_color: string;
  position: string;
  photo_url?: string;
  approval_rating: number;
  approval_change: number;
  trend: 'up' | 'down' | 'stable';
  total_mentions: number;
  sentiment_score: number;
}

export interface SentimentTrendData {
  date: string;
  bjp_sentiment: number;
  tmc_sentiment: number;
  inc_sentiment: number;
  overall_sentiment: number;
}

export interface VotingTrendData {
  party: string;
  party_color: string;
  vote_share_2016: number;
  vote_share_2021: number;
  change: number;
  seats_2016: number;
  seats_2021: number;
}
