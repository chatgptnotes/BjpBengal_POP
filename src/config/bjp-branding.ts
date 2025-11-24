/**
 * BJP (Bharatiya Janata Party) West Bengal Branding Configuration
 *
 * This file contains all branding-related constants for BJP West Bengal.
 * Update these values to customize the platform appearance and behavior.
 */

export const BJP_CONFIG = {
  // Organization Details
  organization: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Bharatiya Janata Party - West Bengal',
    shortName: 'BJP WB',
    slug: 'bjp-wb',
    founder: 'Syama Prasad Mookerjee',
    establishedYear: 1980,
    headquarters: 'Kolkata, West Bengal',
    state: 'West Bengal',
  },

  // Branding
  branding: {
    primaryColor: '#FF9933', // Saffron
    secondaryColor: '#138808', // Green
    accentColor: '#FFFFFF', // White
    logoPath: '/bjp-logo.png',
    partySymbol: 'Lotus',
    tagline: 'Nation First, People Always',
  },

  // Contact Information
  contact: {
    name: 'BJP West Bengal',
    email: 'contact@bjpwestbengal.org',
    phone: '+91-33-XXXXXXXX',
    website: 'https://www.bjp.org',
  },

  // Social Media
  socialMedia: {
    twitter: '@BJP4Bengal',
    twitterUrl: 'https://twitter.com/BJP4Bengal',
    facebook: 'BJPWestBengal',
    facebookUrl: 'https://facebook.com/BJPWestBengal',
    instagram: '@bjp4bengal',
    instagramUrl: 'https://instagram.com/bjp4bengal',
    youtube: 'BJP West Bengal',
    youtubeUrl: 'https://youtube.com/@BJP4Bengal',
  },

  // Political Information
  political: {
    ideology: 'Integral Humanism',
    alliance: 'National Democratic Alliance (NDA)',
    focusAreas: [
      'Development',
      'Good Governance',
      'National Security',
      'Economic Growth',
      'Women Empowerment',
      'Youth Development',
      'Farmers Welfare',
      'Infrastructure Development',
    ],
  },

  // Platform Features
  features: {
    voterManagement: true,
    sentimentTracking: true,
    boothAnalysis: true,
    constituencyMapping: true,
    surveyManagement: true,
    campaignPlanning: true,
    volunteerManagement: true,
    donationTracking: false, // Enable when ready
  },

  // App Metadata
  app: {
    name: 'Pulse of People - BJP West Bengal',
    shortName: 'POP BJP WB',
    description: 'Political sentiment analysis and voter management platform for Bharatiya Janata Party - West Bengal',
    version: '1.0.0',
    buildDate: '2025-11-24',
  },
} as const;

// Type-safe accessors
export const getOrganizationId = () => BJP_CONFIG.organization.id;
export const getOrganizationName = () => BJP_CONFIG.organization.name;
export const getOrganizationShortName = () => BJP_CONFIG.organization.shortName;
export const getPrimaryColor = () => BJP_CONFIG.branding.primaryColor;
export const getLogoPath = () => BJP_CONFIG.branding.logoPath;
export const getPartySymbol = () => BJP_CONFIG.branding.partySymbol;

// Default export
export default BJP_CONFIG;
