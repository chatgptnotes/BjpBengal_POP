/**
 * Hook to fetch constituency data and statistics
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { Constituency } from '../types';

export function useConstituencyData(constituencyId: string | undefined) {
  const [constituency, setConstituency] = useState<Constituency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!constituencyId) {
      setLoading(false);
      return;
    }

    async function fetchConstituency() {
      try {
        setLoading(true);
        setError(null);

        // Query constituency from Supabase
        const { data, error: dbError } = await supabase
          .from('constituencies')
          .select('*')
          .eq('id', constituencyId)
          .single();

        if (dbError) throw dbError;

        if (data) {
          setConstituency({
            id: data.id,
            name: data.name,
            district: data.district,
            is_urban: data.is_urban || true,
            city_cluster: data.city_cluster || data.district,
            total_voters: data.voter_count || 0,
            social_media_activity: 'medium'
          });
        }
      } catch (err) {
        console.error('Error fetching constituency:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchConstituency();
  }, [constituencyId]);

  return { constituency, loading, error };
}
