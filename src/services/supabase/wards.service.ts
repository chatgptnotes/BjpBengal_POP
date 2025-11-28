/**
 * Wards Service
 * Handles all ward-related database operations
 */

import { SupabaseService } from './crud';
import { supabase } from './index';
import type {
  Ward,
  WardInsert,
  WardUpdate,
} from '../../types/database';

class WardsService extends SupabaseService<Ward, WardInsert, WardUpdate> {
  constructor() {
    super('wards');
  }

  /**
   * Get wards by constituency
   */
  async getByConstituency(constituencyId: string): Promise<Ward[]> {
    const { data } = await this.getAll({
      filters: { constituency_id: constituencyId },
      sort: { column: 'ward_number', direction: 'asc' },
    });
    return data;
  }

  /**
   * Get wards by district
   */
  async getByDistrict(districtId: string): Promise<Ward[]> {
    const { data, error } = await supabase
      .from('wards')
      .select('*, constituencies!inner(district_id)')
      .eq('constituencies.district_id', districtId)
      .order('ward_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Search wards by name or code
   */
  async searchWards(searchTerm: string): Promise<Ward[]> {
    const { data } = await this.search(['name', 'code'], searchTerm);
    return data;
  }

  /**
   * Get ward with constituency details
   */
  async getWithConstituency(wardId: string): Promise<any> {
    const { data, error } = await supabase
      .from('wards')
      .select('*, constituency:constituencies(*)')
      .eq('id', wardId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get ward statistics summary
   */
  async getStatsSummary(wardId: string): Promise<{
    total_booths: number;
    total_voters: number;
    population: number | null;
    voter_count: number;
  }> {
    const { data: ward, error } = await supabase
      .from('wards')
      .select('population, voter_count, total_booths')
      .eq('id', wardId)
      .single();

    if (error) throw error;

    // Get voter count from polling booths
    const { data: booths } = await supabase
      .from('polling_booths')
      .select('total_voters')
      .eq('ward_id', wardId);

    const totalVoters = booths?.reduce((sum, b) => sum + b.total_voters, 0) || 0;

    return {
      total_booths: ward?.total_booths || 0,
      total_voters: totalVoters,
      population: ward?.population || null,
      voter_count: ward?.voter_count || 0,
    };
  }

  /**
   * Get all wards with constituency names (for display)
   */
  async getAllWithConstituencies(): Promise<any[]> {
    const { data, error } = await supabase
      .from('wards')
      .select(`
        *,
        constituency:constituencies(id, name, code)
      `)
      .order('ward_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Bulk update ward data
   */
  async bulkUpdate(updates: Array<{ id: string; data: Partial<WardUpdate> }>): Promise<void> {
    await Promise.all(
      updates.map(({ id, data }) => this.update(id, data))
    );
  }
}

// Export singleton instance
export const wardsService = new WardsService();

// Export class for testing
export { WardsService };
