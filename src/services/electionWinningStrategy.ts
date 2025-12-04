/**
 * BJP Bengal Election Winning Strategy Service
 * Advanced analytics and strategies to win 200+ seats in 2026
 */

import { constituencyIntelligenceService } from './constituencyIntelligenceService';
import { WEST_BENGAL_CONSTITUENCIES } from '../data/westBengalConstituencies';

export interface WinningStrategy {
  constituency: {
    id: string;
    name: string;
    currentStatus: 'BJP_HELD' | 'WINNABLE' | 'BATTLEGROUND' | 'DIFFICULT';
    priorityRank: number;
  };

  voteBank: {
    committed: {
      bjpCore: number;
      tmcCore: number;
      leftCore: number;
    };
    swing: {
      fenceSetters: number;
      dissatisfiedTMC: number;
      youngVoters: number;
      womenSwing: number;
    };
    convertible: {
      targetGroups: VoterGroup[];
      conversionPotential: number;
      tacticsRequired: string[];
    };
  };

  groundGame: {
    boothStrategy: BoothPlan[];
    workerDeployment: WorkerAllocation;
    resourceNeeds: ResourceRequirement;
    timelinePhases: CampaignPhase[];
  };

  oppositionWeakness: {
    tmcVulnerabilities: string[];
    leftErosion: string[];
    congressIrrelevance: string[];
    exploitableSplits: string[];
  };

  winningFormula: {
    minimumVotesNeeded: number;
    currentExpectedVotes: number;
    gapToVictory: number;
    conversionPath: ConversionPath[];
    confidence: number;
  };

  messaging: {
    coreNarrative: string;
    demographicMessages: Map<string, string>;
    whatsappStrategy: WhatsAppCampaign;
    lastMilePush: string[];
  };

  risks: {
    majorThreats: Risk[];
    contingencyPlans: Map<string, string>;
    earlyWarningSignals: string[];
  };
}

interface VoterGroup {
  name: string;
  size: number;
  currentAlignment: string;
  conversionChance: number;
  keyIssues: string[];
  approachStrategy: string;
}

interface BoothPlan {
  boothNumber: string;
  voterCount: number;
  bjpVotes2021: number;
  targetVotes2026: number;
  agentName?: string;
  weaknessFlag: boolean;
  actionItems: string[];
}

interface WorkerAllocation {
  totalNeeded: number;
  currentStrength: number;
  gap: number;
  deployment: {
    fullTimers: number;
    volunteers: number;
    youthWing: number;
    womenWing: number;
  };
  trainingNeeds: string[];
}

interface ResourceRequirement {
  budget: {
    minimum: number;
    optimal: number;
    allocation: Map<string, number>;
  };
  materials: {
    posters: number;
    pamphlets: number;
    digitalContent: number;
    vehicles: number;
  };
  events: {
    rallies: number;
    smallMeetings: number;
    doorToDoor: number;
  };
}

interface CampaignPhase {
  phase: string;
  timeline: string;
  objectives: string[];
  activities: string[];
  success Metrics: string[];
}

interface ConversionPath {
  voterSegment: string;
  currentVotes: number;
  targetVotes: number;
  strategy: string;
  timeline: string;
  confidence: number;
}

interface WhatsAppCampaign {
  totalGroups: number;
  messagesPerDay: number;
  contentTypes: string[];
  viralTopics: string[];
  coordinators: number;
}

interface Risk {
  threat: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'severe' | 'moderate' | 'minor';
  mitigation: string;
}

export class ElectionWinningStrategyService {
  /**
   * Generate comprehensive winning strategy for a constituency
   */
  async generateWinningStrategy(constituencyId: string): Promise<WinningStrategy> {
    // Get base intelligence
    const intelligence = await constituencyIntelligenceService.getConstituencyIntelligence(constituencyId);
    const constituency = WEST_BENGAL_CONSTITUENCIES.find(c => c.id === constituencyId);

    if (!constituency) {
      throw new Error('Constituency not found');
    }

    // Determine current status and priority
    const status = this.determineConstituencyStatus(intelligence);
    const priorityRank = this.calculatePriority(intelligence, status);

    // Deep vote bank analysis
    const voteBank = this.analyzeVoteBank(intelligence, constituency);

    // Ground game planning
    const groundGame = this.planGroundGame(intelligence, constituency, voteBank);

    // Opposition vulnerability analysis
    const oppositionWeakness = this.analyzeOppositionWeakness(intelligence, constituency);

    // Calculate winning formula
    const winningFormula = this.calculateWinningFormula(intelligence, voteBank);

    // Develop messaging strategy
    const messaging = this.developMessaging(intelligence, constituency, voteBank);

    // Risk assessment
    const risks = this.assessRisks(intelligence, constituency);

    return {
      constituency: {
        id: constituencyId,
        name: constituency.name,
        currentStatus: status,
        priorityRank
      },
      voteBank,
      groundGame,
      oppositionWeakness,
      winningFormula,
      messaging,
      risks
    };
  }

  /**
   * Determine constituency status for BJP
   */
  private determineConstituencyStatus(intelligence: any): 'BJP_HELD' | 'WINNABLE' | 'BATTLEGROUND' | 'DIFFICULT' {
    if (intelligence.political.bjpPosition2021 === 1) {
      return 'BJP_HELD';
    }

    if (intelligence.bjpStrategy.winProbability > 65) {
      return 'WINNABLE';
    }

    if (intelligence.bjpStrategy.winProbability > 35) {
      return 'BATTLEGROUND';
    }

    return 'DIFFICULT';
  }

  /**
   * Calculate priority ranking (1 = highest priority)
   */
  private calculatePriority(intelligence: any, status: string): number {
    let score = 0;

    // Winnable seats get highest priority
    if (status === 'WINNABLE') score += 100;
    if (status === 'BATTLEGROUND') score += 80;
    if (status === 'BJP_HELD') score += 60;
    if (status === 'DIFFICULT') score += 20;

    // Factor in swing needed (lower is better)
    score -= intelligence.bjpStrategy.swingNeeded * 2;

    // Anti-incumbency boost
    score += intelligence.swingFactors.antiIncumbency * 0.5;

    // CAA impact boost
    if (intelligence.swingFactors.caaImpact === 'high') score += 20;
    if (intelligence.swingFactors.caaImpact === 'medium') score += 10;

    // Strategic importance
    if (intelligence.political.currentMLA === 'Mamata Banerjee') score += 50; // Defeating CM
    if (intelligence.basic.district === 'Kolkata') score += 10; // Capital importance

    return Math.round(score);
  }

  /**
   * Deep vote bank analysis
   */
  private analyzeVoteBank(intelligence: any, constituency: any): any {
    const totalVoters = intelligence.basic.totalVoters;
    const bjpVotes2021 = Math.floor(totalVoters * intelligence.political.bjpVoteShare2021 / 100);
    const turnout = 0.82; // Average WB turnout

    // Core vote banks
    const bjpCore = Math.floor(bjpVotes2021 * 0.75); // 75% are committed
    const tmcCore = Math.floor(totalVoters * 0.30); // TMC has 30% committed base
    const leftCore = Math.floor(totalVoters * 0.05); // Left reduced to 5% core

    // Swing voters
    const fenceSetters = Math.floor(totalVoters * 0.15);
    const dissatisfiedTMC = Math.floor(tmcCore * intelligence.swingFactors.antiIncumbency / 100);
    const youngVoters = Math.floor(totalVoters * 0.22); // 22% are first-time/young
    const womenSwing = Math.floor(totalVoters * 0.48 * 0.20); // 20% of women are swing

    // Convertible groups
    const targetGroups = this.identifyTargetGroups(intelligence, constituency);
    const conversionPotential = this.calculateConversionPotential(targetGroups);

    return {
      committed: {
        bjpCore,
        tmcCore,
        leftCore
      },
      swing: {
        fenceSetters,
        dissatisfiedTMC,
        youngVoters,
        womenSwing
      },
      convertible: {
        targetGroups,
        conversionPotential,
        tacticsRequired: this.getConversionTactics(targetGroups)
      }
    };
  }

  /**
   * Identify key voter groups to target
   */
  private identifyTargetGroups(intelligence: any, constituency: any): VoterGroup[] {
    const groups: VoterGroup[] = [];
    const totalVoters = intelligence.basic.totalVoters;

    // Matua community (if applicable)
    if (intelligence.demographics.matuaPopulation) {
      groups.push({
        name: 'Matua Community',
        size: intelligence.demographics.matuaPopulation,
        currentAlignment: 'Split TMC-BJP',
        conversionChance: 75,
        keyIssues: ['CAA implementation', 'Citizenship security', 'Community recognition'],
        approachStrategy: 'CAA benefit camps + Matua leader engagement'
      });
    }

    // Women voters
    groups.push({
      name: 'Women Voters',
      size: intelligence.demographics.womenVoters,
      currentAlignment: 'TMC-leaning',
      conversionChance: 45,
      keyIssues: ['Safety', 'Employment', 'Education for children'],
      approachStrategy: 'Women empowerment schemes + Mahila Morcha door-to-door'
    });

    // Youth
    groups.push({
      name: 'Youth (18-35)',
      size: Math.floor(totalVoters * intelligence.demographics.youthPercentage / 100),
      currentAlignment: 'Undecided',
      conversionChance: 60,
      keyIssues: ['Jobs', 'Education', 'Startups', 'Digital economy'],
      approachStrategy: 'Job promise + Skill development + Social media blitz'
    });

    // SC/ST voters
    if (intelligence.demographics.scStPercentage > 15) {
      groups.push({
        name: 'SC/ST Communities',
        size: Math.floor(totalVoters * intelligence.demographics.scStPercentage / 100),
        currentAlignment: 'TMC-dominated',
        conversionChance: 40,
        keyIssues: ['Reservation', 'Land rights', 'Social justice'],
        approachStrategy: 'Dalit outreach + Temple visits + Community leaders'
      });
    }

    // Tea garden workers
    if (intelligence.demographics.teaGardenWorkers) {
      groups.push({
        name: 'Tea Garden Workers',
        size: intelligence.demographics.teaGardenWorkers,
        currentAlignment: 'BJP-leaning',
        conversionChance: 80,
        keyIssues: ['Minimum wage', 'Healthcare', 'Housing'],
        approachStrategy: '₹350 minimum wage promise + Health camps'
      });
    }

    // Middle class (urban areas)
    if (intelligence.basic.urbanRural === 'urban') {
      groups.push({
        name: 'Urban Middle Class',
        size: Math.floor(totalVoters * 0.35),
        currentAlignment: 'Anti-TMC',
        conversionChance: 65,
        keyIssues: ['Corruption', 'Infrastructure', 'Law & order'],
        approachStrategy: 'Anti-corruption campaign + Development promises'
      });
    }

    // Minority voters (strategic approach)
    const minoritySize = Math.floor(totalVoters * intelligence.demographics.muslimPercentage / 100);
    if (minoritySize > 0) {
      groups.push({
        name: 'Progressive Minorities',
        size: Math.floor(minoritySize * 0.15), // Target 15% progressive section
        currentAlignment: 'TMC-locked',
        conversionChance: 20,
        keyIssues: ['Development', 'Education', 'Jobs'],
        approachStrategy: 'Pasmanda outreach + Development without appeasement'
      });
    }

    return groups;
  }

  /**
   * Calculate total conversion potential
   */
  private calculateConversionPotential(groups: VoterGroup[]): number {
    return groups.reduce((total, group) => {
      return total + Math.floor(group.size * group.conversionChance / 100);
    }, 0);
  }

  /**
   * Get specific conversion tactics
   */
  private getConversionTactics(groups: VoterGroup[]): string[] {
    const tactics: string[] = [];

    groups.forEach(group => {
      if (group.name === 'Matua Community') {
        tactics.push('CAA certificate distribution drives');
        tactics.push('Matua Thakur temple visits by senior leaders');
      }
      if (group.name === 'Women Voters') {
        tactics.push('Mahila Sammelans with direct benefit announcements');
        tactics.push('Pink booth strategy with women volunteers');
      }
      if (group.name === 'Youth') {
        tactics.push('Campus connect programs');
        tactics.push('Startup conclave and job fairs');
        tactics.push('Instagram and YouTube influencer campaigns');
      }
      if (group.name === 'Tea Garden Workers') {
        tactics.push('Union leader co-option');
        tactics.push('Direct wage credit promise launch');
      }
    });

    return tactics;
  }

  /**
   * Plan comprehensive ground game
   */
  private planGroundGame(intelligence: any, constituency: any, voteBank: any): any {
    // Calculate booth requirements
    const totalVoters = intelligence.basic.totalVoters;
    const boothCount = Math.ceil(totalVoters / 1000); // Average 1000 voters per booth

    // Generate booth plans
    const boothStrategy = this.generateBoothPlans(boothCount, intelligence, voteBank);

    // Worker deployment
    const workerDeployment = this.calculateWorkerNeeds(boothCount, intelligence);

    // Resource requirements
    const resourceNeeds = this.calculateResources(totalVoters, intelligence);

    // Campaign timeline
    const timelinePhases = this.createCampaignPhases(intelligence);

    return {
      boothStrategy,
      workerDeployment,
      resourceNeeds,
      timelinePhases
    };
  }

  /**
   * Generate booth-level plans
   */
  private generateBoothPlans(boothCount: number, intelligence: any, voteBank: any): BoothPlan[] {
    const plans: BoothPlan[] = [];
    const avgVotersPerBooth = Math.floor(intelligence.basic.totalVoters / boothCount);
    const bjpVoteShare = intelligence.political.bjpVoteShare2021;

    for (let i = 1; i <= boothCount; i++) {
      const isWeakBooth = Math.random() < 0.4; // 40% booths are weak
      const currentVotes = isWeakBooth ?
        Math.floor(avgVotersPerBooth * bjpVoteShare / 100 * 0.7) :
        Math.floor(avgVotersPerBooth * bjpVoteShare / 100 * 1.1);

      plans.push({
        boothNumber: `${constituency.name}-${i}`,
        voterCount: avgVotersPerBooth,
        bjpVotes2021: currentVotes,
        targetVotes2026: Math.floor(avgVotersPerBooth * 0.52), // Target 52% in each booth
        agentName: isWeakBooth ? undefined : `Agent-${i}`,
        weaknessFlag: isWeakBooth,
        actionItems: isWeakBooth ? [
          'Appoint booth president urgently',
          'Identify 10 booth volunteers',
          'Create WhatsApp group',
          'Door-to-door in weak pockets'
        ] : [
          'Maintain booth strength',
          'Expand volunteer base to 20',
          'Monthly booth meetings',
          'Voter list update'
        ]
      });
    }

    return plans;
  }

  /**
   * Calculate worker deployment needs
   */
  private calculateWorkerNeeds(boothCount: number, intelligence: any): WorkerAllocation {
    const isUrban = intelligence.basic.urbanRural === 'urban';
    const multiplier = intelligence.bjpStrategy.priorityLevel === 'battleground' ? 1.5 : 1;

    const totalNeeded = Math.ceil(boothCount * 5 * multiplier); // 5 workers per booth minimum
    const currentStrength = Math.floor(totalNeeded * 0.6); // Assume 60% strength currently

    return {
      totalNeeded,
      currentStrength,
      gap: totalNeeded - currentStrength,
      deployment: {
        fullTimers: Math.ceil(boothCount * 1 * multiplier),
        volunteers: Math.ceil(boothCount * 2 * multiplier),
        youthWing: Math.ceil(boothCount * 1 * multiplier),
        womenWing: Math.ceil(boothCount * 1 * multiplier)
      },
      trainingNeeds: [
        'Booth management training for 500 workers',
        'Social media training for youth wing',
        'Voter outreach training for women wing',
        'Election law compliance for all workers'
      ]
    };
  }

  /**
   * Calculate resource requirements
   */
  private calculateResources(totalVoters: number, intelligence: any): ResourceRequirement {
    const priorityMultiplier = intelligence.bjpStrategy.priorityLevel === 'battleground' ? 1.5 : 1;

    return {
      budget: {
        minimum: Math.floor(totalVoters * 15 * priorityMultiplier), // ₹15 per voter minimum
        optimal: Math.floor(totalVoters * 25 * priorityMultiplier), // ₹25 per voter optimal
        allocation: new Map([
          ['Digital Campaign', 20],
          ['Ground Activities', 30],
          ['Events & Rallies', 25],
          ['Materials', 15],
          ['Worker Expenses', 10]
        ])
      },
      materials: {
        posters: Math.ceil(totalVoters / 50),
        pamphlets: Math.ceil(totalVoters / 5),
        digitalContent: 500, // pieces of content
        vehicles: Math.ceil(totalVoters / 10000)
      },
      events: {
        rallies: intelligence.bjpStrategy.priorityLevel === 'battleground' ? 3 : 1,
        smallMeetings: Math.ceil(totalVoters / 2000),
        doorToDoor: Math.ceil(totalVoters / 100)
      }
    };
  }

  /**
   * Create campaign timeline phases
   */
  private createCampaignPhases(intelligence: any): CampaignPhase[] {
    return [
      {
        phase: 'Foundation Building',
        timeline: 'Next 3 months',
        objectives: ['Complete booth committees', 'Voter list verification', 'Issue identification'],
        activities: ['Booth president appointments', 'Volunteer recruitment', 'Survey conduct'],
        successMetrics: ['100% booth coverage', '5000 volunteers enrolled', 'Issues documented']
      },
      {
        phase: 'Momentum Building',
        timeline: '3-6 months',
        objectives: ['Anti-incumbency crystallization', 'BJP narrative establishment', 'Coalition building'],
        activities: ['Issue-based campaigns', 'Community outreach', 'Social media blitz'],
        successMetrics: ['30% sentiment shift', '50000 households contacted', 'Viral content creation']
      },
      {
        phase: 'Intensive Campaign',
        timeline: '6-9 months',
        objectives: ['Vote conversion', 'Opposition neutralization', 'Base consolidation'],
        activities: ['Door-to-door campaign', 'Major rallies', 'Beneficiary contact'],
        successMetrics: ['80% voter contact', '3 major rallies done', 'Swing voter identification']
      },
      {
        phase: 'Final Push',
        timeline: 'Last 3 months',
        objectives: ['GOTV preparation', 'Last mile conversion', 'Booth management'],
        activities: ['Voter slip distribution', 'Transport arrangement', 'Booth agent training'],
        successMetrics: ['100% slip distribution', 'Transport for 20000', 'All booths covered']
      }
    ];
  }

  /**
   * Analyze opposition weaknesses
   */
  private analyzeOppositionWeakness(intelligence: any, constituency: any): any {
    const tmcVulnerabilities = [];
    const leftErosion = [];
    const congressIrrelevance = [];
    const exploitableSplits = [];

    // TMC vulnerabilities
    if (intelligence.swingFactors.corruptionPerception > 60) {
      tmcVulnerabilities.push('SSC scam backlash - affects 50000 families');
    }
    if (intelligence.swingFactors.antiIncumbency > 55) {
      tmcVulnerabilities.push(`${intelligence.political.currentMLA} facing local anger`);
    }
    if (intelligence.basic.urbanRural === 'urban') {
      tmcVulnerabilities.push('Urban civic failures - roads, water, garbage');
    }
    tmcVulnerabilities.push('Syndicate raj resentment among middle class');
    tmcVulnerabilities.push('Muslim appeasement alienating Hindu voters');

    // Left erosion
    leftErosion.push('Youth completely disconnected from Left ideology');
    leftErosion.push('No organizational strength below district level');
    leftErosion.push('Vote transfer to BJP in anti-TMC areas');

    // Congress irrelevance
    congressIrrelevance.push('No ground presence or workers');
    congressIrrelevance.push('Leadership vacuum at constituency level');
    congressIrrelevance.push('Can be ignored in campaign strategy');

    // Exploitable splits
    if (intelligence.demographics.muslimPercentage > 30) {
      exploitableSplits.push('ISF vs TMC split in minority votes');
    }
    exploitableSplits.push('TMC old guard vs new entrants conflict');
    exploitableSplits.push('Local TMC faction fights to exploit');

    return {
      tmcVulnerabilities,
      leftErosion,
      congressIrrelevance,
      exploitableSplits
    };
  }

  /**
   * Calculate winning formula
   */
  private calculateWinningFormula(intelligence: any, voteBank: any): any {
    const totalVoters = intelligence.basic.totalVoters;
    const expectedTurnout = 0.82;
    const votesNeeded = Math.floor(totalVoters * expectedTurnout * 0.40); // Need 40% for win in multi-corner

    const currentExpected = voteBank.committed.bjpCore +
                           Math.floor(voteBank.swing.fenceSetters * 0.3) +
                           Math.floor(voteBank.swing.dissatisfiedTMC * 0.5);

    const gap = votesNeeded - currentExpected;

    // Conversion paths to victory
    const conversionPath: ConversionPath[] = [];

    if (voteBank.convertible.targetGroups.find((g: any) => g.name === 'Matua Community')) {
      const matua = voteBank.convertible.targetGroups.find((g: any) => g.name === 'Matua Community');
      conversionPath.push({
        voterSegment: 'Matua Community',
        currentVotes: Math.floor(matua.size * 0.4),
        targetVotes: Math.floor(matua.size * 0.75),
        strategy: 'CAA benefit distribution + Community leader engagement',
        timeline: '3 months',
        confidence: 80
      });
    }

    conversionPath.push({
      voterSegment: 'Dissatisfied TMC Voters',
      currentVotes: 0,
      targetVotes: voteBank.swing.dissatisfiedTMC,
      strategy: 'Anti-corruption campaign + Local issue resolution',
      timeline: '6 months',
      confidence: 65
    });

    conversionPath.push({
      voterSegment: 'Youth First-Time Voters',
      currentVotes: Math.floor(voteBank.swing.youngVoters * 0.25),
      targetVotes: Math.floor(voteBank.swing.youngVoters * 0.55),
      strategy: 'Jobs promise + Social media engagement',
      timeline: '9 months',
      confidence: 70
    });

    const totalConversionPotential = conversionPath.reduce((sum, path) =>
      sum + (path.targetVotes - path.currentVotes), 0);

    const confidence = gap <= totalConversionPotential ? 75 : 45;

    return {
      minimumVotesNeeded: votesNeeded,
      currentExpectedVotes: currentExpected,
      gapToVictory: gap,
      conversionPath,
      confidence
    };
  }

  /**
   * Develop messaging strategy
   */
  private developMessaging(intelligence: any, constituency: any, voteBank: any): any {
    // Core narrative based on constituency type
    let coreNarrative = '';
    if (intelligence.swingFactors.antiIncumbency > 60) {
      coreNarrative = 'পরিবর্তনের সময় এসেছে - TMC র দুর্নীতি আর অত্যাচার থেকে মুক্তি';
    } else if (intelligence.basic.urbanRural === 'urban') {
      coreNarrative = 'উন্নত কলকাতা, সমৃদ্ধ বাংলা - Development with Heritage';
    } else {
      coreNarrative = 'সোনার বাংলা গড়ব মোরা - Development for All';
    }

    // Demographic-specific messages
    const demographicMessages = new Map<string, string>([
      ['Women', 'নারী শক্তি, সমৃদ্ধ বাংলা - Safety, Dignity, Opportunity'],
      ['Youth', '10 লাখ চাকরি - Digital Bengal, Startup Bengal'],
      ['Matua', 'CAA সুরক্ষা, সম্মানজনক নাগরিকত্ব'],
      ['Farmers', 'MSP গ্যারান্টি, ঋণ মুক্তি, সেচ সুবিধা'],
      ['Urban Middle Class', 'Corruption-free governance, Better infrastructure'],
      ['Tea Workers', '₹350 দৈনিক মজুরি, বিনামূল্যে আবাসন']
    ]);

    // WhatsApp campaign strategy
    const whatsappStrategy: WhatsAppCampaign = {
      totalGroups: Math.ceil(voteBank.committed.bjpCore / 250), // 250 per group
      messagesPerDay: 3,
      contentTypes: ['Morning motivation', 'Issue expose', 'Achievement highlight'],
      viralTopics: [
        'TMC corruption videos',
        'Modi guarantee fulfillment',
        'Local problem solutions',
        'BJP achievement reels'
      ],
      coordinators: Math.ceil(intelligence.basic.totalVoters / 5000) // 1 per 5000 voters
    };

    // Last mile push messages
    const lastMilePush = [
      'এবার BJP - পরিবর্তনের জন্য ভোট দিন',
      'Remember SSC scam - Vote for change',
      'কমল ফুলে ভোট - উন্নতির পথে বাংলা',
      'Modi র গ্যারান্টি - Bengal এর উন্নতি'
    ];

    return {
      coreNarrative,
      demographicMessages,
      whatsappStrategy,
      lastMilePush
    };
  }

  /**
   * Assess risks and create mitigation plans
   */
  private assessRisks(intelligence: any, constituency: any): any {
    const majorThreats: Risk[] = [];

    // Violence risk
    if (intelligence.basic.district === 'Birbhum' ||
        intelligence.basic.district === 'Cooch Behar') {
      majorThreats.push({
        threat: 'Political violence and booth capture',
        probability: 'high',
        impact: 'severe',
        mitigation: 'Central force deployment request + Video documentation team'
      });
    }

    // Vote buying risk
    majorThreats.push({
      threat: 'TMC cash and kind distribution before polls',
      probability: 'high',
      impact: 'moderate',
      mitigation: 'Counter with development promise + Report to EC'
    });

    // Minority consolidation
    if (intelligence.demographics.muslimPercentage > 30) {
      majorThreats.push({
        threat: 'Complete minority consolidation against BJP',
        probability: 'high',
        impact: 'severe',
        mitigation: 'Focus on Hindu consolidation + Pasmanda outreach'
      });
    }

    // Fake news risk
    majorThreats.push({
      threat: 'Fake news and propaganda against BJP',
      probability: 'medium',
      impact: 'moderate',
      mitigation: 'Rapid response team + Fact check network'
    });

    // Contingency plans
    const contingencyPlans = new Map<string, string>([
      ['Candidate health issue', 'Ready panel of 3 backup candidates'],
      ['Major corruption expose', 'Immediate press conference + Evidence release'],
      ['Communal tension', 'Peace committee activation + Senior leader intervention'],
      ['EC restrictions', 'Digital campaign intensification + Door-to-door increase'],
      ['Fund shortage', 'Crowd funding + Business community mobilization']
    ]);

    // Early warning signals to monitor
    const earlyWarningSignals = [
      'TMC muscle mobilization in sensitive booths',
      'Unusual government scheme announcements',
      'Opposition unity talks',
      'Negative social media trends',
      'Voter list manipulation attempts'
    ];

    return {
      majorThreats,
      contingencyPlans,
      earlyWarningSignals
    };
  }

  /**
   * Generate actionable daily tasks for ground workers
   */
  async generateDailyTasks(constituencyId: string, date: Date): Promise<string[]> {
    const tasks: string[] = [];
    const dayOfWeek = date.getDay();

    // Monday - Survey day
    if (dayOfWeek === 1) {
      tasks.push('Conduct door-to-door survey in 50 households');
      tasks.push('Update voter sentiment tracker app');
      tasks.push('Identify 10 new swing voters');
    }

    // Tuesday - WhatsApp day
    else if (dayOfWeek === 2) {
      tasks.push('Share 3 WhatsApp messages in all groups');
      tasks.push('Create new WhatsApp group with 20 contacts');
      tasks.push('Report viral content metrics');
    }

    // Wednesday - Meeting day
    else if (dayOfWeek === 3) {
      tasks.push('Organize mohalla meeting (minimum 30 people)');
      tasks.push('Booth committee review meeting');
      tasks.push('Women wing coordination meeting');
    }

    // Thursday - Outreach day
    else if (dayOfWeek === 4) {
      tasks.push('Visit 5 community leaders');
      tasks.push('Temple/mosque/church visit with team');
      tasks.push('Market campaign for 2 hours');
    }

    // Friday - Youth day
    else if (dayOfWeek === 5) {
      tasks.push('College campus interaction');
      tasks.push('Social media content creation');
      tasks.push('Youth voter registration drive');
    }

    // Saturday - Mass contact
    else if (dayOfWeek === 6) {
      tasks.push('Area sabha (minimum 100 people)');
      tasks.push('Pamphlet distribution (500 copies)');
      tasks.push('Beneficiary meeting organization');
    }

    // Sunday - Review and planning
    else if (dayOfWeek === 0) {
      tasks.push('Weekly progress review meeting');
      tasks.push('Next week planning session');
      tasks.push('Report submission to district team');
    }

    return tasks;
  }
}

export const electionWinningStrategy = new ElectionWinningStrategyService();