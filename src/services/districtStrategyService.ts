/**
 * District Strategy Service
 * Generates comprehensive district-level campaign strategies
 */

interface DistrictData {
  district: string;
  totalSeats: number;
  bjpWon: number;
  bjpSecond: number;
  keyIssues: string[];
  recommendations: string[];
  avgMarginToVictory: number;
  priorityLevel: string;
}

interface DistrictStrategy {
  executiveSummary: string;
  targetConstituencies: TargetConstituency[];
  districtCampaigns: Campaign[];
  resources: Resources;
  leaderDeployment: LeaderDeployment[];
  monthlyPlan: MonthlyPlan[];
  risks: Risk[];
  kpis: KPI[];
}

interface TargetConstituency {
  name: string;
  margin: number;
  swingNeeded: string;
  winProbability: string;
  keyIssue: string;
  strategy: string;
}

interface Campaign {
  name: string;
  description: string;
  reach: string;
  duration: string;
}

interface Resources {
  totalBudget: number;
  perConstituency: number;
  totalVolunteers: number;
  coordinators: number;
  duration: string;
}

interface LeaderDeployment {
  name: string;
  role: string;
  constituencies: number;
  frequency: string;
  focus: string;
}

interface MonthlyPlan {
  title: string;
  focus: string;
  activities: string[];
  metric: string;
}

interface Risk {
  threat: string;
  impact: string;
  mitigation: string;
  severity: string;
}

interface KPI {
  metric: string;
  current: string;
  target: string;
}

class DistrictStrategyService {
  /**
   * Generate comprehensive district strategy
   */
  async generateDistrictStrategy(districtData: DistrictData): Promise<DistrictStrategy> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const strategy: DistrictStrategy = {
      executiveSummary: this.generateExecutiveSummary(districtData),
      targetConstituencies: this.generateTargetConstituencies(districtData),
      districtCampaigns: this.generateDistrictCampaigns(districtData),
      resources: this.calculateResources(districtData),
      leaderDeployment: this.generateLeaderDeployment(districtData),
      monthlyPlan: this.generateMonthlyPlan(districtData),
      risks: this.assessRisks(districtData),
      kpis: this.defineKPIs(districtData)
    };

    return strategy;
  }

  private generateExecutiveSummary(data: DistrictData): string {
    return `${data.district} district presents a critical opportunity for BJP expansion with ${data.bjpSecond} winnable constituencies where we finished second in 2021. Currently holding ${data.bjpWon} out of ${data.totalSeats} seats, a targeted campaign focusing on ${data.keyIssues[0]} and ${data.keyIssues[1]} can swing these constituencies. Average victory margin is only ${data.avgMarginToVictory.toLocaleString()} votes, making this a ${data.priorityLevel} priority district. With proper resource allocation and strategic interventions, BJP can realistically target ${data.bjpWon + data.bjpSecond} seats by 2026.`;
  }

  private generateTargetConstituencies(data: DistrictData): TargetConstituency[] {
    const constituencies: TargetConstituency[] = [];
    const baseMargin = data.avgMarginToVictory;

    for (let i = 0; i < Math.min(data.bjpSecond, 10); i++) {
      const margin = baseMargin + (Math.random() * 5000 - 2500);
      const swingNeeded = ((margin / 100000) * 100).toFixed(1);

      constituencies.push({
        name: `${data.district} Constituency ${i + 1}`,
        margin: Math.round(margin),
        swingNeeded: `${swingNeeded}%`,
        winProbability: margin < 5000 ? 'high' : margin < 10000 ? 'medium' : 'moderate',
        keyIssue: data.keyIssues[i % data.keyIssues.length],
        strategy: data.recommendations[i % data.recommendations.length]
      });
    }

    return constituencies.sort((a, b) => a.margin - b.margin);
  }

  private generateDistrictCampaigns(data: DistrictData): Campaign[] {
    const campaigns: Campaign[] = [
      {
        name: 'Development First Campaign',
        description: `Showcase central government schemes and infrastructure projects in ${data.district}`,
        reach: `${data.totalSeats * 15000} voters`,
        duration: '30 days'
      },
      {
        name: 'Youth Employment Drive',
        description: 'Job fairs, skill development programs, and entrepreneurship workshops',
        reach: `${data.totalSeats * 5000} youth`,
        duration: '45 days'
      },
      {
        name: 'Women Empowerment Initiative',
        description: 'Focus on women safety, economic independence, and social security',
        reach: `${data.totalSeats * 8000} women`,
        duration: '60 days'
      },
      {
        name: 'Farmer Connect Program',
        description: 'Direct farmer engagement on MSP, PM-KISAN, and agricultural reforms',
        reach: `${data.totalSeats * 3000} farmers`,
        duration: '30 days'
      }
    ];

    return campaigns;
  }

  private calculateResources(data: DistrictData): Resources {
    const budgetPerSeat = 1000000; // 10 lakhs per target constituency
    const volunteersPerSeat = 50;

    return {
      totalBudget: data.bjpSecond * budgetPerSeat,
      perConstituency: budgetPerSeat,
      totalVolunteers: data.bjpSecond * volunteersPerSeat,
      coordinators: data.bjpSecond * 5,
      duration: '90 days'
    };
  }

  private generateLeaderDeployment(data: DistrictData): LeaderDeployment[] {
    return [
      {
        name: 'Suvendu Adhikari',
        role: 'Leader of Opposition',
        constituencies: Math.min(5, data.bjpSecond),
        frequency: '2 visits per constituency',
        focus: 'Anti-incumbency, TMC corruption, voter mobilization'
      },
      {
        name: 'Dilip Ghosh',
        role: 'Former State President',
        constituencies: Math.min(4, data.bjpSecond),
        frequency: 'Weekly visits',
        focus: 'Hindu consolidation, organizational strengthening'
      },
      {
        name: 'Local MLAs',
        role: 'District Leadership',
        constituencies: data.bjpSecond,
        frequency: 'Daily presence',
        focus: 'Ground-level coordination, booth management'
      },
      {
        name: 'Central Ministers',
        role: 'Star Campaigners',
        constituencies: Math.min(3, data.bjpSecond),
        frequency: '1 major rally each',
        focus: 'Development narrative, central schemes awareness'
      }
    ];
  }

  private generateMonthlyPlan(data: DistrictData): MonthlyPlan[] {
    return [
      {
        title: 'Month 1: Foundation & Reconnaissance',
        focus: 'Build organizational infrastructure and gather intelligence',
        activities: [
          'Complete booth-level mapping of all target constituencies',
          'Recruit and train booth presidents and polling agents',
          'Conduct voter surveys to identify swing voters and key issues',
          'Establish WhatsApp groups for each booth and constituency',
          'Set up district war room with real-time monitoring',
          'Identify local influencers and opinion leaders',
          'Document TMC weaknesses and corruption cases'
        ],
        metric: '100% booth coverage achieved'
      },
      {
        title: 'Month 2: Engagement & Outreach',
        focus: 'Mass contact program and issue-based mobilization',
        activities: [
          'Launch door-to-door campaign in all constituencies',
          'Organize sector-wise meetings (youth, women, farmers, traders)',
          'Conduct grievance redressal camps',
          'Start social media campaigns highlighting local issues',
          'Deploy Panna Pramukhs for voter list verification',
          'Organize health camps and legal aid camps',
          'Begin candidate selection process through surveys'
        ],
        metric: '50,000+ voter contacts per constituency'
      },
      {
        title: 'Month 3: Consolidation & Final Push',
        focus: 'Maximize visibility and create winning momentum',
        activities: [
          'Deploy star campaigners for mega rallies',
          'Intensify booth-level activities and voter persuasion',
          'Launch multimedia campaign (TV, radio, print, digital)',
          'Organize victory rallies and roadshows',
          'Complete polling day preparations and agent deployment',
          'Activate rapid response team for countering misinformation',
          'Final push on undecided voters and silent supporters'
        ],
        metric: '85%+ positive sentiment in target booths'
      }
    ];
  }

  private assessRisks(data: DistrictData): Risk[] {
    return [
      {
        threat: 'TMC Intimidation and Violence',
        impact: 'Could suppress BJP voter turnout by 5-10% in vulnerable booths',
        mitigation: 'Deploy booth protection squads, ensure police presence, document all incidents, create silent voter programs for intimidated supporters',
        severity: 'high'
      },
      {
        threat: 'Resource Constraints',
        impact: 'Inadequate funding may limit campaign reach and volunteer motivation',
        mitigation: 'Prioritize high-impact constituencies, leverage volunteer networks, use low-cost digital campaigns, seek corporate donations',
        severity: 'medium'
      },
      {
        threat: 'Minority Vote Consolidation Against BJP',
        impact: 'Could swing close constituencies to TMC if minorities vote en bloc',
        mitigation: 'Outreach to progressive minority leaders, highlight pasmanda issues, focus on development-based messaging, avoid polarizing rhetoric',
        severity: 'high'
      },
      {
        threat: 'Misinformation and Fake News',
        impact: 'False narratives can damage BJP reputation and confuse voters',
        mitigation: 'Establish fact-check unit, rapid response team, leverage trusted local voices, use WhatsApp groups for counter-messaging',
        severity: 'medium'
      },
      {
        threat: 'Weak Candidate Selection',
        impact: 'Wrong candidates can lose winnable seats despite good campaign',
        mitigation: 'Data-driven candidate selection, winnability surveys, booth-level feedback, avoid parachute candidates where possible',
        severity: 'high'
      }
    ];
  }

  private defineKPIs(data: DistrictData): KPI[] {
    return [
      {
        metric: 'Booth Coverage',
        current: '0',
        target: '100'
      },
      {
        metric: 'Voter Contacts',
        current: '0',
        target: `${data.bjpSecond * 50000}`
      },
      {
        metric: 'WhatsApp Groups',
        current: '0',
        target: `${data.bjpSecond * 100}`
      },
      {
        metric: 'Active Volunteers',
        current: '0',
        target: `${data.bjpSecond * 50}`
      },
      {
        metric: 'Public Meetings',
        current: '0',
        target: `${data.bjpSecond * 20}`
      },
      {
        metric: 'Social Media Reach',
        current: '0',
        target: `${data.bjpSecond * 100000}`
      },
      {
        metric: 'Grievances Resolved',
        current: '0',
        target: `${data.bjpSecond * 500}`
      },
      {
        metric: 'Positive Sentiment %',
        current: '0',
        target: '75'
      }
    ];
  }
}

export const districtStrategyService = new DistrictStrategyService();
