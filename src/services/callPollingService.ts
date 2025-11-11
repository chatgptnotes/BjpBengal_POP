/**
 * Call Polling Service
 * Runs every 10 minutes to fetch completed calls from ElevenLabs
 * Stores transcripts (in Tamil) to Supabase
 */

import { elevenLabsService } from './elevenLabsService';
import { voterCallsService } from './voterCallsService';
import { voterSentimentService } from './voterSentimentService';

class CallPollingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastPollTime: Date = new Date();

  /**
   * Start polling service (runs every 10 minutes)
   */
  startPolling() {
    if (this.isRunning) {
      console.log('[CallPolling] Already running');
      return;
    }

    console.log('[CallPolling] Starting polling service...');
    this.isRunning = true;

    // Run immediately on start
    this.pollCompletedCalls();

    // Then run every 10 minutes (600000 ms)
    this.pollingInterval = setInterval(() => {
      this.pollCompletedCalls();
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Stop polling service
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isRunning = false;
    console.log('[CallPolling] Stopped polling service');
  }

  /**
   * Main polling function - fetches completed calls from last 10 minutes
   */
  async pollCompletedCalls() {
    try {
      console.log('[CallPolling] Checking for completed calls...');
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      // Get all recent conversations from ElevenLabs
      const conversations = await elevenLabsService.getConversations(100, 0);

      if (!conversations || conversations.length === 0) {
        console.log('[CallPolling] No conversations found');
        return;
      }

      console.log(`[CallPolling] Found ${conversations.length} conversations`);

      // Filter for completed calls in last 10 minutes
      const completedCalls = conversations.filter((conv: any) => {
        const endTime = conv.end_time || conv.ended_at || conv.completed_at || conv.end_timestamp;
        if (!endTime) return false;

        const callEndTime = new Date(endTime);
        const status = conv.status?.toLowerCase() || '';
        return (
          (status === 'completed' || status === 'ended' || status === 'finished' || status === 'done') &&
          callEndTime >= tenMinutesAgo &&
          callEndTime <= now
        );
      });

      console.log(`[CallPolling] Found ${completedCalls.length} completed calls in last 10 minutes`);

      if (completedCalls.length === 0) {
        return;
      }

      // Process each completed call
      for (const call of completedCalls) {
        await this.processCompletedCall(call);
      }

      this.lastPollTime = now;
      console.log('[CallPolling] Polling completed successfully');
    } catch (error) {
      console.error('[CallPolling] Error during polling:', error);
    }
  }

  /**
   * Process a single completed call
   * - Check if already fetched
   * - Fetch transcript from ElevenLabs
   * - Save to Supabase
   * - Analyze sentiment
   */
  private async processCompletedCall(call: any) {
    try {
      const callId = call.conversation_id || call.id || call.call_id;

      if (!callId) {
        console.warn('[CallPolling] Call missing ID, skipping:', call);
        return;
      }

      console.log(`[CallPolling] Processing call: ${callId}`);

      // Check if we've already fetched this call's transcript
      const existingCall = await voterCallsService.getCallByElevenLabsId(callId);

      if (existingCall && existingCall.transcript_fetched_at) {
        console.log(`[CallPolling] Call ${callId} already fetched, skipping`);
        return;
      }

      // Fetch transcript from ElevenLabs (in Tamil)
      console.log(`[CallPolling] Fetching transcript for call: ${callId}`);
      const transcriptData = await elevenLabsService.getTranscript(callId);

      if (!transcriptData.transcript) {
        console.warn(`[CallPolling] No transcript available for call: ${callId}`);
        return;
      }

      console.log(`[CallPolling] Transcript fetched successfully (${transcriptData.transcript.length} chars)`);

      // Determine organization ID from call metadata or conversation initiation data
      const metadata = call.conversation_initiation_client_data || call.metadata || {};
      const organizationId = metadata.organization_id || 'dev-org-id';

      // Extract phone number - ElevenLabs uses 'to_number' or 'customer_phone_number'
      const phoneNumber = call.to_number || call.customer_phone_number || call.phone_number || 'unknown';

      // Extract timestamps
      const startTime = call.start_time || call.started_at || call.start_timestamp;
      const endTime = call.end_time || call.ended_at || call.completed_at || call.end_timestamp;

      // Save to Supabase
      const savedCall = await voterCallsService.createCall({
        organization_id: organizationId,
        call_id: callId,
        phone_number: phoneNumber,
        voter_name: metadata.voter_name || undefined,
        status: 'completed',
        duration_seconds: transcriptData.duration_seconds || call.duration_seconds || call.duration || 0,
        call_started_at: startTime ? new Date(startTime) : new Date(),
        call_ended_at: endTime ? new Date(endTime) : new Date(),
        transcript: transcriptData.transcript, // Tamil transcript
        transcript_fetched_at: new Date(),
        elevenlabs_agent_id: call.agent_id || undefined,
        elevenlabs_metadata: call,
        created_by: metadata.created_by || metadata.user_id || undefined,
      });

      if (!savedCall) {
        console.error(`[CallPolling] Failed to save call to database: ${callId}`);
        return;
      }

      console.log(`[CallPolling] Call saved to database: ${savedCall.id}`);

      // Analyze sentiment (handles Tamil text)
      console.log(`[CallPolling] Analyzing sentiment for call: ${callId}`);
      const analysis = voterSentimentService.analyzeTranscript(
        transcriptData.transcript,
        callId
      );

      // Save sentiment analysis
      const savedAnalysis = await voterSentimentService.saveSentimentAnalysis(
        savedCall.id,
        organizationId,
        analysis
      );

      if (savedAnalysis) {
        console.log(`[CallPolling] Sentiment analysis saved for call: ${callId}`);
      }

      console.log(`[CallPolling] Successfully processed call: ${callId}`);
    } catch (error) {
      console.error('[CallPolling] Error processing call:', error);
    }
  }

  /**
   * Manually trigger a poll (for testing)
   */
  async triggerPoll() {
    console.log('[CallPolling] Manual poll triggered');
    await this.pollCompletedCalls();
  }

  /**
   * Get polling status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastPollTime: this.lastPollTime,
    };
  }
}

// Export singleton instance
export const callPollingService = new CallPollingService();

// Export class for testing
export default CallPollingService;
