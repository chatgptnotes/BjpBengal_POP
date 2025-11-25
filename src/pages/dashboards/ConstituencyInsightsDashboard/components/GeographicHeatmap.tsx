/**
 * Geographic Heatmap Component
 * Shows West Bengal constituency map with color-coded sentiment/party strength
 */

import React from 'react';
import { MapPin } from 'lucide-react';

interface ConstituencyMapData {
  id: string;
  name: string;
  sentiment: 'strong' | 'moderate' | 'weak';
  x: number; // Position percentage
  y: number; // Position percentage
}

interface Props {
  data: ConstituencyMapData[];
  selectedConstituency?: string;
}

export default function GeographicHeatmap({ data, selectedConstituency }: Props) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'strong': return 'rgb(34, 197, 94)'; // green
      case 'moderate': return 'rgb(251, 191, 36)'; // amber
      case 'weak': return 'rgb(239, 68, 68)'; // red
      default: return 'rgb(100, 116, 139)'; // slate
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
        <span className="text-xs text-slate-400">West Bengal</span>
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
          {data.map((constituency) => (
            <g key={constituency.id}>
              <circle
                cx={constituency.x}
                cy={constituency.y}
                r={selectedConstituency === constituency.name ? 6 : 4}
                fill={getSentimentColor(constituency.sentiment)}
                opacity={selectedConstituency === constituency.name ? 1 : 0.8}
                className="transition-all duration-300 cursor-pointer hover:r-6"
                stroke={selectedConstituency === constituency.name ? 'white' : 'transparent'}
                strokeWidth={selectedConstituency === constituency.name ? 2 : 0}
              />
              {selectedConstituency === constituency.name && (
                <text
                  x={constituency.x}
                  y={constituency.y - 12}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-white"
                  style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                >
                  {constituency.name.split(' ')[0]}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-slate-400">Strong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[10px] text-slate-400">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] text-slate-400">Weak</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500">{data.length} zones</span>
      </div>
    </div>
  );
}

// Generate mock data
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
