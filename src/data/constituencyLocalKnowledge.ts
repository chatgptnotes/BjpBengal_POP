/**
 * Local knowledge base for West Bengal constituencies
 * Contains real issues, landmarks, and cultural aspects for targeted campaigns
 */

export interface LocalKnowledge {
  constituencyId: string;
  localIssues: {
    title: string;
    description: string;
    affectedAreas: string[];
    votersAffected: number;
    severity: 'critical' | 'high' | 'medium';
  }[];
  landmarks: {
    name: string;
    type: 'temple' | 'market' | 'college' | 'hospital' | 'industry' | 'station' | 'religious' | 'natural' | 'historical' | 'educational' | 'sports' | 'recreational' | 'tourist' | 'infrastructure' | 'cultural' | 'heritage';
    significance: string;
  }[];
  culturalEvents: {
    name: string;
    timing: string;
    participation: number;
  }[];
  economicActivities: string[];
  rallyVenues: {
    name: string;
    capacity: number;
    location: string;
  }[];
  campaignMottos: {
    theme: string;
    slogan: string;
    target: string;
  }[];
}

export const CONSTITUENCY_LOCAL_KNOWLEDGE: LocalKnowledge[] = [
  // North Bengal - Tea Garden Areas
  {
    constituencyId: 'alipurduar-1',
    localIssues: [
      {
        title: 'Tea Garden Worker Wage Crisis',
        description: 'Daily wages stuck at ₹202 while Kerala pays ₹400',
        affectedAreas: ['Madarihat Tea Estate', 'Birpara Tea Garden', 'Central Dooars'],
        votersAffected: 45000,
        severity: 'critical'
      },
      {
        title: 'Elephant Attacks on Villages',
        description: 'Weekly elephant raids destroying crops and homes',
        affectedAreas: ['Birpara', 'Madarihat', 'Forest villages'],
        votersAffected: 25000,
        severity: 'high'
      },
      {
        title: 'Closed Tea Gardens',
        description: 'Red Bank and Dharanipur gardens closed, workers starving',
        affectedAreas: ['Red Bank', 'Dharanipur', 'Surrounding villages'],
        votersAffected: 15000,
        severity: 'critical'
      }
    ],
    landmarks: [
      { name: 'Jaldapara National Park', type: 'industry', significance: 'Tourism potential unutilized' },
      { name: 'Madarihat Tea Auction Center', type: 'market', significance: 'Tea trade hub' },
      { name: 'Birpara Hospital', type: 'hospital', significance: 'Only medical facility for 50,000' }
    ],
    culturalEvents: [
      { name: 'Tea Garden Festival', timing: 'December', participation: 30000 },
      { name: 'Rajbongshi Cultural Meet', timing: 'February', participation: 20000 }
    ],
    economicActivities: ['Tea cultivation', 'Tourism', 'Forest products', 'Small trade'],
    rallyVenues: [
      { name: 'Madarihat Stadium', capacity: 25000, location: 'Central Madarihat' },
      { name: 'Birpara Ground', capacity: 15000, location: 'Birpara Bazar' }
    ],
    campaignMottos: [
      { theme: 'Tea Garden Revival', slogan: 'Chai Baganer Unnati, BJP r Sathe Pragati', target: 'Tea workers' },
      { theme: 'Wildlife Protection', slogan: 'Manush o Hathi, Shantite Thaki', target: 'Forest villages' }
    ]
  },

  // Urban Kolkata
  {
    constituencyId: 'kolkata-1',
    localIssues: [
      {
        title: 'Burrabazar Fire Safety Crisis',
        description: 'Repeated fires in congested market, no safety measures',
        affectedAreas: ['Burrabazar', 'Posta', 'Jorasanko'],
        votersAffected: 35000,
        severity: 'critical'
      },
      {
        title: 'Heritage Building Collapse',
        description: 'Colonial buildings collapsing, families displaced',
        affectedAreas: ['Bowbazar', 'Central Avenue', 'Chitpur'],
        votersAffected: 20000,
        severity: 'high'
      },
      {
        title: 'Hawker Menace on Footpaths',
        description: 'TMC-backed hawkers blocking pedestrian movement',
        affectedAreas: ['Bentinck Street', 'Central Avenue', 'BB Ganguly Street'],
        votersAffected: 40000,
        severity: 'medium'
      }
    ],
    landmarks: [
      { name: 'Nakhoda Masjid', type: 'temple', significance: 'Largest mosque in Kolkata' },
      { name: 'Burrabazar Market', type: 'market', significance: 'Wholesale trade hub' },
      { name: 'Calcutta University', type: 'college', significance: 'Historic education center' }
    ],
    culturalEvents: [
      { name: 'Eid-ul-Fitr', timing: 'As per calendar', participation: 50000 },
      { name: 'Durga Puja', timing: 'September-October', participation: 30000 }
    ],
    economicActivities: ['Wholesale trade', 'Retail business', 'Small manufacturing', 'Services'],
    rallyVenues: [
      { name: 'Shahid Minar Maidan', capacity: 30000, location: 'Esplanade' },
      { name: 'Mohammed Ali Park', capacity: 20000, location: 'Central Kolkata' }
    ],
    campaignMottos: [
      { theme: 'Save Heritage Kolkata', slogan: 'Aitihya Bachao, Kolkata Bachao', target: 'Heritage lovers' },
      { theme: 'Trader Rights', slogan: 'Byabsayi Bachao, TMC Hatao', target: 'Business community' }
    ]
  },

  // Industrial Belt
  {
    constituencyId: 'asansol-1',
    localIssues: [
      {
        title: 'Coal Mine Closures',
        description: 'ECL mines closing, thousands jobless',
        affectedAreas: ['Kajora', 'Sodepur', 'Parasea'],
        votersAffected: 40000,
        severity: 'critical'
      },
      {
        title: 'Illegal Coal Mining Mafia',
        description: 'TMC-backed illegal mining destroying environment',
        affectedAreas: ['Raniganj', 'Jamuria', 'Border areas'],
        votersAffected: 30000,
        severity: 'high'
      },
      {
        title: 'IISCO Steel Plant Crisis',
        description: 'Modernization stalled, workers suffering',
        affectedAreas: ['Burnpur', 'Hirapur', 'IISCO Colony'],
        votersAffected: 25000,
        severity: 'high'
      }
    ],
    landmarks: [
      { name: 'IISCO Steel Plant', type: 'industry', significance: 'Major employment source' },
      { name: 'Kalyaneshwari Temple', type: 'temple', significance: 'Religious center' },
      { name: 'Asansol Engineering College', type: 'college', significance: 'Technical education hub' }
    ],
    culturalEvents: [
      { name: 'Kali Puja', timing: 'October-November', participation: 40000 },
      { name: 'Poush Mela', timing: 'December', participation: 25000 }
    ],
    economicActivities: ['Coal mining', 'Steel production', 'Small industries', 'Railway jobs'],
    rallyVenues: [
      { name: 'Polo Ground', capacity: 50000, location: 'Central Asansol' },
      { name: 'Burnpur Maidan', capacity: 30000, location: 'Burnpur' }
    ],
    campaignMottos: [
      { theme: 'Industrial Revival', slogan: 'Karkhana Kholo, Chakri Dao', target: 'Workers' },
      { theme: 'Anti-Mafia', slogan: 'Koyla Chor TMC, Nyay Dibe BJP', target: 'Mining areas' }
    ]
  },

  // Rural Agricultural
  {
    constituencyId: 'bardhaman-1',
    localIssues: [
      {
        title: 'Potato Storage Crisis',
        description: 'No cold storage, farmers forced to sell cheap',
        affectedAreas: ['Memari', 'Galsi', 'Raina'],
        votersAffected: 35000,
        severity: 'critical'
      },
      {
        title: 'Canal Water Shortage',
        description: 'DVC canals dry, Boro cultivation affected',
        affectedAreas: ['Khandaghosh', 'Raina', 'Jamalpur'],
        votersAffected: 40000,
        severity: 'high'
      },
      {
        title: 'Paddy Procurement Scam',
        description: 'TMC syndicate in paddy purchase, farmers cheated',
        affectedAreas: ['All blocks'],
        votersAffected: 50000,
        severity: 'critical'
      }
    ],
    landmarks: [
      { name: 'Curzon Gate', type: 'station', significance: 'Historic landmark' },
      { name: 'Sarbamangala Temple', type: 'temple', significance: '108 Shiva temples' },
      { name: 'Burdwan University', type: 'college', significance: 'Education hub' }
    ],
    culturalEvents: [
      { name: 'Poush Parbon', timing: 'January', participation: 30000 },
      { name: 'Gajan Festival', timing: 'April', participation: 20000 }
    ],
    economicActivities: ['Paddy cultivation', 'Potato farming', 'Dairy', 'Small trade'],
    rallyVenues: [
      { name: 'Golapbag Stadium', capacity: 35000, location: 'Burdwan Town' },
      { name: 'Rajbati Ground', capacity: 25000, location: 'Near Rajbati' }
    ],
    campaignMottos: [
      { theme: 'Farmer First', slogan: 'Krishak Bachle, Bangla Bachbe', target: 'Farmers' },
      { theme: 'Water Rights', slogan: 'Jal Adhikar, Krishaker Adhikar', target: 'Rural areas' }
    ]
  },

  // Border Areas
  {
    constituencyId: 'coochbehar-1',
    localIssues: [
      {
        title: 'Bangladeshi Infiltration',
        description: 'Illegal immigration changing demographics',
        affectedAreas: ['Dinhata', 'Sitalkuchi', 'Border villages'],
        votersAffected: 45000,
        severity: 'critical'
      },
      {
        title: 'Enclave Exchange Problems',
        description: 'Former enclave residents without facilities',
        affectedAreas: ['Mekhliganj', 'Haldibari', 'Enclave areas'],
        votersAffected: 20000,
        severity: 'high'
      },
      {
        title: 'Flood Every Monsoon',
        description: 'Torsa, Raidak rivers flood annually',
        affectedAreas: ['Tufanganj', 'Coochbehar', 'River areas'],
        votersAffected: 60000,
        severity: 'critical'
      }
    ],
    landmarks: [
      { name: 'Coochbehar Palace', type: 'temple', significance: 'Royal heritage' },
      { name: 'Madan Mohan Temple', type: 'temple', significance: 'Religious center' },
      { name: 'Rasikbill', type: 'industry', significance: 'Bird sanctuary tourism' }
    ],
    culturalEvents: [
      { name: 'Ras Mela', timing: 'November', participation: 50000 },
      { name: 'Poush Mela', timing: 'January', participation: 40000 }
    ],
    economicActivities: ['Agriculture', 'Tobacco cultivation', 'Border trade', 'Tourism'],
    rallyVenues: [
      { name: 'Rashmela Ground', capacity: 60000, location: 'Coochbehar Town' },
      { name: 'MJN Stadium', capacity: 30000, location: 'Central Coochbehar' }
    ],
    campaignMottos: [
      { theme: 'Secure Borders', slogan: 'Seema Suraksha, Desh Raksha', target: 'Border areas' },
      { theme: 'Flood Control', slogan: 'Baan Theke Mukti, BJP Dibe Sukti', target: 'Flood victims' }
    ]
  },

  // Sundarbans
  {
    constituencyId: 'joynagar-1',
    localIssues: [
      {
        title: 'Cyclone Amphan Rehabilitation',
        description: 'Still living under tarpaulin after 3 years',
        affectedAreas: ['Kultali', 'Jaynagar', 'Coastal villages'],
        votersAffected: 40000,
        severity: 'critical'
      },
      {
        title: 'Tiger Attacks Increasing',
        description: 'Monthly tiger attacks, no compensation',
        affectedAreas: ['Gosaba', 'Kultali', 'Forest villages'],
        votersAffected: 20000,
        severity: 'high'
      },
      {
        title: 'Saline Water Destroying Crops',
        description: 'Embankment breach, farmland becoming saline',
        affectedAreas: ['All coastal blocks'],
        votersAffected: 50000,
        severity: 'critical'
      }
    ],
    landmarks: [
      { name: 'Sundarbans National Park', type: 'industry', significance: 'World Heritage Site' },
      { name: 'Bonbibi Temple', type: 'temple', significance: 'Forest deity worship' },
      { name: 'Kultali Bridge', type: 'station', significance: 'Connectivity lifeline' }
    ],
    culturalEvents: [
      { name: 'Bonbibi Puja', timing: 'January', participation: 30000 },
      { name: 'Ganga Sagar Mela Route', timing: 'January', participation: 100000 }
    ],
    economicActivities: ['Fishing', 'Honey collection', 'Prawn farming', 'Tourism'],
    rallyVenues: [
      { name: 'Jaynagar Stadium', capacity: 25000, location: 'Jaynagar Town' },
      { name: 'Kultali Ground', capacity: 20000, location: 'Kultali Bazar' }
    ],
    campaignMottos: [
      { theme: 'Cyclone Relief', slogan: 'Amphan er Khoti, Puro Korbe Modi', target: 'Cyclone victims' },
      { theme: 'Save Sundarbans', slogan: 'Sundarbans Bachao, Manush Bachao', target: 'Forest dwellers' }
    ]
  },

  // Add specific entries for key constituencies
  {
    constituencyId: 'nandigram-1',
    localIssues: [
      {
        title: 'Chemical Hub Land Acquisition',
        description: 'Farmers fear repeat of 2007 violence',
        affectedAreas: ['Nandigram', 'Khejuri', 'Haldia'],
        votersAffected: 60000,
        severity: 'critical'
      },
      {
        title: '2007 Violence Justice',
        description: '14 martyrs families still awaiting justice',
        affectedAreas: ['Sonachura', 'Bhangabera', 'Gokulnagar'],
        votersAffected: 30000,
        severity: 'high'
      }
    ],
    landmarks: [
      { name: 'Sonachura Memorial', type: 'temple', significance: '2007 martyrs memorial' },
      { name: 'Nandigram Block Office', type: 'station', significance: 'Administrative center' }
    ],
    culturalEvents: [
      { name: 'Shahid Diwas', timing: 'March 14', participation: 50000 },
      { name: 'Krishak Diwas', timing: 'November', participation: 30000 }
    ],
    economicActivities: ['Paddy cultivation', 'Fishing', 'Small trade'],
    rallyVenues: [
      { name: 'Sonachura Ground', capacity: 40000, location: 'Historic site' },
      { name: 'Nandigram Bus Stand', capacity: 30000, location: 'Central Nandigram' }
    ],
    campaignMottos: [
      { theme: 'Justice for 2007', slogan: 'Nyay Chai, BJP Asha Tai', target: 'Victim families' },
      { theme: 'No Land Grab', slogan: 'Jomi Raksha, Krishak Suraksha', target: 'Farmers' }
    ]
  },

  // Bankura District - Tribal Belt Issues
  {
    constituencyId: 'bankura-1',
    localIssues: [
      {
        title: 'Tribal Land Rights Crisis',
        description: 'Santhal and other tribal communities facing land grabbing and forest rights violations',
        affectedAreas: ['Saltora', 'Mejia', 'Gangajalghati'],
        votersAffected: 35000,
        severity: 'critical' as const
      },
      {
        title: 'Mining Displacement without Compensation',
        description: 'Stone quarrying and sand mining displacing villages without proper rehabilitation',
        affectedAreas: ['Saltora Block', 'Chhatna', 'Indpur'],
        votersAffected: 28000,
        severity: 'high' as const
      },
      {
        title: 'Drought and Water Scarcity',
        description: 'Chronic water shortage affecting agriculture and drinking water supply',
        affectedAreas: ['Gangajalghati', 'Mejia', 'Bankura Sadar'],
        votersAffected: 42000,
        severity: 'critical' as const
      }
    ],
    landmarks: [
      { name: 'Susunia Hill', type: 'religious', significance: 'Ancient archaeological site with tribal heritage' },
      { name: 'Biharinath Hill', type: 'natural', significance: 'Highest peak in Bankura, tribal sacred site' },
      { name: 'Jairambati Temple', type: 'religious', significance: 'Holy Mother Sarada Devi birthplace' }
    ],
    culturalEvents: [
      { name: 'Tusu Festival', timing: 'January', participation: 50000 },
      { name: 'Jhumur Dance Festival', timing: 'February', participation: 30000 },
      { name: 'Bishnupur Mela', timing: 'December', participation: 100000 }
    ],
    economicActivities: ['Agriculture', 'Handicrafts', 'Stone Quarrying', 'Terracotta Art'],
    rallyVenues: [
      { name: 'Saltora Stadium', capacity: 20000, location: 'Saltora Town' },
      { name: 'Bankura Zilla School Ground', capacity: 35000, location: 'Bankura' },
      { name: 'Bishnupur Mela Ground', capacity: 40000, location: 'Bishnupur' }
    ],
    campaignMottos: [
      { theme: 'tribal_rights', slogan: 'Adivasi Adhikar, BJP Sarkar', target: 'Tribal voters' },
      { theme: 'water_crisis', slogan: 'Jol Jobon Jomi, BJP r Protishruti', target: 'Farmers' },
      { theme: 'development', slogan: 'Bankura r Unnayan, BJP r Obhiyan', target: 'General voters' }
    ]
  },

  // Birbhum District - Cultural Heritage
  {
    constituencyId: 'birbhum-2',
    localIssues: [
      {
        title: 'Visva-Bharati University Autonomy Crisis',
        description: 'State interference in university matters affecting academic freedom',
        affectedAreas: ['Santiniketan', 'Sriniketan', 'Bolpur'],
        votersAffected: 25000,
        severity: 'high' as const
      },
      {
        title: 'Artisan and Handicraft Crisis',
        description: 'Traditional Kantha and Batik artisans losing livelihood due to lack of support',
        affectedAreas: ['Nanoor', 'Illambazar', 'Bolpur'],
        votersAffected: 18000,
        severity: 'high' as const
      },
      {
        title: 'Stone Crusher Pollution',
        description: 'Illegal stone crushers causing severe air pollution and health hazards',
        affectedAreas: ['Mohammad Bazar', 'Suri', 'Sainthia'],
        votersAffected: 35000,
        severity: 'critical' as const
      }
    ],
    landmarks: [
      { name: 'Visva-Bharati University', type: 'educational', significance: 'Tagore heritage site' },
      { name: 'Kankalitala Temple', type: 'religious', significance: 'Shakti Peetha' },
      { name: 'Nalhati Rajbari', type: 'historical', significance: 'Heritage palace' }
    ],
    culturalEvents: [
      { name: 'Poush Mela', timing: 'December', participation: 500000 },
      { name: 'Basanta Utsav', timing: 'March', participation: 100000 },
      { name: 'Baul Fakir Utsav', timing: 'January', participation: 75000 }
    ],
    economicActivities: ['Education Tourism', 'Handicrafts', 'Agriculture', 'Cultural Tourism'],
    rallyVenues: [
      { name: 'Santiniketan Ground', capacity: 50000, location: 'Bolpur' },
      { name: 'Suri Stadium', capacity: 30000, location: 'Suri' },
      { name: 'Rampurhat Maidan', capacity: 25000, location: 'Rampurhat' }
    ],
    campaignMottos: [
      { theme: 'education', slogan: 'Bidya r Bikash, BJP r Vishwas', target: 'Students and academics' },
      { theme: 'heritage', slogan: 'Sanskritir Raksha, BJP r Lakshya', target: 'Cultural community' },
      { theme: 'artisans', slogan: 'Shilper Samman, BJP r Abhiman', target: 'Artisan community' }
    ]
  },

  // Darjeeling District - Hill Issues
  {
    constituencyId: 'darjeeling-1',
    localIssues: [
      {
        title: 'Gorkhaland Statehood Demand',
        description: 'Long-pending demand for separate state affecting political stability',
        affectedAreas: ['Darjeeling', 'Kalimpong', 'Kurseong', 'Mirik'],
        votersAffected: 150000,
        severity: 'critical' as const
      },
      {
        title: 'Tea Garden Worker Crisis',
        description: 'Unpaid wages, closed gardens, and worker migration',
        affectedAreas: ['Happy Valley', 'Makaibari', 'Castleton', 'Jungpana'],
        votersAffected: 60000,
        severity: 'critical' as const
      },
      {
        title: 'Landslide and Infrastructure',
        description: 'Frequent landslides destroying roads and homes, poor disaster management',
        affectedAreas: ['Darjeeling Town', 'Sukhiapokhri', 'Jorebunglow', 'Ghoom'],
        votersAffected: 40000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Tiger Hill', type: 'tourist', significance: 'Sunrise point over Kanchenjunga' },
      { name: 'Darjeeling Mall', type: 'historical', significance: 'Heritage promenade' },
      { name: 'Japanese Peace Pagoda', type: 'religious', significance: 'Buddhist monument' }
    ],
    culturalEvents: [
      { name: 'Darjeeling Carnival', timing: 'December', participation: 50000 },
      { name: 'Buddha Jayanti', timing: 'May', participation: 30000 },
      { name: 'Losar Festival', timing: 'February', participation: 40000 }
    ],
    economicActivities: ['Tea Production', 'Tourism', 'Education', 'Handicrafts'],
    rallyVenues: [
      { name: 'Chowrasta', capacity: 15000, location: 'Darjeeling Mall' },
      { name: 'Lebong Ground', capacity: 25000, location: 'Lebong' },
      { name: 'Motor Stand', capacity: 10000, location: 'Darjeeling Town' }
    ],
    campaignMottos: [
      { theme: 'identity', slogan: 'Gorkha Gaurav, BJP Ke Saath', target: 'Gorkha community' },
      { theme: 'development', slogan: 'Pahar Ko Pragati, BJP Ki Guarantee', target: 'Hill residents' },
      { theme: 'workers', slogan: 'Chai Mazdoor Kalyan, BJP Ka Abhiyan', target: 'Tea workers' }
    ]
  },

  // Howrah District - Industrial Issues
  {
    constituencyId: 'howrah-1',
    localIssues: [
      {
        title: 'Howrah Bridge Traffic Crisis',
        description: 'Daily gridlock affecting lakhs of commuters and emergency services',
        affectedAreas: ['Howrah Station', 'Shibpur', 'Salkia', 'Bantra'],
        votersAffected: 200000,
        severity: 'critical' as const
      },
      {
        title: 'Industrial Closure and Job Loss',
        description: 'Foundries and engineering units closing, massive unemployment',
        affectedAreas: ['Belur', 'Liluah', 'Salkia', 'Bamangachi'],
        votersAffected: 75000,
        severity: 'critical' as const
      },
      {
        title: 'Hooghly River Pollution',
        description: 'Industrial waste and sewage destroying river ecosystem and livelihoods',
        affectedAreas: ['Shibpur Ghat', 'Ramkrishnapur Ghat', 'Botanical Garden'],
        votersAffected: 50000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Howrah Bridge', type: 'infrastructure', significance: 'Iconic connector to Kolkata' },
      { name: 'Belur Math', type: 'religious', significance: 'Ramakrishna Mission headquarters' },
      { name: 'Indian Botanical Garden', type: 'natural', significance: '273-year-old botanical heritage' }
    ],
    culturalEvents: [
      { name: 'Belur Math Celebration', timing: 'January', participation: 100000 },
      { name: 'Jagaddhatri Puja', timing: 'November', participation: 200000 },
      { name: 'Howrah Bridge Festival', timing: 'February', participation: 50000 }
    ],
    economicActivities: ['Engineering Industry', 'Foundries', 'Jute Mills', 'Transport Hub'],
    rallyVenues: [
      { name: 'Dumurjola Stadium', capacity: 60000, location: 'Howrah Maidan' },
      { name: 'Shibpur Ground', capacity: 30000, location: 'Shibpur' },
      { name: 'Santragachi Maidan', capacity: 40000, location: 'Santragachi' }
    ],
    campaignMottos: [
      { theme: 'industry', slogan: 'Karkhana Khulega, Howrah Jitega', target: 'Industrial workers' },
      { theme: 'infrastructure', slogan: 'Naya Pul, Naya Bhavishya', target: 'Daily commuters' },
      { theme: 'employment', slogan: 'Rozgar Ki Guarantee, BJP Ki Warranty', target: 'Unemployed youth' }
    ]
  },

  // Murshidabad District - Minority & Border Issues
  {
    constituencyId: 'murshidabad-1',
    localIssues: [
      {
        title: 'Bangladesh Border Infiltration',
        description: 'Illegal immigration changing demographics and straining resources',
        affectedAreas: ['Lalgola', 'Bhagabangola', 'Raninagar', 'Domkal'],
        votersAffected: 120000,
        severity: 'critical' as const
      },
      {
        title: 'Beedi Industry Crisis',
        description: 'Traditional beedi workers losing jobs due to GST and mechanization',
        affectedAreas: ['Jangipur', 'Murshidabad', 'Aurangabad', 'Suti'],
        votersAffected: 80000,
        severity: 'high' as const
      },
      {
        title: 'River Erosion by Ganga-Padma',
        description: 'Villages disappearing due to river erosion, thousands displaced',
        affectedAreas: ['Samserganj', 'Dhulian', 'Farakka', 'Raghunathganj'],
        votersAffected: 65000,
        severity: 'critical' as const
      }
    ],
    landmarks: [
      { name: 'Hazarduari Palace', type: 'historical', significance: 'Nawab era heritage' },
      { name: 'Katra Mosque', type: 'religious', significance: 'Murshid Quli Khan monument' },
      { name: 'Farakka Barrage', type: 'infrastructure', significance: 'International water dispute site' }
    ],
    culturalEvents: [
      { name: 'Murshidabad Heritage Festival', timing: 'December', participation: 75000 },
      { name: 'Bera Festival', timing: 'September', participation: 100000 },
      { name: 'Silk Festival', timing: 'November', participation: 50000 }
    ],
    economicActivities: ['Silk Weaving', 'Beedi Making', 'Agriculture', 'Mango Cultivation'],
    rallyVenues: [
      { name: 'Berhampore Stadium', capacity: 40000, location: 'Berhampore' },
      { name: 'Lalbagh Parade Ground', capacity: 50000, location: 'Murshidabad' },
      { name: 'Jangipur College Ground', capacity: 25000, location: 'Jangipur' }
    ],
    campaignMottos: [
      { theme: 'security', slogan: 'Seema Suraksha, Desh Raksha', target: 'Border residents' },
      { theme: 'heritage', slogan: 'Virasat Bachao, BJP Ke Saath Aao', target: 'Cultural preservationists' },
      { theme: 'livelihood', slogan: 'Beedi-Silk-Krishi, Sabka Vikas Nishchit', target: 'Traditional workers' }
    ]
  },

  // North 24 Parganas - Urban-Rural Mix
  {
    constituencyId: 'north24parganas-1',
    localIssues: [
      {
        title: 'Sandeshkhali Violence and Lawlessness',
        description: 'TMC-backed land mafia and violence against women',
        affectedAreas: ['Sandeshkhali', 'Basirhat', 'Minakhan', 'Hasnabad'],
        votersAffected: 150000,
        severity: 'critical' as const
      },
      {
        title: 'Salt Lake Waterlogging',
        description: 'IT hub facing severe waterlogging, affecting businesses and residents',
        affectedAreas: ['Salt Lake Sector V', 'Rajarhat', 'New Town', 'Baguiati'],
        votersAffected: 100000,
        severity: 'high' as const
      },
      {
        title: 'Illegal Fish Farming Mafia',
        description: 'Agricultural land grabbed for illegal fish farms, farmers threatened',
        affectedAreas: ['Minakhan', 'Basirhat', 'Haroa', 'Deganga'],
        votersAffected: 75000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Dakshineswar Temple', type: 'religious', significance: 'Kali temple, Ramakrishna association' },
      { name: 'Salt Lake Stadium', type: 'sports', significance: 'Largest stadium in India' },
      { name: 'Eco Park', type: 'recreational', significance: 'Urban ecological park' }
    ],
    culturalEvents: [
      { name: 'Dakshineswar Kali Puja', timing: 'November', participation: 200000 },
      { name: 'Basirhat Carnival', timing: 'December', participation: 50000 },
      { name: 'Rajarhat Durga Puja', timing: 'October', participation: 300000 }
    ],
    economicActivities: ['IT Industry', 'Fisheries', 'Agriculture', 'Real Estate'],
    rallyVenues: [
      { name: 'Salt Lake Stadium', capacity: 85000, location: 'Bidhannagar' },
      { name: 'Basirhat Stadium', capacity: 25000, location: 'Basirhat' },
      { name: 'Barrackpore Parade Ground', capacity: 35000, location: 'Barrackpore' }
    ],
    campaignMottos: [
      { theme: 'justice', slogan: 'Sandeshkhali Nyay, BJP Ka Vaada', target: 'Violence victims' },
      { theme: 'development', slogan: 'IT Hub Se Smart City', target: 'Urban professionals' },
      { theme: 'farmers', slogan: 'Krishak Suraksha, BJP Ki Parakashtha', target: 'Farmers' }
    ]
  },

  // Purulia District - Jangalmahal Issues
  {
    constituencyId: 'purulia-1',
    localIssues: [
      {
        title: 'Maoist Violence Legacy',
        description: 'Areas still affected by past Maoist violence, lack of development',
        affectedAreas: ['Ayodhya Hills', 'Bandwan', 'Balarampur', 'Jhalda'],
        votersAffected: 45000,
        severity: 'high' as const
      },
      {
        title: 'Chronic Drought and Migration',
        description: 'Severe water crisis forcing mass migration for work',
        affectedAreas: ['Puncha', 'Arsha', 'Jhalda', 'Bagmundi'],
        votersAffected: 60000,
        severity: 'critical' as const
      },
      {
        title: 'Tribal Education Crisis',
        description: 'Schools without teachers, high dropout rates among tribal children',
        affectedAreas: ['Manbazar', 'Bundwan', 'Barabazar', 'Arsha'],
        votersAffected: 35000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Ayodhya Hills', type: 'natural', significance: 'Tribal sacred hills' },
      { name: 'Joychandi Pahar', type: 'religious', significance: 'Shakti worship site' },
      { name: 'Pakhi Pahar', type: 'natural', significance: 'Bird sanctuary' }
    ],
    culturalEvents: [
      { name: 'Chhau Dance Festival', timing: 'March', participation: 100000 },
      { name: 'Tusu Parab', timing: 'January', participation: 75000 },
      { name: 'Bandna Festival', timing: 'November', participation: 50000 }
    ],
    economicActivities: ['Lac Cultivation', 'Coal Mining', 'Chhau Mask Making', 'Agriculture'],
    rallyVenues: [
      { name: 'Purulia Stadium', capacity: 30000, location: 'Purulia Town' },
      { name: 'Raghunathpur Ground', capacity: 20000, location: 'Raghunathpur' },
      { name: 'Jhalda Maidan', capacity: 15000, location: 'Jhalda' }
    ],
    campaignMottos: [
      { theme: 'tribal', slogan: 'Adim Janjati Unnati, BJP Ki Prathmikata', target: 'Tribal community' },
      { theme: 'water', slogan: 'Jal Sankat Mukti, BJP Ki Shakti', target: 'Drought-affected' },
      { theme: 'development', slogan: 'Jangalmahal Jagega, BJP Sang Badhega', target: 'All voters' }
    ]
  },

  // South 24 Parganas - Sundarbans Issues
  {
    constituencyId: 'south24parganas-1',
    localIssues: [
      {
        title: 'Tiger Attacks and Man-Animal Conflict',
        description: 'Frequent tiger attacks, no compensation, livelihood crisis',
        affectedAreas: ['Gosaba', 'Hingalganj', 'Kultali', 'Patharpratima'],
        votersAffected: 50000,
        severity: 'critical' as const
      },
      {
        title: 'Cyclone Devastation (Amphan/Yaas)',
        description: 'Repeated cyclones destroying homes, embankments breached',
        affectedAreas: ['Kakdwip', 'Namkhana', 'Sagar Island', 'Frasergunj'],
        votersAffected: 150000,
        severity: 'critical' as const
      },
      {
        title: 'Saline Water Intrusion',
        description: 'Agricultural land becoming uncultivable due to salinity',
        affectedAreas: ['Mathurapur', 'Raidighi', 'Mandirbazar', 'Kultali'],
        votersAffected: 80000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Sundarbans National Park', type: 'natural', significance: 'UNESCO World Heritage, Tiger Reserve' },
      { name: 'Gangasagar', type: 'religious', significance: 'Holy confluence, Makar Sankranti pilgrimage' },
      { name: 'Diamond Harbour', type: 'historical', significance: 'Colonial port town' }
    ],
    culturalEvents: [
      { name: 'Gangasagar Mela', timing: 'January', participation: 1000000 },
      { name: 'Sundarbans Festival', timing: 'December', participation: 50000 },
      { name: 'Bonbibi Puja', timing: 'Throughout year', participation: 100000 }
    ],
    economicActivities: ['Fishing', 'Honey Collection', 'Prawn Farming', 'Eco-tourism'],
    rallyVenues: [
      { name: 'Diamond Harbour Stadium', capacity: 25000, location: 'Diamond Harbour' },
      { name: 'Kakdwip Ground', capacity: 20000, location: 'Kakdwip' },
      { name: 'Baruipur Stadium', capacity: 30000, location: 'Baruipur' }
    ],
    campaignMottos: [
      { theme: 'disaster', slogan: 'Aapda Se Raksha, BJP Ki Bhasha', target: 'Cyclone victims' },
      { theme: 'sundarbans', slogan: 'Sundarban Bachao, BJP Ke Saath Aao', target: 'Forest dwellers' },
      { theme: 'livelihood', slogan: 'Machli-Madhu-Krishi, Sabki Suraksha Vishesh', target: 'Traditional workers' }
    ]
  },

  // Kolkata North - Urban Poor Issues
  {
    constituencyId: 'kolkata-north-1',
    localIssues: [
      {
        title: 'Slum Eviction Without Rehabilitation',
        description: 'Forced evictions in Bagbazar, Shyambazar without alternative housing',
        affectedAreas: ['Bagbazar', 'Shyambazar', 'Hatibagan', 'Ultadanga'],
        votersAffected: 75000,
        severity: 'critical' as const
      },
      {
        title: 'Hawker Harassment and Extortion',
        description: 'Daily extortion by TMC-backed syndicates from street vendors',
        affectedAreas: ['Shyambazar', 'Hatibagan Market', 'Sovabazar', 'Beniatola'],
        votersAffected: 40000,
        severity: 'high' as const
      },
      {
        title: 'Heritage Building Collapse',
        description: 'Colonial-era buildings collapsing, residents at risk',
        affectedAreas: ['North Kolkata Heritage Zone', 'Chitpur', 'Jorasanko', 'Pathuriaghata'],
        votersAffected: 30000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Jorasanko Thakurbari', type: 'cultural', significance: 'Tagore birthplace' },
      { name: 'Marble Palace', type: 'heritage', significance: '19th-century mansion' },
      { name: 'Kumartuli', type: 'cultural', significance: 'Idol-making hub' }
    ],
    culturalEvents: [
      { name: 'Kumartuli Durga Puja', timing: 'October', participation: 500000 },
      { name: 'Kali Puja North Kolkata', timing: 'November', participation: 300000 },
      { name: 'Poila Boishakh', timing: 'April', participation: 200000 }
    ],
    economicActivities: ['Small Business', 'Idol Making', 'Jewelry', 'Traditional Crafts'],
    rallyVenues: [
      { name: 'Hedua Park', capacity: 15000, location: 'Hatibagan' },
      { name: 'Shyambazar Five Point', capacity: 20000, location: 'Shyambazar' },
      { name: 'College Square', capacity: 25000, location: 'College Street' }
    ],
    campaignMottos: [
      { theme: 'urban_poor', slogan: 'Gareeb Ka Ghar, BJP Ka Adhaar', target: 'Slum dwellers' },
      { theme: 'heritage', slogan: 'Virasat Bachao, Vote BJP Ko Dao', target: 'Heritage residents' },
      { theme: 'vendors', slogan: 'Footpath Se Adhikar Tak', target: 'Street vendors' }
    ]
  },

  // Jalpaiguri - Tea and Forest Issues
  {
    constituencyId: 'jalpaiguri-1',
    localIssues: [
      {
        title: 'Elephant-Human Conflict',
        description: 'Daily elephant raids destroying crops and homes, multiple deaths',
        affectedAreas: ['Nagrakata', 'Chalsa', 'Matiali', 'Madarihat'],
        votersAffected: 55000,
        severity: 'critical' as const
      },
      {
        title: 'Dooars Tea Garden Closure',
        description: '15 tea gardens closed, workers starving without wages for months',
        affectedAreas: ['Birpara', 'Kalchini', 'Alipurduar', 'Madarihat'],
        votersAffected: 70000,
        severity: 'critical' as const
      },
      {
        title: 'Flood and River Erosion',
        description: 'Annual floods from Teesta and Diana rivers displacing thousands',
        affectedAreas: ['Maynaguri', 'Dhupguri', 'Jalpaiguri Sadar', 'Rajganj'],
        votersAffected: 90000,
        severity: 'high' as const
      }
    ],
    landmarks: [
      { name: 'Gorumara National Park', type: 'natural', significance: 'Rhino habitat' },
      { name: 'Jalpesh Temple', type: 'religious', significance: 'Ancient Shiva temple' },
      { name: 'Teesta Barrage', type: 'infrastructure', significance: 'Irrigation lifeline' }
    ],
    culturalEvents: [
      { name: 'Teesta Tea & Tourism Festival', timing: 'December', participation: 100000 },
      { name: 'Jalpesh Mela', timing: 'Shivratri', participation: 200000 },
      { name: 'Dooars Festival', timing: 'January', participation: 75000 }
    ],
    economicActivities: ['Tea Industry', 'Timber', 'Tourism', 'Agriculture'],
    rallyVenues: [
      { name: 'Jalpaiguri Stadium', capacity: 40000, location: 'Jalpaiguri Town' },
      { name: 'Maynaguri Ground', capacity: 25000, location: 'Maynaguri' },
      { name: 'Mal Bazaar Ground', capacity: 20000, location: 'Mal' }
    ],
    campaignMottos: [
      { theme: 'tea_workers', slogan: 'Chai Mazdoor Nyay, BJP Ka Sahay', target: 'Tea workers' },
      { theme: 'wildlife', slogan: 'Van-Manav Samanvay, BJP Ka Uddeshya', target: 'Forest dwellers' },
      { theme: 'floods', slogan: 'Teesta Taming, Development Gaming', target: 'Flood victims' }
    ]
  }
];

// Function to get local knowledge for any constituency
export function getConstituencyLocalKnowledge(constituencyId: string): LocalKnowledge {
  // Return specific knowledge if available
  const specificKnowledge = CONSTITUENCY_LOCAL_KNOWLEDGE.find(k => k.constituencyId === constituencyId);
  if (specificKnowledge) {
    return specificKnowledge;
  }

  // Generate intelligent defaults based on constituency type
  const constituencyName = constituencyId.split('-')[0];
  const isUrban = ['kolkata', 'howrah', 'asansol', 'siliguri', 'durgapur'].some(city =>
    constituencyId.includes(city)
  );
  const isBorder = ['coochbehar', 'alipurduar', 'jalpaiguri', 'malda', 'murshidabad'].some(dist =>
    constituencyId.includes(dist)
  );
  const isCoastal = ['purba-medinipur', 'south-24-parganas'].some(dist =>
    constituencyId.includes(dist)
  );
  const isIndustrial = ['asansol', 'durgapur', 'raniganj', 'haldia'].some(area =>
    constituencyId.includes(area)
  );

  // Generate appropriate issues based on constituency type
  const issues = [];

  if (isUrban) {
    issues.push(
      {
        title: 'Traffic Congestion Crisis',
        description: 'Daily 2-hour traffic jams affecting productivity',
        affectedAreas: ['Main roads', 'Market areas', 'School zones'],
        votersAffected: 30000,
        severity: 'high' as const
      },
      {
        title: 'Water Supply Shortage',
        description: 'Alternate day supply, contaminated water',
        affectedAreas: ['Residential areas', 'Slums'],
        votersAffected: 25000,
        severity: 'critical' as const
      }
    );
  } else if (isBorder) {
    issues.push(
      {
        title: 'Cross-Border Smuggling',
        description: 'Cattle and goods smuggling affecting local economy',
        affectedAreas: ['Border villages', 'Check posts'],
        votersAffected: 20000,
        severity: 'critical' as const
      },
      {
        title: 'BSF Restrictions',
        description: 'Farmers cannot access land near border',
        affectedAreas: ['Within 1km of border'],
        votersAffected: 15000,
        severity: 'high' as const
      }
    );
  } else if (isCoastal) {
    issues.push(
      {
        title: 'Coastal Erosion',
        description: 'Villages disappearing into sea',
        affectedAreas: ['Coastal villages', 'Delta areas'],
        votersAffected: 30000,
        severity: 'critical' as const
      },
      {
        title: 'Fishing Ban Problems',
        description: 'Arbitrary fishing bans affecting livelihood',
        affectedAreas: ['Fishing villages'],
        votersAffected: 20000,
        severity: 'high' as const
      }
    );
  } else if (isIndustrial) {
    issues.push(
      {
        title: 'Factory Closures',
        description: 'Industries closing, workers jobless',
        affectedAreas: ['Industrial belt', 'Worker colonies'],
        votersAffected: 35000,
        severity: 'critical' as const
      },
      {
        title: 'Pollution Crisis',
        description: 'Air and water pollution causing diseases',
        affectedAreas: ['Near factories', 'Downstream areas'],
        votersAffected: 25000,
        severity: 'high' as const
      }
    );
  } else {
    // Rural/agricultural default
    issues.push(
      {
        title: 'Crop Insurance Fraud',
        description: 'Insurance claims not paid for damaged crops',
        affectedAreas: ['All farming areas'],
        votersAffected: 30000,
        severity: 'critical' as const
      },
      {
        title: 'Fertilizer Black Market',
        description: 'TMC syndicate controlling fertilizer supply',
        affectedAreas: ['Agricultural blocks'],
        votersAffected: 25000,
        severity: 'high' as const
      }
    );
  }

  return {
    constituencyId,
    localIssues: issues,
    landmarks: [
      {
        name: `${constituencyName} Main Temple`,
        type: 'temple',
        significance: 'Religious center'
      },
      {
        name: `${constituencyName} Market`,
        type: 'market',
        significance: 'Economic hub'
      }
    ],
    culturalEvents: [
      {
        name: 'Local Festival',
        timing: 'Annual',
        participation: 20000
      }
    ],
    economicActivities: isUrban ?
      ['Trade', 'Services', 'Small industries'] :
      ['Agriculture', 'Animal husbandry', 'Small trade'],
    rallyVenues: [
      {
        name: `${constituencyName} Ground`,
        capacity: 25000,
        location: 'Central area'
      }
    ],
    campaignMottos: [
      {
        theme: 'Change',
        slogan: `${constituencyName} Wants Change, BJP Brings Hope`,
        target: 'All voters'
      }
    ]
  };
}