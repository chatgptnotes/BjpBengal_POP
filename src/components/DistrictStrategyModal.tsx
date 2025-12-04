import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Zap,
  Download,
  RefreshCw,
  Award,
  BarChart3
} from 'lucide-react';
import { districtStrategyService } from '../services/districtStrategyService';

interface DistrictStrategyModalProps {
  districtData: any;
  onClose: () => void;
}

export default function DistrictStrategyModal({ districtData, onClose }: DistrictStrategyModalProps) {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<any>(null);

  useEffect(() => {
    loadStrategy();
  }, [districtData]);

  const loadStrategy = async () => {
    setLoading(true);
    try {
      const strategyData = await districtStrategyService.generateDistrictStrategy(districtData);
      setStrategy(strategyData);
    } catch (error) {
      console.error('Error loading district strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{districtData.district} District Strategy</h2>
              <p className="text-orange-100 mt-1">
                Complete action plan to win {districtData.bjpSecond} more seats
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-800 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="bg-orange-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <div className="text-orange-100 text-sm">Total Seats</div>
              <div className="text-2xl font-bold">{districtData.totalSeats}</div>
            </div>
            <div className="bg-orange-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <div className="text-orange-100 text-sm">BJP Current</div>
              <div className="text-2xl font-bold">{districtData.bjpWon}</div>
            </div>
            <div className="bg-green-500 bg-opacity-90 px-4 py-2 rounded-lg">
              <div className="text-white text-sm">Winnable Now</div>
              <div className="text-2xl font-bold">+{districtData.bjpSecond}</div>
            </div>
            <div className="bg-blue-500 bg-opacity-90 px-4 py-2 rounded-lg">
              <div className="text-white text-sm">2026 Target</div>
              <div className="text-2xl font-bold">{districtData.bjpWon + districtData.bjpSecond}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mr-3" />
              <span className="text-gray-600">Generating detailed district strategy...</span>
            </div>
          ) : strategy ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Strategic Overview
                </h3>
                <p className="text-gray-700 leading-relaxed">{strategy.executiveSummary}</p>
              </div>

              {/* Key Constituencies to Target */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  Priority Constituencies ({strategy.targetConstituencies?.length || 0})
                </h3>
                <div className="space-y-3">
                  {strategy.targetConstituencies?.map((constituency: any, idx: number) => (
                    <div key={idx} className="bg-white border-2 border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{constituency.name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            Margin: <span className="text-red-600 font-medium">{constituency.margin} votes</span>
                            {' • '}
                            Swing Needed: <span className="text-orange-600 font-medium">{constituency.swingNeeded}%</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          constituency.winProbability === 'high' ? 'bg-green-100 text-green-800' :
                          constituency.winProbability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {constituency.winProbability?.toUpperCase() || 'HIGH'} WIN CHANCE
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong className="text-gray-700">Key Issue:</strong>
                          <p className="text-gray-600 mt-1">{constituency.keyIssue}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Winning Strategy:</strong>
                          <p className="text-gray-600 mt-1">{constituency.strategy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* District-Wide Campaigns */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  District-Wide Initiatives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategy.districtCampaigns?.map((campaign: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">{idx + 1}</span>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {campaign.reach}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {campaign.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Allocation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Resource Allocation Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                    <div className="font-semibold text-gray-900">Total Budget</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      ₹{strategy.resources?.totalBudget?.toLocaleString() || '1,00,00,000'}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Per constituency: ₹{strategy.resources?.perConstituency?.toLocaleString() || '10,00,000'}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="font-semibold text-gray-900">Manpower</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {strategy.resources?.totalVolunteers || '500'}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {strategy.resources?.coordinators || '50'} coordinators
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <Calendar className="w-6 h-6 text-orange-600 mb-2" />
                    <div className="font-semibold text-gray-900">Timeline</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">
                      {strategy.resources?.duration || '90 days'}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      3-phase rollout
                    </div>
                  </div>
                </div>
              </div>

              {/* Leadership Deployment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-orange-600" />
                  Leadership & Star Campaigner Deployment
                </h3>
                <div className="space-y-3">
                  {strategy.leaderDeployment?.map((leader: any, idx: number) => (
                    <div key={idx} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{leader.name}</h4>
                          <p className="text-sm text-gray-600">{leader.role}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-orange-600">{leader.constituencies} constituencies</div>
                          <div className="text-xs text-gray-500">{leader.frequency}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Focus:</strong> {leader.focus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Month-by-Month Action Plan */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  90-Day Action Plan
                </h3>
                <div className="space-y-3">
                  {strategy.monthlyPlan?.map((month: any, idx: number) => (
                    <div key={idx} className="bg-white border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold">M{idx + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{month.title}</h4>
                          <p className="text-sm text-gray-600">{month.focus}</p>
                        </div>
                      </div>
                      <div className="ml-16 space-y-2">
                        {month.activities?.map((activity: string, actIdx: number) => (
                          <div key={actIdx} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{activity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t ml-16">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Success Metric:</span>
                          <span className="font-medium text-blue-600">{month.metric}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Risk Assessment & Mitigation
                </h3>
                <div className="space-y-3">
                  {strategy.risks?.map((risk: any, idx: number) => (
                    <div key={idx} className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{risk.threat}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Impact:</strong> {risk.impact}
                          </p>
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          risk.severity === 'high' ? 'bg-red-200 text-red-800' :
                          risk.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {risk.severity?.toUpperCase() || 'MEDIUM'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics Dashboard */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Key Performance Indicators
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {strategy.kpis?.map((kpi: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="text-sm text-gray-600">{kpi.metric}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {kpi.current}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Target: {kpi.target}
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600 transition-all duration-500"
                          style={{ width: `${(parseInt(kpi.current) / parseInt(kpi.target)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load strategy. Please try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Generated on {new Date().toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadStrategy}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
            <button className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Download Strategy</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
