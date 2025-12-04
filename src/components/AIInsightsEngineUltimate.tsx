import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  Users,
  MapPin,
  RefreshCw,
  ChevronDown,
  Shield,
  Calendar,
  Megaphone,
  Activity,
  Award,
  BarChart3,
  Flag,
  ChevronRight,
  Phone,
  MessageSquare,
  Download,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Search
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { aiService } from '../services/aiPoliticalIntelligence';
import { westBengalService } from '../services/westBengalDataService';
import ImplementationStrategy from './ImplementationStrategy';
import DistrictStrategyModal from './DistrictStrategyModal';
import { WEST_BENGAL_CONSTITUENCIES, getAllDistricts, searchConstituencies } from '../data/westBengalConstituencies';

export default function AIInsightsEngineUltimate() {
  // State management
  const [viewMode, setViewMode] = useState<'state' | 'constituency'>('state'); // Start with state view
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // State-level data
  const [stateData, setStateData] = useState<any>(null);
  const [districtPerformance, setDistrictPerformance] = useState<any[]>([]);
  const [battlegrounds, setBattlegrounds] = useState<any[]>([]);
  const [bjpLeaders, setBjpLeaders] = useState<any[]>([]);
  const [stateInsights, setStateInsights] = useState<any[]>([]);

  // Constituency-level data
  const [constituencyInsights, setConstituencyInsights] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [showStrategy, setShowStrategy] = useState(false);

  // District strategy modal
  const [showDistrictStrategy, setShowDistrictStrategy] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  // Load initial data on mount
  useEffect(() => {
    loadStateData();
    fetchConstituencies();
    // Don't set a default constituency - show state view by default
  }, []);

  /**
   * Load state-level data
   */
  const loadStateData = async () => {
    setLoading(true);
    try {
      const [overview, districts, battles, leaders, insights] = await Promise.all([
        westBengalService.getStateOverview(),
        westBengalService.getDistrictPerformance(),
        westBengalService.getBattlegroundConstituencies(),
        westBengalService.getBJPLeaders(),
        westBengalService.getStateInsights()
      ]);

      setStateData(overview);
      setDistrictPerformance(districts);
      setBattlegrounds(battles);
      setBjpLeaders(leaders);
      setStateInsights(insights);
    } catch (error) {
      console.error('Error loading state data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch constituencies list
   */
  const fetchConstituencies = async () => {
    // Load all 294 constituencies from the complete data file
    setConstituencies(WEST_BENGAL_CONSTITUENCIES);
  };

  /**
   * Handle constituency selection
   */
  const handleConstituencySelect = async (constituencyId: string) => {
    setSelectedConstituency(constituencyId);
    setViewMode('constituency');
    setShowDropdown(false);
    setLoading(true);

    try {
      const insights = await aiService.generateConstituencyInsights(constituencyId);
      setConstituencyInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate party positions for chart - 2026 projections
   */
  const partyData = stateData ? [
    { name: 'BJP', value: stateData.bjpProjected2026, color: '#FF9933' },
    { name: 'TMC', value: stateData.tmcProjected2026, color: '#20C05C' },
    { name: 'Congress', value: stateData.congressProjected2026, color: '#19AAED' },
    { name: 'CPI(M)', value: stateData.cpimProjected2026, color: '#FF0000' },
    { name: 'Others', value: stateData.othersProjected2026, color: '#666666' }
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Quick Summary', icon: Brain },
    { id: 'districts', label: 'Where to Focus', icon: MapPin },
    { id: 'battlegrounds', label: 'Winnable Seats', icon: Target },
    { id: 'strategy', label: 'Action Plan', icon: Shield },
    { id: 'leaders', label: 'Team Deployment', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-8 h-8 mr-3 text-orange-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                BJP West Bengal - Smart Campaign Manager
              </h2>
              <p className="text-gray-600">Get winning strategies for all 294 constituencies</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('state')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'state'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Whole Bengal View
              </button>
              <button
                onClick={() => setViewMode('constituency')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'constituency'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single Constituency
              </button>
            </div>

            {viewMode === 'constituency' && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{selectedConstituency ? constituencies.find(c => c.id === selectedConstituency)?.name : 'Select Constituency'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b bg-gray-50">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search from all 294 constituencies..."
                          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: {constituencies.filter(c =>
                          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.district.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length} constituencies
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {constituencies
                        .filter(c =>
                          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.district.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice(0, 50)
                        .map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleConstituencySelect(c.id)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{c.name}</div>
                                <div className="text-sm text-gray-500">{c.district} • {c.region}</div>
                              </div>
                              <div className="text-xs text-gray-400">#{c.assemblyNumber}</div>
                            </div>
                          </button>
                        ))}
                      {constituencies.filter(c =>
                        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.district.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length > 50 && (
                        <div className="p-3 text-center text-sm text-gray-500">
                          Type to see more results...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => viewMode === 'state' ? loadStateData() : handleConstituencySelect(selectedConstituency)}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* State View */}
      {viewMode === 'state' && stateData && (
        <>
          {/* Key Predictions for 2026 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-700">{stateData.bjpProjected2026}</div>
                  <div className="text-sm text-orange-600 font-medium">BJP Projected 2026</div>
                  <div className="text-xs text-orange-500 mt-1">+{stateData.bjpGainPotential} gain</div>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stateData.tmcProjected2026}</div>
                  <div className="text-sm text-gray-600">TMC Expected 2026</div>
                  <div className="text-xs text-red-500 mt-1">-93 loss</div>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700">{stateData.voterSwingNeeded}%</div>
                  <div className="text-sm text-blue-600 font-medium">Swing Needed</div>
                  <div className="text-xs text-blue-500 mt-1">from 38.1% to 46.6%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700">{stateData.confidenceLevel}%</div>
                  <div className="text-sm text-purple-600 font-medium">Confidence Level</div>
                  <div className="text-xs text-purple-500 mt-1">AI Prediction</div>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className={`rounded-lg shadow-sm border p-4 ${
              stateData.currentMomentum === 'positive' ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
              stateData.currentMomentum === 'negative' ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' :
              'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold capitalize text-green-700">
                    {stateData.currentMomentum}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Momentum</div>
                  <div className="text-xs text-green-500 mt-1">Last 30 days</div>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg shadow-sm border p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Party Position Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">2026 Projected Assembly Composition</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={partyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {partyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-6 mt-4">
                      {partyData.map(party => (
                        <div key={party.name} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: party.color }}></div>
                          <span className="text-sm">{party.name}: {party.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">2026 Winning Strategy</h3>
                    <div className="space-y-3">
                      {stateInsights.slice(0, 5).map((insight, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                            insight.category === 'opportunity' ? 'bg-green-500' :
                            insight.category === 'threat' ? 'bg-red-500' :
                            insight.category === 'strength' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              {insight.affectedDistricts.slice(0, 2).join(', ')}
                              {insight.affectedDistricts.length > 2 && ` +${insight.affectedDistricts.length - 2} more`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swing Analysis & Predictions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">📊 Voter Swing Analysis & 2026 Predictions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-2">Key Swing Demographics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Women Voters</span>
                          <span className="text-green-600 font-medium">+12% swing to BJP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Youth (18-35)</span>
                          <span className="text-green-600 font-medium">+15% swing to BJP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>SC/ST Communities</span>
                          <span className="text-yellow-600 font-medium">+5% swing to BJP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Matua Community</span>
                          <span className="text-green-600 font-medium">+25% swing to BJP</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-2">Regional Projections</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>North Bengal</span>
                          <span className="text-orange-600 font-medium">BJP: 38/54 seats</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Jangalmahal</span>
                          <span className="text-orange-600 font-medium">BJP: 32/40 seats</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>South Bengal</span>
                          <span className="text-orange-600 font-medium">BJP: 65/120 seats</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Kolkata Metro</span>
                          <span className="text-orange-600 font-medium">BJP: 30/80 seats</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-2">Critical Factors</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>Anti-incumbency: 65% dissatisfaction with TMC</span>
                        </div>
                        <div className="flex items-start">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>CAA impact: +30 seats in border areas</span>
                        </div>
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                          <span>TMC welfare schemes: -20 seats impact</span>
                        </div>
                        <div className="flex items-start">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>Modi factor: +15% vote share boost</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-orange-800">
                        AI Prediction: BJP will cross 150+ seats if current momentum continues. Focus on 88 swing constituencies for majority.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Immediate Actions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">🎯 Priority Actions for Next 30 Days</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Launch state-wide anti-corruption campaign focusing on SSC scam',
                      'Fast-track CAA implementation in Matua areas',
                      'Announce Industrial Revival 2.0 for coal belt',
                      'Start "Mission 10 Lakh Jobs" with sector-wise breakup',
                      'Deploy star campaigners to 50 battleground constituencies',
                      'Strengthen booth committees in weak constituencies'
                    ].map((action, idx) => (
                      <div key={idx} className="flex items-start bg-orange-50 rounded-lg p-3">
                        <CheckCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'districts' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Districts Where BJP Can Win More Seats</h3>
                <div className="space-y-4">
                  {districtPerformance
                    .filter(d => d.priorityLevel === 'high')
                    .map((district, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{district.district}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>Total Seats: {district.totalSeats}</span>
                              <span>BJP Won: {district.bjpWon}</span>
                              <span>Runner-up: {district.bjpSecond}</span>
                              <span className="text-orange-600 font-medium">
                                Potential Gain: +{district.bjpSecond} seats
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            district.priorityLevel === 'high' ? 'bg-red-100 text-red-800' :
                            district.priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {district.priorityLevel.toUpperCase()} PRIORITY
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Key Issues:</h5>
                            <ul className="space-y-1">
                              {district.keyIssues.map((issue, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center">
                                  <ChevronRight className="w-3 h-3 text-orange-500 mr-1" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Recommended Strategy:</h5>
                            <ul className="space-y-1">
                              {district.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center">
                                  <Target className="w-3 h-3 text-orange-500 mr-1" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Average margin to victory: <strong>{district.avgMarginToVictory.toLocaleString()} votes</strong>
                            </span>
                            <button
                              onClick={() => {
                                setSelectedDistrict(district);
                                setShowDistrictStrategy(true);
                              }}
                              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Generate Detailed District Plan →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'battlegrounds' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Seats BJP Lost by Small Margins (Can Win in 2026)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Constituency</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Current MLA</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">BJP Candidate</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Margin</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {battlegrounds.slice(0, 10).map((bg, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{bg.name}</div>
                              <div className="text-sm text-gray-500">{bg.district}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div>{bg.currentMLA}</div>
                              <div className="text-gray-500">({bg.currentParty})</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{bg.bjpCandidate}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className={`font-medium ${bg.marginOfDefeat > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.abs(bg.marginOfDefeat).toLocaleString()}
                              </div>
                              <div className="text-gray-500">Swing: {bg.swingNeeded.toLocaleString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">{bg.winStrategy}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Step-by-Step Plan to Win 2026 Elections</h3>

                {/* Monthly Milestones */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">What to Achieve Each Month</h4>
                  <div className="space-y-3">
                    {[
                      { month: 'Month 1', target: 'Complete booth committee formation', metric: '100% booth coverage' },
                      { month: 'Month 2', target: 'CAA benefits to 1 lakh Matuas', metric: '1,00,000 beneficiaries' },
                      { month: 'Month 3', target: 'Youth employment melas in 50 towns', metric: '50,000 registrations' },
                      { month: 'Month 6', target: 'Sentiment improvement in urban areas', metric: '+5% BJP vote share' },
                      { month: 'Month 12', target: 'Win 3 of 5 upcoming by-elections', metric: '60% strike rate' }
                    ].map((milestone, idx) => (
                      <div key={idx} className="flex items-center bg-gray-50 rounded-lg p-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                          <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{milestone.month}</div>
                          <div className="text-sm text-gray-600">{milestone.target}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-orange-600">{milestone.metric}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stateInsights
                    .filter(i => i.urgency === 'immediate')
                    .slice(0, 6)
                    .map((insight, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedInsight(insight);
                          setShowStrategy(true);
                        }}
                        className="p-4 bg-white border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                      >
                        <div className="flex items-center mb-2">
                          {insight.category === 'opportunity' && <Zap className="w-5 h-5 text-green-600 mr-2" />}
                          {insight.category === 'threat' && <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />}
                          {insight.category === 'strength' && <Shield className="w-5 h-5 text-blue-600 mr-2" />}
                          <span className="font-medium text-gray-900 text-sm">{insight.title}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{insight.action}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-orange-600 font-medium">Implement Strategy →</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            insight.urgency === 'immediate' ? 'bg-red-100 text-red-700' :
                            insight.urgency === 'short-term' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {insight.urgency}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'leaders' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Which Leader Should Campaign Where</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bjpLeaders.map((leader, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{leader.name}</h4>
                          <p className="text-sm text-gray-600">{leader.position}</p>
                          {leader.constituency && (
                            <p className="text-sm text-gray-500 mt-1">{leader.constituency}</p>
                          )}
                        </div>
                        <Award className="w-8 h-8 text-orange-500" />
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <span className="text-gray-500">Specialization:</span>
                          <p className="text-gray-700">{leader.specialization}</p>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Deploy to:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {leader.deploymentPriority.map((area, i) => (
                              <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Constituency View */}
      {viewMode === 'constituency' && selectedConstituency && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <RefreshCw className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Creating winning strategy for this constituency...</p>
            </div>
          ) : constituencyInsights.length > 0 ? (
            <div className="space-y-4">
              {constituencyInsights.map((insight, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-gray-600 mt-1">{insight.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      insight.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        +{insight.expectedOutcome.sentimentImprovement}%
                      </div>
                      <div className="text-xs text-gray-600">Sentiment Boost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {insight.expectedOutcome.voterReachIncrease.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Voter Reach</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {insight.resources.volunteersNeeded}
                      </div>
                      <div className="text-xs text-gray-600">Volunteers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {insight.expectedOutcome.timeToImpact}
                      </div>
                      <div className="text-xs text-gray-600">Time to Impact</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedInsight(insight);
                      setShowStrategy(true);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View Detailed Implementation Strategy →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a constituency to view insights</p>
            </div>
          )}
        </div>
      )}

      {/* Implementation Strategy Modal */}
      {showStrategy && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <ImplementationStrategy
              insight={selectedInsight}
              constituency={selectedConstituency || 'West Bengal'}
              onClose={() => setShowStrategy(false)}
            />
          </div>
        </div>
      )}

      {/* District Strategy Modal */}
      {showDistrictStrategy && selectedDistrict && (
        <DistrictStrategyModal
          districtData={selectedDistrict}
          onClose={() => {
            setShowDistrictStrategy(false);
            setSelectedDistrict(null);
          }}
        />
      )}
    </div>
  );
}