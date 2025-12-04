/**
 * Election Topic Analysis Service
 * Analyzes text for election-related topics and determines impact on BJP/TMC
 * Topics: Development, Law & Order, Employment, Corruption, Minority Welfare
 */

export type ElectionTopic = 'development' | 'law_order' | 'employment' | 'corruption' | 'minority';
export type Party = 'BJP' | 'TMC';
export type Impact = 'positive' | 'negative' | 'neutral';

export interface TopicKeywords {
  topic: ElectionTopic;
  topicLabel: string;
  bjpPositive: string[];
  bjpNegative: string[];
  tmcPositive: string[];
  tmcNegative: string[];
  general: string[]; // Keywords that indicate topic but not party-specific
}

export interface TopicAnalysisResult {
  topic: ElectionTopic;
  topicLabel: string;
  detected: boolean;
  bjpImpact: Impact;
  tmcImpact: Impact;
  bjpScore: number; // -1 to 1
  tmcScore: number; // -1 to 1
  matchedKeywords: string[];
}

export interface ElectionAnalysisResult {
  topics: TopicAnalysisResult[];
  bjpTotalScore: number;
  tmcTotalScore: number;
  bjpSeatImpact: number;
  tmcSeatImpact: number;
  dominantParty: Party | 'neutral';
}

// Topic Keywords Database - Bengal Election Focused
const TOPIC_KEYWORDS: TopicKeywords[] = [
  {
    topic: 'development',
    topicLabel: 'Development & Infrastructure',
    bjpPositive: [
      // Central Schemes
      'modi scheme', 'pm modi scheme', 'central funds', 'pmay', 'pm awas', 'pm awas yojana',
      'ayushman bharat', 'jan dhan', 'ujjwala', 'swachh bharat', 'digital india',
      // Infrastructure
      'highway', 'national highway', 'expressway', 'metro expansion', 'smart city',
      'bjp development', 'central government project', 'central scheme',
      // Bengal specific BJP claims
      'double engine sarkar', 'double engine government', 'central neglect by tmc',
      'funds blocked', 'state blocking funds',
      // Bengali
      'কেন্দ্রীয় প্রকল্প', 'মোদি প্রকল্প', 'ডাবল ইঞ্জিন'
    ],
    bjpNegative: [
      'false promise', 'jumla', 'no development', 'central neglect',
      'modi failed', 'bjp failed development', 'broken promise',
      'জুমলা', 'মিথ্যা প্রতিশ্রুতি'
    ],
    tmcPositive: [
      // TMC Schemes
      'duare sarkar', 'lakshmir bhandar', 'kanyashree', 'swasthya sathi',
      'state development', 'mamata scheme', 'state scheme', 'bengal scheme',
      'krishak bandhu', 'sabuj sathi', 'rupashree', 'yuvashree',
      'gatidhara', 'nijashree', 'sikshashree',
      // Bengali
      'দুয়ারে সরকার', 'লক্ষ্মীর ভান্ডার', 'কন্যাশ্রী', 'স্বাস্থ্য সাথী',
      'কৃষক বন্ধু', 'সবুজ সাথী'
    ],
    tmcNegative: [
      'incomplete project', 'stalled development', 'fund misuse', 'delayed infrastructure',
      'development failure bengal', 'bengal underdeveloped', 'poor infrastructure bengal',
      'scheme failure', 'scheme scam',
      'অসম্পূর্ণ প্রকল্প', 'উন্নয়ন ব্যর্থ'
    ],
    general: [
      'development', 'infrastructure', 'road', 'bridge', 'project', 'scheme',
      'উন্নয়ন', 'পরিকাঠামো'
    ]
  },
  {
    topic: 'law_order',
    topicLabel: 'Law & Order',
    bjpPositive: [
      'safe bengal', 'law reform', 'justice', 'security promise',
      'bjp will restore law', 'strict action', 'zero tolerance crime',
      'নিরাপদ বাংলা', 'আইনের শাসন'
    ],
    bjpNegative: [
      'communal tension', 'riot', 'divisive politics', 'bjp violence',
      'communal riot', 'bjp goons', 'saffron terror',
      'সাম্প্রদায়িক', 'দাঙ্গা'
    ],
    tmcPositive: [
      'peace bengal', 'law enforcement', 'police action', 'peaceful state',
      'mamata law order', 'state police success', 'crime control',
      'শান্তি', 'আইন শৃঙ্খলা'
    ],
    tmcNegative: [
      // Major incidents
      'sandeshkhali', 'সন্দেশখালি',
      // Violence
      'violence bengal', 'political murder', 'political violence', 'post poll violence',
      'bengal violence', 'murder bengal',
      // TMC specific
      'tmc goons', 'tmc goonda', 'tmc violence', 'tmc cadre attack',
      'cut money', 'syndicate raj', 'syndicate', 'tolabaji', 'extortion tmc',
      // Law failure
      'law and order failure', 'crime rate bengal', 'unsafe bengal', 'lawless bengal',
      'police bias', 'police inactive',
      // Bengali
      'তৃণমূল গুন্ডা', 'কাট মানি', 'সিন্ডিকেট', 'তোলাবাজি', 'রাজনৈতিক হত্যা'
    ],
    general: [
      'law', 'order', 'crime', 'police', 'murder', 'attack', 'violence',
      'আইন', 'পুলিশ', 'অপরাধ'
    ]
  },
  {
    topic: 'employment',
    topicLabel: 'Employment & Jobs',
    bjpPositive: [
      'rozgar mela', 'employment scheme', 'startup india', 'skill development',
      'job creation central', 'pm employment', 'mudra loan', 'make in india',
      'new factory', 'industrial growth', 'investment india',
      'রোজগার মেলা', 'কেন্দ্রীয় চাকরি'
    ],
    bjpNegative: [
      'unemployment india', 'job loss india', 'factory closure', 'no jobs central',
      'demonetization job loss', 'gst job loss',
      'বেকারত্ব ভারত'
    ],
    tmcPositive: [
      'yuvasree', 'yuvashree', 'state jobs', 'government recruitment bengal',
      'bengal employment', 'state employment scheme', 'karmasathi',
      'যুবশ্রী', 'রাজ্য চাকরি', 'কর্মসাথী'
    ],
    tmcNegative: [
      // Scams
      'ssc scam', 'school service commission scam', 'recruitment scam',
      'teacher recruitment scam', 'school job scam', 'tet scam',
      'job scam bengal', 'fake job', 'bribe for job',
      // Unemployment
      'unemployment bengal', 'job crisis bengal', 'no jobs bengal',
      'youth unemployment bengal', 'educated unemployed',
      // Bengali
      'এসএসসি কেলেঙ্কারি', 'নিয়োগ দুর্নীতি', 'বেকারত্ব বাংলা', 'চাকরি কেলেঙ্কারি'
    ],
    general: [
      'job', 'employment', 'unemployment', 'recruitment', 'vacancy',
      'চাকরি', 'বেকার', 'নিয়োগ'
    ]
  },
  {
    topic: 'corruption',
    topicLabel: 'Corruption Allegations',
    bjpPositive: [
      'clean government', 'anti corruption bjp', 'transparent governance',
      'corruption free', 'honest government'
    ],
    bjpNegative: [
      'electoral bond', 'electoral bond scam', 'bjp corruption', 'adani',
      'modi corruption', 'pm cares fund', 'rafale scam', 'bjp scam',
      'নির্বাচনী বন্ড', 'বিজেপি দুর্নীতি'
    ],
    tmcPositive: [
      'tmc clean', 'false allegation', 'political vendetta', 'ed misuse',
      'cbi misuse', 'witch hunt'
    ],
    tmcNegative: [
      // ED/CBI raids
      'ed raid tmc', 'ed arrest tmc', 'cbi tmc', 'ed tmc',
      // Key figures
      'partha chatterjee', 'arpita mukherjee', 'partha chatterjee arrest',
      'anubrata mondal', 'manik bhattacharya',
      // Scams
      'cattle scam', 'coal scam bengal', 'ration scam', 'amphan relief scam',
      'tmc corruption', 'tmc scam', 'tmc minister arrest',
      // Bengali
      'পার্থ চ্যাটার্জি', 'অর্পিতা মুখার্জি', 'ইডি তৃণমূল', 'গরু পাচার',
      'কয়লা কেলেঙ্কারি', 'তৃণমূল দুর্নীতি', 'অনুব্রত মণ্ডল'
    ],
    general: [
      'corruption', 'scam', 'ed', 'cbi', 'arrest', 'raid', 'investigation',
      'দুর্নীতি', 'কেলেঙ্কারি', 'গ্রেপ্তার'
    ]
  },
  {
    topic: 'minority',
    topicLabel: 'Minority Welfare',
    bjpPositive: [
      'sabka saath', 'sabka vikas', 'equal development', 'uniform civil code',
      'ucc', 'minority empowerment', 'pasmanda muslim',
      'সবকা সাথ', 'সমান উন্নয়ন'
    ],
    bjpNegative: [
      'muslim appeasement', 'vote bank', 'pseudo secular', 'minority appeasement',
      'anti hindu', 'hindu khatre mein',
      'তোষণ', 'ভোট ব্যাংক'
    ],
    tmcPositive: [
      'minority welfare', 'imam stipend', 'imam bhata', 'madrasah',
      'minority scholarship', 'inclusive bengal', 'secular bengal',
      'minority development', 'waqf board',
      'সংখ্যালঘু কল্যাণ', 'ইমাম ভাতা', 'মাদ্রাসা'
    ],
    tmcNegative: [
      'polarization', 'communal divide', 'hindu muslim divide',
      'minority vote bank', 'religious division',
      'মেরুকরণ', 'সাম্প্রদায়িক বিভাজন'
    ],
    general: [
      'minority', 'muslim', 'hindu', 'religion', 'secular', 'communal',
      'সংখ্যালঘু', 'মুসলিম', 'হিন্দু', 'ধর্মনিরপেক্ষ'
    ]
  }
];

/**
 * Analyze text for a single topic
 */
function analyzeTopicInText(text: string, topicData: TopicKeywords): TopicAnalysisResult {
  const lowerText = text.toLowerCase();
  const matchedKeywords: string[] = [];

  let bjpPositiveCount = 0;
  let bjpNegativeCount = 0;
  let tmcPositiveCount = 0;
  let tmcNegativeCount = 0;
  let generalCount = 0;

  // Check BJP positive keywords
  topicData.bjpPositive.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      bjpPositiveCount++;
      matchedKeywords.push(`BJP+: ${keyword}`);
    }
  });

  // Check BJP negative keywords
  topicData.bjpNegative.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      bjpNegativeCount++;
      matchedKeywords.push(`BJP-: ${keyword}`);
    }
  });

  // Check TMC positive keywords
  topicData.tmcPositive.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      tmcPositiveCount++;
      matchedKeywords.push(`TMC+: ${keyword}`);
    }
  });

  // Check TMC negative keywords
  topicData.tmcNegative.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      tmcNegativeCount++;
      matchedKeywords.push(`TMC-: ${keyword}`);
    }
  });

  // Check general keywords
  topicData.general.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      generalCount++;
    }
  });

  // Determine if topic is detected
  const detected = matchedKeywords.length > 0 || generalCount > 0;

  // Calculate scores (-1 to 1)
  const bjpScore = bjpPositiveCount > 0 || bjpNegativeCount > 0
    ? (bjpPositiveCount - bjpNegativeCount) / Math.max(bjpPositiveCount + bjpNegativeCount, 1)
    : 0;

  const tmcScore = tmcPositiveCount > 0 || tmcNegativeCount > 0
    ? (tmcPositiveCount - tmcNegativeCount) / Math.max(tmcPositiveCount + tmcNegativeCount, 1)
    : 0;

  // Determine impact
  const bjpImpact: Impact = bjpScore > 0.2 ? 'positive' : bjpScore < -0.2 ? 'negative' : 'neutral';
  const tmcImpact: Impact = tmcScore > 0.2 ? 'positive' : tmcScore < -0.2 ? 'negative' : 'neutral';

  return {
    topic: topicData.topic,
    topicLabel: topicData.topicLabel,
    detected,
    bjpImpact,
    tmcImpact,
    bjpScore,
    tmcScore,
    matchedKeywords
  };
}

/**
 * Analyze text for all election topics
 */
export function analyzeElectionTopics(text: string): ElectionAnalysisResult {
  const topics = TOPIC_KEYWORDS.map(topicData => analyzeTopicInText(text, topicData));

  // Calculate total scores
  const bjpTotalScore = topics.reduce((sum, t) => sum + t.bjpScore, 0);
  const tmcTotalScore = topics.reduce((sum, t) => sum + t.tmcScore, 0);

  // Calculate seat impact (simple formula)
  // Positive score = +0.1 seat per point, Negative = -0.15 seat per point
  const bjpSeatImpact = bjpTotalScore > 0
    ? bjpTotalScore * 0.1
    : bjpTotalScore * 0.15;

  const tmcSeatImpact = tmcTotalScore > 0
    ? tmcTotalScore * 0.1
    : tmcTotalScore * 0.15;

  // Determine dominant party
  const dominantParty: Party | 'neutral' =
    bjpTotalScore > tmcTotalScore + 0.5 ? 'BJP' :
    tmcTotalScore > bjpTotalScore + 0.5 ? 'TMC' : 'neutral';

  return {
    topics,
    bjpTotalScore,
    tmcTotalScore,
    bjpSeatImpact,
    tmcSeatImpact,
    dominantParty
  };
}

/**
 * Detect which topics are present in text (returns boolean flags)
 */
export function detectTopics(text: string): {
  development: boolean;
  law_order: boolean;
  employment: boolean;
  corruption: boolean;
  minority: boolean;
} {
  const result = analyzeElectionTopics(text);

  return {
    development: result.topics.find(t => t.topic === 'development')?.detected || false,
    law_order: result.topics.find(t => t.topic === 'law_order')?.detected || false,
    employment: result.topics.find(t => t.topic === 'employment')?.detected || false,
    corruption: result.topics.find(t => t.topic === 'corruption')?.detected || false,
    minority: result.topics.find(t => t.topic === 'minority')?.detected || false,
  };
}

/**
 * Get party impact for a specific topic
 */
export function getTopicPartyImpact(text: string, topic: ElectionTopic): {
  bjpImpact: Impact;
  tmcImpact: Impact;
  bjpScore: number;
  tmcScore: number;
} {
  const topicData = TOPIC_KEYWORDS.find(t => t.topic === topic);
  if (!topicData) {
    return { bjpImpact: 'neutral', tmcImpact: 'neutral', bjpScore: 0, tmcScore: 0 };
  }

  const result = analyzeTopicInText(text, topicData);
  return {
    bjpImpact: result.bjpImpact,
    tmcImpact: result.tmcImpact,
    bjpScore: result.bjpScore,
    tmcScore: result.tmcScore
  };
}

/**
 * Get all topic keywords for reference
 */
export function getAllTopicKeywords(): TopicKeywords[] {
  return TOPIC_KEYWORDS;
}

// Constituency Keywords for detection
interface ConstituencyKeywords {
  id: string;
  name: string;
  district: string;
  keywords: string[];
}

const CONSTITUENCY_KEYWORDS: ConstituencyKeywords[] = [
  // Kolkata constituencies
  { id: 'wb_kolkata_bhowanipore', name: 'Bhowanipore', district: 'Kolkata', keywords: ['bhowanipore', 'bhawanipore', 'bhowanipor', 'ভবানীপুর', 'kalighat', 'কালীঘাট'] },
  { id: 'wb_kolkata_beleghata', name: 'Beleghata', district: 'Kolkata', keywords: ['beleghata', 'beliaghata', 'বেলেঘাটা', 'বেলিয়াঘাটা'] },
  { id: 'wb_kolkata_entally', name: 'Entally', district: 'Kolkata', keywords: ['entally', 'এন্টালি', 'এন্টালী'] },
  { id: 'wb_kolkata_ballygunge', name: 'Ballygunge', district: 'Kolkata', keywords: ['ballygunge', 'ballygunj', 'বালিগঞ্জ', 'বালিগুঞ্জ'] },
  { id: 'wb_kolkata_chowringhee', name: 'Chowringhee', district: 'Kolkata', keywords: ['chowringhee', 'chowringee', 'চৌরঙ্গি', 'চৌরঙ্গী', 'park street', 'পার্ক স্ট্রিট'] },
  { id: 'wb_kolkata_rashbehari', name: 'Rashbehari', district: 'Kolkata', keywords: ['rashbehari', 'রাসবিহারী', 'gariahat', 'গড়িয়াহাট'] },
  { id: 'wb_kolkata_tollygunge', name: 'Tollygunge', district: 'Kolkata', keywords: ['tollygunge', 'tollygunj', 'টালিগঞ্জ', 'টলিগঞ্জ'] },
  { id: 'wb_kolkata_jadavpur', name: 'Jadavpur', district: 'Kolkata', keywords: ['jadavpur', 'যাদবপুর', 'jadavpur university', 'যাদবপুর বিশ্ববিদ্যালয়'] },
  { id: 'wb_kolkata_kasba', name: 'Kasba', district: 'Kolkata', keywords: ['kasba', 'কসবা', 'কাসবা'] },
  { id: 'wb_kolkata_behala_west', name: 'Behala West', district: 'Kolkata', keywords: ['behala', 'বেহালা', 'behala west', 'পশ্চিম বেহালা'] },

  // Howrah constituencies
  { id: 'wb_howrah_howrah_uttar', name: 'Howrah Uttar', district: 'Howrah', keywords: ['howrah uttar', 'north howrah', 'উত্তর হাওড়া', 'হাওড়া উত্তর'] },
  { id: 'wb_howrah_howrah_madhya', name: 'Howrah Madhya', district: 'Howrah', keywords: ['howrah madhya', 'মধ্য হাওড়া', 'হাওড়া মধ্য', 'howrah central'] },
  { id: 'wb_howrah_shibpur', name: 'Shibpur', district: 'Howrah', keywords: ['shibpur', 'sibpur', 'শিবপুর', 'howrah bridge', 'হাওড়া ব্রিজ'] },
  { id: 'wb_howrah_bally', name: 'Bally', district: 'Howrah', keywords: ['bally', 'বালি', 'bali'] },
  { id: 'wb_howrah_uttarpara', name: 'Uttarpara', district: 'Howrah', keywords: ['uttarpara', 'উত্তরপাড়া', 'kotrung'] },

  // North 24 Parganas constituencies
  { id: 'wb_north_24_parganas_barrackpore', name: 'Barrackpore', district: 'North 24 Parganas', keywords: ['barrackpore', 'barrackpur', 'ব্যারাকপুর', 'barrackpore cantonment'] },
  { id: 'wb_north_24_parganas_dum_dum', name: 'Dum Dum', district: 'North 24 Parganas', keywords: ['dum dum', 'dumdum', 'দমদম', 'dum dum airport'] },
  { id: 'wb_north_24_parganas_rajarhat_new_town', name: 'Rajarhat New Town', district: 'North 24 Parganas', keywords: ['rajarhat', 'newtown', 'new town', 'রাজারহাট', 'নিউটাউন', 'action area'] },
  { id: 'wb_north_24_parganas_bidhannagar', name: 'Bidhannagar', district: 'North 24 Parganas', keywords: ['bidhannagar', 'বিধাননগর', 'salt lake', 'সল্ট লেক', 'sector v'] },
  { id: 'wb_north_24_parganas_madhyamgram', name: 'Madhyamgram', district: 'North 24 Parganas', keywords: ['madhyamgram', 'মধ্যমগ্রাম'] },
  { id: 'wb_north_24_parganas_barasat', name: 'Barasat', district: 'North 24 Parganas', keywords: ['barasat', 'বারাসাত', 'বারাসত'] },

  // South 24 Parganas constituencies
  { id: 'wb_south_24_parganas_jadavpur', name: 'Jadavpur', district: 'South 24 Parganas', keywords: ['south jadavpur', 'দক্ষিণ যাদবপুর'] },
  { id: 'wb_south_24_parganas_sonarpur_uttar', name: 'Sonarpur Uttar', district: 'South 24 Parganas', keywords: ['sonarpur', 'সোনারপুর', 'narendrapur'] },
  { id: 'wb_south_24_parganas_budge_budge', name: 'Budge Budge', district: 'South 24 Parganas', keywords: ['budge budge', 'বজবজ', 'budgebudge'] },
  { id: 'wb_south_24_parganas_diamond_harbour', name: 'Diamond Harbour', district: 'South 24 Parganas', keywords: ['diamond harbour', 'ডায়মন্ড হারবার', 'diamond harbor'] },

  // Darjeeling constituencies
  { id: 'wb_darjeeling_darjeeling', name: 'Darjeeling', district: 'Darjeeling', keywords: ['darjeeling', 'দার্জিলিং', 'darjeeling hills', 'gorkhaland'] },
  { id: 'wb_darjeeling_siliguri', name: 'Siliguri', district: 'Darjeeling', keywords: ['siliguri', 'শিলিগুড়ি', 'shiliguri', 'siliguri corridor'] },

  // Jalpaiguri
  { id: 'wb_jalpaiguri_jalpaiguri', name: 'Jalpaiguri', district: 'Jalpaiguri', keywords: ['jalpaiguri', 'জলপাইগুড়ি'] },

  // Cooch Behar
  { id: 'wb_cooch_behar_cooch_behar_uttar', name: 'Cooch Behar Uttar', district: 'Cooch Behar', keywords: ['cooch behar', 'koch bihar', 'কোচবিহার', 'coochbehar'] },

  // Malda
  { id: 'wb_malda_english_bazar', name: 'English Bazar', district: 'Malda', keywords: ['english bazar', 'malda', 'মালদা', 'ইংলিশ বাজার'] },

  // Murshidabad
  { id: 'wb_murshidabad_berhampore', name: 'Berhampore', district: 'Murshidabad', keywords: ['berhampore', 'baharampur', 'মুর্শিদাবাদ', 'বহরমপুর', 'murshidabad'] },

  // Nadia
  { id: 'wb_nadia_krishnanagar_uttar', name: 'Krishnanagar Uttar', district: 'Nadia', keywords: ['krishnanagar', 'কৃষ্ণনগর', 'krishnagar', 'nadia'] },
  { id: 'wb_nadia_ranaghat_uttar_paschim', name: 'Ranaghat Uttar Paschim', district: 'Nadia', keywords: ['ranaghat', 'রানাঘাট'] },

  // Hooghly constituencies
  { id: 'wb_hooghly_serampore', name: 'Serampore', district: 'Hooghly', keywords: ['serampore', 'সেরামপুর', 'srirampore', 'শ্রীরামপুর'] },
  { id: 'wb_hooghly_chandannagar', name: 'Chandannagar', district: 'Hooghly', keywords: ['chandannagar', 'চন্দননগর', 'chandernagore'] },
  { id: 'wb_hooghly_chinsurah', name: 'Chinsurah', district: 'Hooghly', keywords: ['chinsurah', 'chinsura', 'চুঁচুড়া', 'hooghly', 'হুগলি'] },
  { id: 'wb_hooghly_arambag', name: 'Arambag', district: 'Hooghly', keywords: ['arambag', 'arambagh', 'আরামবাগ'] },

  // Purba Bardhaman constituencies
  { id: 'wb_purba_bardhaman_asansol_uttar', name: 'Asansol Uttar', district: 'Purba Bardhaman', keywords: ['asansol uttar', 'north asansol', 'আসানসোল উত্তর'] },
  { id: 'wb_purba_bardhaman_asansol_dakshin', name: 'Asansol Dakshin', district: 'Purba Bardhaman', keywords: ['asansol dakshin', 'south asansol', 'আসানসোল দক্ষিণ', 'asansol', 'আসানসোল'] },
  { id: 'wb_purba_bardhaman_durgapur_purba', name: 'Durgapur Purba', district: 'Purba Bardhaman', keywords: ['durgapur purba', 'east durgapur', 'দুর্গাপুর পূর্ব'] },
  { id: 'wb_purba_bardhaman_durgapur_paschim', name: 'Durgapur Paschim', district: 'Purba Bardhaman', keywords: ['durgapur paschim', 'west durgapur', 'দুর্গাপুর পশ্চিম', 'durgapur', 'দুর্গাপুর'] },
  { id: 'wb_purba_bardhaman_bardhaman_uttar', name: 'Bardhaman Uttar', district: 'Purba Bardhaman', keywords: ['bardhaman', 'burdwan', 'বর্ধমান'] },

  // Purba Medinipur
  { id: 'wb_purba_medinipur_tamluk', name: 'Tamluk', district: 'Purba Medinipur', keywords: ['tamluk', 'তমলুক', 'tamralipta'] },
  { id: 'wb_purba_medinipur_haldia', name: 'Haldia', district: 'Purba Medinipur', keywords: ['haldia', 'হলদিয়া', 'haldia port'] },

  // Paschim Medinipur
  { id: 'wb_paschim_medinipur_midnapore', name: 'Midnapore', district: 'Paschim Medinipur', keywords: ['midnapore', 'medinipur', 'মেদিনীপুর'] },

  // Paschim Bardhaman
  { id: 'wb_paschim_bardhaman_pandaveswar', name: 'Pandaveswar', district: 'Paschim Bardhaman', keywords: ['pandaveswar', 'pandabeswar', 'পাণ্ডবেশ্বর'] },

  // Bankura
  { id: 'wb_bankura_bankura', name: 'Bankura', district: 'Bankura', keywords: ['bankura', 'বাঁকুড়া'] },

  // Purulia
  { id: 'wb_purulia_purulia', name: 'Purulia', district: 'Purulia', keywords: ['purulia', 'পুরুলিয়া'] },

  // Birbhum
  { id: 'wb_birbhum_bolpur', name: 'Bolpur', district: 'Birbhum', keywords: ['bolpur', 'বোলপুর', 'santiniketan', 'শান্তিনিকেতন', 'visva bharati'] },
  { id: 'wb_birbhum_suri', name: 'Suri', district: 'Birbhum', keywords: ['suri', 'সুরি', 'birbhum', 'বীরভূম'] }
];

/**
 * Detect constituency from text
 */
export function detectConstituency(text: string): { id: string; name: string; district: string } | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  // Check each constituency's keywords
  for (const constituency of CONSTITUENCY_KEYWORDS) {
    for (const keyword of constituency.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return {
          id: constituency.id,
          name: constituency.name,
          district: constituency.district
        };
      }
    }
  }

  return null;
}

/**
 * Get all constituency keywords
 */
export function getAllConstituencyKeywords(): ConstituencyKeywords[] {
  return CONSTITUENCY_KEYWORDS;
}

export default {
  analyzeElectionTopics,
  detectTopics,
  getTopicPartyImpact,
  getAllTopicKeywords,
  detectConstituency,
  getAllConstituencyKeywords,
  TOPIC_KEYWORDS,
  CONSTITUENCY_KEYWORDS
};
