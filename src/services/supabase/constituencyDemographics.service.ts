/**
 * Constituency Demographics Service
 * Fetches demographic data (population, age, gender, caste, religion) for constituencies
 */

import { supabase } from './index';
import type { ConstituencyDemographicsRow } from '../../types/database';

/**
 * Get demographic data for a constituency
 * @param constituencyId - The constituency identifier
 * @returns Demographics data or null if not found
 */
export async function getByConstituencyId(
  constituencyId: string
): Promise<ConstituencyDemographicsRow | null> {
  const { data, error } = await supabase
    .from('constituency_demographics')
    .select('*')
    .eq('constituency_id', constituencyId)
    .single();

  if (error) {
    // PGRST116 means no rows found - this is expected when data doesn't exist
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[ConstituencyDemographics] Error fetching data:', error);
    return null;
  }

  return data as ConstituencyDemographicsRow | null;
}

/**
 * Get all constituency demographics
 * @returns Array of all demographics data
 */
export async function getAll(): Promise<ConstituencyDemographicsRow[]> {
  const { data, error } = await supabase
    .from('constituency_demographics')
    .select('*')
    .order('constituency_id');

  if (error) {
    console.error('[ConstituencyDemographics] Error fetching all data:', error);
    return [];
  }

  return (data as ConstituencyDemographicsRow[]) || [];
}

/**
 * Upsert demographics data for a constituency
 * @param constituencyId - The constituency identifier
 * @param data - The demographics data to save
 */
export async function upsertDemographics(
  constituencyId: string,
  data: Omit<ConstituencyDemographicsRow, 'id' | 'constituency_id' | 'created_at'>
): Promise<ConstituencyDemographicsRow | null> {
  const { data: result, error } = await supabase
    .from('constituency_demographics')
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
    console.error('[ConstituencyDemographics] Error upserting data:', error);
    return null;
  }

  return result as ConstituencyDemographicsRow;
}

export const constituencyDemographicsService = {
  getByConstituencyId,
  getAll,
  upsertDemographics,
};

export default constituencyDemographicsService;
