/**
 * Infographic Viewer Component
 * Button + Fullscreen modal to view saved infographics from Supabase Storage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageOff,
  Download,
  Trash2,
  Maximize2
} from 'lucide-react';
import {
  getInfographicsForConstituency,
  deleteInfographic,
  type InfographicFile
} from '@/services/infographicStorageService';

interface InfographicViewerProps {
  constituencyId: string;
  constituencyName: string;
}

export default function InfographicViewer({
  constituencyId,
  constituencyName
}: InfographicViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infographics, setInfographics] = useState<InfographicFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch infographics when modal opens
  const fetchInfographics = useCallback(async () => {
    setIsLoading(true);
    try {
      const files = await getInfographicsForConstituency(constituencyId);
      setInfographics(files);
      setSelectedIndex(0);
    } catch (error) {
      console.error('[InfographicViewer] Error fetching:', error);
    } finally {
      setIsLoading(false);
    }
  }, [constituencyId]);

  useEffect(() => {
    if (isOpen) {
      fetchInfographics();
    }
  }, [isOpen, fetchInfographics]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setIsOpen(false);
        }
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => Math.min(infographics.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, infographics.length]);

  // Handle delete
  const handleDelete = async (index: number) => {
    const file = infographics[index];
    if (!file) return;

    const confirmed = window.confirm('Are you sure you want to delete this infographic?');
    if (!confirmed) return;

    const filePath = `${constituencyId}/${file.name}`;
    const success = await deleteInfographic(filePath);

    if (success) {
      const newInfographics = infographics.filter((_, i) => i !== index);
      setInfographics(newInfographics);
      if (selectedIndex >= newInfographics.length) {
        setSelectedIndex(Math.max(0, newInfographics.length - 1));
      }
    }
  };

  // Handle download
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedInfographic = infographics[selectedIndex];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50
                   text-slate-200 rounded-lg transition-colors text-sm"
        title="View Saved Infographics"
      >
        <Image size={18} />
        <span className="hidden sm:inline">Infographics</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90"
            onClick={() => !isFullscreen && setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl max-h-[90vh]'} flex flex-col`}>
            {/* Header */}
            {!isFullscreen && (
              <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur rounded-t-xl">
                <div className="text-white">
                  <h2 className="font-bold text-lg">Saved Infographics</h2>
                  <p className="text-slate-400 text-sm">{constituencyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {infographics.length > 0 && (
                    <span className="text-slate-400 text-sm">
                      {selectedIndex + 1} of {infographics.length}
                    </span>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className={`flex-1 flex items-center justify-center ${isFullscreen ? '' : 'bg-slate-800/50 backdrop-blur'} overflow-hidden`}>
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <Loader2 size={48} className="animate-spin" />
                  <p>Loading infographics...</p>
                </div>
              ) : infographics.length === 0 ? (
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <ImageOff size={64} className="opacity-50" />
                  <p className="text-lg">No saved infographics yet</p>
                  <p className="text-sm">Generate and save an infographic to see it here</p>
                </div>
              ) : (
                <>
                  {/* Navigation - Left */}
                  {selectedIndex > 0 && (
                    <button
                      onClick={() => setSelectedIndex(prev => prev - 1)}
                      className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <ChevronLeft size={32} />
                    </button>
                  )}

                  {/* Main Image */}
                  <div className={`relative ${isFullscreen ? 'w-full h-full' : 'max-w-full max-h-[60vh]'} flex items-center justify-center`}>
                    {selectedInfographic && (
                      <img
                        src={selectedInfographic.url}
                        alt={`Infographic ${selectedIndex + 1}`}
                        className={`${isFullscreen ? 'max-w-full max-h-full object-contain' : 'max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl'}`}
                      />
                    )}

                    {/* Fullscreen toggle */}
                    {!isFullscreen && selectedInfographic && (
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                        title="View Fullscreen"
                      >
                        <Maximize2 size={20} />
                      </button>
                    )}

                    {/* Close fullscreen */}
                    {isFullscreen && (
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      >
                        <X size={24} />
                      </button>
                    )}
                  </div>

                  {/* Navigation - Right */}
                  {selectedIndex < infographics.length - 1 && (
                    <button
                      onClick={() => setSelectedIndex(prev => prev + 1)}
                      className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <ChevronRight size={32} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer with Thumbnails & Actions */}
            {!isFullscreen && infographics.length > 0 && (
              <div className="p-4 bg-slate-900/80 backdrop-blur rounded-b-xl">
                {/* Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-slate-400 text-sm">
                    {selectedInfographic && (
                      <>Created: {selectedInfographic.createdAt.toLocaleString()}</>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectedInfographic && handleDownload(selectedInfographic.url, selectedInfographic.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(selectedIndex)}
                      className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                {infographics.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {infographics.map((file, index) => (
                      <button
                        key={file.name}
                        onClick={() => setSelectedIndex(index)}
                        className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all
                                   ${index === selectedIndex
                                     ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                     : 'border-transparent hover:border-slate-500'}`}
                      >
                        <img
                          src={file.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
