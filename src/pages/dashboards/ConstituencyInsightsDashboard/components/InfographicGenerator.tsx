/**
 * Infographic Generator Component
 * FAB button + Modal for generating and downloading constituency infographics
 */

import React, { useState, useCallback } from 'react';
import {
  Image as ImageIcon,
  X,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Database,
  BarChart3,
  Layout,
  CheckCircle
} from 'lucide-react';

import {
  generateConstituencyInfographic,
  downloadImage,
  getImageDataUrl,
  type GenerationStage,
  type InfographicData
} from '@/services/geminiImageService';
import { collectInfographicData } from '../utils/collectInfographicData';
import type { ConstituencyLeader } from '@/services/leaderTracking/constituencyLeaderService';

// Props interface
interface InfographicGeneratorProps {
  constituencyId: string;
  constituency: {
    id: string;
    name: string;
    district: string;
    cluster: string;
    is_urban: boolean;
    total_voters: number;
    social_media_activity: string | number;
  };
  dashboardData: {
    constituency_name: string;
    summary: { text: string; sentiment: string; confidence: string };
    strategy: {
      incumbent_shield: Array<{ name: string; effect: string; desc: string }>;
      bjp_friction_points: Array<{ issue: string; severity: string; desc: string }>;
      path_to_victory: string[];
    };
    current_affairs: Array<{ date: string; event: string; type: string; impact: string }>;
    top_issues: Array<{ label: string; score: number; trend: string }>;
    segments: Array<{ name: string; sentiment: { pos: number; neg: number; neu: number }; top: string[] }>;
    social: { total: string; sentiment_split: number[]; hashtags: string[] };
    debates: Array<{ channel: string; show: string; date: string; summary: string; stance: string }>;
    history: {
      last: { year: number; winner: string; party: string; margin: string };
      prev: { year: number; winner: string; party: string; margin: string };
    };
    infra: { wards: number; booths: number; sensitive: number; voters: string };
    party_strength: Array<{ name: string; val: number; color: string }>;
  };
  currentLeader: ConstituencyLeader | null;
}

// Loading stage configuration
const loadingStages: Array<{
  stage: GenerationStage;
  label: string;
  icon: React.ElementType;
  progress: number;
}> = [
  { stage: 'collecting-data', label: 'Collecting constituency data...', icon: Database, progress: 20 },
  { stage: 'generating-prompt', label: 'Preparing visual layout...', icon: Layout, progress: 40 },
  { stage: 'calling-api', label: 'Generating with Gemini AI...', icon: BarChart3, progress: 60 },
  { stage: 'processing-response', label: 'Rendering infographic...', icon: ImageIcon, progress: 80 },
  { stage: 'complete', label: 'Complete!', icon: CheckCircle, progress: 100 },
];

export default function InfographicGenerator({
  constituencyId,
  constituency,
  dashboardData,
  currentLeader
}: InfographicGeneratorProps) {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<GenerationStage>('idle');
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Get current stage info
  const currentStageInfo = loadingStages.find(s => s.stage === currentStage) || loadingStages[0];
  const currentStageIndex = loadingStages.findIndex(s => s.stage === currentStage);

  // Handle stage change callback
  const handleStageChange = useCallback((stage: GenerationStage, stageProgress: number) => {
    setCurrentStage(stage);
    setProgress(stageProgress);
  }, []);

  // Generate infographic
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentStage('collecting-data');
    setProgress(10);

    try {
      // Collect data
      handleStageChange('collecting-data', 15);
      const infographicData = await collectInfographicData(
        constituencyId,
        constituency,
        dashboardData,
        currentLeader
      );

      // Generate image
      const result = await generateConstituencyInfographic(
        infographicData,
        handleStageChange
      );

      if (result.success && result.imageData) {
        setGeneratedImage(result.imageData);
        setImageMimeType(result.mimeType || 'image/png');
        setCurrentStage('complete');
        setProgress(100);
      } else {
        setError(result.error || 'Failed to generate infographic');
        setCurrentStage('error');
      }
    } catch (err) {
      console.error('[InfographicGenerator] Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentStage('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download handlers
  const handleDownloadPNG = () => {
    if (generatedImage) {
      const filename = `${constituency.name.replace(/\s+/g, '_')}_Infographic_${new Date().toISOString().split('T')[0]}.png`;
      downloadImage(generatedImage, 'image/png', filename);
    }
  };

  const handleDownloadJPG = () => {
    if (generatedImage) {
      const filename = `${constituency.name.replace(/\s+/g, '_')}_Infographic_${new Date().toISOString().split('T')[0]}.jpg`;
      downloadImage(generatedImage, 'image/jpeg', filename);
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  // Close and reset
  const handleClose = () => {
    setIsModalOpen(false);
    // Reset state after animation
    setTimeout(() => {
      if (!isGenerating) {
        setCurrentStage('idle');
        setProgress(0);
        setError(null);
        setZoom(1);
      }
    }, 300);
  };

  return (
    <>
      {/* FAB Button - Bottom Left */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-emerald-600 to-teal-600
                   text-white p-4 rounded-full shadow-2xl hover:scale-105
                   transition-transform z-40 flex items-center gap-2 group"
        title="Generate Constituency Infographic"
      >
        <ImageIcon size={24} className="group-hover:animate-pulse" />
        <span className="text-sm font-bold pr-2 hidden md:inline">Generate Infographic</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isGenerating ? handleClose : undefined}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <ImageIcon size={24} />
                <div>
                  <h2 className="font-bold text-lg">Constituency Infographic</h2>
                  <p className="text-emerald-100 text-xs">{constituency.name} - {constituency.district}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isGenerating}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">

              {/* Initial State - Generate Button */}
              {currentStage === 'idle' && !generatedImage && !error && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Generate AI Infographic
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Create a comprehensive visual summary of {constituency.name} constituency
                    including demographics, election history, voter sentiment, and strategic insights.
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white
                               px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg
                               hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                  >
                    <ImageIcon size={20} />
                    Generate Now
                  </button>
                  <p className="text-xs text-slate-400 mt-4">
                    Powered by Google Gemini AI
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="text-center py-12">
                  {/* Animated Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 rounded-full">
                      {React.createElement(currentStageInfo.icon, {
                        className: 'w-10 h-10 text-emerald-600 animate-pulse'
                      })}
                    </div>
                  </div>

                  {/* Stage Label */}
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {currentStageInfo.label}
                  </h3>

                  {/* Progress Bar */}
                  <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full
                                 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Stage Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {loadingStages.slice(0, -1).map((stage, idx) => (
                      <div
                        key={stage.stage}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx <= currentStageIndex ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Estimated Time */}
                  <p className="text-xs text-slate-400 mt-6">
                    This may take 15-30 seconds...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isGenerating && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold text-rose-800 mb-2">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-rose-600 mb-6 max-w-md mx-auto">
                    {error}
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600
                                 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Success - Image Preview */}
              {generatedImage && !isGenerating && (
                <div className="space-y-4">
                  {/* Zoom Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <span className="text-sm text-slate-500 font-medium w-16 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ZoomIn size={16} />
                      </button>
                    </div>
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600
                                 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>
                  </div>

                  {/* Image Container */}
                  <div className="border border-slate-200 rounded-xl overflow-auto bg-slate-50 max-h-[50vh]">
                    <img
                      src={getImageDataUrl(generatedImage, imageMimeType)}
                      alt={`${constituency.name} Political Strategy Infographic`}
                      className="transition-transform duration-200 origin-top-left"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="text-center text-sm text-slate-500">
                    <p>Generated: {new Date().toLocaleString()}</p>
                    <p>{constituency.name} | {constituency.district} District</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Download Buttons */}
            {generatedImage && !isGenerating && (
              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100
                             hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
                >
                  <Download size={16} />
                  PNG
                </button>
                <button
                  onClick={handleDownloadJPG}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600
                             hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Download size={16} />
                  Download JPG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
