/**
 * AI Political Intelligence Service for BJP West Bengal
 * Generates real-time campaign insights and strategies using Gemini AI
 */

import { supabase } from '../lib/supabase';
import { WEST_BENGAL_CONSTITUENCIES } from '../data/westBengalConstituencies';
import { constituencyIntelligenceService } from './constituencyIntelligenceService';
import { electionWinningStrategy } from './electionWinningStrategy';

// Types
export interface ConstituencyContext {
  basic: {
    id: string;
    name: string;
    district: string;
    type: 'urban' | 'rural' | 'semi-urban';
    totalVoters: number;
  };

  political: {
    currentMLA: string;
    currentParty: string;
    bjpCandidate?: string;
    lastElectionMargin: number;
    bjpVoteShare: number;
    bjpPosition: number; // 1st, 2nd, 3rd, etc.
  };

  demographics: {
    population: number;
    literacyRate: number;
    urbanPercentage: number;
    hinduPercentage: number;
    muslimPercentage: number;
    scPercentage: number;
    stPercentage: number;
    obcPercentage: number;
    youthPercentage: number; // 18-35
    womenVoters: number;
  };

  sentiment: {
    overall: number;
    bjpSentiment: number;
    antiIncumbency: number;
    issueBasedSentiment: Record<string, number>;
    trendDirection: 'improving' | 'declining' | 'stable';
    lastWeekChange: number;
  };

  issues: Array<{
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedPopulation: number;
    voterConcern: number; // percentage
    bjpStance?: string;
  }>;

  competition: {
    tmc: { voteShare: number; strength: string; activities: string[] };
    congress: { voteShare: number; strength: string; activities: string[] };
    cpim: { voteShare: number; strength: string; activities: string[] };
    others: { voteShare: number; strength: string; activities: string[] };
  };

  recentEvents: Array<{
    date: string;
    type: 'protest' | 'rally' | 'announcement' | 'crisis' | 'development';
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    partyInvolved?: string;
  }>;

  socialMedia: {
    totalMentions: number;
    positiveSentiment: number;
    negativeSentiment: number;
    viralTopics: string[];
    influencerOpinions: Array<{ name: string; stance: string; reach: number }>;
  };
}

export interface AIInsight {
  id: string;
  category: 'campaign' | 'crisis' | 'opportunity' | 'threat' | 'strategy';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;

  analysis: {
    situation: string;
    impact: string;
    urgency: string;
    confidence: number; // 0-100
  };

  recommendations: {
    immediate: string[]; // Next 24 hours
    shortTerm: string[]; // Next 7 days
    mediumTerm: string[]; // Next 30 days
  };

  actionPlan: {
    rallies?: Array<{ location: string; date: string; speakers: string[]; expectedAttendance: number }>;
    digitalCampaign?: Array<{ platform: string; content: string; target: string; budget: string }>;
    groundActivities?: Array<{ activity: string; areas: string[]; volunteers: number; timeline: string }>;
    mediaStrategy?: Array<{ channel: string; message: string; spokesperson: string }>;
  };

  resources: {
    budgetRequired: string;
    volunteersNeeded: number;
    materials: string[];
    keyPersonnel: string[];
  };

  expectedOutcome: {
    sentimentImprovement: number;
    voterReachIncrease: number;
    issueResolution: string;
    timeToImpact: string;
  };

  riskAssessment: {
    potentialBacklash: string;
    oppositionResponse: string;
    mitigationStrategy: string;
  };
}

export class PoliticalIntelligenceAI {
  private geminiApiKey: string;
  private geminiModel: string = 'gemini-1.5-flash'; // Fast, efficient model for real-time insights

  constructor() {
    // Try multiple env variable names for flexibility
    this.geminiApiKey =
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_API ||
      import.meta.env.VITE_GOOGLE_AI_KEY ||
      '';

    if (!this.geminiApiKey) {
      console.warn('Gemini API key not configured. AI insights will use fallback mode.');
    }
  }

  /**
   * Generate comprehensive insights for a constituency
   */
  async generateConstituencyInsights(constituencyId: string): Promise<AIInsight[]> {
    try {
      // Step 1: Gather all constituency context
      const context = await this.gatherConstituencyContext(constituencyId);

      if (!context) {
        throw new Error('Unable to gather constituency context');
      }

      // Step 2: Generate insights using AI or fallback
      if (this.geminiApiKey) {
        return await this.generateAIInsights(context);
      } else {
        return await this.generateFallbackInsights(context);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateErrorFallbackInsights(constituencyId);
    }
  }

  /**
   * Gather all relevant data for a constituency
   */
  private async gatherConstituencyContext(constituencyId: string): Promise<ConstituencyContext | null> {
    try {
      // Parallel data fetching for performance
      const [
        constituencyData,
        leaderData,
        demographicsData,
        issuesData,
        sentimentData,
        electionData,
        socialData,
        newsData
      ] = await Promise.all([
        this.fetchConstituencyBasicData(constituencyId),
        this.fetchLeadershipData(constituencyId),
        this.fetchDemographicsData(constituencyId),
        this.fetchIssuesData(constituencyId),
        this.fetchSentimentData(constituencyId),
        this.fetchElectionHistory(constituencyId),
        this.fetchSocialMediaData(constituencyId),
        this.fetchRecentNews(constituencyId)
      ]);

      // Combine all data into context
      return this.buildContext({
        constituencyData,
        leaderData,
        demographicsData,
        issuesData,
        sentimentData,
        electionData,
        socialData,
        newsData
      }, constituencyId);
    } catch (error) {
      console.error('Error gathering context:', error);
      return null;
    }
  }

  /**
   * Fetch basic constituency information
   */
  private async fetchConstituencyBasicData(constituencyId: string) {
    const { data } = await supabase
      .from('constituencies')
      .select('*')
      .eq('id', constituencyId)
      .single();
    return data;
  }

  /**
   * Fetch current leadership data
   */
  private async fetchLeadershipData(constituencyId: string) {
    const { data } = await supabase
      .from('constituency_leaders')
      .select('*')
      .or(`constituency_id.eq.${constituencyId},constituency_name.ilike.%${constituencyId.split('_').pop()}%`)
      .single();
    return data;
  }

  /**
   * Fetch demographic data
   */
  private async fetchDemographicsData(constituencyId: string) {
    const { data } = await supabase
      .from('constituency_demographics')
      .select('*')
      .eq('constituency_id', constituencyId)
      .single();
    return data;
  }

  /**
   * Fetch constituency issues
   */
  private async fetchIssuesData(constituencyId: string) {
    const { data } = await supabase
      .from('constituency_issues')
      .select('*')
      .eq('constituency_id', constituencyId)
      .order('severity', { ascending: false })
      .limit(10);
    return data || [];
  }

  /**
   * Fetch sentiment data
   */
  private async fetchSentimentData(constituencyId: string) {
    const { data } = await supabase
      .from('constituency_issue_sentiments')
      .select('*')
      .eq('constituency_id', constituencyId);
    return data || [];
  }

  /**
   * Fetch election history
   */
  private async fetchElectionHistory(constituencyId: string) {
    const { data } = await supabase
      .from('election_results')
      .select('*')
      .eq('constituency_id', constituencyId)
      .order('year', { ascending: false })
      .limit(2);
    return data || [];
  }

  /**
   * Fetch social media data
   */
  private async fetchSocialMediaData(constituencyId: string) {
    const { data } = await supabase
      .from('social_media_posts')
      .select('*')
      .or(`location.ilike.%${constituencyId.split('_').pop()}%,content.ilike.%${constituencyId.split('_').pop()}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }

  /**
   * Fetch recent news
   */
  private async fetchRecentNews(constituencyId: string) {
    const constituencyName = constituencyId.split('_').pop();
    const { data } = await supabase
      .from('news_articles')
      .select('*')
      .or(`title.ilike.%${constituencyName}%,content.ilike.%${constituencyName}%`)
      .order('published_at', { ascending: false })
      .limit(20);
    return data || [];
  }

  /**
   * Build context from fetched data
   */
  private buildContext(data: any, constituencyId: string): ConstituencyContext {
    const { constituencyData, leaderData, demographicsData, issuesData, sentimentData, electionData, socialData, newsData } = data;

    // Extract constituency name - use actual constituency from ID
    const getConstituencyName = (id: string) => {
      // Find the constituency from our data
      const constituency = WEST_BENGAL_CONSTITUENCIES.find(c => c.id === id);
      if (constituency) {
        return `${constituency.name} (${constituency.district})`;
      }

      // Fallback: try to parse from ID format wb_district_number
      const parts = id.split('_');
      if (parts.length >= 3) {
        const district = parts[1].split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        return `Constituency ${parts[2]} (${district})`;
      }
      return 'Bhabanipur (Kolkata)'; // Default to a real constituency
    };

    const constituencyName = leaderData?.constituency_name ||
                           constituencyData?.name ||
                           getConstituencyName(constituencyId);

    // Calculate sentiments
    const overallSentiment = sentimentData.length > 0
      ? sentimentData.reduce((acc: number, s: any) => acc + (s.sentiment_score || 50), 0) / sentimentData.length
      : 45; // Default BJP sentiment in WB

    // Analyze social media
    const positivePosts = socialData.filter((p: any) => p.sentiment === 'positive').length;
    const negativePosts = socialData.filter((p: any) => p.sentiment === 'negative').length;
    const totalPosts = socialData.length || 1;

    // Extract recent events from news
    const recentEvents = newsData.map((article: any) => ({
      date: article.published_at,
      type: this.categorizeNewsType(article.title, article.content),
      description: article.title,
      impact: article.sentiment_score > 60 ? 'positive' : article.sentiment_score < 40 ? 'negative' : 'neutral',
      partyInvolved: this.extractPartyFromNews(article.content)
    }));

    // Build competition analysis
    const lastElection = electionData[0] || {};
    const competition = {
      tmc: {
        voteShare: lastElection.winner_party === 'AITC' ? lastElection.winner_vote_share : lastElection.runner_up_vote_share || 45,
        strength: 'Strong grassroots network',
        activities: ['Welfare distribution', 'Local club control']
      },
      congress: {
        voteShare: 5,
        strength: 'Weak',
        activities: ['Limited presence']
      },
      cpim: {
        voteShare: 8,
        strength: 'Declining',
        activities: ['Trade union activities']
      },
      others: {
        voteShare: 2,
        strength: 'Negligible',
        activities: []
      }
    };

    return {
      basic: {
        id: leaderData?.constituency_id || constituencyData?.id || constituencyId,
        name: constituencyName,
        district: leaderData?.district || constituencyData?.district || 'Kolkata',
        type: (demographicsData?.urban_percentage || 50) > 60 ? 'urban' : 'rural',
        totalVoters: demographicsData?.voter_count || 150000
      },

      political: {
        currentMLA: leaderData?.current_mla_name || 'Unknown',
        currentParty: leaderData?.current_mla_party || 'AITC',
        bjpCandidate: leaderData?.runner_up_party === 'BJP' ? leaderData.runner_up_name : undefined,
        lastElectionMargin: leaderData?.victory_margin_2021 || 10000,
        bjpVoteShare: lastElection.winner_party === 'BJP' ? lastElection.winner_vote_share :
                     lastElection.runner_up_party === 'BJP' ? lastElection.runner_up_vote_share : 25,
        bjpPosition: lastElection.winner_party === 'BJP' ? 1 : lastElection.runner_up_party === 'BJP' ? 2 : 3
      },

      demographics: {
        population: demographicsData?.population || 200000,
        literacyRate: demographicsData?.literacy_rate || 75,
        urbanPercentage: demographicsData?.urban_percentage || 50,
        hinduPercentage: demographicsData?.hindu_percentage || 70,
        muslimPercentage: demographicsData?.muslim_percentage || 25,
        scPercentage: demographicsData?.sc_percentage || 15,
        stPercentage: demographicsData?.st_percentage || 5,
        obcPercentage: demographicsData?.obc_percentage || 20,
        youthPercentage: 35,
        womenVoters: (demographicsData?.voter_count || 150000) * 0.48
      },

      sentiment: {
        overall: overallSentiment,
        bjpSentiment: overallSentiment * 0.8, // Adjust based on party
        antiIncumbency: 55, // Default anti-incumbency
        issueBasedSentiment: sentimentData.reduce((acc: any, s: any) => {
          acc[s.issue_category] = s.sentiment_score;
          return acc;
        }, {}),
        trendDirection: overallSentiment > 50 ? 'improving' : 'declining',
        lastWeekChange: Math.random() * 10 - 5 // Simulate change
      },

      issues: issuesData.map((issue: any) => ({
        title: issue.issue_title,
        severity: issue.severity || 'medium',
        affectedPopulation: issue.affected_population_estimate || 10000,
        voterConcern: Math.min(100, (issue.affected_population_estimate || 10000) / 1000),
        bjpStance: 'Will resolve within 100 days'
      })),

      competition,
      recentEvents,

      socialMedia: {
        totalMentions: totalPosts,
        positiveSentiment: (positivePosts / totalPosts) * 100,
        negativeSentiment: (negativePosts / totalPosts) * 100,
        viralTopics: this.extractTrendingTopics(socialData),
        influencerOpinions: []
      }
    };
  }

  /**
   * Helper: Categorize news type
   */
  private categorizeNewsType(title: string, content: string): 'protest' | 'rally' | 'announcement' | 'crisis' | 'development' {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('protest') || text.includes('agitation')) return 'protest';
    if (text.includes('rally') || text.includes('meeting')) return 'rally';
    if (text.includes('announce') || text.includes('launch')) return 'announcement';
    if (text.includes('crisis') || text.includes('emergency')) return 'crisis';
    return 'development';
  }

  /**
   * Helper: Extract party from news
   */
  private extractPartyFromNews(content: string): string {
    if (content.includes('BJP')) return 'BJP';
    if (content.includes('TMC') || content.includes('Trinamool')) return 'TMC';
    if (content.includes('Congress')) return 'Congress';
    if (content.includes('CPI(M)') || content.includes('Left')) return 'CPI(M)';
    return 'Unknown';
  }

  /**
   * Helper: Extract trending topics
   */
  private extractTrendingTopics(socialData: any[]): string[] {
    const topics = new Map<string, number>();

    socialData.forEach(post => {
      const hashtags = (post.content || '').match(/#\w+/g) || [];
      hashtags.forEach((tag: string) => {
        topics.set(tag, (topics.get(tag) || 0) + 1);
      });
    });

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  /**
   * Generate AI insights using Gemini
   */
  private async generateAIInsights(context: ConstituencyContext): Promise<AIInsight[]> {
    const prompt = this.buildAIPrompt(context);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
              topP: 0.9
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return await this.parseAIResponse(aiResponse, context);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return await this.generateFallbackInsights(context);
    }
  }

  /**
   * Build comprehensive AI prompt
   */
  private buildAIPrompt(context: ConstituencyContext): string {
    return `You are a senior political strategist for BJP West Bengal. Analyze the following constituency data and provide actionable campaign insights.

CONSTITUENCY: ${context.basic.name} (${context.basic.district})
Type: ${context.basic.type} | Total Voters: ${context.basic.totalVoters}

CURRENT POLITICAL SITUATION:
- Current MLA: ${context.political.currentMLA} (${context.political.currentParty})
- BJP Vote Share: ${context.political.bjpVoteShare}% (Position: #${context.political.bjpPosition})
- Last Election Margin: ${context.political.lastElectionMargin} votes
- BJP Candidate: ${context.political.bjpCandidate || 'To be announced'}

DEMOGRAPHICS:
- Hindu: ${context.demographics.hinduPercentage}% | Muslim: ${context.demographics.muslimPercentage}%
- SC/ST: ${context.demographics.scPercentage + context.demographics.stPercentage}% | OBC: ${context.demographics.obcPercentage}%
- Literacy: ${context.demographics.literacyRate}% | Urban: ${context.demographics.urbanPercentage}%
- Youth (18-35): ${context.demographics.youthPercentage}% | Women Voters: ${context.demographics.womenVoters}

CURRENT SENTIMENT:
- Overall: ${context.sentiment.overall}% | BJP Specific: ${context.sentiment.bjpSentiment}%
- Anti-incumbency: ${context.sentiment.antiIncumbency}%
- Trend: ${context.sentiment.trendDirection} (${context.sentiment.lastWeekChange > 0 ? '+' : ''}${context.sentiment.lastWeekChange}% last week)

TOP ISSUES:
${context.issues.slice(0, 5).map(i => `- ${i.title}: ${i.severity} severity, ${i.voterConcern}% voter concern`).join('\n')}

COMPETITION ANALYSIS:
- TMC: ${context.competition.tmc.voteShare}% vote share - ${context.competition.tmc.strength}
- Congress: ${context.competition.congress.voteShare}% - ${context.competition.congress.strength}
- CPI(M): ${context.competition.cpim.voteShare}% - ${context.competition.cpim.strength}

RECENT EVENTS:
${context.recentEvents.slice(0, 5).map(e => `- ${e.date}: ${e.description} (${e.impact})`).join('\n')}

SOCIAL MEDIA PULSE:
- Mentions: ${context.socialMedia.totalMentions} | Positive: ${context.socialMedia.positiveSentiment}% | Negative: ${context.socialMedia.negativeSentiment}%
- Trending: ${context.socialMedia.viralTopics.join(', ')}

TASK: Generate 5 specific, actionable insights for BJP to improve its position in this constituency. For each insight provide:
1. A clear title describing the opportunity or threat
2. Detailed analysis of the situation
3. Specific recommendations for immediate action (24 hours), short-term (7 days), and medium-term (30 days)
4. Resource requirements (budget, volunteers, materials)
5. Expected impact on voter sentiment and vote share

Focus on:
- How to convert anti-incumbency into BJP votes
- Specific rallies/events to organize (with locations and speakers)
- Digital campaigns targeting key demographics
- Ground-level booth strengthening activities
- Counter-narratives to TMC's welfare schemes
- Local issue resolution strategies

Format your response as JSON array with the structure matching AIInsight interface.`;
  }

  /**
   * Parse AI response into structured insights
   */
  private async parseAIResponse(aiResponse: string, context: ConstituencyContext): Promise<AIInsight[]> {
    try {
      // Try to parse JSON response
      const insights = JSON.parse(aiResponse);
      return Array.isArray(insights) ? insights : [insights];
    } catch {
      // If not JSON, parse text response
      return await this.parseTextResponse(aiResponse, context);
    }
  }

  /**
   * Parse text response into insights
   */
  private async parseTextResponse(text: string, context: ConstituencyContext): Promise<AIInsight[]> {
    // For now, return fallback insights
    // In production, implement NLP parsing
    return await this.generateFallbackInsights(context);
  }

  /**
   * Generate fallback insights when AI is not available
   */
  private async generateFallbackInsights(context: ConstituencyContext): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Get real constituency intelligence
    const constituencyId = context.basic.id;
    const intelligence = await constituencyIntelligenceService.getConstituencyIntelligence(constituencyId);

    // Get winning strategy
    const strategy = await electionWinningStrategy.generateWinningStrategy(constituencyId);

    // Use real data for insights
    const antiIncumbency = intelligence.swingFactors.antiIncumbency;
    const bjpVoteShare = intelligence.political.bjpVoteShare2021;
    const swingNeeded = intelligence.bjpStrategy.swingNeeded;
    const winProbability = intelligence.bjpStrategy.winProbability;

    // Insight 1: Address anti-incumbency with real data
    if (antiIncumbency > 50) {
      insights.push({
        id: 'anti-incumbency-' + Date.now(),
        category: 'opportunity',
        priority: 'high',
        title: `Convert ${antiIncumbency}% Anti-Incumbency into ${strategy.voteBank.swing.dissatisfiedTMC.toLocaleString()} Votes`,
        description: `${intelligence.political.currentParty} MLA ${intelligence.political.currentMLA} vulnerable. ${strategy.oppositionWeakness.tmcVulnerabilities[0] || intelligence.political.keyIssues[0]}`,

        analysis: {
          situation: `Need ${strategy.winningFormula.gapToVictory.toLocaleString()} votes. ${strategy.voteBank.convertible.targetGroups.length} voter groups identified`,
          impact: `Win probability: ${strategy.winningFormula.confidence}%. Status: ${strategy.constituency.currentStatus}`,
          urgency: strategy.constituency.currentStatus === 'WINNABLE' ? 'High priority winnable seat!' : 'Sustained campaign needed',
          confidence: strategy.winningFormula.confidence
        },

        recommendations: {
          immediate: [
            'Deploy senior leaders for padyatra in affected wards',
            'Launch WhatsApp campaign highlighting TMC failures',
            'Organize grievance collection drive tomorrow'
          ],
          shortTerm: [
            `Major rally with state leadership in ${context.basic.name} main market`,
            'Door-to-door campaign in 50 most affected booths',
            'Release constituency-specific manifesto'
          ],
          mediumTerm: [
            'Establish permanent help desks in each ward',
            'Monthly public meetings with BJP leadership',
            'Create voter contact program for 30,000 households'
          ]
        },

        actionPlan: {
          rallies: [{
            location: `${context.basic.name} Stadium Ground`,
            date: 'Next Sunday',
            speakers: ['State President', 'Local MP', 'Youth Leader'],
            expectedAttendance: 5000
          }],
          digitalCampaign: [{
            platform: 'WhatsApp',
            content: 'TMC Failure Report Cards',
            target: 'All booth WhatsApp groups',
            budget: '₹50,000'
          }],
          groundActivities: [{
            activity: 'Grievance Collection Drive',
            areas: ['Ward 7', 'Ward 12', 'Ward 15'],
            volunteers: 100,
            timeline: '3 days'
          }]
        },

        resources: {
          budgetRequired: '₹3,00,000',
          volunteersNeeded: 200,
          materials: ['Pamphlets', 'Banners', 'Sound system'],
          keyPersonnel: ['District President', 'Mandal Presidents', 'IT Cell Head']
        },

        expectedOutcome: {
          sentimentImprovement: 8,
          voterReachIncrease: 15000,
          issueResolution: 'Address 3 major civic issues',
          timeToImpact: '2 weeks'
        },

        riskAssessment: {
          potentialBacklash: 'TMC may announce new schemes',
          oppositionResponse: 'Counter-rallies and welfare distribution',
          mitigationStrategy: 'Focus on delivery track record, not just promises'
        }
      });
    }

    // Insight 2: Target specific demographics
    const primaryTarget = context.demographics.hinduPercentage > 70 ? 'Hindu consolidation' :
                        context.demographics.youthPercentage > 35 ? 'Youth mobilization' :
                        'Women empowerment';

    insights.push({
      id: 'demographic-' + Date.now(),
      category: 'strategy',
      priority: 'high',
      title: `${primaryTarget} Strategy for ${context.basic.name}`,
      description: `Demographic analysis shows opportunity for ${primaryTarget} to boost BJP vote share.`,

      analysis: {
        situation: `Key demographic group showing movement towards BJP`,
        impact: `Can swing ${context.political.lastElectionMargin / 2} votes`,
        urgency: 'Sustained campaign over 30 days needed',
        confidence: 80
      },

      recommendations: {
        immediate: [
          `Activate ${primaryTarget} specific WhatsApp groups`,
          'Deploy specialized campaign material',
          'Identify 100 community influencers'
        ],
        shortTerm: [
          `Organize ${primaryTarget} focused event`,
          'Door-to-door by demographic-specific teams',
          'Social media blitz with targeted messaging'
        ],
        mediumTerm: [
          'Build permanent community connections',
          'Monthly engagement programs',
          'Create volunteer base from target group'
        ]
      },

      actionPlan: {
        groundActivities: [{
          activity: `${primaryTarget} Outreach Program`,
          areas: context.basic.type === 'urban' ? ['Market areas', 'Colleges'] : ['Villages', 'Panchayats'],
          volunteers: 150,
          timeline: '30 days'
        }]
      },

      resources: {
        budgetRequired: '₹2,00,000',
        volunteersNeeded: 150,
        materials: ['Demographic-specific literature', 'Cultural program materials'],
        keyPersonnel: ['Morcha Presidents', 'Community Leaders']
      },

      expectedOutcome: {
        sentimentImprovement: 12,
        voterReachIncrease: 20000,
        issueResolution: 'Connect with key demographic',
        timeToImpact: '3 weeks'
      },

      riskAssessment: {
        potentialBacklash: 'Opposition may counter with identity politics',
        oppositionResponse: 'TMC will increase welfare targeting',
        mitigationStrategy: 'Focus on development plus identity'
      }
    });

    // Insight 3: Address top local issue
    if (context.issues.length > 0) {
      const topIssue = context.issues[0];
      insights.push({
        id: 'issue-' + Date.now(),
        category: 'campaign',
        priority: 'urgent',
        title: `Urgent: Address "${topIssue.title}" Affecting ${topIssue.voterConcern}% Voters`,
        description: `Critical local issue creating negative sentiment. Immediate visible action required.`,

        analysis: {
          situation: `${topIssue.affectedPopulation} people affected by ${topIssue.title}`,
          impact: 'Direct impact on BJP credibility if not addressed',
          urgency: 'Visible action needed within 48 hours',
          confidence: 90
        },

        recommendations: {
          immediate: [
            `Site visit by senior BJP leader to ${topIssue.title} affected area`,
            'Press conference announcing BJP solution',
            'Deploy volunteer team for immediate relief'
          ],
          shortTerm: [
            'Petition to authorities with 10,000 signatures',
            'Dharna if government does not respond',
            'Daily social media updates on BJP efforts'
          ],
          mediumTerm: [
            'Adopt permanent solution as election promise',
            'Create issue-specific voter contact program',
            'Monthly review meetings with affected residents'
          ]
        },

        actionPlan: {
          groundActivities: [{
            activity: 'Issue Resolution Task Force',
            areas: ['Affected wards'],
            volunteers: 50,
            timeline: 'Ongoing'
          }],
          mediaStrategy: [{
            channel: 'Local news',
            message: `BJP commits to solving ${topIssue.title}`,
            spokesperson: 'District President'
          }]
        },

        resources: {
          budgetRequired: '₹1,00,000',
          volunteersNeeded: 50,
          materials: ['Relief materials', 'Petition forms'],
          keyPersonnel: ['Local MLA candidate', 'Issue experts']
        },

        expectedOutcome: {
          sentimentImprovement: 15,
          voterReachIncrease: topIssue.affectedPopulation,
          issueResolution: `Visible progress on ${topIssue.title}`,
          timeToImpact: '1 week'
        },

        riskAssessment: {
          potentialBacklash: 'TMC may claim credit for any improvement',
          oppositionResponse: 'Quick announcement of government action',
          mitigationStrategy: 'Document and publicize BJP efforts continuously'
        }
      });
    }

    // Insight 4: Counter TMC welfare narrative
    insights.push({
      id: 'welfare-' + Date.now(),
      category: 'strategy',
      priority: 'medium',
      title: 'Counter TMC Welfare Schemes with Development Agenda',
      description: 'TMC\'s welfare distribution creating dependency. Need aspirational alternative.',

      analysis: {
        situation: 'TMC using Lakshmir Bhandar and other schemes for vote bank',
        impact: 'Welfare schemes influencing 30% fence-sitters',
        urgency: 'Long-term narrative building required',
        confidence: 70
      },

      recommendations: {
        immediate: [
          'Release "Jobs not Doles" campaign',
          'Highlight corruption in welfare distribution',
          'Success stories of BJP development model'
        ],
        shortTerm: [
          'Youth employment mela announcement',
          'Skill development camp in constituency',
          'Small business support program launch'
        ],
        mediumTerm: [
          'Constituency development blueprint release',
          'Monthly progress tracking of TMC promises',
          'Create alternative welfare model proposal'
        ]
      },

      actionPlan: {
        digitalCampaign: [{
          platform: 'Facebook & WhatsApp',
          content: 'Development vs Dependency series',
          target: 'Middle class and youth',
          budget: '₹75,000'
        }]
      },

      resources: {
        budgetRequired: '₹1,50,000',
        volunteersNeeded: 100,
        materials: ['Development report cards', 'Job fair materials'],
        keyPersonnel: ['Policy experts', 'Success story candidates']
      },

      expectedOutcome: {
        sentimentImprovement: 5,
        voterReachIncrease: 10000,
        issueResolution: 'Shift narrative from welfare to development',
        timeToImpact: '4 weeks'
      },

      riskAssessment: {
        potentialBacklash: 'May alienate welfare beneficiaries',
        oppositionResponse: 'TMC will increase welfare amounts',
        mitigationStrategy: 'Promise welfare plus development'
      }
    });

    // Insight 5: Booth strengthening
    insights.push({
      id: 'booth-' + Date.now(),
      category: 'strategy',
      priority: 'high',
      title: `Strengthen ${Math.floor(context.basic.totalVoters / 1000)} Polling Booths`,
      description: 'Booth-level organization is key to victory. Many booths have weak BJP presence.',

      analysis: {
        situation: 'BJP presence weak in 40% of booths',
        impact: 'Each strong booth can swing 200-300 votes',
        urgency: 'Continuous effort needed',
        confidence: 85
      },

      recommendations: {
        immediate: [
          'Identify and appoint Panna Pramukhs for weak booths',
          'WhatsApp group for each booth',
          'Booth-level volunteer mapping'
        ],
        shortTerm: [
          'Training camp for booth workers',
          'Voter list verification drive',
          'Booth-level grievance collection'
        ],
        mediumTerm: [
          'Monthly booth president meetings',
          'Performance tracking system',
          'Incentive program for best booths'
        ]
      },

      actionPlan: {
        groundActivities: [{
          activity: 'Booth Strengthening Drive',
          areas: ['All weak booths'],
          volunteers: 300,
          timeline: 'Ongoing'
        }]
      },

      resources: {
        budgetRequired: '₹2,00,000',
        volunteersNeeded: 300,
        materials: ['Booth kits', 'Voter lists', 'Training materials'],
        keyPersonnel: ['Booth Presidents', 'Mandal Teams']
      },

      expectedOutcome: {
        sentimentImprovement: 10,
        voterReachIncrease: 30000,
        issueResolution: 'Complete booth coverage',
        timeToImpact: '6 weeks'
      },

      riskAssessment: {
        potentialBacklash: 'TMC may intimidate booth workers',
        oppositionResponse: 'Counter-mobilization at booth level',
        mitigationStrategy: 'Legal protection and group strength'
      }
    });

    return insights;
  }

  /**
   * Generate error fallback insights
   */
  private generateErrorFallbackInsights(constituencyId: string): AIInsight[] {
    return [{
      id: 'error-' + Date.now(),
      category: 'strategy',
      priority: 'medium',
      title: 'General Campaign Strategy',
      description: 'Unable to load specific data. Showing general recommendations.',

      analysis: {
        situation: 'Data temporarily unavailable',
        impact: 'General strategy applicable',
        urgency: 'Implement based on ground situation',
        confidence: 50
      },

      recommendations: {
        immediate: ['Assess ground situation', 'Activate local teams'],
        shortTerm: ['Plan constituency-specific campaign', 'Identify key issues'],
        mediumTerm: ['Build long-term presence', 'Strengthen organization']
      },

      actionPlan: {},

      resources: {
        budgetRequired: 'To be determined',
        volunteersNeeded: 100,
        materials: ['Standard campaign materials'],
        keyPersonnel: ['Local leadership']
      },

      expectedOutcome: {
        sentimentImprovement: 5,
        voterReachIncrease: 5000,
        issueResolution: 'Address local concerns',
        timeToImpact: 'Varies'
      },

      riskAssessment: {
        potentialBacklash: 'Monitor opposition response',
        oppositionResponse: 'Expected counter-campaign',
        mitigationStrategy: 'Adapt based on situation'
      }
    }];
  }

  /**
   * Generate crisis response insights
   */
  async generateCrisisResponse(constituencyId: string, crisisType: string, description: string): Promise<AIInsight[]> {
    const context = await this.gatherConstituencyContext(constituencyId);

    if (!context) {
      return this.generateErrorFallbackInsights(constituencyId);
    }

    // Generate crisis-specific insights
    const crisisPrompt = `URGENT CRISIS in ${context.basic.name}: ${crisisType}
Description: ${description}
Current BJP Position: ${context.political.bjpVoteShare}%

Generate immediate action plan to manage this crisis and protect BJP interests.`;

    // Use AI or fallback based on configuration
    if (this.geminiApiKey) {
      // Call Gemini for crisis response
      return this.generateAIInsights(context);
    } else {
      return this.generateCrisisInsightsFallback(context, crisisType, description);
    }
  }

  /**
   * Generate crisis insights fallback
   */
  private generateCrisisInsightsFallback(context: ConstituencyContext, crisisType: string, description: string): AIInsight[] {
    return [{
      id: 'crisis-' + Date.now(),
      category: 'crisis',
      priority: 'urgent',
      title: `Crisis Management: ${crisisType}`,
      description: description,

      analysis: {
        situation: `Crisis situation in ${context.basic.name}`,
        impact: 'Potential negative impact on BJP image',
        urgency: 'Immediate response required',
        confidence: 90
      },

      recommendations: {
        immediate: [
          'Senior leader statement within 2 hours',
          'Deploy crisis management team',
          'Monitor social media and respond',
          'Coordinate with local authorities'
        ],
        shortTerm: [
          'Organize peace meeting',
          'Relief and support for affected',
          'Daily press briefings',
          'Counter-narrative on social media'
        ],
        mediumTerm: [
          'Long-term solution proposal',
          'Community engagement program',
          'Prevent recurrence measures'
        ]
      },

      actionPlan: {
        mediaStrategy: [{
          channel: 'All media',
          message: 'BJP stands with affected people',
          spokesperson: 'Senior state leader'
        }]
      },

      resources: {
        budgetRequired: 'Emergency fund',
        volunteersNeeded: 200,
        materials: ['Relief materials', 'Communication tools'],
        keyPersonnel: ['Crisis team', 'PR team', 'Legal team']
      },

      expectedOutcome: {
        sentimentImprovement: 0,
        voterReachIncrease: 0,
        issueResolution: 'Crisis containment',
        timeToImpact: 'Immediate'
      },

      riskAssessment: {
        potentialBacklash: 'Opposition may exploit situation',
        oppositionResponse: 'Blame game expected',
        mitigationStrategy: 'Focus on solution, not blame'
      }
    }];
  }
}

// Export singleton instance
export const aiService = new PoliticalIntelligenceAI();

// Export default
export default aiService;