import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Activity, Users, MessageCircle, Tv, MapPin,
  History, Share2, Calendar, TrendingUp, AlertTriangle,
  Menu, X, ChevronDown, Check, Clock, Sparkles, Send, Loader2, Bot,
  Target, ShieldAlert, Zap, FileText, Lock, RefreshCw, ExternalLink
} from 'lucide-react';

// Import the news service
import { fetchConstituencyNewsWithCache, clearNewsCache } from '../../../services/constituencyNewsService';
// Import strategic analysis service
import { generateStrategicAnalysis, generateFallbackAnalysis } from '../../../services/strategicAnalysisService';
// Import sidebar components
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
// Import new dynamic components
import LiveNewsTicker from './components/LiveNewsTicker';
import SocialMediaFeed, { generateMockSocialPosts } from './components/SocialMediaFeed';
import SentimentTimeline, { generateSentimentTimelineData } from './components/SentimentTimeline';

/* -------------------------------------------------------------------------
   GEMINI API UTILITIES
   ------------------------------------------------------------------------- */
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // API Key from environment

const callGeminiAPI = async (prompt: string, systemInstruction = "") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";
    } catch (error) {
      attempt++;
      if (attempt === maxRetries) {
        console.error("Gemini API failed after retries:", error);
        return "⚠️ Unable to connect to Pulse AI Strategist. Please try again later.";
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

/* -------------------------------------------------------------------------
   MOCK DATA & CONSTANTS
   ------------------------------------------------------------------------- */

// Import constituencies data
import constituenciesDataRaw from '../../../data/wb_constituencies_50.json';

const TIME_RANGES = [
  { label: "Live / Today", value: "24h", subtitle: "Last 24 Hours" },
  { label: "Last 7 Days", value: "7d", subtitle: "Weekly Aggregation" },
  { label: "Last 30 Days", value: "30d", subtitle: "Monthly Trend" },
  { label: "Election 2021", value: "4y", subtitle: "Historical Snapshot" },
  { label: "Election 2016", value: "8y", subtitle: "Historical Snapshot" },
];

// Transform constituencies data to match our structure
const MOCK_CONSTITUENCIES = constituenciesDataRaw.map((c: any) => ({
  id: c.id,
  name: c.name,
  district: c.district,
  cluster: c.city_cluster,
  is_urban: c.is_urban,
  total_voters: c.total_voters,
  social_media_activity: c.social_media_activity
}));

interface DashboardData {
  constituency_name: string;
  summary: {
    text: string;
    sentiment: string;
    confidence: string;
  };
  strategy: {
    incumbent_shield: Array<{ name: string; effect: string; desc: string }>;
    bjp_friction_points: Array<{ issue: string; severity: string; desc: string }>;
    path_to_victory: string[];
  };
  current_affairs: Array<{ date: string; event: string; type: string; impact: string }>;
  top_issues: Array<{ label: string; score: number; trend: string }>;
  segments: Array<{ name: string; sentiment: { pos: number; neg: number; neu: number }; top: string[] }>;
  social: {
    total: string;
    sentiment_split: number[];
    hashtags: string[];
  };
  debates: Array<{ channel: string; show: string; date: string; summary: string; stance: string }>;
  history: {
    last: { year: number; winner: string; party: string; margin: string };
    prev: { year: number; winner: string; party: string; margin: string };
  };
  infra: {
    wards: number;
    booths: number;
    sensitive: number;
    voters: string;
  };
  party_strength: Array<{ name: string; val: number; color: string }>;
}

const generateDashboardData = (constituencyId: string, timeRangeVal: string): DashboardData => {
  const isHistoric = timeRangeVal === '4y' || timeRangeVal === '8y';
  const constituency = MOCK_CONSTITUENCIES.find(c => c.id === constituencyId);
  const cName = constituency?.name || "Unknown";

  return {
    constituency_name: cName,
    summary: {
      text: isHistoric
        ? `In ${timeRangeVal === '4y' ? '2021' : '2016'}, ${cName} witnessed a polarized contest. The narrative was dominated by state-level welfare schemes versus anti-incumbency factors. Voter turnout was exceptionally high at 78%.`
        : `Current sentiment in ${cName} is cautiously optimistic but fragile. Recent infrastructure announcements have boosted engagement, but inflation remains a critical pain point across middle-class segments.`,
      sentiment: isHistoric ? "High Engagement" : "Mixed / Volatile",
      confidence: "89%"
    },
    // Deep Strategic Analysis Data
    strategy: {
      incumbent_shield: [
        { name: "Lakshmir Bhandar", effect: "High", desc: "92% penetration in slums creating a loyalty lock." },
        { name: "Local Club Network", effect: "Medium", desc: "Strong control over Ward 12 & 14 via Durga Puja grants." },
        { name: "Minority Consolidation", effect: "High", desc: "Est. 28% vote bank consolidated fully behind incumbent." }
      ],
      bjp_friction_points: [
        { issue: "Booth Organization", severity: "Critical", desc: "No Panna Pramukh in 35 booths (Ward 8, 9)." },
        { issue: "Narrative Gap", severity: "High", desc: "Campaign focused on national issues; voters asking for local drainage solutions." },
        { issue: "Candidate Connect", severity: "Medium", desc: "Candidate seen as 'absent' post-election 2021." }
      ],
      path_to_victory: [
        "Hyper-local campaign on 'Drainage & Water' to counter welfare narrative.",
        "Target 'Mahila Morcha' specifically to crack the Lakshmir Bhandar shield.",
        "Must secure 65% of the split Anti-Incumbency vote to overcome minority deficit."
      ]
    },
    current_affairs: isHistoric ? [] : [
      { date: "Today, 10:30 AM", event: "Traders association protest regarding new GST compliance norms near Market Sq.", type: "Protest", impact: "High" },
      { date: "Today, 08:15 AM", event: "Minor water logging reported in Ward 12 & 13 after overnight rain.", type: "Civic", impact: "Medium" },
      { date: "Yesterday", event: "Inauguration of community hall by local MLA; positive reception in Ward 05.", type: "Event", impact: "Low" },
      { date: "Nov 23", event: "Viral video circulating alleging unfair ration distribution in slum cluster.", type: "Social", impact: "High" }
    ],
    top_issues: isHistoric
      ? [
          { label: "Welfare Schemes", score: 92, trend: "up" },
          { label: "State Leadership", score: 85, trend: "neutral" },
          { label: "Corruption Allegations", score: 76, trend: "up" },
          { label: "Local Development", score: 60, trend: "down" }
        ]
      : [
          { label: "Unemployment", score: 87, trend: "up" },
          { label: "Price Rise / Inflation", score: 79, trend: "up" },
          { label: "Civic Infrastructure", score: 68, trend: "neutral" },
          { label: "Law & Order", score: 55, trend: "down" },
          { label: "Education / Exams", score: 48, trend: "up" }
        ],
    segments: [
      { name: "Youth (18-30)", sentiment: { pos: 20, neg: 60, neu: 20 }, top: ["Jobs", "Exam Process"] },
      { name: "Women (35+)", sentiment: { pos: 65, neg: 15, neu: 20 }, top: ["Lakshmir Bhandar", "Safety"] },
      { name: "Small Traders", sentiment: { pos: 30, neg: 40, neu: 30 }, top: ["License Issues", "GST"] },
      { name: "Urban Middle Class", sentiment: { pos: 40, neg: 45, neu: 15 }, top: ["DA Issues", "Inflation"] }
    ],
    social: {
      total: isHistoric ? "125K" : "3.4K",
      sentiment_split: isHistoric ? [45, 35, 20] : [32, 48, 20], // Pos, Neg, Neu
      hashtags: isHistoric ? ["#Bengal2021", "#KhelaHobe", "#Modi"] : ["#JobsNow", "#PriceHike", "#LocalFestivals", "#TrafficWoes"]
    },
    debates: [
      { channel: "NewsX Bengal", show: "Prime Debate", date: "2d ago", summary: "Heated debate on municipal tenders. Opposition alleged favoritism.", stance: "Critical" },
      { channel: "Republic Bangla", show: "Jabab Chai", date: "4d ago", summary: "Discussion on upcoming cultural festival funding.", stance: "Positive" },
      { channel: "ABP Ananda", show: "Ghanta Khanek", date: "5d ago", summary: "Panel on waterlogging issues in low-lying wards.", stance: "Neutral" }
    ],
    history: {
      last: { year: 2021, winner: "A. Ray", party: "TMC", margin: "+28k" },
      prev: { year: 2016, winner: "S. Chattopadhyay", party: "TMC", margin: "+24k" }
    },
    infra: {
      wards: 12,
      booths: 245,
      sensitive: 14,
      voters: "2.1L"
    },
    party_strength: [
      { name: "TMC", val: 65, color: "bg-green-500" },
      { name: "BJP", val: 25, color: "bg-orange-500" },
      { name: "CPI(M)", val: 8, color: "bg-red-600" },
      { name: "INC", val: 2, color: "bg-blue-500" }
    ]
  };
};

/* -------------------------------------------------------------------------
   SUB-COMPONENTS
   ------------------------------------------------------------------------- */

const SentimentBar = ({ pos, neg, neu }: { pos: number; neg: number; neu: number }) => (
  <div className="w-full h-3 rounded-full flex overflow-hidden bg-gray-100 mt-2">
    <div style={{ width: `${pos}%` }} className="bg-emerald-500 h-full" />
    <div style={{ width: `${neu}%` }} className="bg-gray-400 h-full" />
    <div style={{ width: `${neg}%` }} className="bg-rose-500 h-full" />
  </div>
);

const SegmentCard = ({ data }: { data: DashboardData['segments'][0] }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-gray-800 text-sm">{data.name}</h4>
      <Users size={14} className="text-gray-400" />
    </div>
    <div className="mb-3">
      <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider">
        <span>Sentiment</span>
        <span className="text-emerald-600">{data.sentiment.pos}% Pos</span>
      </div>
      <SentimentBar {...data.sentiment} />
    </div>
    <div className="flex flex-wrap gap-1">
      {data.top.map((t, i) => (
        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
          {t}
        </span>
      ))}
    </div>
  </div>
);

const PartyBar = ({ name, val, color }: { name: string; val: number; color: string }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="w-12 text-xs font-bold text-gray-600">{name}</div>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${val}%` }}></div>
    </div>
    <div className="w-8 text-xs font-bold text-right text-gray-800">{val}%</div>
  </div>
);

const StrategicDeepDive = ({ strategy, lastUpdate }: { strategy: DashboardData['strategy']; lastUpdate?: string }) => (
  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

    <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Target size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-wider">Strategic Intelligence Unit</h3>
          <p className="text-xs text-slate-400">War Room Diagnostic Report</p>
        </div>
      </div>
      {lastUpdate && (
        <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1.5 rounded-lg">
          <Activity size={12} className="text-blue-400 animate-pulse" />
          <span className="text-[10px] text-blue-300 font-bold">LIVE • {lastUpdate}</span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

      {/* 1. Incumbent Shield */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase mb-3">
          <ShieldAlert size={14} /> The Incumbent Shield (Why They Win)
        </h4>
        <div className="space-y-3">
          {strategy.incumbent_shield.map((item, i) => (
            <div key={i} className="bg-slate-800 p-3 rounded border-l-2 border-emerald-500">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-200">{item.name}</span>
                <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded uppercase">{item.effect} Impact</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Friction Points */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase mb-3">
          <AlertTriangle size={14} /> Friction Points (Why BJP Fails)
        </h4>
        <div className="space-y-3">
          {strategy.bjp_friction_points.map((item, i) => (
            <div key={i} className="bg-slate-800 p-3 rounded border-l-2 border-rose-500">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-200">{item.issue}</span>
                <span className="text-[10px] bg-rose-900/40 text-rose-400 px-1.5 py-0.5 rounded uppercase">{item.severity}</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Path to Victory */}
      <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-4 border border-blue-500/20">
        <h4 className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-3">
          <Zap size={14} /> Path to 51% (Winning Formula)
        </h4>
        <div className="space-y-3">
          {strategy.path_to_victory.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {i+1}
              </div>
              <p className="text-sm text-slate-300 font-medium leading-snug">{step}</p>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-blue-500/20">
             <div className="flex items-center gap-2 text-[10px] text-blue-300 bg-blue-900/30 px-3 py-2 rounded">
                <Lock size={12} /> Confidential Strategy Note
             </div>
          </div>
        </div>
      </div>

    </div>
  </div>
);

/* -------------------------------------------------------------------------
   AI STRATEGIST COMPONENT
   ------------------------------------------------------------------------- */

const PulseAIStrategist = ({ data }: { data: DashboardData }) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const predefinedQueries = [
    "What is the biggest risk for the incumbent party?",
    "How can we improve sentiment among youth voters?",
    "Draft a 3-point strategy based on current issues."
  ];

  const handleAsk = async (textToAsk: string) => {
    if (!textToAsk) return;
    setIsThinking(true);
    setResponse(null); // Clear previous
    setQuery(textToAsk);

    const systemPrompt = `You are a political campaign strategist for the ${data.constituency_name} constituency in West Bengal.
    Analyze the provided dashboard JSON data carefully.
    - The user is a campaign manager.
    - Keep answers concise, actionable, and data-driven based on the JSON.
    - Use bullet points.
    - If the sentiment is negative, suggest corrective measures.

    Dashboard Data Context: ${JSON.stringify(data)}`;

    const result = await callGeminiAPI(textToAsk, systemPrompt);
    setResponse(result);
    setIsThinking(false);
  };

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response, isThinking, isOpen]);

  return (
    <>
      {/* FAB to open Strategist */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center gap-2 group"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="group-hover:animate-spin-slow" />}
        {!isOpen && <span className="text-sm font-bold pr-2">Ask AI Strategist</span>}
      </button>

      {/* Strategist Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot size={20} />
              <h3 className="font-bold">Pulse AI Strategist</h3>
            </div>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-mono">Gemini 2.5 Flash</span>
          </div>

          <div className="p-4 h-96 overflow-y-auto bg-slate-50">
            {/* Welcome Msg */}
            <div className="mb-4">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-700">
                Hello! I've analyzed the data for <strong>{data.constituency_name}</strong>. The youth sentiment is currently a concern. How can I assist your campaign strategy?
              </div>
            </div>

            {/* Q&A Conversation */}
            {query && (
              <div className="mb-4 flex justify-end">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
                  {query}
                </div>
              </div>
            )}

            {isThinking && (
              <div className="mb-4">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-3 w-fit">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs font-bold text-slate-500 animate-pulse">Analyzing voter segments...</span>
                </div>
              </div>
            )}

            {response && (
              <div className="mb-4">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-purple-100 shadow-sm text-sm text-slate-700 leading-relaxed prose prose-sm prose-indigo">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                     <Sparkles size={12} /> Strategic Insight
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions & Input */}
          <div className="p-3 bg-white border-t border-slate-100">
             {/* Predefined Chips */}
             <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                {predefinedQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(q)}
                    className="flex-shrink-0 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
             </div>

             <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about strategy, demographics..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      handleAsk(target.value);
                      target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input');
                    if (input) {
                      handleAsk(input.value);
                      input.value = '';
                    }
                  }}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send size={16} />
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

/* -------------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------------- */

export default function PulseDashboard() {
  const [selectedId, setSelectedId] = useState(MOCK_CONSTITUENCIES[0].id);
  const [timeRangeIdx, setTimeRangeIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<string>('');

  // Refs for horizontal scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);

  // Load Data Effect
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const constituency = MOCK_CONSTITUENCIES.find(c => c.id === selectedId);
        if (!constituency) return;

        // Generate base dashboard data
        const baseData = generateDashboardData(selectedId, TIME_RANGES[timeRangeIdx].value);

        // Fetch real-time news for current time ranges only
        if (timeRangeIdx <= 2) { // Live, 7D, 30D only
          setLoadingNews(true);
          try {
            const newsData = await fetchConstituencyNewsWithCache(
              constituency.id,
              constituency.name,
              constituency.district
            );

            // Merge real news data with base data
            baseData.current_affairs = newsData.current_affairs.map(item => ({
              date: item.date,
              event: item.event,
              type: item.type,
              impact: item.impact
            }));

            baseData.social.hashtags = newsData.trending_hashtags;
            baseData.social.total = newsData.social_mentions > 0
              ? `${(newsData.social_mentions / 1000).toFixed(1)}K`
              : baseData.social.total;

            // Generate dynamic strategic analysis based on real news
            const strategicAnalysis = generateStrategicAnalysis(
              constituency.name,
              constituency.district,
              newsData.current_affairs,
              baseData.top_issues,
              baseData.segments
            );

            // Update strategy with real analysis
            baseData.strategy = strategicAnalysis;

            setLastNewsUpdate(new Date(newsData.last_updated).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }));
          } catch (error) {
            console.error('Error loading news:', error);
            // Use fallback analysis if news fetch fails
            baseData.strategy = generateFallbackAnalysis(constituency.name);
          } finally {
            setLoadingNews(false);
          }
        } else {
          // Use fallback analysis for historical time ranges
          baseData.strategy = generateFallbackAnalysis(constituency.name);
        }

        setData(baseData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedId, timeRangeIdx]);

  // Auto-scroll to middle section when data loads
  useEffect(() => {
    if (data && middleSectionRef.current && scrollContainerRef.current) {
      // Wait for layout to complete
      const timer = setTimeout(() => {
        if (middleSectionRef.current && scrollContainerRef.current) {
          // Calculate scroll position to center the middle section
          const container = scrollContainerRef.current;
          const middle = middleSectionRef.current;

          const scrollLeft = middle.offsetLeft - (container.clientWidth / 2) + (middle.clientWidth / 2);

          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }, 300); // Wait 300ms for components to render

      return () => clearTimeout(timer);
    }
  }, [data]);

  // Manual refresh function
  const handleRefreshNews = async () => {
    const constituency = MOCK_CONSTITUENCIES.find(c => c.id === selectedId);
    if (!constituency || !data) return;

    setLoadingNews(true);
    try {
      // Clear cache and fetch fresh data
      clearNewsCache(constituency.id);
      const newsData = await fetchConstituencyNewsWithCache(
        constituency.id,
        constituency.name,
        constituency.district
      );

      setData(prevData => {
        if (!prevData) return prevData;

        // Generate new strategic analysis
        const strategicAnalysis = generateStrategicAnalysis(
          constituency.name,
          constituency.district,
          newsData.current_affairs,
          prevData.top_issues,
          prevData.segments
        );

        return {
          ...prevData,
          current_affairs: newsData.current_affairs.map(item => ({
            date: item.date,
            event: item.event,
            type: item.type,
            impact: item.impact
          })),
          social: {
            ...prevData.social,
            hashtags: newsData.trending_hashtags,
            total: newsData.social_mentions > 0
              ? `${(newsData.social_mentions / 1000).toFixed(1)}K`
              : prevData.social.total
          },
          strategy: strategicAnalysis
        };
      });

      setLastNewsUpdate(new Date(newsData.last_updated).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const activeRange = TIME_RANGES[timeRangeIdx];
  const activeConstituency = MOCK_CONSTITUENCIES.find(c => c.id === selectedId);

  if (!activeConstituency) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 relative">

      {/* 1. STICKY HEADER */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">PULSE</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">West Bengal</p>
            </div>
          </div>

          {/* Desktop Selector */}
          <div className="hidden md:flex items-center gap-4">
             <div className="relative">
                <select
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer appearance-none pr-8 border border-slate-200"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {MOCK_CONSTITUENCIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.district}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
             </div>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4">
             <label className="text-xs font-bold text-slate-400 uppercase">Select Constituency</label>
             <select
                className="w-full mt-2 p-2 bg-slate-100 rounded-lg text-sm font-bold"
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setMobileMenuOpen(false); }}
              >
                {MOCK_CONSTITUENCIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.district}</option>
                ))}
              </select>
          </div>
        )}
      </nav>

      {/* 2. TIMELINE SLIDER (Full Width) */}
      <div className="bg-slate-900 text-white pt-6 pb-8 px-4 rounded-b-[2.5rem] shadow-lg mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Time Window</h2>
              <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                {activeRange.label}
                <span className="text-sm font-normal text-slate-400 hidden md:inline-block">| {activeRange.subtitle}</span>
              </div>
            </div>
            <Calendar className="text-slate-600 hidden md:block" size={32} />
          </div>

          <div className="relative">
             <input
              type="range"
              min="0"
              max={TIME_RANGES.length - 1}
              step="1"
              value={timeRangeIdx}
              onChange={(e) => setTimeRangeIdx(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 z-10 relative"
            />
            <div className="flex justify-between mt-3 px-1">
              {TIME_RANGES.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center cursor-pointer transition-all ${idx === timeRangeIdx ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                  onClick={() => setTimeRangeIdx(idx)}
                >
                  <div className={`w-1 h-2 mb-1 rounded-full ${idx === timeRangeIdx ? 'bg-blue-400' : 'bg-transparent'}`} />
                  <span className="text-[10px] md:text-xs font-bold uppercase">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      {loading || !data ? (
        <div className="max-w-5xl mx-auto px-4 h-64 flex flex-col items-center justify-center text-slate-400">
           <Activity className="animate-spin mb-3 text-blue-500" size={32} />
           <p className="text-sm font-medium animate-pulse">Analyzing constituency data...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 space-y-6">

          {/* AI Strategist Inject */}
          <PulseAIStrategist data={data} />

          {/* NEW: HORIZONTAL SCROLLING LAYOUT */}
          <div className="relative">
            {/* Horizontal scroll container */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {/* LEFT SIDEBAR */}
                <div
                  className="flex-shrink-0 w-[400px]"
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <LeftSidebar topIssues={data.top_issues} />
                </div>

                {/* MIDDLE SECTION - Strategic Intelligence Unit */}
                <div
                  ref={middleSectionRef}
                  className="flex-shrink-0 w-[700px]"
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {data.strategy && <StrategicDeepDive strategy={data.strategy} lastUpdate={lastNewsUpdate} />}
                </div>

                {/* RIGHT SIDEBAR */}
                <div
                  className="flex-shrink-0 w-[400px]"
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <RightSidebar selectedConstituency={data.constituency_name} />
                </div>
              </div>
            </div>

            {/* Scroll indicators */}
            <div className="flex justify-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <span>Left</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Strategic Intelligence</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <span>Right</span>
              </div>
            </div>
          </div>

          {/* LIVE NEWS TICKER */}
          <LiveNewsTicker
            news={data.current_affairs || []}
            lastUpdate={lastNewsUpdate}
            onRefresh={handleRefreshNews}
            isLoading={loadingNews}
          />

          {/* REAL-TIME SOCIAL MEDIA & SENTIMENT TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Social Media Feed */}
            <SocialMediaFeed posts={generateMockSocialPosts()} />

            {/* Sentiment Timeline */}
            <SentimentTimeline data={generateSentimentTimelineData(30)} />
          </div>

          {/* A. SUMMARY & TOP ISSUES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN: Summary + Current Affairs */}
            <div className="lg:col-span-2 space-y-6">
               {/* 1. AI Summary Card */}
               <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MessageCircle size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Activity size={10} /> AI ANALYSIS
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{data.summary.sentiment}</span>
                    </div>
                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                      "{data.summary.text}"
                    </p>
                  </div>
               </div>

               {/* 2. The Current Affairs */}
               {data.current_affairs && data.current_affairs.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} className="text-blue-500" /> Current Affairs (Live Log)
                      </h3>
                      <div className="flex items-center gap-2">
                        {lastNewsUpdate && (
                          <span className="text-[10px] text-slate-400">
                            Updated: {lastNewsUpdate}
                          </span>
                        )}
                        <button
                          onClick={handleRefreshNews}
                          disabled={loadingNews || timeRangeIdx > 2}
                          className={`p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            loadingNews ? 'animate-spin' : ''
                          }`}
                          title="Refresh news"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                    {loadingNews && data.current_affairs.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
                        <span className="text-sm text-slate-500">Loading real-time news...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.current_affairs.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 hover:border-blue-500 transition-colors group">
                             <div className="w-24 flex-shrink-0 pt-0.5">
                                <div className="text-xs font-bold text-slate-800">{item.date}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase mt-1">{item.type}</div>
                             </div>
                             <div className="flex-1">
                                <p className="text-sm text-slate-600 font-medium leading-snug group-hover:text-slate-900">{item.event}</p>
                             </div>
                             <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                               item.impact === 'High' ? 'bg-rose-50 text-rose-600' :
                               item.impact === 'Medium' ? 'bg-amber-50 text-amber-600' :
                               'bg-slate-100 text-slate-500'
                             }`}>
                               {item.impact} Impact
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {timeRangeIdx > 2 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <AlertTriangle size={12} className="inline mr-1" />
                          Real-time news is available for Live, 7D, and 30D timeframes only.
                        </p>
                      </div>
                    )}
                  </div>
               )}
            </div>

            {/* RIGHT COLUMN: Top Issues List */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-fit">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dominant Issues</h3>
               <div className="space-y-4">
                 {data.top_issues.slice(0, 5).map((issue, i) => (
                   <div key={i} className="group">
                     <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                       <span>{i+1}. {issue.label}</span>
                       <span className="text-blue-600">{issue.score}%</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${issue.score}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* B. VOTER SEGMENTS */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={20} /> Voter Segments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {data.segments.map((seg, i) => <SegmentCard key={i} data={seg} />)}
            </div>
          </div>

          {/* C. SOCIAL & MEDIA ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Social Sentiment */}
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <Share2 size={18} className="text-blue-500" /> Social Sentiment
                   </h3>
                   <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-bold">
                     {data.social.total} Posts
                   </span>
                </div>

                <div className="flex items-center gap-6">
                   {/* Donut Chart Simulation */}
                   <div className="relative w-32 h-32 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        {/* Circle Background */}
                        <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        {/* Positive Segment */}
                        <path className="text-emerald-500" strokeDasharray={`${data.social.sentiment_split[0]}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        {/* Negative Segment (Offset roughly) */}
                        <path className="text-rose-500" strokeDasharray={`${data.social.sentiment_split[1]}, 100`} strokeDashoffset={`-${data.social.sentiment_split[0]}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-xl font-bold text-slate-800">{data.social.sentiment_split[0]}%</span>
                         <span className="text-[8px] uppercase font-bold text-emerald-600">Positive</span>
                      </div>
                   </div>

                   {/* Hashtags */}
                   <div className="flex-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Trending Hashtags</h4>
                      <div className="flex flex-wrap gap-2">
                         {data.social.hashtags.map((tag, i) => (
                           <span key={i} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                             {tag}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* TV Debates */}
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                   <Tv size={18} className="text-purple-500" /> TV Debates
                </h3>
                <div className="space-y-4">
                   {data.debates.map((d, i) => (
                     <div key={i} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                           {d.channel.substring(0,2)}
                        </div>
                        <div>
                           <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-slate-900">{d.show}</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${d.stance === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{d.stance}</span>
                           </div>
                           <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.summary}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* D. BOTTOM GRID: HISTORY & INFRA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Party Strength */}
             <div className="bg-white p-5 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex gap-2 items-center"><BarChart size={14}/> Party Strength</h3>
                {data.party_strength.map((p, i) => (
                  <PartyBar key={i} {...p} />
                ))}
             </div>

             {/* Historical Results */}
             <div className="bg-white p-5 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex gap-2 items-center"><History size={14}/> Past Verdicts</h3>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <div className="text-[10px] font-bold text-green-800 uppercase opacity-60">2021</div>
                      <div className="font-bold text-slate-900">{data.history.last.party}</div>
                      <div className="text-xs text-green-700">{data.history.last.margin}</div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase opacity-60">2016</div>
                      <div className="font-bold text-slate-900">{data.history.prev.party}</div>
                      <div className="text-xs text-slate-600">{data.history.prev.margin}</div>
                   </div>
                </div>
             </div>

             {/* Infra Info */}
             <div className="bg-slate-800 text-slate-200 p-5 rounded-xl flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-1">Infrastructure</h3>
                    <div className="text-2xl font-bold text-white">{activeConstituency.cluster}</div>
                  </div>
                  <MapPin className="text-blue-500" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-4">
                   <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-lg font-bold text-white">{data.infra.wards}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Wards</div>
                   </div>
                   <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-lg font-bold text-white">{data.infra.booths}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Booths</div>
                   </div>
                   <div className="bg-slate-700/50 p-2 rounded border border-rose-500/30">
                      <div className="text-lg font-bold text-rose-400 flex items-center justify-center gap-1">
                        <AlertTriangle size={12} /> {data.infra.sensitive}
                      </div>
                      <div className="text-[10px] text-rose-300 uppercase">Sensitive</div>
                   </div>
                </div>
             </div>
          </div>

          <div className="h-8"></div>
        </div>
      )}
    </div>
  );
}
