/**
 * Geographic Heatmap Component
 * Shows West Bengal constituency map with news-based sentiment coloring
 * - Dot size based on news count
 * - Dot color based on news sentiment
 * - Hover tooltip with headlines
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getMapData, ConstituencyMapData } from '@/utils/constituencyExtendedData';

// News data interface
interface ConstituencyNewsData {
  constituency_id: string;
  constituency_name: string;
  news_count: number;
  sentiment_score: number;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  top_headlines: string[];
}

interface MapMarkerData {
  id: string;
  name: string;
  sentiment: 'strong' | 'moderate' | 'weak';
  x: number;
  y: number;
  party?: string;
  is_swing?: boolean;
}

interface Props {
  data?: MapMarkerData[];
  selectedConstituency?: string;
  constituencyLeaders?: Array<{
    constituency_id: string;
    constituency_name: string;
    current_mla_party: string;
    current_mla_margin?: number;
    is_swing_constituency: boolean;
  }>;
}

export default function GeographicHeatmap({
  data,
  selectedConstituency,
  constituencyLeaders
}: Props) {
  // State for news data and tooltip
  const [newsData, setNewsData] = useState<ConstituencyNewsData[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [hoveredConstituency, setHoveredConstituency] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Use real data if constituencyLeaders is provided
  const mapData: MapMarkerData[] = constituencyLeaders
    ? getMapData(constituencyLeaders, selectedConstituency).map(c => ({
        id: c.constituency_id,
        name: c.constituency_name,
        sentiment: c.sentiment,
        x: c.map_x,
        y: c.map_y,
        party: c.party,
        is_swing: c.is_swing
      }))
    : (data || []);

  // Fetch news data for all constituencies
  useEffect(() => {
    const fetchNewsData = async () => {
      setLoadingNews(true);
      try {
        const response = await fetch('http://localhost:3001/api/news/all-constituencies');
        const result = await response.json();
        if (result.success && result.data) {
          setNewsData(result.data);
          console.log('[GeographicHeatmap] Loaded news for', result.data.length, 'constituencies');
        }
      } catch (error) {
        console.error('[GeographicHeatmap] Error fetching news:', error);
      }
      setLoadingNews(false);
    };

    fetchNewsData();
  }, []);

  // Get news data for a specific constituency
  const getNewsForConstituency = (constituencyId: string): ConstituencyNewsData | undefined => {
    return newsData.find(n => n.constituency_id === constituencyId);
  };

  // Get dot size based on news count
  const getDotSize = (constituencyId: string, isSelected: boolean): number => {
    if (isSelected) return 8;
    const news = getNewsForConstituency(constituencyId);
    if (!news || news.news_count === 0) return 4;
    if (news.news_count <= 3) return 5;
    if (news.news_count <= 6) return 6;
    return 7; // 7+ news = trending
  };

  // Get dot color based on news sentiment
  const getDotColor = (constituencyId: string, sentiment: string): string => {
    const news = getNewsForConstituency(constituencyId);

    if (news && news.news_count > 0) {
      // Use news sentiment colors
      switch (news.sentiment_label) {
        case 'positive': return 'rgb(16, 185, 129)'; // emerald-500
        case 'negative': return 'rgb(239, 68, 68)'; // red-500
        case 'neutral': return 'rgb(245, 158, 11)'; // amber-500
      }
    }

    // Fallback to party-based sentiment
    switch (sentiment) {
      case 'strong': return 'rgb(34, 197, 94)'; // green
      case 'moderate': return 'rgb(251, 191, 36)'; // amber
      case 'weak': return 'rgb(239, 68, 68)'; // red
      default: return 'rgb(107, 114, 128)'; // gray-500
    }
  };

  // Handle mouse enter on dot
  const handleMouseEnter = (constituency: MapMarkerData, event: React.MouseEvent) => {
    setHoveredConstituency(constituency.id);
    const rect = (event.target as SVGElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  // Get sentiment icon
  const SentimentIcon = ({ label }: { label: string }) => {
    switch (label) {
      case 'positive': return <TrendingUp size={12} className="text-emerald-400" />;
      case 'negative': return <TrendingDown size={12} className="text-red-400" />;
      default: return <Minus size={12} className="text-amber-400" />;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Geographic Heatmap
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {loadingNews && (
            <div className="animate-spin w-3 h-3 border border-emerald-500 border-t-transparent rounded-full"></div>
          )}
          <span className="text-xs text-slate-400">West Bengal</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-slate-900/50 rounded-lg p-4 aspect-[3/4]">
        {/* West Bengal SVG Outline */}
        <svg
          viewBox="0 0 300 400"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
        >
          {/* Simplified WB outline - top to bottom */}
          <path
            d="M 150,20 L 180,40 L 200,60 L 210,90 L 220,120 L 225,150 L 220,180 L 210,210 L 200,240 L 190,270 L 180,300 L 170,330 L 160,360 L 150,380 L 140,360 L 130,330 L 120,300 L 110,270 L 100,240 L 90,210 L 80,180 L 75,150 L 80,120 L 90,90 L 100,60 L 120,40 Z"
            fill="rgba(30, 41, 59, 0.8)"
            stroke="rgba(71, 85, 105, 0.5)"
            strokeWidth="1"
          />

          {/* Constituency dots */}
          {mapData.map((constituency) => {
            const isSelected = selectedConstituency === constituency.name;
            const news = getNewsForConstituency(constituency.id);
            const dotSize = getDotSize(constituency.id, isSelected);

            return (
              <g key={constituency.id}>
                {/* Pulsing animation for trending constituencies */}
                {news && news.news_count >= 7 && (
                  <circle
                    cx={constituency.x}
                    cy={constituency.y}
                    r={dotSize + 3}
                    fill="transparent"
                    stroke={getDotColor(constituency.id, constituency.sentiment)}
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Main dot */}
                <circle
                  cx={constituency.x}
                  cy={constituency.y}
                  r={dotSize}
                  fill={getDotColor(constituency.id, constituency.sentiment)}
                  opacity={isSelected ? 1 : 0.85}
                  className="transition-all duration-300 cursor-pointer"
                  stroke={isSelected ? 'white' : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                  onMouseEnter={(e) => handleMouseEnter(constituency, e)}
                  onMouseLeave={() => setHoveredConstituency(null)}
                />

                {/* News count badge */}
                {news && news.news_count > 0 && !isSelected && (
                  <text
                    x={constituency.x}
                    y={constituency.y + 3}
                    textAnchor="middle"
                    className="text-[6px] font-bold fill-white pointer-events-none"
                  >
                    {news.news_count}
                  </text>
                )}

                {/* Selected label */}
                {isSelected && (
                  <text
                    x={constituency.x}
                    y={constituency.y - 14}
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-white"
                    style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                  >
                    {constituency.name.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredConstituency && (
          <div
            className="fixed z-50 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl max-w-xs pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {(() => {
              const news = getNewsForConstituency(hoveredConstituency);
              const constituency = mapData.find(c => c.id === hoveredConstituency);

              return (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-white">
                      {news?.constituency_name || constituency?.name}
                    </span>
                    {news && (
                      <div className="flex items-center gap-1">
                        <SentimentIcon label={news.sentiment_label} />
                        <span className={`text-xs capitalize ${
                          news.sentiment_label === 'positive' ? 'text-emerald-400' :
                          news.sentiment_label === 'negative' ? 'text-red-400' :
                          'text-amber-400'
                        }`}>
                          {news.sentiment_label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* News count */}
                  {news && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Newspaper size={12} />
                      <span>{news.news_count} news articles</span>
                    </div>
                  )}

                  {/* Headlines */}
                  {news && news.top_headlines.length > 0 && (
                    <div className="border-t border-slate-700 pt-2 space-y-1">
                      {news.top_headlines.slice(0, 3).map((headline, idx) => (
                        <p key={idx} className="text-[10px] text-slate-300 line-clamp-1">
                          {headline}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* No news */}
                  {(!news || news.news_count === 0) && (
                    <p className="text-xs text-slate-500">No recent news</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-slate-400">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[10px] text-slate-400">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] text-slate-400">Negative</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500">{mapData.length} zones</span>
      </div>
    </div>
  );
}

// Generate mock data (kept for backwards compatibility)
export function generateMapData(selectedConstituency?: string): ConstituencyMapData[] {
  const constituencies = [
    { id: '1', name: 'Kolkata North', x: 150, y: 280, sentiment: 'strong' as const },
    { id: '2', name: 'Kolkata South', x: 145, y: 300, sentiment: 'moderate' as const },
    { id: '3', name: 'Howrah', x: 130, y: 290, sentiment: 'strong' as const },
    { id: '4', name: 'Darjeeling', x: 160, y: 60, sentiment: 'weak' as const },
    { id: '5', name: 'Jalpaiguri', x: 175, y: 80, sentiment: 'moderate' as const },
    { id: '6', name: 'Cooch Behar', x: 190, y: 50, sentiment: 'strong' as const },
    { id: '7', name: 'Alipurduar', x: 205, y: 70, sentiment: 'moderate' as const },
    { id: '8', name: 'Malda North', x: 140, y: 110, sentiment: 'weak' as const },
    { id: '9', name: 'Malda South', x: 135, y: 130, sentiment: 'moderate' as const },
    { id: '10', name: 'Murshidabad', x: 125, y: 160, sentiment: 'strong' as const },
    { id: '11', name: 'Nadia', x: 120, y: 220, sentiment: 'strong' as const },
    { id: '12', name: 'Bardhaman', x: 140, y: 200, sentiment: 'moderate' as const },
    { id: '13', name: 'Birbhum', x: 150, y: 170, sentiment: 'weak' as const },
    { id: '14', name: '24 Parganas N', x: 160, y: 260, sentiment: 'strong' as const },
    { id: '15', name: '24 Parganas S', x: 140, y: 320, sentiment: 'moderate' as const },
  ];

  return constituencies;
}
