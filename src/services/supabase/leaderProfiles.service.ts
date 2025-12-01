/**
 * Leader Profiles Service
 * Handles MLA profile data from Supabase
 */

import { supabase } from './index';

export interface LeaderProfile {
  id?: string;
  constituency_id: string;
  leader_name: string;
  leader_name_bengali?: string;
  party: string;

  // Criminal records (from MyNeta)
  criminal_cases: number;
  serious_criminal_cases?: number;

  // Assets (in Lakhs)
  declared_assets_lakhs: number | null;

  // Personal info
  age?: number | null;
  education?: string | null;
  profession?: string | null;

  // Photo
  photo_url?: string | null;

  // Extended data stored in positions_held until migration 20
  positions_held?: string[];

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface ParsedBiography {
  summary: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  mynetaUrl: string | null;
  wikipediaUrl: string | null;
}

/**
 * Extract biography data from positions_held array
 * (Temporary storage until migration 20 is applied)
 */
function parseBiographyFromPositions(positionsHeld?: string[]): ParsedBiography {
  const result: ParsedBiography = {
    summary: null,
    birthDate: null,
    birthPlace: null,
    mynetaUrl: null,
    wikipediaUrl: null,
  };

  if (!positionsHeld || positionsHeld.length === 0) {
    return result;
  }

  for (const item of positionsHeld) {
    if (item.startsWith('Biography: ')) {
      result.summary = item.replace('Biography: ', '');
    } else if (item.startsWith('Birth: ')) {
      result.birthDate = item.replace('Birth: ', '');
    } else if (item.startsWith('Place: ')) {
      result.birthPlace = item.replace('Place: ', '');
    } else if (item.startsWith('MyNeta: ')) {
      result.mynetaUrl = item.replace('MyNeta: ', '');
    } else if (item.startsWith('Wikipedia: ')) {
      result.wikipediaUrl = item.replace('Wikipedia: ', '');
    }
  }

  return result;
}

/**
 * Get leader profile by constituency ID
 */
export async function getLeaderProfile(constituencyId: string): Promise<LeaderProfile | null> {
  const { data, error } = await supabase
    .from('leader_profiles')
    .select('*')
    .eq('constituency_id', constituencyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found
      return null;
    }
    console.error('[LeaderProfiles] Error fetching profile:', error);
    return null;
  }

  return data as LeaderProfile;
}

/**
 * Get all leader profiles
 */
export async function getAllLeaderProfiles(): Promise<LeaderProfile[]> {
  const { data, error } = await supabase
    .from('leader_profiles')
    .select('*')
    .order('leader_name');

  if (error) {
    console.error('[LeaderProfiles] Error fetching profiles:', error);
    return [];
  }

  return data as LeaderProfile[];
}

/**
 * Get leader profile with parsed biography
 */
export async function getLeaderProfileWithBio(constituencyId: string): Promise<{
  profile: LeaderProfile | null;
  biography: ParsedBiography;
}> {
  const profile = await getLeaderProfile(constituencyId);
  const biography = profile ? parseBiographyFromPositions(profile.positions_held) : {
    summary: null,
    birthDate: null,
    birthPlace: null,
    mynetaUrl: null,
    wikipediaUrl: null,
  };

  return { profile, biography };
}

/**
 * Format currency in Indian format
 */
export function formatIndianCurrency(amountInLakhs: number | null): string {
  if (amountInLakhs === null || amountInLakhs === undefined) {
    return 'Not Available';
  }

  if (amountInLakhs >= 100) {
    return `Rs ${(amountInLakhs / 100).toFixed(2)} Crores`;
  } else if (amountInLakhs >= 1) {
    return `Rs ${amountInLakhs.toFixed(2)} Lakhs`;
  } else {
    return `Rs ${(amountInLakhs * 100000).toFixed(0)}`;
  }
}

/**
 * Check if profile data is available
 */
export function hasProfileData(profile: LeaderProfile | null): boolean {
  if (!profile) return false;

  return !!(
    profile.criminal_cases > 0 ||
    profile.declared_assets_lakhs ||
    profile.education ||
    profile.photo_url ||
    (profile.positions_held && profile.positions_held.length > 0)
  );
}

export default {
  getLeaderProfile,
  getAllLeaderProfiles,
  getLeaderProfileWithBio,
  formatIndianCurrency,
  hasProfileData,
  parseBiographyFromPositions,
};
