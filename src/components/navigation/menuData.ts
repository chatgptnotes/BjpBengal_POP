/**
 * Menu Data - Organized by category
 * Maps all application menu items to their respective categories
 */

import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingIcon,
  Insights as InsightsIcon,
  Assignment as ReportsIcon,
  CompareArrows as ComparisonIcon,
  Timeline as TimelineIcon,
  // Data Intelligence
  Twitter as TwitterIcon,
  Tv as TvIcon,
  Newspaper as NewspaperIcon,
  RecordVoiceOver as InfluencerIcon,
  SmartToy as BotIcon,
  Poll as PollIcon,
  CameraAlt as DataCaptureIcon,
  Phone as PhoneIcon,
  Psychology as PersonaIcon,
  ViewModule as PersonaLibraryIcon,
  Balance as PersonaCompareIcon,
  ShowChart as PersonaTrendsIcon,
  TuneOutlined as PersuasionIcon,
  FileDownload as AudienceExportIcon,
  // Maps
  Map as MapIcon,
  Public as GlobalIcon,
  Storage as DatabaseIcon,
  Place as PlaceIcon,
  LocationOn as LocationIcon,
  CloudUpload as UploadIcon,
  // Competitors
  People as PeopleIcon,
  Monitor as MonitorIcon,
  BarChart as BarChartIcon,
  // Operations
  PersonSearch as FieldWorkerIcon,
  TrackChanges as TrackingIcon,
  // Alerts
  Notifications as AlertsIcon,
  Forum as EngagementIcon,
  // Settings
  Settings as SettingsIcon,
  Tune as ConfigIcon,
} from '@mui/icons-material';

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; fontSize?: string }>;
  badge?: string;
  permission?: string;
}

export const categoryMenuItems: Record<string, MenuItem[]> = {
  // MAIN DASHBOARD
  'dashboard': [
    {
      name: 'POP Dashboard',
      href: '/dashboard/legacy',
      icon: DashboardIcon,
      badge: 'Live'
    },
    {
      name: 'Role-Based Dashboard',
      href: '/dashboard/legacy',
      icon: DashboardIcon
    },
  ],

  // DATA INTELLIGENCE
  'data-intelligence': [
    // Voter Personas Subcategory
    {
      name: 'Voter Personas',
      href: '/voter-personas',
      icon: PersonaIcon,
      badge: 'ML'
    },
    {
      name: '  → Persona Library',
      href: '/voter-personas?tab=0',
      icon: PersonaLibraryIcon
    },
    {
      name: '  → Persona Comparison',
      href: '/voter-personas?tab=1',
      icon: PersonaCompareIcon
    },
    {
      name: '  → Geographic Map',
      href: '/voter-personas?tab=2',
      icon: MapIcon
    },
    {
      name: '  → Trends & Migration',
      href: '/voter-personas?tab=3',
      icon: PersonaTrendsIcon
    },
    {
      name: '  → Persuasion Scoring',
      href: '/voter-personas/persuasion',
      icon: PersuasionIcon,
      badge: 'New'
    },
    {
      name: '  → Audience Export',
      href: '/voter-personas/export',
      icon: AudienceExportIcon
    },
    // Other Data Intelligence Items
    {
      name: 'Social Media Channels',
      href: '/social-media-channels',
      icon: TwitterIcon
    },
    {
      name: 'TV Broadcast Analysis',
      href: '/tv-broadcast-analysis',
      icon: TvIcon
    },
    {
      name: 'Press Monitoring',
      href: '/press-media-monitoring',
      icon: NewspaperIcon
    },
    {
      name: 'Influencer Tracking',
      href: '/influencer-tracking',
      icon: InfluencerIcon
    },
    {
      name: 'Voter Sentiment Analysis',
      href: '/voter-sentiment-analysis',
      icon: InfluencerIcon,
      badge: 'AI'
    },
    {
      name: 'Voice Agent Chat',
      href: '/voice-agent-chat',
      icon: PhoneIcon,
      badge: 'AI'
    },
    {
      name: 'Conversation Bot',
      href: '/conversation-bot',
      icon: BotIcon
    },
    {
      name: 'Political Polling',
      href: '/political-polling',
      icon: PollIcon
    },
    {
      name: 'Data Capture Kit',
      href: '/data-kit',
      icon: DataCaptureIcon
    },
    {
      name: 'Data Submission',
      href: '/submit-data',
      icon: DataCaptureIcon
    },
  ],

  // ANALYTICS & INSIGHTS
  'analytics': [
    {
      name: 'Analytics Dashboard',
      href: '/analytics-dashboard',
      icon: AnalyticsIcon
    },
    {
      name: 'Constituency Insights',
      href: '/insights/constituency/wb_kolkata_bhowanipore',
      icon: InsightsIcon,
      badge: 'New'
    },
    {
      name: 'Advanced Charts',
      href: '/advanced-charts',
      icon: AssessmentIcon
    },
    {
      name: 'AI Insights',
      href: '/ai-insights',
      icon: InsightsIcon
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ReportsIcon
    },
    {
      name: 'Competitor Analysis',
      href: '/competitor-analysis',
      icon: ComparisonIcon
    },
    {
      name: 'Data Tracking',
      href: '/data-tracking',
      icon: TimelineIcon
    },
  ],

  // COMPETITOR INTELLIGENCE
  'competitors': [
    {
      name: 'Competitor Registry',
      href: '/competitors/registry',
      icon: PeopleIcon
    },
    {
      name: 'Social Media Monitor',
      href: '/competitors/monitor',
      icon: MonitorIcon
    },
    {
      name: 'Sentiment Dashboard',
      href: '/competitors/sentiment',
      icon: BarChartIcon
    },
    {
      name: 'Competitor Analysis',
      href: '/competitor-analysis',
      icon: ComparisonIcon
    },
    {
      name: 'Competitor Tracking',
      href: '/competitor-tracking',
      icon: ComparisonIcon
    },
  ],

  // MAPS & TERRITORY
  'maps': [
    {
      name: 'Regional Map',
      href: '/regional-map',
      icon: GlobalIcon
    },
    {
      name: 'West Bengal Map',
      href: '/west-bengal-map',
      icon: MapIcon
    },
    {
      name: 'Voter Database',
      href: '/voter-database',
      icon: DatabaseIcon
    },
    {
      name: 'My Constituency',
      href: '/constituency',
      icon: PlaceIcon
    },
    // Wards & Booths Management
    {
      name: 'Wards List',
      href: '/wards',
      icon: LocationIcon
    },
    {
      name: 'Upload Wards',
      href: '/wards/upload',
      icon: UploadIcon,
      badge: 'New'
    },
    {
      name: 'Booths List',
      href: '/booths',
      icon: LocationIcon
    },
    {
      name: 'Upload Booths',
      href: '/booths/upload',
      icon: UploadIcon,
      badge: 'New'
    },
    {
      name: 'Booths Map',
      href: '/booths/map',
      icon: MapIcon
    },
    {
      name: 'Wards & Booths Analytics',
      href: '/wards-booths/analytics',
      icon: AssessmentIcon
    },
  ],

  // CAMPAIGN OPERATIONS
  'operations': [
    {
      name: 'Field Workers',
      href: '/field-workers',
      icon: FieldWorkerIcon
    },
    {
      name: 'Data Capture Kit',
      href: '/data-kit',
      icon: DataCaptureIcon
    },
    {
      name: 'Data Tracking',
      href: '/data-tracking',
      icon: TrackingIcon
    },
  ],

  // ALERTS & ENGAGEMENT
  'alerts': [
    {
      name: 'Alert Center',
      href: '/alerts',
      icon: AlertsIcon
    },
    {
      name: 'Social Listening',
      href: '/social-media-channels',
      icon: TwitterIcon
    },
    {
      name: 'Bot Engagement',
      href: '/conversation-bot',
      icon: EngagementIcon
    },
  ],

  // SETTINGS
  'settings': [
    {
      name: 'General Settings',
      href: '/settings',
      icon: SettingsIcon
    },
    {
      name: 'Profile Settings',
      href: '/settings',
      icon: ConfigIcon
    },
    {
      name: 'Social Media Settings',
      href: '/settings',
      icon: TwitterIcon
    },
  ],
};
