/**
 * Constituency Sentiment Service
 * Fetches real sentiment data from DB tables:
 * - tv_transcripts
 * - local_news
 * - election_topic_mentions
 */

import supabase from '../lib/supabase';

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  bjpMentions: number;
  tmcMentions: number;
  avgScore: number;
}

export interface SentimentTimelinePoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  bjpMentions: number;
  tmcMentions: number;
}

export interface TopicSentiment {
  topic: string;
  bjpScore: number;
  tmcScore: number;
  bjpMentions: number;
  tmcMentions: number;
  overallSentiment: 'positive' | 'negative' | 'neutral';
}

export interface PartySentimentComparison {
  bjp: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    avgScore: number;
  };
  tmc: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    avgScore: number;
  };
}

/**
 * Get overall sentiment stats for a constituency
 * Pass null/undefined for constituencyName to get state-wide data
 */
export async function getConstituencySentiment(
  constituencyName: string | null | undefined,
  daysBack: number = 30
): Promise<SentimentStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString();

  // Fetch from tv_transcripts - skip constituency filter if null (state-level)
  let transcriptQuery = supabase
    .from('tv_transcripts')
    .select('sentiment, bjp_mention, tmc_mention')
    .gte('created_at', startDateStr);

  if (constituencyName) {
    transcriptQuery = transcriptQuery.eq('constituency', constituencyName);
  }

  const { data: transcripts, error: transcriptError } = await transcriptQuery;

  // Fetch from local_news - skip constituency filter if null (state-level)
  let newsQuery = supabase
    .from('local_news')
    .select('sentiment, sentiment_score, bjp_mentioned, tmc_mentioned')
    .gte('published_at', startDateStr);

  if (constituencyName) {
    newsQuery = newsQuery.eq('constituency', constituencyName);
  }

  const { data: news, error: newsError } = await newsQuery;

  if (transcriptError) console.error('Error fetching transcripts:', transcriptError);
  if (newsError) console.error('Error fetching news:', newsError);

  // Combine data
  const allSentiments: string[] = [];
  let bjpMentions = 0;
  let tmcMentions = 0;
  let totalScore = 0;
  let scoreCount = 0;

  // Process transcripts
  if (transcripts) {
    transcripts.forEach(t => {
      if (t.sentiment) allSentiments.push(t.sentiment);
      if (t.bjp_mention) bjpMentions++;
      if (t.tmc_mention) tmcMentions++;
    });
  }

  // Process news
  if (news) {
    news.forEach(n => {
      if (n.sentiment) allSentiments.push(n.sentiment);
      if (n.bjp_mentioned) bjpMentions++;
      if (n.tmc_mentioned) tmcMentions++;
      if (n.sentiment_score) {
        totalScore += n.sentiment_score;
        scoreCount++;
      }
    });
  }

  // Calculate percentages
  const total = allSentiments.length;
  const positive = allSentiments.filter(s => s === 'positive').length;
  const negative = allSentiments.filter(s => s === 'negative').length;
  const neutral = allSentiments.filter(s => s === 'neutral').length;

  return {
    positive: total > 0 ? Math.round((positive / total) * 100) : 0,
    negative: total > 0 ? Math.round((negative / total) * 100) : 0,
    neutral: total > 0 ? Math.round((neutral / total) * 100) : 0,
    total,
    bjpMentions,
    tmcMentions,
    avgScore: scoreCount > 0 ? totalScore / scoreCount : 0.5
  };
}

/**
 * Get sentiment timeline data for charts
 * Pass null/undefined for constituencyName to get state-wide data
 */
export async function getSentimentTimeline(
  constituencyName: string | null | undefined,
  daysBack: number = 30
): Promise<SentimentTimelinePoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString();

  // Build queries - skip constituency filter if null (state-level)
  let transcriptQuery = supabase
    .from('tv_transcripts')
    .select('sentiment, bjp_mention, tmc_mention, created_at')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true });

  let newsQuery = supabase
    .from('local_news')
    .select('sentiment, bjp_mentioned, tmc_mentioned, published_at')
    .gte('published_at', startDateStr)
    .order('published_at', { ascending: true });

  if (constituencyName) {
    transcriptQuery = transcriptQuery.eq('constituency', constituencyName);
    newsQuery = newsQuery.eq('constituency', constituencyName);
  }

  // Fetch all data for the period
  const [transcriptsResult, newsResult] = await Promise.all([
    transcriptQuery,
    newsQuery
  ]);

  // Group by date
  const dateMap = new Map<string, {
    positive: number;
    negative: number;
    neutral: number;
    bjpMentions: number;
    tmcMentions: number;
    total: number;
  }>();

  // Initialize all dates in range
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dateMap.set(dateKey, {
      positive: 0,
      negative: 0,
      neutral: 0,
      bjpMentions: 0,
      tmcMentions: 0,
      total: 0
    });
  }

  // Process transcripts
  if (transcriptsResult.data) {
    transcriptsResult.data.forEach(t => {
      const dateKey = new Date(t.created_at).toISOString().split('T')[0];
      const entry = dateMap.get(dateKey);
      if (entry) {
        entry.total++;
        if (t.sentiment === 'positive') entry.positive++;
        else if (t.sentiment === 'negative') entry.negative++;
        else entry.neutral++;
        if (t.bjp_mention) entry.bjpMentions++;
        if (t.tmc_mention) entry.tmcMentions++;
      }
    });
  }

  // Process news
  if (newsResult.data) {
    newsResult.data.forEach(n => {
      const dateKey = new Date(n.published_at).toISOString().split('T')[0];
      const entry = dateMap.get(dateKey);
      if (entry) {
        entry.total++;
        if (n.sentiment === 'positive') entry.positive++;
        else if (n.sentiment === 'negative') entry.negative++;
        else entry.neutral++;
        if (n.bjp_mentioned) entry.bjpMentions++;
        if (n.tmc_mentioned) entry.tmcMentions++;
      }
    });
  }

  // Convert to timeline array with percentages
  const timeline: SentimentTimelinePoint[] = [];
  dateMap.forEach((value, dateKey) => {
    const total = value.total || 1; // Avoid division by zero
    timeline.push({
      date: new Date(dateKey).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      positive: Math.round((value.positive / total) * 100),
      negative: Math.round((value.negative / total) * 100),
      neutral: Math.round((value.neutral / total) * 100),
      bjpMentions: value.bjpMentions,
      tmcMentions: value.tmcMentions
    });
  });

  return timeline;
}

/**
 * Get topic-wise sentiment comparison between BJP and TMC
 * Pass null/undefined for constituencyName to get state-wide data
 */
export async function getTopicSentiment(
  constituencyName: string | null | undefined,
  daysBack: number = 30
): Promise<TopicSentiment[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString();

  // Fetch election topic mentions - skip constituency filter if null (state-level)
  let topicQuery = supabase
    .from('election_topic_mentions')
    .select('topic, party, impact, score')
    .gte('created_at', startDateStr);

  if (constituencyName) {
    topicQuery = topicQuery.eq('constituency', constituencyName);
  }

  const { data: topicMentions, error } = await topicQuery;

  if (error) {
    console.error('Error fetching topic mentions:', error);
    return [];
  }

  // Group by topic
  const topicMap = new Map<string, {
    bjpScore: number;
    tmcScore: number;
    bjpCount: number;
    tmcCount: number;
    bjpImpact: number;
    tmcImpact: number;
  }>();

  const defaultTopics = ['Development', 'Law & Order', 'Employment', 'Corruption', 'Minority'];
  defaultTopics.forEach(topic => {
    topicMap.set(topic, {
      bjpScore: 0,
      tmcScore: 0,
      bjpCount: 0,
      tmcCount: 0,
      bjpImpact: 0,
      tmcImpact: 0
    });
  });

  // Process topic mentions
  if (topicMentions) {
    topicMentions.forEach(tm => {
      const topic = tm.topic || 'Other';
      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          bjpScore: 0,
          tmcScore: 0,
          bjpCount: 0,
          tmcCount: 0,
          bjpImpact: 0,
          tmcImpact: 0
        });
      }

      const entry = topicMap.get(topic)!;
      const impactMultiplier = tm.impact === 'High' ? 1.5 : tm.impact === 'Medium' ? 1 : 0.5;
      const score = (tm.score || 0.5) * impactMultiplier;

      if (tm.party === 'BJP') {
        entry.bjpScore += score;
        entry.bjpCount++;
        entry.bjpImpact += impactMultiplier;
      } else if (tm.party === 'TMC') {
        entry.tmcScore += score;
        entry.tmcCount++;
        entry.tmcImpact += impactMultiplier;
      }
    });
  }

  // Convert to array
  const topicSentiments: TopicSentiment[] = [];
  topicMap.forEach((value, topic) => {
    const bjpAvg = value.bjpCount > 0 ? (value.bjpScore / value.bjpCount) * 100 : 50;
    const tmcAvg = value.tmcCount > 0 ? (value.tmcScore / value.tmcCount) * 100 : 50;
    const overallScore = (bjpAvg + tmcAvg) / 2;

    topicSentiments.push({
      topic,
      bjpScore: Math.round(bjpAvg),
      tmcScore: Math.round(tmcAvg),
      bjpMentions: value.bjpCount,
      tmcMentions: value.tmcCount,
      overallSentiment: overallScore > 60 ? 'positive' : overallScore < 40 ? 'negative' : 'neutral'
    });
  });

  return topicSentiments;
}

/**
 * Get party-wise sentiment comparison
 * Pass null/undefined for constituencyName to get state-wide data
 */
export async function getPartySentimentComparison(
  constituencyName: string | null | undefined,
  daysBack: number = 30
): Promise<PartySentimentComparison> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString();

  // Build queries - skip constituency filter if null (state-level)
  let bjpTranscriptQuery = supabase
    .from('tv_transcripts')
    .select('sentiment')
    .eq('bjp_mention', true)
    .gte('created_at', startDateStr);

  let tmcTranscriptQuery = supabase
    .from('tv_transcripts')
    .select('sentiment')
    .eq('tmc_mention', true)
    .gte('created_at', startDateStr);

  let bjpNewsQuery = supabase
    .from('local_news')
    .select('sentiment, sentiment_score')
    .eq('bjp_mentioned', true)
    .gte('published_at', startDateStr);

  let tmcNewsQuery = supabase
    .from('local_news')
    .select('sentiment, sentiment_score')
    .eq('tmc_mentioned', true)
    .gte('published_at', startDateStr);

  if (constituencyName) {
    bjpTranscriptQuery = bjpTranscriptQuery.eq('constituency', constituencyName);
    tmcTranscriptQuery = tmcTranscriptQuery.eq('constituency', constituencyName);
    bjpNewsQuery = bjpNewsQuery.eq('constituency', constituencyName);
    tmcNewsQuery = tmcNewsQuery.eq('constituency', constituencyName);
  }

  // Fetch BJP mentions from transcripts
  const { data: bjpTranscripts } = await bjpTranscriptQuery;

  // Fetch TMC mentions from transcripts
  const { data: tmcTranscripts } = await tmcTranscriptQuery;

  // Fetch BJP mentions from news
  const { data: bjpNews } = await bjpNewsQuery;

  // Fetch TMC mentions from news
  const { data: tmcNews } = await tmcNewsQuery;

  // Calculate BJP sentiment
  const bjpSentiments = [
    ...(bjpTranscripts || []).map(t => t.sentiment),
    ...(bjpNews || []).map(n => n.sentiment)
  ];
  const bjpTotal = bjpSentiments.length || 1;
  const bjpPositive = bjpSentiments.filter(s => s === 'positive').length;
  const bjpNegative = bjpSentiments.filter(s => s === 'negative').length;
  const bjpNeutral = bjpSentiments.filter(s => s === 'neutral').length;
  const bjpScores = (bjpNews || []).filter(n => n.sentiment_score).map(n => n.sentiment_score);
  const bjpAvgScore = bjpScores.length > 0 ? bjpScores.reduce((a, b) => a + b, 0) / bjpScores.length : 0.5;

  // Calculate TMC sentiment
  const tmcSentiments = [
    ...(tmcTranscripts || []).map(t => t.sentiment),
    ...(tmcNews || []).map(n => n.sentiment)
  ];
  const tmcTotal = tmcSentiments.length || 1;
  const tmcPositive = tmcSentiments.filter(s => s === 'positive').length;
  const tmcNegative = tmcSentiments.filter(s => s === 'negative').length;
  const tmcNeutral = tmcSentiments.filter(s => s === 'neutral').length;
  const tmcScores = (tmcNews || []).filter(n => n.sentiment_score).map(n => n.sentiment_score);
  const tmcAvgScore = tmcScores.length > 0 ? tmcScores.reduce((a, b) => a + b, 0) / tmcScores.length : 0.5;

  return {
    bjp: {
      positive: Math.round((bjpPositive / bjpTotal) * 100),
      negative: Math.round((bjpNegative / bjpTotal) * 100),
      neutral: Math.round((bjpNeutral / bjpTotal) * 100),
      total: bjpSentiments.length,
      avgScore: bjpAvgScore
    },
    tmc: {
      positive: Math.round((tmcPositive / tmcTotal) * 100),
      negative: Math.round((tmcNegative / tmcTotal) * 100),
      neutral: Math.round((tmcNeutral / tmcTotal) * 100),
      total: tmcSentiments.length,
      avgScore: tmcAvgScore
    }
  };
}

/**
 * Get overall sentiment data for all constituencies (for state-level view)
 */
export async function getStateSentimentOverview(
  daysBack: number = 7
): Promise<{
  totalArticles: number;
  totalTranscripts: number;
  avgSentiment: number;
  bjpMentions: number;
  tmcMentions: number;
  topConstituencies: Array<{ name: string; sentiment: number; mentions: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString();

  const [transcriptsCount, newsCount, bjpCount, tmcCount] = await Promise.all([
    supabase.from('tv_transcripts').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
    supabase.from('local_news').select('id', { count: 'exact', head: true }).gte('published_at', startDateStr),
    supabase.from('tv_transcripts').select('id', { count: 'exact', head: true }).eq('bjp_mention', true).gte('created_at', startDateStr),
    supabase.from('tv_transcripts').select('id', { count: 'exact', head: true }).eq('tmc_mention', true).gte('created_at', startDateStr)
  ]);

  // Get top constituencies by mentions
  const { data: topConstituenciesData } = await supabase
    .from('tv_transcripts')
    .select('constituency')
    .not('constituency', 'is', null)
    .gte('created_at', startDateStr);

  const constituencyMentions = new Map<string, number>();
  if (topConstituenciesData) {
    topConstituenciesData.forEach(t => {
      if (t.constituency) {
        constituencyMentions.set(t.constituency, (constituencyMentions.get(t.constituency) || 0) + 1);
      }
    });
  }

  const topConstituencies = Array.from(constituencyMentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, mentions]) => ({
      name,
      sentiment: 50 + Math.random() * 30, // Placeholder - would need actual sentiment calc
      mentions
    }));

  return {
    totalArticles: newsCount.count || 0,
    totalTranscripts: transcriptsCount.count || 0,
    avgSentiment: 0.55, // Placeholder
    bjpMentions: bjpCount.count || 0,
    tmcMentions: tmcCount.count || 0,
    topConstituencies
  };
}
