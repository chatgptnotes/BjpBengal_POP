import React from 'react';
import {
  X,
  Calendar,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  Download,
  MapPin,
  Megaphone,
  Activity
} from 'lucide-react';

interface ImplementationStrategyProps {
  insight: any;
  constituency: string;
  onClose: () => void;
}

export default function ImplementationStrategy({ insight, constituency, onClose }: ImplementationStrategyProps) {
  return (
    <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{insight.title}</h2>
            <p className="text-orange-100 mt-1">{constituency}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-800 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            insight.priority === 'urgent' ? 'bg-red-500 text-white' :
            insight.priority === 'high' ? 'bg-orange-500 text-white' :
            insight.priority === 'medium' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {insight.priority?.toUpperCase() || 'HIGH'} PRIORITY
          </span>
          <span className="text-orange-100 text-sm">
            Impact: +{insight.expectedOutcome?.sentimentImprovement || 8}% Vote Share
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Overview */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Strategy Overview
          </h3>
          <p className="text-gray-700">{insight.description}</p>
          {insight.action && (
            <p className="text-gray-700 mt-2 font-medium">{insight.action}</p>
          )}
        </div>

        {/* Expected Outcomes */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Expected Outcomes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                +{insight.expectedOutcome?.sentimentImprovement || 8}%
              </div>
              <div className="text-sm text-gray-600">Sentiment Boost</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {insight.expectedOutcome?.voterReachIncrease?.toLocaleString() || '15,000'}
              </div>
              <div className="text-sm text-gray-600">Voter Reach</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {insight.expectedOutcome?.timeToImpact || '2-3 weeks'}
              </div>
              <div className="text-sm text-gray-600">Time to Impact</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {insight.expectedOutcome?.successRate || '85'}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-600" />
            Implementation Timeline (30 Days)
          </h3>
          <div className="space-y-3">
            {(insight.actionPlan?.groundActivities || [
              { activity: 'Ground research and booth mapping', timeline: 'Week 1' },
              { activity: 'Campaign material preparation', timeline: 'Week 2' },
              { activity: 'Door-to-door outreach', timeline: 'Week 3' },
              { activity: 'Mega rallies and final push', timeline: 'Week 4' }
            ]).map((phase, idx) => (
              <div key={idx} className="flex items-start bg-gray-50 rounded-lg p-4">
                <div className="w-20 flex-shrink-0">
                  <div className="font-medium text-orange-600">{phase.timeline || `Week ${idx + 1}`}</div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{phase.activity || phase.task}</p>
                </div>
                <div>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Requirements */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Resource Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-semibold text-gray-900">Team Size</div>
              <div className="text-sm text-gray-600 mt-1">
                {insight.resources?.volunteersNeeded || 50} volunteers
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.ceil((insight.resources?.volunteersNeeded || 50) / 10)} field coordinators
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <DollarSign className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-semibold text-gray-900">Budget</div>
              <div className="text-sm text-gray-600 mt-1">
                {insight.resources?.budgetRequired || '₹2,50,000'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Campaign materials, events, transport
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-semibold text-gray-900">Duration</div>
              <div className="text-sm text-gray-600 mt-1">
                {insight.resources?.timeCommitment || '30 days'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Full campaign cycle
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Detailed Action Items
          </h3>
          <div className="space-y-2">
            {(insight.recommendations?.immediate?.concat(
              insight.recommendations?.shortTerm || [],
              insight.recommendations?.mediumTerm || []
            ) || [
              'Identify polling booths needing attention',
              'Recruit booth volunteers',
              'Create WhatsApp groups',
              'Organize community meetings',
              'Deploy social media campaign',
              'Track daily progress'
            ]).slice(0, 10).map((action, idx) => (
              <div key={idx} className="flex items-start bg-gray-50 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Communication Strategy */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
            Communication & Outreach
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Traditional Media</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Door-to-door canvassing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Street corner meetings
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Community hall gatherings
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Poster & banner campaign
                </li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-2">Digital Media</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-orange-600" />
                  WhatsApp group campaigns
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-orange-600" />
                  Facebook community pages
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-orange-600" />
                  Video messages from leaders
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-orange-600" />
                  Local influencer collaboration
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Risk Mitigation */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Risk Mitigation
          </h3>
          <div className="space-y-2">
            {[
              { risk: 'TMC intimidation tactics', mitigation: 'Document all incidents, establish police contacts, use silent voter programs' },
              { risk: 'Low volunteer turnout', mitigation: 'Incentivize with certificates, recognition, create competitive environment' },
              { risk: 'Resource constraints', mitigation: 'Prioritize high-impact activities, leverage local resources, crowdfunding' },
              { risk: 'Misinformation campaigns', mitigation: 'Rapid response team, fact-check unit, trusted local voices' }
            ].map((item, idx) => (
              <div key={idx} className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="font-medium text-gray-900 mb-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                  {item.risk}
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  <strong>Solution:</strong> {item.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Track These Metrics Weekly
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { metric: 'Booth Coverage', target: '100%', current: '0%' },
              { metric: 'Voter Contacts', target: '50,000', current: '0' },
              { metric: 'WhatsApp Groups', target: '100', current: '0' },
              { metric: 'Volunteers Active', target: '50', current: '0' }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
                <div className="text-sm text-gray-600">{item.metric}</div>
                <div className="text-xl font-bold text-gray-900 mt-1">{item.current}</div>
                <div className="text-xs text-gray-500">Target: {item.target}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Full Strategy PDF</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span>Share with Team</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            <Phone className="w-5 h-5" />
            <span>Contact Coordinator</span>
          </button>
        </div>
      </div>
    </div>
  );
}
