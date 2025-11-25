/**
 * TypeScript Types for Constituency Insights Dashboard
 */

export interface Constituency {
  id: string;
  name: string;
  district: string;
  is_urban: boolean;
  city_cluster: string;
  total_voters: number;
  social_media_activity: 'very_high' | 'high' | 'medium' | 'low';
}

export interface TimeWindow {
  label: string;
  from: Date;
  to: Date;
  preset: 'live' | '7d' | '30d' | '90d' | 'last_election' | 'previous_election' | 'custom';
}

export interface VoterSegment {
  id: string;
  name: string;
  description: string;
  sentiment_score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  top_issues: string[];
  positive_percent: number;
  neutral_percent: number;
  negative_percent: number;
  voter_count?: number;
}

export interface IssueScore {
  issue: string;
  score: number; // 0-100
  importance_score: number; // 0-1
  change_7d: number;
  change_30d: number;
}

export interface SentimentTimeSeries {
  date: string;
  overall_sentiment: number;
  jobs: number;
  healthcare: number;
  infrastructure: number;
  education: number;
  agriculture: number;
  law_order: number;
}

export interface SocialMediaMetrics {
  platform: 'Twitter' | 'Facebook' | 'Instagram' | 'YouTube';
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_posts: number;
  reach: number;
  engagement: number;
  top_hashtags: string[];
  trending_topics: string[];
}

export interface NewsDebate {
  id: string;
  type: 'news' | 'tv_debate' | 'radio';
  channel_name?: string;
  program_name?: string;
  title: string;
  published_at: string;
  aired_at?: string;
  sentiment_score: number;
  bjp_mentioned: boolean;
  bjp_sentiment_score?: number;
  summary: string;
  topics: string[];
  stance_summary?: string;
}

export interface PartyStrength {
  party_id: string;
  party_name: string;
  party_abbreviation: string;
  strength_score: number; // 0-100
  sentiment_trend: number[]; // Historical sentiment scores
  vote_share_2021?: number;
  vote_share_2016?: number;
  change_since_last_election?: number;
}

export interface ElectionResult {
  year: number;
  winning_candidate: string;
  winning_party: string;
  vote_share_percent: number;
  margin_votes: number;
  margin_percent: number;
  runner_up_candidate: string;
  runner_up_party: string;
  turnout_percent: number;
}

export interface BoothData {
  booth_id: string;
  booth_number: string;
  booth_name: string;
  ward_id: string;
  ward_name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  total_voters: number;
  male_voters: number;
  female_voters: number;
  sentiment_score: number;
  is_active: boolean;
  agent_assigned?: string;
}

export interface WardPerformance {
  ward_id: string;
  ward_number: string;
  ward_name: string;
  sentiment_score: number;
  total_booths: number;
  active_booths: number;
  total_voters: number;
  feedback_count: number;
}

export interface AIRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'sentiment' | 'engagement' | 'booth' | 'issue' | 'competitor';
  title: string;
  description: string;
  action_items: string[];
  impact_score: number; // 0-100
  generated_at: string;
}

export interface ConstituencySnapshot {
  constituency: Constituency;
  time_window: TimeWindow;
  top_issues_overall: IssueScore[];
  live_summary_text: string;
  voter_segments: VoterSegment[];
  social_sentiment: SocialMediaMetrics[];
  debate_highlights: NewsDebate[];
  historical_results: {
    last_election: ElectionResult;
    previous_election: ElectionResult;
  };
  parties_strength: PartyStrength[];
  booths_and_wards: {
    total_wards: number;
    total_booths: number;
    active_booths: number;
    wards: WardPerformance[];
    booths: BoothData[];
  };
  ai_recommendations?: AIRecommendation[];
  overall_sentiment_trend: SentimentTimeSeries[];
}

export interface VoterSegmentFilter {
  age_min?: number;
  age_max?: number;
  gender?: 'Male' | 'Female' | 'Other';
  caste_category?: 'SC' | 'ST' | 'OBC' | 'General';
  location_type?: 'Urban' | 'Rural';
  education_level?: string;
  income_bracket?: string;
}
