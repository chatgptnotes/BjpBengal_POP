/**
 * Service for storing transcripts in Supabase with AI sentiment analysis
 * and election topic detection
 */

import supabase from '../lib/supabase';
import { TranscriptLine } from './transcriptionSocket';
import { sentimentEngine } from './sentimentAnalysis';
import { analyzeElectionTopics, detectTopics, detectConstituency } from './electionTopicAnalysis';

// BJP keywords for detection - West Bengal focused
const BJP_KEYWORDS = [
  // National BJP Leaders
  'bjp', 'bharatiya janata', 'modi', 'narendra modi', 'pm modi',
  'amit shah', 'jp nadda', 'nda', 'lotus', 'kamal',
  // West Bengal BJP Leaders
  'sukanta majumdar', 'dilip ghosh', 'suvendu adhikari', 'suvendu',
  'rahul sinha', 'locket chatterjee', 'agnimitra paul', 'samik bhattacharya',
  'jyotirmoy singh mahato', 'nisith pramanik', 'john barla', 'shantanu thakur',
  'arjun singh', 'saumitra khan', 'mukul roy', 'babul supriyo',
  // BJP Bengal Terms
  'bengal bjp', 'bjp bengal', 'bjp west bengal', 'saffron', 'parivartan',
  'sonar bangla', 'jai shri ram', 'bjp candidate', 'bjp worker', 'bjp booth',
  // Bengali BJP terms
  'বিজেপি', 'পদ্ম', 'মোদি', 'সুকান্ত', 'সুভেন্দু', 'দিলীপ ঘোষ'
];

// TMC keywords for detection - West Bengal focused
const TMC_KEYWORDS = [
  // TMC Main Leaders
  'tmc', 'trinamool', 'mamata', 'mamata banerjee', 'abhishek banerjee',
  'trinamool congress', 'didi', 'grassroots', 'aitc',
  // TMC Senior Leaders
  'partha chatterjee', 'subrata mukherjee', 'firhad hakim', 'aroop biswas',
  'chandrima bhattacharya', 'bratya basu', 'shashi panja', 'sobhandeb chattopadhyay',
  'amit mitra', 'moloy ghatak', 'jyotipriya mallick', 'sujit bose',
  // TMC Youth & Others
  'derek o brien', 'derek obrien', 'mahua moitra', 'nusrat jahan', 'mimi chakraborty',
  'sayoni ghosh', 'babul supriyo tmc', 'kunal ghosh', 'santanu sen',
  // TMC Bengal Terms
  'khela hobe', 'pishi', 'tolabaji', 'cut money', 'syndicate raj',
  'tmc candidate', 'tmc worker', 'tmc booth', 'jorasanko', 'kalighat',
  // Bengali TMC terms
  'তৃণমূল', 'মমতা', 'দিদি', 'অভিষেক', 'খেলা হবে'
];

/**
 * Detect BJP mentions in text
 */
function detectBJP(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BJP_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Detect TMC mentions in text
 */
function detectTMC(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return TMC_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Analyze sentiment using AI engine
 */
async function analyzeSentiment(text: string): Promise<{ sentiment: string; score: number }> {
  try {
    const result = await sentimentEngine.analyzeSentiment(text);
    return {
      sentiment: result.polarity,
      score: (result.sentiment + 1) / 2
    };
  } catch {
    return { sentiment: 'neutral', score: 0.5 };
  }
}

export interface TranscriptRecord {
  id?: string;
  channel_name: string;
  channel_id?: string;
  transcript_time: string;
  bengali_text: string;
  hindi_text: string;
  english_text: string;
  sentiment: string;
  bjp_mention: boolean;
  tmc_mention: boolean;
  // Topic detection fields
  topic_development?: boolean;
  topic_law_order?: boolean;
  topic_employment?: boolean;
  topic_corruption?: boolean;
  topic_minority?: boolean;
  // Constituency detection
  constituency?: string;
  created_at?: string;
}

interface ElectionTopicMention {
  source_type: 'transcript' | 'news';
  source_id?: string;
  topic: string;
  party: 'BJP' | 'TMC';
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  keywords_matched: string[];
  text_snippet: string;
  channel_name: string;
  constituency?: string;
}

/**
 * Save election topic mentions to database
 */
async function saveTopicMentions(
  mentions: ElectionTopicMention[]
): Promise<void> {
  if (mentions.length === 0) return;

  try {
    const { error } = await supabase
      .from('election_topic_mentions')
      .insert(mentions);

    if (error) {
      console.error('[TranscriptStorage] Error saving topic mentions:', error);
    }
  } catch (err) {
    console.error('[TranscriptStorage] Exception saving topics:', err);
  }
}

/**
 * Save a transcript line to Supabase with AI sentiment analysis
 */
export async function saveTranscript(
  channelName: string,
  channelId: string | undefined,
  line: TranscriptLine
): Promise<{ success: boolean; error?: string }> {
  try {
    // Combine all text for analysis
    const fullText = `${line.english || ''} ${line.hindi || ''} ${line.bengali || ''}`.trim();

    // AI Sentiment Analysis
    const sentimentResult = await analyzeSentiment(fullText);

    // Detect political mentions
    const bjpMentioned = line.bjpMention || detectBJP(fullText);
    const tmcMentioned = line.tmcMention || detectTMC(fullText);

    // Detect election topics
    const topics = detectTopics(fullText);
    const topicAnalysis = analyzeElectionTopics(fullText);

    // Detect constituency from text
    const detectedConstituency = detectConstituency(fullText);

    const record: TranscriptRecord = {
      channel_name: channelName,
      channel_id: channelId || null,
      transcript_time: line.timestamp,
      bengali_text: line.bengali,
      hindi_text: line.hindi,
      english_text: line.english,
      sentiment: sentimentResult.sentiment,
      bjp_mention: bjpMentioned,
      tmc_mention: tmcMentioned,
      // Topic flags
      topic_development: topics.development,
      topic_law_order: topics.law_order,
      topic_employment: topics.employment,
      topic_corruption: topics.corruption,
      topic_minority: topics.minority,
      // Constituency
      constituency: detectedConstituency?.name || null,
    };

    const { data, error } = await supabase
      .from('tv_transcripts')
      .insert(record)
      .select('id')
      .single();

    if (error) {
      console.error('[TranscriptStorage] Error saving transcript:', error);
      return { success: false, error: error.message };
    }

    // Save topic mentions for detailed analysis
    const topicMentions: ElectionTopicMention[] = [];
    const textSnippet = fullText.slice(0, 200);

    topicAnalysis.topics.forEach(topic => {
      if (topic.detected && topic.matchedKeywords.length > 0) {
        // Save BJP impact
        if (topic.bjpImpact !== 'neutral' || topic.bjpScore !== 0) {
          topicMentions.push({
            source_type: 'transcript',
            source_id: data?.id,
            topic: topic.topic,
            party: 'BJP',
            impact: topic.bjpImpact,
            score: topic.bjpScore,
            keywords_matched: topic.matchedKeywords.filter(k => k.startsWith('BJP')),
            text_snippet: textSnippet,
            channel_name: channelName,
            constituency: detectedConstituency?.name || null
          });
        }
        // Save TMC impact
        if (topic.tmcImpact !== 'neutral' || topic.tmcScore !== 0) {
          topicMentions.push({
            source_type: 'transcript',
            source_id: data?.id,
            topic: topic.topic,
            party: 'TMC',
            impact: topic.tmcImpact,
            score: topic.tmcScore,
            keywords_matched: topic.matchedKeywords.filter(k => k.startsWith('TMC')),
            text_snippet: textSnippet,
            channel_name: channelName,
            constituency: detectedConstituency?.name || null
          });
        }
      }
    });

    // Save topic mentions in background
    saveTopicMentions(topicMentions);

    console.log('[TranscriptStorage] Saved with sentiment:', sentimentResult.sentiment,
      '| BJP:', bjpMentioned, '| TMC:', tmcMentioned,
      '| Constituency:', detectedConstituency?.name || 'none',
      '| Topics:', Object.entries(topics).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TranscriptStorage] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Save multiple transcript lines (batch insert) with AI sentiment analysis
 */
export async function saveTranscriptBatch(
  channelName: string,
  channelId: string | undefined,
  lines: TranscriptLine[]
): Promise<{ success: boolean; error?: string; count: number }> {
  try {
    // Process each line with AI sentiment analysis and topic detection
    const records: TranscriptRecord[] = await Promise.all(
      lines.map(async (line) => {
        const fullText = `${line.english || ''} ${line.hindi || ''} ${line.bengali || ''}`.trim();
        const sentimentResult = await analyzeSentiment(fullText);
        const topics = detectTopics(fullText);
        const detectedConstituency = detectConstituency(fullText);

        return {
          channel_name: channelName,
          channel_id: channelId || null,
          transcript_time: line.timestamp,
          bengali_text: line.bengali,
          hindi_text: line.hindi,
          english_text: line.english,
          sentiment: sentimentResult.sentiment,
          bjp_mention: line.bjpMention || detectBJP(fullText),
          tmc_mention: line.tmcMention || detectTMC(fullText),
          // Topic flags
          topic_development: topics.development,
          topic_law_order: topics.law_order,
          topic_employment: topics.employment,
          topic_corruption: topics.corruption,
          topic_minority: topics.minority,
          // Constituency
          constituency: detectedConstituency?.name || null,
        };
      })
    );

    const { data, error } = await supabase
      .from('tv_transcripts')
      .insert(records)
      .select('id');

    if (error) {
      console.error('[TranscriptStorage] Error saving batch:', error);
      return { success: false, error: error.message, count: 0 };
    }

    // Process topic mentions for batch
    const allTopicMentions: ElectionTopicMention[] = [];

    lines.forEach((line, index) => {
      const fullText = `${line.english || ''} ${line.hindi || ''} ${line.bengali || ''}`.trim();
      const topicAnalysis = analyzeElectionTopics(fullText);
      const detectedConstituency = detectConstituency(fullText);
      const textSnippet = fullText.slice(0, 200);
      const recordId = data?.[index]?.id;

      topicAnalysis.topics.forEach(topic => {
        if (topic.detected && topic.matchedKeywords.length > 0) {
          if (topic.bjpImpact !== 'neutral' || topic.bjpScore !== 0) {
            allTopicMentions.push({
              source_type: 'transcript',
              source_id: recordId,
              topic: topic.topic,
              party: 'BJP',
              impact: topic.bjpImpact,
              score: topic.bjpScore,
              keywords_matched: topic.matchedKeywords.filter(k => k.startsWith('BJP')),
              text_snippet: textSnippet,
              channel_name: channelName,
              constituency: detectedConstituency?.name || null
            });
          }
          if (topic.tmcImpact !== 'neutral' || topic.tmcScore !== 0) {
            allTopicMentions.push({
              source_type: 'transcript',
              source_id: recordId,
              topic: topic.topic,
              party: 'TMC',
              impact: topic.tmcImpact,
              score: topic.tmcScore,
              keywords_matched: topic.matchedKeywords.filter(k => k.startsWith('TMC')),
              text_snippet: textSnippet,
              channel_name: channelName,
              constituency: detectedConstituency?.name || null
            });
          }
        }
      });
    });

    // Save all topic mentions
    saveTopicMentions(allTopicMentions);

    console.log('[TranscriptStorage] Saved batch with sentiment:', lines.length, 'transcripts');
    return { success: true, count: lines.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TranscriptStorage] Exception:', errorMessage);
    return { success: false, error: errorMessage, count: 0 };
  }
}

/**
 * Get transcripts for a channel within date range
 */
export async function getTranscripts(
  channelName?: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): Promise<{ data: TranscriptRecord[] | null; error?: string }> {
  try {
    let query = supabase
      .from('tv_transcripts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (channelName) {
      query = query.eq('channel_name', channelName);
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[TranscriptStorage] Error fetching transcripts:', error);
      return { data: null, error: error.message };
    }

    return { data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TranscriptStorage] Exception:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get political transcripts only (BJP or TMC mentions)
 */
export async function getPoliticalTranscripts(
  channelName?: string,
  limit: number = 100
): Promise<{ data: TranscriptRecord[] | null; error?: string }> {
  try {
    let query = supabase
      .from('tv_transcripts')
      .select('*')
      .or('bjp_mention.eq.true,tmc_mention.eq.true')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (channelName) {
      query = query.eq('channel_name', channelName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[TranscriptStorage] Error fetching political transcripts:', error);
      return { data: null, error: error.message };
    }

    return { data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TranscriptStorage] Exception:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get transcript statistics for a channel
 */
export async function getTranscriptStats(channelName?: string): Promise<{
  total: number;
  bjpMentions: number;
  tmcMentions: number;
  positive: number;
  negative: number;
  neutral: number;
  error?: string;
}> {
  try {
    let query = supabase.from('tv_transcripts').select('*', { count: 'exact' });

    if (channelName) {
      query = query.eq('channel_name', channelName);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('[TranscriptStorage] Error getting stats:', error);
      return { total: 0, bjpMentions: 0, tmcMentions: 0, positive: 0, negative: 0, neutral: 0, error: error.message };
    }

    const stats = {
      total: count || 0,
      bjpMentions: data?.filter(r => r.bjp_mention).length || 0,
      tmcMentions: data?.filter(r => r.tmc_mention).length || 0,
      positive: data?.filter(r => r.sentiment === 'positive').length || 0,
      negative: data?.filter(r => r.sentiment === 'negative').length || 0,
      neutral: data?.filter(r => r.sentiment === 'neutral').length || 0,
    };

    return stats;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TranscriptStorage] Exception:', errorMessage);
    return { total: 0, bjpMentions: 0, tmcMentions: 0, positive: 0, negative: 0, neutral: 0, error: errorMessage };
  }
}

export default {
  saveTranscript,
  saveTranscriptBatch,
  getTranscripts,
  getPoliticalTranscripts,
  getTranscriptStats,
};
