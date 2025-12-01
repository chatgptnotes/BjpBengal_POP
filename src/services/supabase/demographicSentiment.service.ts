/**
 * Demographic Sentiment Service
 * Fetches demographic sentiment data for constituencies from Supabase
 */

import { supabase } from './index';
import type { DemographicSentimentRow } from '../../types/database';

export interface DemographicSentiment {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * Transform database row to component-friendly format
 */
function transformToComponentFormat(row: DemographicSentimentRow): DemographicSentiment[] {
  return [
    {
      category: 'Youth (18-30)',
      positive: row.youth_positive,
      neutral: row.youth_neutral,
      negative: row.youth_negative,
    },
    {
      category: 'Women (30+)',
      positive: row.women_positive,
      neutral: row.women_neutral,
      negative: row.women_negative,
    },
    {
      category: 'Urban Middle Class',
      positive: row.urban_middle_class_positive,
      neutral: row.urban_middle_class_neutral,
      negative: row.urban_middle_class_negative,
    },
    {
      category: 'Rural Voters',
      positive: row.rural_voters_positive,
      neutral: row.rural_voters_neutral,
      negative: row.rural_voters_negative,
    },
    {
      category: 'Small Traders',
      positive: row.small_traders_positive,
      neutral: row.small_traders_neutral,
      negative: row.small_traders_negative,
    },
  ];
}

/**
 * Get demographic sentiment data for a constituency
 * @param constituencyId - The constituency identifier
 * @returns Array of demographic sentiment data or null if not found
 */
export async function getByConstituencyId(
  constituencyId: string
): Promise<DemographicSentiment[] | null> {
  console.log('[DemographicSentiment] Fetching data for:', constituencyId);

  const { data, error } = await supabase
    .from('demographic_sentiment')
    .select('*')
    .eq('constituency_id', constituencyId)
    .single();

  console.log('[DemographicSentiment] Response:', { data, error });

  if (error) {
    // PGRST116 means no rows found - this is expected when data doesn't exist
    if (error.code === 'PGRST116') {
      console.log('[DemographicSentiment] No data found for constituency');
      return null;
    }
    console.error('[DemographicSentiment] Error fetching data:', error);
    return null;
  }

  if (!data) {
    console.log('[DemographicSentiment] Data is null');
    return null;
  }

  console.log('[DemographicSentiment] Transforming data');
  return transformToComponentFormat(data as DemographicSentimentRow);
}

/**
 * Get raw database row for a constituency
 * @param constituencyId - The constituency identifier
 * @returns Raw database row or null if not found
 */
export async function getRawByConstituencyId(
  constituencyId: string
): Promise<DemographicSentimentRow | null> {
  const { data, error } = await supabase
    .from('demographic_sentiment')
    .select('*')
    .eq('constituency_id', constituencyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[DemographicSentiment] Error fetching data:', error);
    return null;
  }

  return data as DemographicSentimentRow | null;
}

/**
 * Upsert demographic sentiment data for a constituency
 * @param constituencyId - The constituency identifier
 * @param data - The sentiment data to save
 */
export async function upsertDemographicSentiment(
  constituencyId: string,
  data: Omit<DemographicSentimentRow, 'id' | 'constituency_id' | 'created_at' | 'updated_at'>
): Promise<DemographicSentimentRow | null> {
  const { data: result, error } = await supabase
    .from('demographic_sentiment')
    .upsert(
      {
        constituency_id: constituencyId,
        ...data,
      },
      {
        onConflict: 'constituency_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('[DemographicSentiment] Error upserting data:', error);
    return null;
  }

  return result as DemographicSentimentRow;
}

export const demographicSentimentService = {
  getByConstituencyId,
  getRawByConstituencyId,
  upsertDemographicSentiment,
};

export default demographicSentimentService;
