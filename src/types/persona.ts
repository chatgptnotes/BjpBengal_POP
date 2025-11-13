/**
 * Voter Persona Types
 * Version: 1.0
 * Date: 2025-11-13
 */

// =====================================================
// Core Persona Types
// =====================================================

export interface VoterPersona {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  segment_key: string;
  color: string;
  icon: string;
  total_voters: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Psychographic Profile Types
// =====================================================

export interface BigFiveTraits {
  openness: number; // 0-1
  conscientiousness: number; // 0-1
  extraversion: number; // 0-1
  agreeableness: number; // 0-1
  neuroticism: number; // 0-1
}

export interface CommunicationPreferences {
  channels: string[]; // ['social_media', 'phone', 'door_to_door', 'whatsapp']
  preferred_tone: 'formal' | 'casual' | 'inspirational' | 'direct';
  best_timing: {
    days: string[]; // ['monday', 'friday']
    hours: number[]; // [18, 19, 20] (6pm-8pm)
  };
  language: 'ta' | 'en' | 'both';
}

export interface PsychographicProfile {
  id: string;
  persona_id: string;

  // Big Five Personality Traits (OCEAN Model)
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;

  // Additional psychographic data
  values: string[]; // ['family', 'tradition', 'progress', 'equality']
  beliefs: Record<string, any>;
  communication_preferences: CommunicationPreferences;
  persuasion_score: number; // 0-100

  created_at: string;
  updated_at: string;
}

// =====================================================
// Voter Assignment Types
// =====================================================

export interface VoterPersonaAssignment {
  id: string;
  voter_id: string;
  persona_id: string;
  confidence_score: number; // 0-1
  assigned_at: string;
  assigned_by: 'ml_model' | 'manual' | 'survey';
  ml_model_version?: string;
}

// =====================================================
// Behavioral Cues Types
// =====================================================

export type CueType = 'emotion' | 'linguistic' | 'timing' | 'engagement';

export type EmotionValue = 'anger' | 'fear' | 'hope' | 'disgust' | 'joy' | 'surprise' | 'sadness' | 'neutral';

export interface BehavioralCue {
  id: string;
  voter_id: string;

  // Cue classification
  cue_type: CueType;
  cue_category?: string;
  cue_value: string; // emotion name, pattern name, etc.
  intensity: number; // 0-1

  // Source information
  source: 'social_media' | 'survey' | 'interaction' | 'phone_call' | 'whatsapp';
  source_id?: string;
  source_text?: string;

  // Language support
  language: 'ta' | 'en';

  // Metadata
  detected_at: string;
  confidence: number; // 0-1
  ml_model_version?: string;
}

// =====================================================
// Persona Metrics Types
// =====================================================

export interface TopItem {
  name: string;
  count: number;
  percentage: number;
}

export interface PersonaMetrics {
  id: string;
  persona_id: string;
  metric_date: string;

  // Voter counts
  total_voters: number;
  new_voters_count: number;
  churned_voters_count: number;

  // Propensity scores (averages)
  avg_turnout_propensity?: number;
  avg_donation_likelihood?: number;
  avg_volunteer_potential?: number;
  avg_persuasion_score?: number;

  // Engagement metrics
  engagement_rate?: number;
  avg_interactions_per_voter?: number;

  // Top items
  top_emotions: TopItem[];
  top_issues: TopItem[];
  top_channels: TopItem[];
  top_constituencies: TopItem[];

  created_at: string;
}

// =====================================================
// Persona Migration Types
// =====================================================

export interface PersonaMigration {
  id: string;
  voter_id: string;
  from_persona_id: string | null;
  to_persona_id: string;
  migration_date: string;
  trigger_event?: string;
  trigger_id?: string;
  confidence_before?: number;
  confidence_after?: number;
  notes?: string;
}

// =====================================================
// Persuasion Score Types
// =====================================================

export interface VoterPersuasionScore {
  id: string;
  voter_id: string;

  // Propensity scores
  turnout_propensity?: number;
  donation_likelihood?: number;
  volunteer_potential?: number;

  // Persuasion metrics
  persuasion_score: number; // 0-100
  swing_voter_probability?: number; // 0-1
  influence_score?: number; // 0-100

  // Messaging recommendations
  recommended_channels: string[];
  recommended_tone?: string;
  recommended_timing?: Record<string, any>;
  message_themes: string[];

  // Metadata
  calculated_at: string;
  ml_model_version?: string;
}

// =====================================================
// ML Model Metadata Types
// =====================================================

export interface MLModelMetadata {
  id: string;
  model_name: string;
  model_version: string;
  model_type: 'clustering' | 'classification' | 'emotion_detection' | 'scoring';
  algorithm: string; // kmeans, random_forest, transformer, etc.

  // Performance metrics
  accuracy?: number;
  precision_score?: number;
  recall?: number;
  f1_score?: number;

  // Training info
  training_data_size?: number;
  training_date?: string;
  feature_count?: number;
  hyperparameters: Record<string, any>;

  // Status
  status: 'active' | 'deprecated' | 'testing';
  notes?: string;

  created_at: string;
}

// =====================================================
// Audience Export Types
// =====================================================

export type ExportPlatform = 'facebook' | 'google' | 'twitter' | 'whatsapp';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AudienceExportLog {
  id: string;
  persona_id: string;
  platform: ExportPlatform;
  export_type: 'custom_audience' | 'lookalike' | 'targeting';

  // Export details
  voter_count: number;
  criteria: Record<string, any>;
  audience_id?: string; // Platform-specific audience ID

  // Status
  status: ExportStatus;
  error_message?: string;

  // Metadata
  exported_by: string; // user ID
  exported_at: string;
  completed_at?: string;
}

// =====================================================
// Dashboard & UI Types
// =====================================================

export interface PersonaCardData extends VoterPersona {
  psychographic_profile?: PsychographicProfile;
  metrics?: PersonaMetrics;
  top_emotions?: EmotionValue[];
  growth_rate?: number; // percentage
}

export interface PersonaComparison {
  persona_a: PersonaCardData;
  persona_b: PersonaCardData;
  differences: {
    trait: string;
    value_a: number;
    value_b: number;
    difference: number;
  }[];
}

export interface PersonaTrend {
  date: string;
  voter_count: number;
  engagement_rate: number;
  avg_persuasion_score: number;
}

export interface PersonaGeoDistribution {
  constituency: string;
  district: string;
  voter_count: number;
  percentage: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface CreatePersonaRequest {
  name: string;
  description?: string;
  segment_key: string;
  color?: string;
  icon?: string;
  psychographic_profile?: Partial<PsychographicProfile>;
}

export interface UpdatePersonaRequest extends Partial<CreatePersonaRequest> {
  id: string;
}

export interface ClusterVotersRequest {
  algorithm: 'kmeans' | 'hierarchical' | 'dbscan';
  n_clusters?: number;
  features: string[];
  filter_criteria?: Record<string, any>;
}

export interface ClusterVotersResponse {
  clusters: {
    cluster_id: number;
    voter_ids: string[];
    centroid: number[];
    size: number;
  }[];
  model_metadata: MLModelMetadata;
}

export interface ClassifyVoterRequest {
  voter_id: string;
  features?: Record<string, any>;
}

export interface ClassifyVoterResponse {
  voter_id: string;
  persona_id: string;
  confidence_score: number;
  alternative_personas: {
    persona_id: string;
    confidence_score: number;
  }[];
}

export interface DetectEmotionRequest {
  text: string;
  language: 'ta' | 'en';
  voter_id?: string;
}

export interface DetectEmotionResponse {
  emotions: {
    emotion: EmotionValue;
    intensity: number;
    confidence: number;
  }[];
  dominant_emotion: EmotionValue;
  linguistic_patterns?: {
    urgency_level: number;
    sentiment_polarity: number;
    formality_level: number;
  };
}

export interface ExportAudienceRequest {
  persona_id: string;
  platform: ExportPlatform;
  export_type: 'custom_audience' | 'lookalike' | 'targeting';
  criteria?: Record<string, any>;
}

export interface PersonaInsights {
  persona: PersonaCardData;
  key_insights: string[];
  messaging_tips: string[];
  recommended_actions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }[];
}

// =====================================================
// Filter & Query Types
// =====================================================

export interface PersonaFilters {
  search?: string;
  min_voters?: number;
  max_voters?: number;
  min_persuasion_score?: number;
  max_persuasion_score?: number;
  emotions?: EmotionValue[];
  sort_by?: 'name' | 'voter_count' | 'persuasion_score' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface VoterFilters {
  persona_ids?: string[];
  min_confidence?: number;
  constituencies?: string[];
  districts?: string[];
  emotions?: EmotionValue[];
  date_range?: {
    start: string;
    end: string;
  };
}

// =====================================================
// Chart Data Types
// =====================================================

export interface RadarChartData {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export interface PersonalityRadarData {
  labels: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
  datasets: RadarChartData[];
}

export interface EmotionDistribution {
  emotion: EmotionValue;
  count: number;
  percentage: number;
  color: string;
}

export interface MigrationFlow {
  from_persona: string;
  to_persona: string;
  count: number;
  avg_confidence_change: number;
}

// =====================================================
// Utility Types
// =====================================================

export type PersonaView = 'grid' | 'list' | 'table' | 'map';

export interface PersonaDashboardState {
  view: PersonaView;
  filters: PersonaFilters;
  selectedPersonas: string[];
  comparisonMode: boolean;
  loading: boolean;
  error?: string;
}
