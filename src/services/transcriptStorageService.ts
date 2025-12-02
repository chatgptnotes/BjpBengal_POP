/**
 * Service for storing transcripts in Supabase
 */

import supabase from '../lib/supabase';
import { TranscriptLine } from './transcriptionSocket';

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
 * Save a transcript line to Supabase
 */
export async function saveTranscript(
  channelName: string,
  channelId: string | undefined,
  line: TranscriptLine
): Promise<{ success: boolean; error?: string }> {
  try {
    const record: TranscriptRecord = {
      channel_name: channelName,
      channel_id: channelId || null,
      transcript_time: line.timestamp,
      bengali_text: line.bengali,
      hindi_text: line.hindi,
      english_text: line.english,
      sentiment: line.sentiment || 'neutral',
      bjp_mention: line.bjpMention || false,
      tmc_mention: line.tmcMention || false,
    };

    const { error } = await supabase
      .from('tv_transcripts')
      .insert(record);

    if (error) {
      console.error('[TranscriptStorage] Error saving transcript:', error);
      return { success: false, error: error.message };
    }

    console.log('[TranscriptStorage] Saved transcript:', line.timestamp);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TranscriptStorage] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Save multiple transcript lines (batch insert)
 */
export async function saveTranscriptBatch(
  channelName: string,
  channelId: string | undefined,
  lines: TranscriptLine[]
): Promise<{ success: boolean; error?: string; count: number }> {
  try {
    const records: TranscriptRecord[] = lines.map(line => ({
      channel_name: channelName,
      channel_id: channelId || null,
      transcript_time: line.timestamp,
      bengali_text: line.bengali,
      hindi_text: line.hindi,
      english_text: line.english,
      sentiment: line.sentiment || 'neutral',
      bjp_mention: line.bjpMention || false,
      tmc_mention: line.tmcMention || false,
    }));

    const { error } = await supabase
      .from('tv_transcripts')
      .insert(records);

    if (error) {
      console.error('[TranscriptStorage] Error saving batch:', error);
      return { success: false, error: error.message, count: 0 };
    }

    console.log('[TranscriptStorage] Saved batch:', lines.length, 'transcripts');
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
