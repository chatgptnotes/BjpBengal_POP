/**
 * West Bengal Configuration
 * BJP (Bharatiya Janata Party) Election Campaign
 */

// West Bengal Districts (23)
export const WB_DISTRICTS = [
  'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
  'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram',
  'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
  'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur',
  'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
];

// All Districts
export const ALL_DISTRICTS = [...WB_DISTRICTS];

// Major Cities
export const MAJOR_CITIES = [
  'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
  'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur',
  'Shantipur', 'Darjeeling', 'Jalpaiguri', 'Balurghat'
];

// Assembly Constituencies
export const TOTAL_CONSTITUENCIES = {
  WEST_BENGAL: 294,
  TOTAL: 294
};

// Lok Sabha Constituencies
export const LOK_SABHA_CONSTITUENCIES = 42;

// Major Political Parties in West Bengal
export const WB_POLITICAL_PARTIES = {
  BJP: {
    name: 'Bharatiya Janata Party',
    shortName: 'BJP',
    leader: 'Sunil Bansal', // State President
    color: '#FF9933',
    description: 'Indian People\'s Party',
    symbol: 'Lotus'
  },
  TMC: {
    name: 'All India Trinamool Congress',
    shortName: 'TMC',
    leader: 'Mamata Banerjee',
    color: '#00A651',
    description: 'Trinamool Congress',
    symbol: 'Grass and Flower'
  },
  INC: {
    name: 'Indian National Congress',
    shortName: 'INC',
    leader: 'Adhir Ranjan Chowdhury',
    color: '#19AAED',
    description: 'Congress Party',
    symbol: 'Hand'
  },
  CPM: {
    name: 'Communist Party of India (Marxist)',
    shortName: 'CPM',
    leader: 'Md. Salim',
    color: '#FF0000',
    description: 'Communist Party Marxist',
    symbol: 'Hammer and Sickle'
  },
  CPI: {
    name: 'Communist Party of India',
    shortName: 'CPI',
    leader: 'Swapan Banerjee',
    color: '#ED2E38',
    description: 'Communist Party',
    symbol: 'Corn and Sickle'
  },
  ISF: {
    name: 'Indian Secular Front',
    shortName: 'ISF',
    leader: 'Abbas Siddiqui',
    color: '#00FF00',
    description: 'Secular Front'
  }
};

// West Bengal Specific Issues
export const WB_ELECTION_ISSUES = {
  DEVELOPMENT: {
    name: 'Development',
    nameInBengali: 'উন্নয়ন',
    priority: 'critical',
    description: 'Infrastructure development, industrial growth, economic prosperity'
  },
  JOBS: {
    name: 'Employment',
    nameInBengali: 'কর্মসংস্থান',
    priority: 'critical',
    description: 'Youth unemployment, IT sector jobs, manufacturing sector growth'
  },
  WOMEN_SAFETY: {
    name: 'Women Safety',
    nameInBengali: 'মহিলাদের নিরাপত্তা',
    priority: 'critical',
    description: 'Women security, crime against women, law and order'
  },
  AGRICULTURE: {
    name: 'Agriculture',
    nameInBengali: 'কৃষি',
    priority: 'high',
    description: 'Farmer welfare, PM-KISAN support, MSP, irrigation, farm loans'
  },
  EDUCATION: {
    name: 'Education',
    nameInBengali: 'শিক্ষা',
    priority: 'high',
    description: 'Quality education, school infrastructure, competitive exam preparation'
  },
  HEALTH: {
    name: 'Healthcare',
    nameInBengali: 'স্বাস্থ্যসেবা',
    priority: 'high',
    description: 'Ayushman Bharat, government hospitals, healthcare access, free medicines'
  },
  CORRUPTION: {
    name: 'Corruption',
    nameInBengali: 'দুর্নীতি',
    priority: 'high',
    description: 'Political corruption, transparency in governance, clean administration'
  },
  LAW_ORDER: {
    name: 'Law & Order',
    nameInBengali: 'আইন ও শৃঙ্খলা',
    priority: 'high',
    description: 'Crime control, police reform, political violence prevention'
  },
  INFRASTRUCTURE: {
    name: 'Infrastructure',
    nameInBengali: 'পরিকাঠামো',
    priority: 'medium',
    description: 'Roads, bridges, electricity, water supply, public transport'
  },
  BENGALI_IDENTITY: {
    name: 'Bengali Culture',
    nameInBengali: 'বাঙালি সংস্কৃতি',
    priority: 'medium',
    description: 'Bengali language, culture preservation, heritage conservation'
  },
  REFUGEES: {
    name: 'Refugee Issue',
    nameInBengali: 'শরণার্থী সমস্যা',
    priority: 'medium',
    description: 'Illegal immigration, CAA implementation, border security'
  },
  PENSION: {
    name: 'Social Welfare',
    nameInBengali: 'সামাজিক কল্যাণ',
    priority: 'medium',
    description: 'Old age pension, widow pension, disability benefits'
  }
};

// Caste/Community Demographics (Approximate %)
export const WB_DEMOGRAPHICS = {
  SC: 23, // Scheduled Castes
  ST: 6,  // Scheduled Tribes
  OBC: 40, // Other Backward Classes
  GENERAL: 31, // General/Forward Castes
  MINORITY: {
    MUSLIM: 30,
    CHRISTIAN: 1,
    OTHER: 1
  }
};

// Languages
export const WB_LANGUAGES = [
  { name: 'Bengali', code: 'bn', primary: true },
  { name: 'Hindi', code: 'hi', primary: false },
  { name: 'English', code: 'en', primary: false },
  { name: 'Nepali', code: 'ne', primary: false },
  { name: 'Santali', code: 'sat', primary: false }
];

// Regions
export const WB_REGIONS = {
  NORTH_BENGAL: {
    name: 'North Bengal',
    districts: ['Darjeeling', 'Jalpaiguri', 'Alipurduar', 'Cooch Behar', 'Kalimpong', 'Malda', 'Uttar Dinajpur', 'Dakshin Dinajpur'],
    characteristics: 'Tea gardens, tourism, tribal population'
  },
  SOUTH_BENGAL: {
    name: 'South Bengal',
    districts: ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly', 'Nadia'],
    characteristics: 'Urban centers, industry, services'
  },
  CENTRAL_BENGAL: {
    name: 'Central Bengal',
    districts: ['Murshidabad', 'Birbhum', 'Purba Bardhaman', 'Paschim Bardhaman'],
    characteristics: 'Agricultural belt, historical significance'
  },
  WESTERN_BENGAL: {
    name: 'Western Bengal',
    districts: ['Bankura', 'Purulia', 'Paschim Medinipur', 'Jhargram'],
    characteristics: 'Tribal areas, mining, forests'
  },
  EASTERN_BENGAL: {
    name: 'Eastern Bengal',
    districts: ['Purba Medinipur'],
    characteristics: 'Coastal areas, tourism'
  }
};

// Major News Channels
export const WB_NEWS_CHANNELS = [
  'ABP Ananda', 'Zee 24 Ghanta', 'TV9 Bangla', 'News18 Bangla',
  'Republic Bangla', 'Kolkata TV', 'Times Now Navbharat', 'DD Bangla',
  'Calcutta News', 'R Plus News'
];

// Social Media Influencers
export const WB_INFLUENCERS = {
  BJP: [
    'Amit Malviya', 'Dilip Ghosh', 'Locket Chatterjee', 'Suvendu Adhikari',
    'Babul Supriyo', 'Saumitra Khan'
  ],
  TMC: [
    'Derek O\'Brien', 'Abhishek Banerjee', 'Mahua Moitra', 'Saket Gokhale'
  ],
  NEUTRAL: [
    'Sandip Ghosh', 'Sudipta Datta', 'Arnab Goswami'
  ]
};

// 2021 Assembly Election Results (Sample - Update with actual data)
export const WB_2021_RESULTS = {
  TMC: {
    seats: 213,
    voteShare: 48.0
  },
  BJP: {
    seats: 77,
    voteShare: 38.1
  },
  INC: {
    seats: 0,
    voteShare: 2.9
  },
  CPM: {
    seats: 0,
    voteShare: 4.7
  },
  OTHER: {
    seats: 4,
    voteShare: 6.3
  }
};

// Export default config object
export const WEST_BENGAL_CONFIG = {
  state: 'West Bengal',
  stateCode: 'WB',
  capital: 'Kolkata',
  districts: WB_DISTRICTS,
  majorCities: MAJOR_CITIES,
  totalConstituencies: TOTAL_CONSTITUENCIES,
  lokSabhaSeats: LOK_SABHA_CONSTITUENCIES,
  politicalParties: WB_POLITICAL_PARTIES,
  electionIssues: WB_ELECTION_ISSUES,
  demographics: WB_DEMOGRAPHICS,
  languages: WB_LANGUAGES,
  regions: WB_REGIONS,
  newsChannels: WB_NEWS_CHANNELS,
  influencers: WB_INFLUENCERS,
  lastElectionResults: WB_2021_RESULTS
};

export default WEST_BENGAL_CONFIG;
