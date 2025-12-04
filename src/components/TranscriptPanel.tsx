import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Play,
  Pause,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Radio,
  Wifi,
  WifiOff,
  Loader2,
  Filter,
  FilterX,
  Database,
  CloudOff
} from 'lucide-react';
import transcriptionSocket, { TranscriptLine } from '../services/transcriptionSocket';
import { saveTranscript, getTranscripts } from '../services/transcriptStorageService';

export type { TranscriptLine };

interface TranscriptPanelProps {
  channelName: string;
  channelId?: string; // YouTube channel ID for real transcription
  isLive?: boolean;
  maxHeight?: string;
}

// No mock data - real transcription only

export default function TranscriptPanel({ channelName, channelId, isLive = true, maxHeight = '350px' }: TranscriptPanelProps) {
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true); // Track if component is mounted

  // Real transcription state - starts disconnected, user must click to connect
  const [isRealMode, setIsRealMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [filterPolitical, setFilterPolitical] = useState(false); // false = show all, true = BJP/TMC only
  const [autoSaveToSupabase, setAutoSaveToSupabase] = useState(true); // Auto-save transcripts to Supabase
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [savedCount, setSavedCount] = useState(0);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbCount, setDbCount] = useState(0);

  // Generate timestamp based on current time minus offset
  const generateTimestamp = (offsetSeconds: number): string => {
    const now = new Date();
    now.setSeconds(now.getSeconds() - offsetSeconds);
    return now.toLocaleTimeString('en-IN', { hour12: false });
  };

  // Start real transcription - no API key needed, server has it from .env
  const startRealTranscription = useCallback(async (politicalFilter?: boolean) => {
    if (!channelId) {
      console.error('No channel ID provided');
      return;
    }

    const useFilter = politicalFilter ?? filterPolitical;
    setConnectionStatus('connecting');
    setIsRealMode(true);
    setTranscriptLines([]);

    try {
      await transcriptionSocket.connect();
      transcriptionSocket.startTranscription(channelId, useFilter);
    } catch (error) {
      console.error('Failed to start transcription:', error);
      setConnectionStatus('error');
    }
  }, [channelId, filterPolitical]);

  // Stop real transcription
  const stopRealTranscription = useCallback(() => {
    transcriptionSocket.stopTranscription();
    transcriptionSocket.disconnect();
    setIsRealMode(false);
    setConnectionStatus('disconnected');
  }, []);

  // Load transcripts from Supabase database
  const loadFromDatabase = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      // Fetch all transcripts (no channel filter) to show any available data
      const result = await getTranscripts(undefined, undefined, undefined, 50);
      if (result.data && result.data.length > 0) {
        const lines: TranscriptLine[] = result.data.map((r, index) => ({
          id: r.id || `db_${index}`,
          timestamp: r.transcript_time || new Date(r.created_at || '').toLocaleTimeString('en-IN', { hour12: false }),
          bengali: r.bengali_text || '',
          hindi: r.hindi_text || '',
          english: r.english_text || '',
          sentiment: r.sentiment as 'positive' | 'negative' | 'neutral' | undefined,
          bjpMention: r.bjp_mention,
          tmcMention: r.tmc_mention
        }));
        setTranscriptLines(lines);
        setDbCount(result.data.length);
        console.log(`[TranscriptPanel] Loaded ${result.data.length} transcripts from DB`);
      } else {
        console.log('[TranscriptPanel] No transcripts found in DB');
        setDbCount(0);
      }
    } catch (error) {
      console.error('[TranscriptPanel] Error loading from DB:', error);
      setDbCount(0);
    }
    setIsLoadingDb(false);
  }, []);

  // Real transcription WebSocket listeners
  useEffect(() => {
    isMountedRef.current = true;

    const unsubTranscript = transcriptionSocket.onTranscript(async (line) => {
      if (isMountedRef.current) {
        setTranscriptLines(prev => {
          const updated = [...prev, line];
          return updated.slice(-50); // Keep last 50 lines
        });

        // Auto-save to Supabase if enabled
        if (autoSaveToSupabase) {
          setSaveStatus('saving');
          const result = await saveTranscript(channelName, channelId, line);
          if (isMountedRef.current) {
            if (result.success) {
              setSavedCount(prev => prev + 1);
              setSaveStatus('idle');
            } else {
              console.error('[TranscriptPanel] Failed to save:', result.error);
              setSaveStatus('error');
            }
          }
        }
      }
    });

    const unsubStatus = transcriptionSocket.onStatus((status) => {
      if (isMountedRef.current) {
        setConnectionStatus(status);
      }
    });

    const unsubError = transcriptionSocket.onError((error) => {
      console.error('Transcription error:', error);
      if (isMountedRef.current) {
        setConnectionStatus('error');
      }
    });

    return () => {
      unsubTranscript();
      unsubStatus();
      unsubError();
    };
  }, [autoSaveToSupabase, channelName, channelId]);

  // Don't auto-start - transcription requires ffmpeg/yt-dlp on server
  // User must click "Real Mode" button to start manually
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, [channelId]);

  // Auto-load from database on mount
  useEffect(() => {
    loadFromDatabase();
  }, [loadFromDatabase]);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptLines, isAutoScroll]);

  // Filter lines based on search
  const filteredLines = searchQuery
    ? transcriptLines.filter(line =>
        line.bengali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.hindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.english.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcriptLines;

  // Download transcript as text file
  const downloadTranscript = () => {
    const content = transcriptLines
      .map(line => `[${line.timestamp}]\nBengali: ${line.bengali}\nHindi: ${line.hindi}\nEnglish: ${line.english}\n`)
      .join('\n---\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${channelName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getSentimentBorder = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-4 border-green-400';
      case 'negative':
        return 'border-l-4 border-red-400';
      default:
        return 'border-l-4 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Live Transcript</span>
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span>LIVE</span>
            </span>
            {/* Connection Status */}
            {isRealMode && (
              <span className={`flex items-center space-x-1 px-2 py-0.5 text-xs rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
                connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
                connectionStatus === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {connectionStatus === 'connected' ? <Wifi className="w-3 h-3" /> :
                 connectionStatus === 'connecting' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                 <WifiOff className="w-3 h-3" />}
                <span>{connectionStatus}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Political Filter Toggle */}
            <button
              onClick={() => {
                const newFilter = !filterPolitical;
                setFilterPolitical(newFilter);
                // Restart transcription with new filter setting
                if (isRealMode && channelId) {
                  stopRealTranscription();
                  setTimeout(() => startRealTranscription(newFilter), 500);
                }
              }}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded text-sm ${
                filterPolitical
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={filterPolitical ? 'Showing BJP/TMC only - Click for all' : 'Showing all - Click for BJP/TMC only'}
            >
              {filterPolitical ? <Filter className="w-4 h-4" /> : <FilterX className="w-4 h-4" />}
              <span>{filterPolitical ? 'Political' : 'All'}</span>
            </button>

            {/* Load from Database Button */}
            <button
              onClick={loadFromDatabase}
              disabled={isLoadingDb}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded text-sm ${
                isLoadingDb
                  ? 'bg-blue-100 text-blue-600'
                  : dbCount > 0
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`Load transcripts from database (${dbCount} loaded). Click to refresh.`}
            >
              {isLoadingDb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>DB ({dbCount})</span>
            </button>

            {/* Supabase Auto-Save Toggle */}
            <button
              onClick={() => setAutoSaveToSupabase(!autoSaveToSupabase)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded text-sm ${
                autoSaveToSupabase
                  ? saveStatus === 'error'
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoSaveToSupabase ? `Auto-saving enabled (${savedCount} saved this session)` : 'Enable auto-save to Supabase'}
            >
              {autoSaveToSupabase ? (
                saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                saveStatus === 'error' ? <CloudOff className="w-4 h-4" /> :
                <Database className="w-4 h-4" />
              ) : <CloudOff className="w-4 h-4" />}
              <span>{autoSaveToSupabase ? 'Save On' : 'Save Off'}</span>
            </button>

            {/* Real Transcription Toggle */}
            {channelId && (
              isRealMode ? (
                <button
                  onClick={stopRealTranscription}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  title="Stop real transcription"
                >
                  <Radio className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => startRealTranscription()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 text-sm"
                  title="Start real transcription"
                >
                  <Radio className="w-4 h-4" />
                  <span>Real Mode</span>
                </button>
              )
            )}

            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`p-1.5 rounded ${isAutoScroll ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
              title={isAutoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}
            >
              {isAutoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={downloadTranscript}
              className="p-1.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
              title="Download transcript"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-2 relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Column Headers */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold text-gray-600">
          <div className="bg-yellow-50 px-2 py-1 rounded text-center">Bengali</div>
          <div className="bg-orange-50 px-2 py-1 rounded text-center">Hindi</div>
          <div className="bg-blue-50 px-2 py-1 rounded text-center">English</div>
        </div>
      </div>

      {/* Transcript Content */}
      <div
        ref={scrollRef}
        className="overflow-y-auto p-2 space-y-2"
        style={{ maxHeight }}
        onMouseEnter={() => setIsAutoScroll(false)}
        onMouseLeave={() => setIsAutoScroll(true)}
      >
        {filteredLines.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Waiting for transcript...</p>
          </div>
        ) : (
          filteredLines.map((line) => (
            <div
              key={line.id}
              className={`p-2 rounded bg-gray-50 ${getSentimentBorder(line.sentiment)} transition-all duration-300`}
            >
              {/* Timestamp and badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-mono">
                  {line.timestamp}
                </span>
                <div className="flex items-center space-x-1">
                  {getSentimentIcon(line.sentiment)}
                  {line.bjpMention && (
                    <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded font-medium">
                      BJP
                    </span>
                  )}
                  {line.tmcMention && (
                    <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded font-medium">
                      TMC
                    </span>
                  )}
                </div>
              </div>

              {/* 3-Column Layout */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-yellow-50 p-2 rounded">
                  <p className="text-gray-800 leading-relaxed">{line.bengali}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <p className="text-gray-800 leading-relaxed">{line.hindi}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-gray-800 leading-relaxed">{line.english}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{transcriptLines.length} lines</span>
          <span>
            {transcriptLines.filter(l => l.bjpMention).length} BJP | {transcriptLines.filter(l => l.tmcMention).length} TMC mentions
          </span>
        </div>
      </div>
    </div>
  );
}
