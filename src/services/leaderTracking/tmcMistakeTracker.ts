/**
 * TMC Mistake Tracker Service
 * Tracks and categorizes TMC controversies for BJP strategic use
 */

import { supabase } from '@/lib/supabase';
import type { TMCMistake } from './constituencyLeaderService';

// Controversy detection patterns
const CONTROVERSY_PATTERNS = {
  corruption: {
    keywords: [
      'scam', 'corruption', 'bribe', 'kickback', 'embezzlement',
      'fraud', 'illegal', 'money laundering', 'benami',
      'SSC', 'coal', 'cattle', 'sand', 'ration', 'syndicate',
      'cut money', 'tender', 'recruitment',
      // Bengali
      'দুর্নীতি', 'কেলেঙ্কারি', 'ঘুষ', 'বেনামি'
    ],
    severity: 'high' as const
  },
  violence: {
    keywords: [
      'violence', 'attack', 'murder', 'assault', 'killed',
      'death', 'injured', 'bomb', 'arson', 'rape',
      'booth capturing', 'rigging', 'threatening',
      'Sandeshkhali', 'post-poll',
      // Bengali
      'হিংসা', 'হামলা', 'খুন', 'হত্যা', 'ধর্ষণ'
    ],
    severity: 'critical' as const
  },
  governance: {
    keywords: [
      'failure', 'mismanagement', 'negligence', 'apathy',
      'unemployment', 'farmer suicide', 'flood', 'cyclone',
      'healthcare', 'education', 'infrastructure',
      'protest', 'agitation', 'strike', 'blockade',
      // Bengali
      'বেকারত্ব', 'ব্যর্থতা', 'অবহেলা', 'প্রতিবাদ'
    ],
    severity: 'medium' as const
  },
  scandal: {
    keywords: [
      'scandal', 'controversy', 'expose', 'revealed',
      'leaked', 'secret', 'affair', 'misconduct',
      // Bengali
      'কেলেঙ্কারি', 'ফাঁস'
    ],
    severity: 'medium' as const
  },
  election_malpractice: {
    keywords: [
      'booth capturing', 'rigging', 'fake voting', 'intimidation',
      'EVM', 'electoral fraud', 'nomination rejection',
      'EC complaint', 'model code violation',
      // Bengali
      'বুথ দখল', 'ভোট জালিয়াতি'
    ],
    severity: 'high' as const
  },
  judicial_action: {
    keywords: [
      'ED', 'CBI', 'NIA', 'IT raid', 'arrest', 'chargesheet',
      'summons', 'interrogation', 'custody', 'bail',
      'court order', 'conviction', 'sentence',
      // Bengali
      'গ্রেপ্তার', 'সমন', 'জিজ্ঞাসাবাদ'
    ],
    severity: 'critical' as const
  },
  nepotism: {
    keywords: [
      'nepotism', 'family', 'dynasty', 'relatives',
      'appointment', 'favoritism', 'preference',
      // Bengali
      'স্বজনপোষণ', 'পরিবারতন্ত্র'
    ],
    severity: 'medium' as const
  }
};

interface DetectedControversy {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  matchedKeywords: string[];
  confidence: number;
}

export const tmcMistakeTracker = {
  /**
   * Detect controversy in text
   */
  detectControversy(text: string): DetectedControversy | null {
    const lowerText = text.toLowerCase();
    let bestMatch: DetectedControversy | null = null;
    let maxScore = 0;

    for (const [category, { keywords, severity }] of Object.entries(CONTROVERSY_PATTERNS)) {
      const matchedKeywords: string[] = [];

      keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      });

      if (matchedKeywords.length > 0) {
        const score = matchedKeywords.length;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = {
            category,
            severity,
            matchedKeywords,
            confidence: Math.min(score / 3, 1)
          };
        }
      }
    }

    // Upgrade severity based on multiple matches
    if (bestMatch && bestMatch.matchedKeywords.length >= 3) {
      if (bestMatch.severity === 'medium') bestMatch.severity = 'high';
      else if (bestMatch.severity === 'high') bestMatch.severity = 'critical';
    }

    return bestMatch;
  },

  /**
   * Log a TMC mistake
   */
  async logMistake(mistake: Partial<TMCMistake>): Promise<TMCMistake> {
    const { data, error } = await supabase
      .from('tmc_mistakes_log')
      .insert({
        ...mistake,
        party: mistake.party || 'TMC',
        can_use_in_campaign: mistake.can_use_in_campaign !== false,
        is_verified: mistake.is_verified || false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get recent TMC mistakes
   */
  async getRecentMistakes(options?: {
    days?: number;
    category?: string;
    severity?: string;
    limit?: number;
  }): Promise<TMCMistake[]> {
    const { days = 30, category, severity, limit = 50 } = options || {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('tmc_mistakes_log')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get mistakes from view (with constituency info)
   */
  async getRecentMistakesWithDetails(limit: number = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('v_tmc_recent_mistakes')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get critical mistakes only
   */
  async getCriticalMistakes(): Promise<TMCMistake[]> {
    return this.getRecentMistakes({
      days: 90,
      severity: 'critical',
      limit: 20
    });
  },

  /**
   * Get mistakes by leader
   */
  async getMistakesByLeader(leaderName: string): Promise<TMCMistake[]> {
    const { data, error } = await supabase
      .from('tmc_mistakes_log')
      .select('*')
      .ilike('leader_name', `%${leaderName}%`)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get mistakes by category stats
   */
  async getMistakeStats(): Promise<{
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    total: number;
    thisMonth: number;
    thisWeek: number;
  }> {
    const { data, error } = await supabase
      .from('tmc_mistakes_log')
      .select('category, severity, date');

    if (error) throw error;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let thisMonth = 0;
    let thisWeek = 0;

    (data || []).forEach(item => {
      byCategory[item.category || 'other'] = (byCategory[item.category || 'other'] || 0) + 1;
      bySeverity[item.severity || 'unknown'] = (bySeverity[item.severity || 'unknown'] || 0) + 1;

      const date = new Date(item.date);
      if (date >= monthAgo) thisMonth++;
      if (date >= weekAgo) thisWeek++;
    });

    return {
      byCategory,
      bySeverity,
      total: (data || []).length,
      thisMonth,
      thisWeek
    };
  },

  /**
   * Process news for TMC controversies
   * Automatically detect and log from leader news
   */
  async processNewsForControversies(limit: number = 100): Promise<{ processed: number; logged: number }> {
    // Get unprocessed TMC news marked as controversy
    const { data: news, error } = await supabase
      .from('leader_daily_news')
      .select('*')
      .eq('leader_party', 'TMC')
      .eq('is_controversy', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    let logged = 0;

    for (const article of news || []) {
      // Check if already logged
      const { data: existing } = await supabase
        .from('tmc_mistakes_log')
        .select('id')
        .eq('headline', article.title)
        .single();

      if (existing) continue;

      // Detect controversy details
      const controversy = this.detectControversy(article.title);

      if (controversy) {
        await this.logMistake({
          constituency_id: article.constituency_id,
          leader_name: article.leader_name,
          date: article.published_at.split('T')[0],
          headline: article.title,
          description: article.description,
          source_url: article.url,
          source_name: article.source,
          category: controversy.category,
          severity: controversy.severity,
          keywords: controversy.matchedKeywords,
          is_verified: controversy.confidence > 0.7
        });
        logged++;
      }
    }

    return { processed: (news || []).length, logged };
  },

  /**
   * Mark mistake as verified
   */
  async verifyMistake(id: string, verifiedBy: string, verificationSource?: string): Promise<void> {
    const { error } = await supabase
      .from('tmc_mistakes_log')
      .update({
        is_verified: true,
        verified_by: verifiedBy,
        verification_source: verificationSource,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Add campaign usage notes
   */
  async addCampaignNotes(id: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('tmc_mistakes_log')
      .update({
        campaign_usage_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get usable campaign material
   */
  async getCampaignMaterial(options?: {
    category?: string;
    minSeverity?: string;
  }): Promise<TMCMistake[]> {
    const { category, minSeverity } = options || {};

    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const minIndex = minSeverity ? severityOrder.indexOf(minSeverity) : 0;

    let query = supabase
      .from('tmc_mistakes_log')
      .select('*')
      .eq('can_use_in_campaign', true)
      .eq('is_verified', true)
      .order('severity', { ascending: false })
      .order('date', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter by minimum severity
    return (data || []).filter(item => {
      const itemIndex = severityOrder.indexOf(item.severity || 'low');
      return itemIndex >= minIndex;
    });
  },

  /**
   * Search mistakes
   */
  async searchMistakes(query: string): Promise<TMCMistake[]> {
    const { data, error } = await supabase
      .from('tmc_mistakes_log')
      .select('*')
      .or(`headline.ilike.%${query}%,leader_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }
};

export default tmcMistakeTracker;
