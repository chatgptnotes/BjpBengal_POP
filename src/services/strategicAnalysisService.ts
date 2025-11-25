/**
 * Strategic Analysis Service
 * Generates dynamic strategic intelligence based on real-time news and data
 */

interface NewsItem {
  date: string;
  event: string;
  type: string;
  impact: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface StrategicAnalysis {
  incumbent_shield: Array<{ name: string; effect: string; desc: string }>;
  bjp_friction_points: Array<{ issue: string; severity: string; desc: string }>;
  path_to_victory: string[];
}

/**
 * Analyze news data to generate strategic insights
 */
export function generateStrategicAnalysis(
  constituencyName: string,
  district: string,
  currentAffairs: NewsItem[],
  topIssues: Array<{ label: string; score: number }>,
  segments: Array<{ name: string; sentiment: { pos: number; neg: number; neu: number } }>
): StrategicAnalysis {

  // Analyze current affairs for patterns
  const protestCount = currentAffairs.filter(item => item.type === 'Protest').length;
  const civicIssues = currentAffairs.filter(item => item.type === 'Civic').length;
  const developmentNews = currentAffairs.filter(item => item.type === 'Development').length;
  const politicalEvents = currentAffairs.filter(item => item.type === 'Political').length;

  // Analyze sentiment distribution
  const negativeNews = currentAffairs.filter(item => item.sentiment === 'negative').length;
  const positiveNews = currentAffairs.filter(item => item.sentiment === 'positive').length;

  // Analyze youth sentiment (critical demographic)
  const youthSegment = segments.find(s => s.name.includes('Youth') || s.name.includes('18-30'));
  const youthNegativeSentiment = youthSegment ? youthSegment.sentiment.neg : 50;

  // Analyze women sentiment (key voting bloc)
  const womenSegment = segments.find(s => s.name.includes('Women'));
  const womenPositiveSentiment = womenSegment ? womenSegment.sentiment.pos : 50;

  // Generate Incumbent Shield based on real data
  const incumbent_shield = generateIncumbentShield(
    positiveNews,
    developmentNews,
    womenPositiveSentiment,
    topIssues,
    constituencyName
  );

  // Generate BJP Friction Points based on real data
  const bjp_friction_points = generateFrictionPoints(
    protestCount,
    civicIssues,
    youthNegativeSentiment,
    negativeNews,
    currentAffairs,
    constituencyName
  );

  // Generate Path to Victory based on analysis
  const path_to_victory = generatePathToVictory(
    topIssues,
    youthNegativeSentiment,
    civicIssues,
    constituencyName,
    district
  );

  return {
    incumbent_shield,
    bjp_friction_points,
    path_to_victory
  };
}

/**
 * Generate Incumbent Shield analysis
 */
function generateIncumbentShield(
  positiveNews: number,
  developmentNews: number,
  womenPositiveSentiment: number,
  topIssues: Array<{ label: string; score: number }>,
  constituencyName: string
): Array<{ name: string; effect: string; desc: string }> {

  const shield = [];

  // Check for welfare scheme popularity
  const welfareIssue = topIssues.find(i =>
    i.label.toLowerCase().includes('welfare') ||
    i.label.toLowerCase().includes('scheme')
  );

  if (welfareIssue && welfareIssue.score > 60) {
    shield.push({
      name: "Welfare Schemes (Lakshmir Bhandar)",
      effect: "High",
      desc: `Strong ${welfareIssue.score}% support for welfare programs. Direct benefit transfer creating voter loyalty in ${constituencyName}.`
    });
  } else if (womenPositiveSentiment > 60) {
    shield.push({
      name: "Women Voter Support",
      effect: "High",
      desc: `${womenPositiveSentiment}% positive sentiment among women voters. Strong support base in ${constituencyName}.`
    });
  } else {
    shield.push({
      name: "Welfare Distribution Network",
      effect: "Medium",
      desc: `Established welfare distribution creating baseline support in ${constituencyName}.`
    });
  }

  // Check for local development
  if (developmentNews > 2) {
    shield.push({
      name: "Recent Development Projects",
      effect: "High",
      desc: `${developmentNews} major development initiatives announced. Visibility of work creating positive perception.`
    });
  } else if (positiveNews > negativeNews) {
    shield.push({
      name: "Positive Media Coverage",
      effect: "Medium",
      desc: `Favorable news coverage with ${positiveNews} positive stories. Narrative control maintained.`
    });
  } else {
    shield.push({
      name: "Local Club Network",
      effect: "Medium",
      desc: "Traditional grassroots organization through local clubs and community groups."
    });
  }

  // Check for community consolidation
  const communityIssue = topIssues.find(i =>
    i.label.toLowerCase().includes('community') ||
    i.label.toLowerCase().includes('minority')
  );

  if (communityIssue && communityIssue.score > 50) {
    shield.push({
      name: "Community Consolidation",
      effect: "High",
      desc: `Strong ${communityIssue.score}% consolidation of community vote bank behind incumbent.`
    });
  } else {
    shield.push({
      name: "Traditional Vote Bank",
      effect: "Medium",
      desc: "Established voter base from previous elections providing foundation."
    });
  }

  return shield.slice(0, 3);
}

/**
 * Generate BJP Friction Points
 */
function generateFrictionPoints(
  protestCount: number,
  civicIssues: number,
  youthNegativeSentiment: number,
  negativeNews: number,
  currentAffairs: NewsItem[],
  constituencyName: string
): Array<{ issue: string; severity: string; desc: string }> {

  const frictions = [];

  // Check for organizational issues
  if (youthNegativeSentiment > 55) {
    frictions.push({
      issue: "Youth Disengagement",
      severity: "Critical",
      desc: `${youthNegativeSentiment}% negative sentiment among youth. Failure to connect with 18-30 demographic in ${constituencyName}.`
    });
  } else {
    frictions.push({
      issue: "Booth Organization",
      severity: "High",
      desc: "Ground organization gaps visible. Need stronger booth-level presence and Panna Pramukhs."
    });
  }

  // Check for civic issues
  if (civicIssues > 2) {
    const civicProblems = currentAffairs
      .filter(item => item.type === 'Civic')
      .map(item => item.event)
      .join('; ');

    frictions.push({
      issue: "Civic Infrastructure Failures",
      severity: "Critical",
      desc: `${civicIssues} major civic issues reported: ${civicProblems.slice(0, 100)}... Opposition failing to capitalize.`
    });
  } else if (protestCount > 1) {
    frictions.push({
      issue: "Protest Response Gap",
      severity: "High",
      desc: `${protestCount} protests reported but no alternative narrative presented. Missing opportunity to channel anti-incumbency.`
    });
  } else {
    frictions.push({
      issue: "Narrative Gap",
      severity: "High",
      desc: "Campaign focused on national issues while voters concerned about local problems like drainage and water supply."
    });
  }

  // Check for candidate issues
  if (negativeNews > positiveNews && negativeNews > 3) {
    frictions.push({
      issue: "Negative Media Perception",
      severity: "High",
      desc: `${negativeNews} negative news stories creating perception problem. Candidate visibility insufficient to counter.`
    });
  } else {
    frictions.push({
      issue: "Candidate Connect",
      severity: "Medium",
      desc: "Local candidate visibility low. Need more ground presence and direct voter interaction."
    });
  }

  return frictions.slice(0, 3);
}

/**
 * Generate Path to Victory
 */
function generatePathToVictory(
  topIssues: Array<{ label: string; score: number }>,
  youthNegativeSentiment: number,
  civicIssues: number,
  constituencyName: string,
  district: string
): string[] {

  const path = [];

  // Strategy 1: Address top issue
  if (topIssues.length > 0) {
    const topIssue = topIssues[0];
    if (topIssue.score > 70) {
      path.push(
        `Launch hyper-local campaign on '${topIssue.label}' (${topIssue.score}% concern). Door-to-door commitment cards with specific solutions for ${constituencyName}.`
      );
    } else {
      path.push(
        `Focus on top voter concerns: ${topIssues.slice(0, 2).map(i => i.label).join(' and ')}. Create ward-specific action plans.`
      );
    }
  } else {
    path.push(
      `Create hyperlocal narrative around drainage, water supply, and road infrastructure specific to ${constituencyName} wards.`
    );
  }

  // Strategy 2: Target key demographic
  if (youthNegativeSentiment > 55) {
    path.push(
      `URGENT: Youth outreach program needed. ${youthNegativeSentiment}% negative sentiment requires jobs & education roadmap specific to ${district}.`
    );
  } else {
    path.push(
      `Target 'Mahila Morcha' specifically with women-centric development agenda to crack the welfare scheme shield.`
    );
  }

  // Strategy 3: Tactical approach
  if (civicIssues > 2) {
    path.push(
      `Exploit civic failures: Document and showcase ${civicIssues} infrastructure problems. Create contrast with development promise.`
    );
  } else {
    path.push(
      `Must secure 65%+ of the split Anti-Incumbency vote. Coalition building with disgruntled voters essential for victory in ${constituencyName}.`
    );
  }

  return path;
}

/**
 * Generate fallback analysis when real data is limited
 */
export function generateFallbackAnalysis(constituencyName: string): StrategicAnalysis {
  return {
    incumbent_shield: [
      {
        name: "Welfare Distribution Network",
        effect: "High",
        desc: `Established welfare scheme penetration creating loyalty base in ${constituencyName}.`
      },
      {
        name: "Local Organization",
        effect: "Medium",
        desc: "Strong grassroots network through community organizations and clubs."
      },
      {
        name: "Traditional Vote Bank",
        effect: "Medium",
        desc: "Consolidated support from core voter demographics."
      }
    ],
    bjp_friction_points: [
      {
        issue: "Ground Organization",
        severity: "High",
        desc: `Need stronger booth-level presence in ${constituencyName}. Organizational gaps evident.`
      },
      {
        issue: "Local Issues Focus",
        severity: "Medium",
        desc: "Campaign needs to address constituency-specific problems more directly."
      },
      {
        issue: "Candidate Visibility",
        severity: "Medium",
        desc: "Increase local presence and direct voter engagement required."
      }
    ],
    path_to_victory: [
      `Focus on hyperlocal issues specific to ${constituencyName} - water, drainage, infrastructure.`,
      "Target swing voter segments with specific commitments and action plans.",
      "Build coalition with disgruntled voters and convert anti-incumbency into votes."
    ]
  };
}
