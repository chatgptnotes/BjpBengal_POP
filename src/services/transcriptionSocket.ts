/**
 * WebSocket client for real-time transcription
 */

import { io, Socket } from 'socket.io-client';

export interface TranscriptLine {
  id: string;
  timestamp: string;
  bengali: string;
  hindi: string;
  english: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  bjpMention?: boolean;
  tmcMention?: boolean;
}

export interface TranscriptionStatus {
  channelId: string;
  status: 'getting_stream' | 'stream_found' | 'capturing' | 'transcribing' | 'chunk_error' | 'refreshing_stream' | 'stream_refreshed' | 'stream_lost' | 'error' | 'stopped' | 'already_running';
  message: string;
}

type TranscriptCallback = (line: TranscriptLine) => void;
type ErrorCallback = (error: { channelId: string; error: string }) => void;
type StatusCallback = (status: 'connected' | 'disconnected' | 'error') => void;
type TranscriptionStatusCallback = (status: TranscriptionStatus) => void;

class TranscriptionSocketService {
  private socket: Socket | null = null;
  private transcriptCallbacks: Set<TranscriptCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private transcriptionStatusCallbacks: Set<TranscriptionStatusCallback> = new Set();
  private serverUrl: string;
  private currentChannelId: string | null = null;

  constructor() {
    this.serverUrl = import.meta.env.VITE_TRANSCRIPTION_SERVER_URL || 'http://localhost:3002';
  }

  /**
   * Connect to transcription server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.serverUrl, {
        path: '/transcription',
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('Connected to transcription server');
        this.notifyStatus('connected');
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from transcription server');
        this.notifyStatus('disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.notifyStatus('error');
        reject(error);
      });

      this.socket.on('transcript', (line: TranscriptLine) => {
        this.transcriptCallbacks.forEach(cb => cb(line));
      });

      this.socket.on('transcription_error', (error: { channelId: string; error: string }) => {
        this.errorCallbacks.forEach(cb => cb(error));
      });

      this.socket.on('error', (error: { message: string }) => {
        console.error('Server error:', error.message);
        this.errorCallbacks.forEach(cb => cb({ channelId: 'unknown', error: error.message }));
      });

      this.socket.on('transcription_status', (status: TranscriptionStatus) => {
        console.log('Transcription status:', status);
        this.transcriptionStatusCallbacks.forEach(cb => cb(status));
      });
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Start transcription for a channel (server has API key from .env)
   * @param filterPolitical - if true, only show BJP/TMC related content
   */
  startTranscription(channelId: string, filterPolitical: boolean = false) {
    if (!this.socket?.connected) {
      console.error('Not connected to transcription server');
      return;
    }

    this.currentChannelId = channelId;
    this.socket.emit('start_transcription', { channelId, filterPolitical });
  }

  /**
   * Stop transcription for current channel
   */
  stopTranscription() {
    if (!this.socket?.connected || !this.currentChannelId) {
      return;
    }

    this.socket.emit('stop_transcription', {
      channelId: this.currentChannelId
    });
    this.currentChannelId = null;
  }

  /**
   * Subscribe to transcript updates
   */
  onTranscript(callback: TranscriptCallback): () => void {
    this.transcriptCallbacks.add(callback);
    return () => this.transcriptCallbacks.delete(callback);
  }

  /**
   * Subscribe to error updates
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Subscribe to status updates
   */
  onStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  /**
   * Subscribe to transcription status updates (getting_stream, capturing, etc.)
   */
  onTranscriptionStatus(callback: TranscriptionStatusCallback): () => void {
    this.transcriptionStatusCallbacks.add(callback);
    return () => this.transcriptionStatusCallbacks.delete(callback);
  }

  /**
   * Notify all status callbacks
   */
  private notifyStatus(status: 'connected' | 'disconnected' | 'error') {
    this.statusCallbacks.forEach(cb => cb(status));
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current channel being transcribed
   */
  getCurrentChannel(): string | null {
    return this.currentChannelId;
  }
}

// Singleton instance
export const transcriptionSocket = new TranscriptionSocketService();
export default transcriptionSocket;
