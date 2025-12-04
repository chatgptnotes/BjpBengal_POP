/**
 * Infographic Hero Component
 * Fullscreen display of the most recent saved infographic
 * If no infographic exists, shows a banner message and allows the rest of the page to load
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Loader2,
  Download,
  ZoomIn,
  ZoomOut,
  X,
  AlertCircle
} from 'lucide-react';
import {
  getInfographicsForConstituency,
  type InfographicFile
} from '@/services/infographicStorageService';

interface InfographicHeroProps {
  constituencyId: string;
  constituencyName: string;
  onGenerateClick?: () => void;
}

export default function InfographicHero({
  constituencyId,
  constituencyName,
  onGenerateClick
}: InfographicHeroProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [latestInfographic, setLatestInfographic] = useState<InfographicFile | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      setIsLoading(true);
      try {
        const files = await getInfographicsForConstituency(constituencyId);
        if (files.length > 0) {
          setLatestInfographic(files[0]); // Most recent first
        }
      } catch (error) {
        console.error('[InfographicHero] Error fetching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatest();
  }, [constituencyId]);

  const handleDownload = () => {
    if (latestInfographic) {
      const link = document.createElement('a');
      link.href = latestInfographic.url;
      link.download = latestInfographic.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Loading state - show small loader, don't block page
  if (isLoading) {
    return (
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Loading infographic...</span>
        </div>
      </div>
    );
  }

  // No infographic - show banner message, don't block page
  if (!latestInfographic) {
    return (
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-b border-amber-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertCircle size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-amber-200 font-medium text-sm">No infographic saved for {constituencyName}</p>
              <p className="text-amber-400/70 text-xs">Please generate an infographic first using the button below</p>
            </div>
          </div>
          {onGenerateClick && (
            <button
              onClick={onGenerateClick}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <ImageIcon size={16} />
              Generate
            </button>
          )}
        </div>
      </div>
    );
  }

  // Has infographic - show fullscreen
  return (
    <>
      <div className="h-screen w-screen bg-slate-900 relative overflow-hidden">
        {/* Fullscreen image as background */}
        <motion.img
          src={latestInfographic.url}
          alt={`${constituencyName} Infographic`}
          className="absolute inset-0 w-full h-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Header bar overlay - only action buttons, no duplicate title */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg text-white transition-colors"
            title={isZoomed ? "Fit to screen" : "View original size"}
          >
            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700
                       text-white rounded-lg transition-colors font-medium shadow-lg"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Zoomed modal - shows original size */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-auto"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="fixed top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X size={24} />
          </button>
          <img
            src={latestInfographic.url}
            alt={`${constituencyName} Infographic - Original Size`}
            className="max-w-none cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
