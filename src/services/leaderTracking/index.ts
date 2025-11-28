/**
 * Leader Tracking Services
 * Unified exports for all leader tracking functionality
 */

export { constituencyLeaderService } from './constituencyLeaderService';
export type {
  ConstituencyLeader,
  LeaderNews,
  LeaderSentimentDaily,
  SwingConstituency,
  TMCMistake
} from './constituencyLeaderService';

export { leaderNewsService } from './leaderNewsService';

export { leaderSentimentService } from './leaderSentimentService';

export { tmcMistakeTracker } from './tmcMistakeTracker';

export { swingConstituencyService } from './swingConstituencyService';
export type { SwingAnalysis } from './swingConstituencyService';

// Re-export default services for convenience
export { default as constituencyLeaders } from './constituencyLeaderService';
export { default as leaderNews } from './leaderNewsService';
export { default as leaderSentiment } from './leaderSentimentService';
export { default as tmcMistakes } from './tmcMistakeTracker';
export { default as swingConstituencies } from './swingConstituencyService';
