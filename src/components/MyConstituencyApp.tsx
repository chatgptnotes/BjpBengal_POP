import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Camera,
  FileText,
  Send,
  Heart,
  Star,
  Clock,
  Filter,
  Plus,
  Share2,
  Download,
  Flag,
  Building,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'healthcare' | 'education' | 'employment' | 'environment' | 'safety' | 'utilities' | 'transport';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  coordinates?: { lat: number; lng: number };
  reportedBy: string;
  reportedAt: Date;
  supporters: number;
  comments: number;
  images?: string[];
  assignedTo?: string;
  estimatedResolution?: Date;
  updates?: Array<{
    id: string;
    message: string;
    timestamp: Date;
    author: string;
    type: 'update' | 'comment' | 'status_change';
  }>;
}

interface Representative {
  id: string;
  name: string;
  position: string;
  party: string;
  contact: {
    phone: string;
    email: string;
    office: string;
  };
  availability: {
    publicMeeting: string;
    onlineHours: string;
  };
  responsiveness: number; // 0-1 score
  issuesHandled: number;
  satisfactionRating: number; // 0-5 stars
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  category: 'town_hall' | 'public_meeting' | 'development_update' | 'community_event';
  attendees: number;
  maxCapacity?: number;
  isOnline: boolean;
  meetingLink?: string;
}

export default function MyConstituencyApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'issues' | 'representatives' | 'events' | 'insights' | 'report'>('issues');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [constituencyData, setConstituencyData] = useState<any>(null);
  const [constituencyId, setConstituencyId] = useState<string>('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isLoadingRepresentatives, setIsLoadingRepresentatives] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load user's constituency from database
  useEffect(() => {
    async function loadConstituency() {
      if (!user?.id) return;

      try {
        // Get user's constituency from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('constituency')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const userConstituency = userData?.constituency || user?.constituency;

        if (userConstituency) {
          setSelectedConstituency(userConstituency);

          // Fetch constituency details
          const { data: constData } = await supabase
            .from('constituencies')
            .select('*')
            .ilike('name', `%${userConstituency}%`)
            .limit(1)
            .single();

          if (constData) {
            setConstituencyData(constData);
            setConstituencyId(constData.id);
          }
        } else {
          // Default to first West Bengal constituency
          const { data: defaultConst } = await supabase
            .from('constituencies')
            .select('*')
            .ilike('code', 'WB%')
            .limit(1)
            .single();

          if (defaultConst) {
            setSelectedConstituency(defaultConst.name);
            setConstituencyData(defaultConst);
            setConstituencyId(defaultConst.id);
          }
        }
      } catch (error) {
        console.error('Error loading constituency:', error);
        // Fallback to default West Bengal constituency
        setSelectedConstituency('Bhowanipore');
      }
    }

    loadConstituency();
  }, [user]);

  // Load issues from database based on constituency
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function loadIssues() {
      if (!selectedConstituency) return;

      setIsLoadingIssues(true);
      try {
        // Try to fetch from constituency_issues table
        // Database uses format like: wb_kolkata_bhowanipore
        const queryPattern = selectedConstituency.toLowerCase().replace(/\s+/g, '_');

        console.log('[Issues] Searching for constituency:', selectedConstituency, '→', queryPattern);

        // Try multiple search strategies
        let dbIssues = null;
        let error = null;

        // Strategy 1: Search by exact constituency_id pattern
        const { data: data1, error: error1 } = await supabase
          .from('constituency_issues')
          .select('*')
          .ilike('constituency_id', `%${queryPattern}%`);

        if (data1 && data1.length > 0) {
          dbIssues = data1;
        } else {
          // Strategy 2: Search by constituency_name
          const { data: data2, error: error2 } = await supabase
            .from('constituency_issues')
            .select('*')
            .ilike('constituency_name', `%${selectedConstituency}%`);

          dbIssues = data2;
          error = error2;
        }

        if (error) {
          console.warn('Error fetching issues from database:', error);
          // Fall back to demo data if database query fails
          loadDemoIssues();
        } else if (dbIssues && dbIssues.length > 0) {
          // Map database fields to component interface
          const mappedIssues: Issue[] = dbIssues.map(issue => ({
            id: issue.id,
            title: issue.issue_title || 'Untitled Issue',
            description: issue.issue_description || '',
            category: mapIssueCategory(issue.issue_category),
            priority: mapSeverityToPriority(issue.severity),
            status: 'reported' as const,
            location: Array.isArray(issue.affected_areas) && issue.affected_areas.length > 0
              ? issue.affected_areas[0]
              : selectedConstituency,
            reportedBy: 'Constituency Residents',
            reportedAt: issue.issue_since ? new Date(issue.issue_since) : new Date(issue.created_at),
            supporters: issue.affected_population_estimate || 0,
            comments: 0,
            assignedTo: issue.mla_response ? 'MLA Office' : undefined
          }));
          setIssues(mappedIssues);
        } else {
          // No data in database, use demo data
          loadDemoIssues();
        }
      } catch (error) {
        console.error('Error loading issues:', error);
        loadDemoIssues();
      } finally {
        setIsLoadingIssues(false);
      }
    }

    loadIssues();
  }, [constituencyId, selectedConstituency]);

  // Helper functions for mapping database values to component interface
  const mapIssueCategory = (dbCategory: string): Issue['category'] => {
    const categoryMap: Record<string, Issue['category']> = {
      'infrastructure': 'infrastructure',
      'healthcare': 'healthcare',
      'health': 'healthcare',
      'education': 'education',
      'employment': 'employment',
      'jobs': 'employment',
      'environment': 'environment',
      'safety': 'safety',
      'utilities': 'utilities',
      'water': 'utilities',
      'electricity': 'utilities',
      'transport': 'transport',
      'transportation': 'transport'
    };
    return categoryMap[dbCategory?.toLowerCase()] || 'infrastructure';
  };

  const mapSeverityToPriority = (severity: string): Issue['priority'] => {
    const priorityMap: Record<string, Issue['priority']> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'urgent'
    };
    return priorityMap[severity?.toLowerCase()] || 'medium';
  };

  // Fallback demo data function
  const loadDemoIssues = () => {
    setIssues([
      {
        id: '1',
        title: 'Poor Street Lighting on Sarat Bose Road',
        description: 'Several street lights have been non-functional for over 2 months, creating safety concerns for evening commuters and pedestrians.',
        category: 'infrastructure',
        priority: 'high',
        status: 'acknowledged',
        location: 'Sarat Bose Road, Near Gariahat',
        reportedBy: 'Amit Chatterjee',
        reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        supporters: 23,
        comments: 8,
        assignedTo: 'PWD Team',
        estimatedResolution: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        updates: [
          {
            id: '1',
            message: 'Issue acknowledged by PWD department. Survey team dispatched.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            author: 'PWD Officer',
            type: 'status_change'
          }
        ]
      },
      {
        id: '2',
        title: 'Overcrowding at Government Hospital',
        description: 'Long waiting times at the OPD, insufficient seating arrangements, and need for additional consultation rooms.',
        category: 'healthcare',
        priority: 'urgent',
        status: 'in_progress',
        location: 'SSKM Hospital',
        reportedBy: 'Dr. Debjani Roy',
        reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        supporters: 67,
        comments: 15,
        assignedTo: 'Health Department',
        updates: [
          {
            id: '1',
            message: 'Additional temporary consultation rooms being set up. New appointment system under testing.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            author: 'Health Secretary',
            type: 'update'
          }
        ]
      },
      {
        id: '3',
        title: 'Need for Children\'s Park in Residential Area',
        description: 'The residential area lacks recreational facilities for children. Request for establishing a small park with playground equipment.',
        category: 'environment',
        priority: 'medium',
        status: 'reported',
        location: 'Kalighat Area',
        reportedBy: 'Residents Association',
        reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        supporters: 41,
        comments: 12
      },
      {
        id: '4',
        title: 'Irregular Water Supply',
        description: 'Water supply has been irregular for the past month. Many households receiving water only on alternate days.',
        category: 'utilities',
        priority: 'high',
        status: 'acknowledged',
        location: 'Bhowanipore Area',
        reportedBy: 'Multiple Citizens',
        reportedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        supporters: 89,
        comments: 23,
        assignedTo: 'Water Authority'
      }
    ]);
  };

  // Load representatives from database
  const [representatives, setRepresentatives] = useState<Representative[]>([]);

  useEffect(() => {
    async function loadRepresentatives() {
      if (!selectedConstituency) return;

      setIsLoadingRepresentatives(true);
      try {
        // Try to fetch from constituency_leaders table
        // Database uses format like: wb_kolkata_bhowanipore
        const queryPattern = selectedConstituency.toLowerCase().replace(/\s+/g, '_');

        console.log('[Representatives] Searching for constituency:', selectedConstituency, '→', queryPattern);

        // Try multiple search strategies
        let leaderData = null;
        let error = null;

        // Strategy 1: Search by exact constituency_id pattern
        const { data: data1, error: error1 } = await supabase
          .from('constituency_leaders')
          .select('*')
          .ilike('constituency_id', `%${queryPattern}%`)
          .limit(1);

        if (data1 && data1.length > 0) {
          leaderData = data1[0];
          console.log('[Representatives] ✅ Found leader data:', leaderData?.current_mla_name);
        } else {
          // Strategy 2: Search by constituency_name
          const { data: data2, error: error2 } = await supabase
            .from('constituency_leaders')
            .select('*')
            .ilike('constituency_name', `%${selectedConstituency}%`)
            .limit(1);

          leaderData = data2?.[0];
          error = error2;

          if (leaderData) {
            console.log('[Representatives] ✅ Found leader data by name:', leaderData?.current_mla_name);
          } else {
            console.log('[Representatives] ❌ No leader data found');
          }
        }

        if (error || !leaderData) {
          console.warn('No leaders found in database, using demo data');
          loadDemoRepresentatives();
        } else {
          // Map database fields to representative interface
          const reps: Representative[] = [];

          // Add current MLA if exists
          if (leaderData.current_mla_name) {
            reps.push({
              id: '1',
              name: leaderData.current_mla_name,
              position: 'Member of Legislative Assembly (MLA)',
              party: leaderData.current_mla_party || 'Unknown',
              contact: {
                phone: '+91-33-XXXX-XXXX',
                email: `mla.${selectedConstituency.toLowerCase().replace(/\s+/g, '')}@wb.gov.in`,
                office: `MLA Office, ${selectedConstituency}`
              },
              availability: {
                publicMeeting: 'Every Saturday 10 AM - 12 PM',
                onlineHours: 'Monday & Wednesday 6 PM - 8 PM'
              },
              responsiveness: 0.85,
              issuesHandled: 0,
              satisfactionRating: 4.0
            });
          }

          // Add runner-up if exists
          if (leaderData.runner_up_name) {
            reps.push({
              id: '2',
              name: leaderData.runner_up_name,
              position: 'Opposition Leader',
              party: leaderData.runner_up_party || 'Unknown',
              contact: {
                phone: '+91-33-XXXX-XXXX',
                email: `contact@${leaderData.runner_up_party?.toLowerCase().replace(/\s+/g, '')}.org`,
                office: `Party Office, ${selectedConstituency}`
              },
              availability: {
                publicMeeting: 'Tuesday & Thursday 11 AM - 1 PM',
                onlineHours: 'Friday 5 PM - 7 PM'
              },
              responsiveness: 0.80,
              issuesHandled: 0,
              satisfactionRating: 3.8
            });
          }

          if (reps.length > 0) {
            setRepresentatives(reps);
          } else {
            loadDemoRepresentatives();
          }
        }
      } catch (error) {
        console.error('Error loading representatives:', error);
        loadDemoRepresentatives();
      } finally {
        setIsLoadingRepresentatives(false);
      }
    }

    loadRepresentatives();
  }, [constituencyId, selectedConstituency]);

  const loadDemoRepresentatives = () => {
    setRepresentatives([
      {
        id: '1',
        name: 'Suvendu Adhikari',
        position: 'Leader of Opposition, West Bengal',
        party: 'Bharatiya Janata Party',
        contact: {
          phone: '+91-33-2345-6789',
          email: 'lop.westbengal@bjp.org',
          office: 'BJP State Office, Kolkata'
        },
        availability: {
          publicMeeting: 'Every Saturday 10 AM - 12 PM',
          onlineHours: 'Monday & Wednesday 6 PM - 8 PM'
        },
        responsiveness: 0.87,
        issuesHandled: 142,
        satisfactionRating: 4.2
      },
      {
        id: '2',
        name: 'BJP Constituency Leader',
        position: 'Local MLA',
        party: 'Bharatiya Janata Party',
        contact: {
          phone: '+91-33-2456-7890',
          email: 'mla.kolkata@bjp.org',
          office: 'MLA Office, Kolkata'
        },
        availability: {
          publicMeeting: 'Tuesday & Thursday 11 AM - 1 PM',
          onlineHours: 'Friday 5 PM - 7 PM'
        },
        responsiveness: 0.92,
        issuesHandled: 89,
        satisfactionRating: 4.5
      },
      {
        id: '3',
        name: 'Kolkata Municipal Leader',
        position: 'Ward Councillor',
        party: 'Bharatiya Janata Party',
        contact: {
          phone: '+91-33-2567-8901',
          email: 'councillor@kolkatamunicipal.gov.in',
          office: 'Ward Office, Kolkata'
        },
        availability: {
          publicMeeting: 'Every Wednesday 2 PM - 4 PM',
          onlineHours: 'Thursday 7 PM - 9 PM'
        },
        responsiveness: 0.89,
        issuesHandled: 156,
        satisfactionRating: 4.3
      }
    ]);
  };

  // Load events from database
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function loadEvents() {
      if (!selectedConstituency) return;

      setIsLoadingEvents(true);
      try {
        // Try to fetch future events from database
        const queryPattern = selectedConstituency.toLowerCase().replace(/\s+/g, '_');

        console.log('[Events] Searching for constituency:', selectedConstituency, '→', queryPattern);

        // Try searching by location name
        const { data: dbEvents, error } = await supabase
          .from('events')
          .select('*')
          .ilike('location', `%${selectedConstituency}%`)
          .gt('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true })
          .limit(10);

        if (error || !dbEvents || dbEvents.length === 0) {
          console.warn('No events found in database, using demo data');
          loadDemoEvents();
        } else {
          // Map database fields to event interface
          const mappedEvents: Event[] = dbEvents.map(event => ({
            id: event.id,
            title: event.event_name,
            description: event.description || `Event organized at ${selectedConstituency}`,
            date: new Date(event.start_datetime),
            location: event.location || selectedConstituency,
            organizer: event.organizer_name || 'Constituency Office',
            category: mapEventType(event.event_type),
            attendees: event.actual_attendance || 0,
            maxCapacity: event.expected_attendance || 100,
            isOnline: event.location?.toLowerCase().includes('online') || event.location?.toLowerCase().includes('virtual') || false
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        loadDemoEvents();
      } finally {
        setIsLoadingEvents(false);
      }
    }

    loadEvents();
  }, [constituencyId, selectedConstituency]);

  const mapEventType = (dbEventType: string): Event['category'] => {
    const eventTypeMap: Record<string, Event['category']> = {
      'rally': 'public_meeting',
      'meeting': 'town_hall',
      'town_hall': 'town_hall',
      'door_to_door': 'community_event',
      'booth_visit': 'community_event',
      'development': 'development_update',
      'public_meeting': 'public_meeting'
    };
    return eventTypeMap[dbEventType?.toLowerCase()] || 'community_event';
  };

  const loadDemoEvents = () => {
    setEvents([
      {
        id: '1',
        title: 'Monthly Town Hall Meeting',
        description: 'Discuss ongoing development projects, citizen concerns, and upcoming initiatives for the constituency.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Community Hall, Kolkata',
        organizer: 'BJP Local Office',
        category: 'town_hall',
        attendees: 0,
        maxCapacity: 200,
        isOnline: false
      },
      {
        id: '2',
        title: 'Smart City Project Updates',
        description: 'Presentation on progress of Smart City initiatives including digital infrastructure, traffic management, and e-governance.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Online Meeting',
        organizer: 'Smart City Mission',
        category: 'development_update',
        attendees: 0,
        maxCapacity: 500,
        isOnline: true,
        meetingLink: 'https://meet.google.com/xyz-abc-def'
      },
      {
        id: '3',
        title: 'Health Camp & Awareness Program',
        description: 'Free health checkups, vaccination drive, and awareness session on preventive healthcare measures.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Government Higher Secondary School',
        organizer: 'Health Department',
        category: 'community_event',
        attendees: 0,
        maxCapacity: 300,
        isOnline: false
      }
    ]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'infrastructure': return <Building className="h-4 w-4" />;
      case 'healthcare': return <Heart className="h-4 w-4" />;
      case 'education': return <FileText className="h-4 w-4" />;
      case 'employment': return <Users className="h-4 w-4" />;
      case 'environment': return <Shield className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'utilities': return <Zap className="h-4 w-4" />;
      case 'transport': return <Globe className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure': return 'text-blue-600 bg-blue-100';
      case 'healthcare': return 'text-red-600 bg-red-100';
      case 'education': return 'text-green-600 bg-green-100';
      case 'employment': return 'text-purple-600 bg-purple-100';
      case 'environment': return 'text-emerald-600 bg-emerald-100';
      case 'safety': return 'text-orange-600 bg-orange-100';
      case 'utilities': return 'text-yellow-600 bg-yellow-100';
      case 'transport': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'text-blue-600 bg-blue-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.reportedAt.getTime() - a.reportedAt.getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'supporters':
        return b.supporters - a.supporters;
      default:
        return 0;
    }
  });

  const handleSupportIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, supporters: issue.supporters + 1 }
        : issue
    ));
  };

  const handleReportIssue = (formData: any) => {
    const newIssue: Issue = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'reported',
      location: formData.location,
      reportedBy: 'Current User', // Would come from auth context
      reportedAt: new Date(),
      supporters: 1,
      comments: 0
    };
    setIssues(prev => [newIssue, ...prev]);
    setShowReportForm(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-green-600" />
            My Constituency: {selectedConstituency || 'Loading...'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Citizen engagement platform for local issues and community participation
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowReportForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Flag className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{issues.length}</div>
              <div className="text-sm text-blue-700">Active Issues</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">
                {issues.filter(i => i.status === 'resolved').length}
              </div>
              <div className="text-sm text-green-700">Resolved</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {issues.reduce((sum, issue) => sum + issue.supporters, 0)}
              </div>
              <div className="text-sm text-purple-700">Total Support</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-900">{events.length}</div>
              <div className="text-sm text-orange-700">Upcoming Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'issues', label: 'Local Issues', icon: Flag },
              { key: 'representatives', label: 'Representatives', icon: Users },
              { key: 'events', label: 'Events', icon: Calendar },
              { key: 'insights', label: 'Insights', icon: TrendingUp },
              { key: 'report', label: 'Report', icon: FileText }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-1 h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="utilities">Utilities</option>
                <option value="transport">Transport</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="priority">Priority</option>
                <option value="supporters">Most Supported</option>
              </select>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {isLoadingIssues ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No issues found</p>
                <p className="text-sm text-gray-500 mt-1">There are currently no reported issues for this constituency</p>
              </div>
            ) : filteredIssues.map((issue) => (
              <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(issue.category)}`}>
                        {getCategoryIcon(issue.category)}
                        <span className="ml-1 capitalize">{issue.category}</span>
                      </div>
                      <div className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority.toUpperCase()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{issue.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {issue.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {issue.reportedAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Reported by {issue.reportedBy}
                      </div>
                    </div>
                    {issue.assignedTo && (
                      <div className="mt-2 text-xs text-blue-600">
                        Assigned to: {issue.assignedTo}
                        {issue.estimatedResolution && (
                          <span className="ml-2">• Expected resolution: {issue.estimatedResolution.toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSupportIssue(issue.id)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {issue.supporters}
                      </button>
                      <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {issue.comments}
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
                {issue.updates && issue.updates.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs text-blue-800 font-medium mb-1">Latest Update:</div>
                    <div className="text-sm text-blue-700">{issue.updates[issue.updates.length - 1].message}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {issue.updates[issue.updates.length - 1].timestamp.toLocaleDateString()} - {issue.updates[issue.updates.length - 1].author}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Representatives Tab */}
      {activeTab === 'representatives' && (
        <div className="space-y-4">
          {isLoadingRepresentatives ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading representatives...</p>
            </div>
          ) : representatives.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No representatives found</p>
              <p className="text-sm text-gray-500 mt-1">Representative information is not available for this constituency</p>
            </div>
          ) : representatives.map((rep) => (
            <div key={rep.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{rep.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{rep.party}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{rep.position}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{rep.issuesHandled}</div>
                    <div className="text-xs text-gray-500">Issues Handled</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < rep.satisfactionRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{rep.satisfactionRating}/5</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{rep.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{rep.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{rep.contact.office}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Availability</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Public Meetings:</span>
                      <div className="text-gray-800">{rep.availability.publicMeeting}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Online Hours:</span>
                      <div className="text-gray-800">{rep.availability.onlineHours}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Responsiveness</span>
                      <span className="text-sm font-medium">{Math.round(rep.responsiveness * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 relative">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${rep.responsiveness * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {isLoadingEvents ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No upcoming events</p>
              <p className="text-sm text-gray-500 mt-1">There are no scheduled events for this constituency</p>
            </div>
          ) : events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.category === 'town_hall' ? 'bg-blue-100 text-blue-700' :
                      event.category === 'development_update' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {event.category.replace('_', ' ').toUpperCase()}
                    </span>
                    {event.isOnline && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        ONLINE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {event.date.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {event.organizer}
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  {event.maxCapacity && (
                    <div className="text-sm text-gray-600 mb-2">
                      {event.attendees}/{event.maxCapacity} attending
                    </div>
                  )}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    {event.isOnline ? 'Join Online' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Issue Categories</h4>
              <div className="space-y-3">
                {['infrastructure', 'healthcare', 'utilities', 'environment'].map(category => {
                  const count = issues.filter(i => i.category === category).length;
                  const percentage = Math.round((count / issues.length) * 100);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-2 text-sm capitalize">{category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-200 rounded-full h-2 w-20 relative">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Response Times</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <span className="font-medium">2.3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resolution Rate</span>
                  <span className="font-medium text-green-600">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Citizen Satisfaction</span>
                  <span className="font-medium text-blue-600">4.2/5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Trending Issues</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Street Lighting & Safety</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">↑ 23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Water Supply Issues</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">↑ 18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Healthcare Access</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">↓ 12%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Constituency Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <Download className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Monthly Report</div>
            </button>
            <button className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              <Share2 className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Share Insights</div>
            </button>
            <button className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Action Plan</div>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Generate comprehensive reports on constituency performance, issue resolution rates, citizen engagement metrics, and representative responsiveness.
          </p>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Report New Issue</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleReportIssue({
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                location: formData.get('location')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                  <input name="title" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Brief description of the issue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Category</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="utilities">Utilities</option>
                    <option value="environment">Environment</option>
                    <option value="transport">Transport</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input name="location" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Specific location or area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows={4} required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Detailed description of the issue"></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}