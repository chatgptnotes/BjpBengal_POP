/**
 * Service for storing transcripts in Supabase with AI sentiment analysis
 */

import supabase from '../lib/supabase';
import { TranscriptLine } from './transcriptionSocket';
import { sentimentEngine } from './sentimentAnalysis';

// BJP keywords for detection
const BJP_KEYWORDS = [
  'bjp', 'bharatiya janata', 'modi', 'narendra modi', 'pm modi',
  'amit shah', 'jp nadda', 'nda', 'lotus', 'kamal',
  'sukanta majumdar', 'dilip ghosh', 'suvendu adhikari'
];

// TMC keywords for detection
const TMC_KEYWORDS = [
  'tmc', 'trinamool', 'mamata', 'mamata banerjee', 'abhishek banerjee',
  'trinamool congress', 'didi', 'tmc', 'grassroots'
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
  created_at?: string;
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
    };

    const { error } = await supabase
      .from('tv_transcripts')
      .insert(record);

    if (error) {
      console.error('[TranscriptStorage] Error saving transcript:', error);
      return { success: false, error: error.message };
    }

    console.log('[TranscriptStorage] Saved with sentiment:', sentimentResult.sentiment, '| BJP:', bjpMentioned, '| TMC:', tmcMentioned);
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
    // Process each line with AI sentiment analysis
    const records: TranscriptRecord[] = await Promise.all(
      lines.map(async (line) => {
        const fullText = `${line.english || ''} ${line.hindi || ''} ${line.bengali || ''}`.trim();
        const sentimentResult = await analyzeSentiment(fullText);

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
        };
      })
    );

    const { error } = await supabase
      .from('tv_transcripts')
      .insert(records);

    if (error) {
      console.error('[TranscriptStorage] Error saving batch:', error);
      return { success: false, error: error.message, count: 0 };
    }

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
