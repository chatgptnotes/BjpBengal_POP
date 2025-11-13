/**
 * Voter Persona Service
 * API layer for persona management, ML operations, and analytics
 * Version: 1.0
 * Date: 2025-11-13
 */

import { supabase } from '../lib/supabase';
import type {
  VoterPersona,
  PersonaCardData,
  PsychographicProfile,
  VoterPersonaAssignment,
  BehavioralCue,
  PersonaMetrics,
  PersonaMigration,
  VoterPersuasionScore,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  PersonaFilters,
  VoterFilters,
  ClusterVotersRequest,
  ClusterVotersResponse,
  ClassifyVoterRequest,
  ClassifyVoterResponse,
  DetectEmotionRequest,
  DetectEmotionResponse,
  ExportAudienceRequest,
  AudienceExportLog,
  PersonaInsights,
  PersonaGeoDistribution,
  PersonaTrend,
} from '../types/persona';

// =====================================================
// Persona CRUD Operations
// =====================================================

export const personaService = {
  /**
   * Fetch all personas for the current tenant
   */
  async getPersonas(filters?: PersonaFilters): Promise<PersonaCardData[]> {
    let query = supabase
      .from('voter_personas')
      .select(`
        *,
        psychographic_profile:psychographic_profiles(*),
        metrics:persona_metrics(*)
      `)
      .order(filters?.sort_by || 'created_at', { ascending: filters?.sort_order === 'asc' });

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters?.min_voters) {
      query = query.gte('total_voters', filters.min_voters);
    }
    if (filters?.max_voters) {
      query = query.lte('total_voters', filters.max_voters);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PersonaCardData[];
  },

  /**
   * Get a single persona by ID
   */
  async getPersonaById(id: string): Promise<PersonaCardData | null> {
    const { data, error } = await supabase
      .from('voter_personas')
      .select(`
        *,
        psychographic_profile:psychographic_profiles(*),
        metrics:persona_metrics(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PersonaCardData;
  },

  /**
   * Create a new persona
   */
  async createPersona(request: CreatePersonaRequest): Promise<VoterPersona> {
    const { psychographic_profile, ...personaData } = request;

    // Insert persona
    const { data: persona, error: personaError } = await supabase
      .from('voter_personas')
      .insert(personaData)
      .select()
      .single();

    if (personaError) throw personaError;

    // Insert psychographic profile if provided
    if (psychographic_profile) {
      const { error: profileError } = await supabase
        .from('psychographic_profiles')
        .insert({
          persona_id: persona.id,
          ...psychographic_profile,
        });

      if (profileError) throw profileError;
    }

    return persona;
  },

  /**
   * Update an existing persona
   */
  async updatePersona(request: UpdatePersonaRequest): Promise<VoterPersona> {
    const { id, ...updateData } = request;

    const { data, error } = await supabase
      .from('voter_personas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a persona
   */
  async deletePersona(id: string): Promise<void> {
    const { error } = await supabase
      .from('voter_personas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =====================================================
  // Voter Assignment Operations
  // =====================================================

  /**
   * Get voters assigned to a persona
   */
  async getPersonaVoters(
    personaId: string,
    filters?: VoterFilters
  ): Promise<VoterPersonaAssignment[]> {
    let query = supabase
      .from('voter_persona_assignments')
      .select('*, voter:voters(*)')
      .eq('persona_id', personaId);

    if (filters?.min_confidence) {
      query = query.gte('confidence_score', filters.min_confidence);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Assign a voter to a persona
   */
  async assignVoterToPersona(
    voterId: string,
    personaId: string,
    confidenceScore: number = 0.5,
    assignedBy: 'ml_model' | 'manual' | 'survey' = 'manual'
  ): Promise<VoterPersonaAssignment> {
    const { data, error } = await supabase
      .from('voter_persona_assignments')
      .upsert({
        voter_id: voterId,
        persona_id: personaId,
        confidence_score: confidenceScore,
        assigned_by: assignedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Bulk assign voters to personas
   */
  async bulkAssignVoters(
    assignments: Array<{
      voter_id: string;
      persona_id: string;
      confidence_score: number;
    }>
  ): Promise<number> {
    const { error, count } = await supabase
      .from('voter_persona_assignments')
      .upsert(assignments);

    if (error) throw error;
    return count || 0;
  },

  // =====================================================
  // Psychographic Profile Operations
  // =====================================================

  /**
   * Get psychographic profile for a persona
   */
  async getPsychographicProfile(personaId: string): Promise<PsychographicProfile | null> {
    const { data, error } = await supabase
      .from('psychographic_profiles')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data;
  },

  /**
   * Update psychographic profile
   */
  async updatePsychographicProfile(
    personaId: string,
    profile: Partial<PsychographicProfile>
  ): Promise<PsychographicProfile> {
    const { data, error } = await supabase
      .from('psychographic_profiles')
      .upsert({
        persona_id: personaId,
        ...profile,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // =====================================================
  // Behavioral Cues Operations
  // =====================================================

  /**
   * Get behavioral cues for a voter
   */
  async getBehavioralCues(
    voterId: string,
    limit: number = 100
  ): Promise<BehavioralCue[]> {
    const { data, error } = await supabase
      .from('behavioral_cues')
      .select('*')
      .eq('voter_id', voterId)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get top emotions for a persona
   */
  async getPersonaEmotions(personaId: string): Promise<{ emotion: string; count: number }[]> {
    const { data, error } = await supabase.rpc('get_persona_emotions', {
      p_persona_id: personaId,
    });

    if (error) {
      // Fallback if function doesn't exist
      console.warn('RPC function not available, using fallback');
      return [];
    }

    return data;
  },

  /**
   * Log a behavioral cue
   */
  async logBehavioralCue(cue: Omit<BehavioralCue, 'id' | 'detected_at'>): Promise<BehavioralCue> {
    const { data, error } = await supabase
      .from('behavioral_cues')
      .insert(cue)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // =====================================================
  // Persona Metrics Operations
  // =====================================================

  /**
   * Get metrics for a persona
   */
  async getPersonaMetrics(personaId: string, days: number = 30): Promise<PersonaMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('persona_metrics')
      .select('*')
      .eq('persona_id', personaId)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get persona trends over time
   */
  async getPersonaTrends(personaId: string, days: number = 90): Promise<PersonaTrend[]> {
    const metrics = await this.getPersonaMetrics(personaId, days);

    return metrics.map(m => ({
      date: m.metric_date,
      voter_count: m.total_voters,
      engagement_rate: m.engagement_rate || 0,
      avg_persuasion_score: m.avg_persuasion_score || 0,
    }));
  },

  // =====================================================
  // Migration Tracking Operations
  // =====================================================

  /**
   * Get persona migrations
   */
  async getPersonaMigrations(
    personaId: string,
    direction: 'from' | 'to' | 'both' = 'both'
  ): Promise<PersonaMigration[]> {
    let query = supabase
      .from('persona_migrations')
      .select('*, from_persona:voter_personas!from_persona_id(*), to_persona:voter_personas!to_persona_id(*)')
      .order('migration_date', { ascending: false });

    if (direction === 'from') {
      query = query.eq('from_persona_id', personaId);
    } else if (direction === 'to') {
      query = query.eq('to_persona_id', personaId);
    } else {
      query = query.or(`from_persona_id.eq.${personaId},to_persona_id.eq.${personaId}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // =====================================================
  // Persuasion Score Operations
  // =====================================================

  /**
   * Get persuasion score for a voter
   */
  async getPersuasionScore(voterId: string): Promise<VoterPersuasionScore | null> {
    const { data, error } = await supabase
      .from('voter_persuasion_scores')
      .select('*')
      .eq('voter_id', voterId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get top swing voters
   */
  async getTopSwingVoters(limit: number = 100): Promise<VoterPersuasionScore[]> {
    const { data, error } = await supabase
      .from('voter_persuasion_scores')
      .select('*, voter:voters(*)')
      .order('swing_voter_probability', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // =====================================================
  // Geographic Distribution
  // =====================================================

  /**
   * Get geographic distribution of a persona
   */
  async getPersonaGeoDistribution(personaId: string): Promise<PersonaGeoDistribution[]> {
    const { data, error } = await supabase.rpc('get_persona_geo_distribution', {
      p_persona_id: personaId,
    });

    if (error) {
      console.warn('RPC function not available, using fallback');
      return [];
    }

    return data;
  },

  // =====================================================
  // ML Operations (will call Edge Functions)
  // =====================================================

  /**
   * Run clustering algorithm on voters
   */
  async clusterVoters(request: ClusterVotersRequest): Promise<ClusterVotersResponse> {
    const { data, error } = await supabase.functions.invoke('ml-clustering', {
      body: request,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Classify a single voter into a persona
   */
  async classifyVoter(request: ClassifyVoterRequest): Promise<ClassifyVoterResponse> {
    const { data, error } = await supabase.functions.invoke('ml-classify-voter', {
      body: request,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Detect emotions from text
   */
  async detectEmotion(request: DetectEmotionRequest): Promise<DetectEmotionResponse> {
    const { data, error } = await supabase.functions.invoke('behavioral-cues', {
      body: request,
    });

    if (error) throw error;
    return data;
  },

  // =====================================================
  // Audience Export Operations
  // =====================================================

  /**
   * Export persona to ad platform
   */
  async exportAudience(request: ExportAudienceRequest): Promise<AudienceExportLog> {
    const { data, error } = await supabase
      .from('audience_export_logs')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    // Trigger export edge function
    supabase.functions.invoke('export-audience', {
      body: { export_id: data.id },
    });

    return data;
  },

  /**
   * Get export logs for a persona
   */
  async getExportLogs(personaId: string): Promise<AudienceExportLog[]> {
    const { data, error } = await supabase
      .from('audience_export_logs')
      .select('*')
      .eq('persona_id', personaId)
      .order('exported_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // =====================================================
  // Analytics & Insights
  // =====================================================

  /**
   * Get AI-generated insights for a persona
   */
  async getPersonaInsights(personaId: string): Promise<PersonaInsights> {
    const persona = await this.getPersonaById(personaId);
    if (!persona) throw new Error('Persona not found');

    const metrics = await this.getPersonaMetrics(personaId, 30);
    const migrations = await this.getPersonaMigrations(personaId);

    // Generate insights (can be enhanced with AI later)
    const insights: PersonaInsights = {
      persona,
      key_insights: [
        `Total voters: ${persona.total_voters}`,
        `Growth rate: ${this.calculateGrowthRate(metrics)}%`,
        `Engagement trending ${this.getTrend(metrics, 'engagement_rate')}`,
      ],
      messaging_tips: [
        `Best channel: ${persona.psychographic_profile?.communication_preferences?.channels?.[0] || 'social media'}`,
        `Preferred tone: ${persona.psychographic_profile?.communication_preferences?.preferred_tone || 'casual'}`,
      ],
      recommended_actions: [
        {
          action: 'Launch targeted social media campaign',
          priority: 'high',
          impact: 'Increase engagement by 25%',
        },
      ],
    };

    return insights;
  },

  /**
   * Compare two personas
   */
  async comparePersonas(personaIdA: string, personaIdB: string) {
    const [personaA, personaB] = await Promise.all([
      this.getPersonaById(personaIdA),
      this.getPersonaById(personaIdB),
    ]);

    if (!personaA || !personaB) throw new Error('Persona not found');

    const profileA = personaA.psychographic_profile;
    const profileB = personaB.psychographic_profile;

    const differences = [];
    if (profileA && profileB) {
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      for (const trait of traits) {
        differences.push({
          trait,
          value_a: profileA[trait as keyof typeof profileA] as number,
          value_b: profileB[trait as keyof typeof profileB] as number,
          difference: Math.abs(
            (profileA[trait as keyof typeof profileA] as number) -
            (profileB[trait as keyof typeof profileB] as number)
          ),
        });
      }
    }

    return {
      persona_a: personaA,
      persona_b: personaB,
      differences,
    };
  },

  // =====================================================
  // Utility Functions
  // =====================================================

  calculateGrowthRate(metrics: PersonaMetrics[]): number {
    if (metrics.length < 2) return 0;
    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];
    return ((latest.total_voters - previous.total_voters) / previous.total_voters) * 100;
  },

  getTrend(metrics: PersonaMetrics[], field: keyof PersonaMetrics): 'up' | 'down' | 'stable' {
    if (metrics.length < 2) return 'stable';
    const latest = metrics[metrics.length - 1][field] as number;
    const previous = metrics[metrics.length - 2][field] as number;
    if (latest > previous * 1.05) return 'up';
    if (latest < previous * 0.95) return 'down';
    return 'stable';
  },
};

export default personaService;
