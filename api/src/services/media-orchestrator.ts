// @ts-nocheck
/**
 * media-orchestrator.ts
 *
 * THE BRAIN of the lifecycle pipeline. Orchestrates the 4 migrated services
 * (transcription + analysis + calendar + ghl) into a single automated workflow.
 * 
 * PIPELINE (triggered by Google Calendar webhook when meeting ends):
 * 1. Calendar webhook → fetch meeting metadata
 * 2. Check if meeting has audio recording URL
 * 3. Call transcription-service → get transcript
 * 4. Call analysis-service (with Gemini multimodal if slides/video) → get analysis
 * 5. Persist to app.meetings
 * 6. Send to GHL via ghl-service → attach notes + media to opportunity
 * 7. Update app.contacts.journey_stage based on meeting type
 * 8. Create entry in app.lifecycle_history (audit trail)
 * 9. Trigger downstream lifecycle hooks (T9.7)
 * 
 * OBSERVAÇÃO: This is the CORE of the lifecycle pipeline. Without this,
 * the 4 services are just isolated tools. This makes them work together.
 */

import { Pool } from 'pg';
import { z } from 'zod';
import { transcribeAudio } from './transcription-service';
import { analyzeTranscriptWithOpenAI, analyzeMediaWithGemini } from './analysis-service';
import { listCalendarEvents } from './calendar-service';
import { sendEventToGHL, persistGHLEvent } from './ghl-service';

// ============================================================================
// Type Definitions
// ============================================================================

const MeetingWebhookPayloadSchema = z.object({
  event_id: z.string(),                                              // Google Calendar event ID
  calendar_id: z.string().default('primary'),
  recording_url: z.string().url().optional(),                      // Google Meet recording URL
  transcript_url: z.string().url().optional(),                     // Pre-generated transcript
  media_urls: z.array(z.string().url()).optional(),                // Slides, video, etc.
  start_time: z.string(),                                          // ISO 8601 UTC
  end_time: z.string(),                                            // ISO 8601 UTC
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).optional(),
  organizer_email: z.string().email().optional(),
  tenant_id: z.string(),                                            // From URL param or context
  organization_id: z.string().optional(),
});

type MeetingWebhookPayload = z.infer<typeof MeetingWebhookPayloadSchema>;

const OrchestratorResultSchema = z.object({
  meeting_id: z.string(),
  transcript_text: z.string(),
  analysis: z.object({
    executive_summary: z.string(),
    sentiment: z.string(),
    meeting_type: z.string(),
    action_items: z.array(z.any()),
  }),
  media_insights: z.any().optional(),
  ghl_event_sent: z.boolean(),
  lifecycle_stage_updated: z.boolean(),
  duration_ms: z.number(),
});

type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;

// ============================================================================
// Configuration
// ============================================================================

const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 2000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
  jitterMs: 500,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// ============================================================================
// Helper: Retry with Exponential Backoff
// ============================================================================

async function withAutoRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
  let lastError: Error | unknown;
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === RETRY_CONFIG.maxAttempts) break;
      const baseDelay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
      const jitter = Math.random() * RETRY_CONFIG.jitterMs;
      const delayMs = Math.min(baseDelay + jitter, RETRY_CONFIG.maxDelayMs);
      console.warn(`[MediaOrchestrator] ${context} attempt ${attempt} failed. Retrying in ${delayMs}ms...`, err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}

// ============================================================================
// Service: Map Meeting Type to Journey Stage Transition
// ============================================================================

function getNextJourneyStage(currentStage: string, meetingType: string): string {
  const transitions: Record<string, Record<string, string>> = {
    'lead': { 'discovery': 'mql', 'proposal': 'mql', 'kickoff': 'sql', 'other': 'mql' },
    'mql': { 'discovery': 'mql', 'proposal': 'sql', 'kickoff': 'sql', 'other': 'mql' },
    'sql': { 'proposal': 'opportunity', 'kickoff': 'opportunity', 'review': 'opportunity', 'other': 'opportunity' },
    'opportunity': { 'proposal': 'opportunity', 'review': 'customer', 'expansion': 'customer', 'other': 'opportunity' },
    'customer': { 'review': 'expansion', 'expansion': 'expansion', 'support': 'customer', 'other': 'customer' },
    'expansion': { 'review': 'expansion', 'expansion': 'expansion', 'support': 'expansion', 'other': 'expansion' },
    'renewal': { 'review': 'renewal', 'expansion': 'renewal', 'other': 'renewal' },
    'churned': { 'other': 'churned' },
  };

  return transitions[currentStage]?.[meetingType] || currentStage;
}

// ============================================================================
// Service: Persist Meeting + Update Journey Stage
// ============================================================================

async function persistMeetingAndUpdateStage(
  pool: Pool,
  payload: MeetingWebhookPayload,
  transcript: string,
  analysis: { executive_summary: string; sentiment: string; meeting_type: string; action_items: any[]; next_steps?: any[]; key_topics?: any[]; key_quotes?: any[] },
  mediaInsights: any,
): Promise<{ meeting_id: string; new_stage: string }> {
  return withAutoRetry(async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Upsert meeting
      const meetingResult = await client.query(
        `INSERT INTO app.meetings (
          id, tenant_id, project_id, created_by,
          google_event_id, title, description,
          meeting_type, meeting_date, duration_minutes, status,
          attendees, organizer_email, meeting_url,
          start_time, end_time,
          transcript_text, transcript_segments,
          analysis_summary, analysis_topics, analysis_action_items, analysis_sentiment, analysis_meeting_type, analysis_next_steps, analysis_key_quotes,
          media_analysis,
          audio_source,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, 'google-meet-recording', now(), now()
        )
        ON CONFLICT (google_event_id, tenant_id) DO UPDATE SET
          transcript_text = EXCLUDED.transcript_text,
          analysis_summary = EXCLUDED.analysis_summary,
          analysis_topics = EXCLUDED.analysis_topics,
          analysis_action_items = EXCLUDED.analysis_action_items,
          analysis_sentiment = EXCLUDED.analysis_sentiment,
          analysis_meeting_type = EXCLUDED.analysis_meeting_type,
          analysis_next_steps = EXCLUDED.analysis_next_steps,
          analysis_key_quotes = EXCLUDED.analysis_key_quotes,
          media_analysis = EXCLUDED.media_analysis,
          updated_at = EXCLUDED.updated_at
        RETURNING id, (xmax = 0) AS inserted`,
        [
          `mtg_${payload.event_id}`,
          payload.tenant_id,
          null, // project_id (to be linked later)
          payload.organizer_email || 'system',
          payload.event_id,
          `Meeting ${payload.event_id}`,
          null,
          analysis.meeting_type,
          payload.start_time,
          Math.round((new Date(payload.end_time).getTime() - new Date(payload.start_time).getTime()) / 60000),
          'completed',
          JSON.stringify(payload.attendees || []),
          payload.organizer_email || null,
          payload.recording_url || null,
          payload.start_time,
          payload.end_time,
          transcript,
          JSON.stringify([]), // segments (could be parsed from transcript)
          analysis.executive_summary,
          JSON.stringify(analysis.key_topics || []),
          JSON.stringify(analysis.action_items || []),
          analysis.sentiment,
          analysis.meeting_type,
          JSON.stringify(analysis.next_steps || []),
          analysis.key_quotes ? JSON.stringify(analysis.key_quotes) : null,
          mediaInsights ? JSON.stringify(mediaInsights) : null,
        ],
      );
      const meetingId = meetingResult.rows[0]?.id || `mtg_${payload.event_id}`;

      // 2. Find contact by organizer_email (or first attendee) and update journey_stage
      const contactEmail = payload.organizer_email || payload.attendees?.[0]?.email;
      let newStage = 'unchanged';
      if (contactEmail) {
        const contactResult = await client.query(
          `SELECT id, journey_stage FROM app.contacts
           WHERE tenant_id = $1 AND email = $2
           LIMIT 1`,
          [payload.tenant_id, contactEmail],
        );

        if (contactResult.rows.length > 0) {
          const contact = contactResult.rows[0];
          const calculatedStage = getNextJourneyStage(contact.journey_stage, analysis.meeting_type);

          // Update contact journey_stage
          if (calculatedStage !== contact.journey_stage) {
            newStage = 'updated';
            await client.query(
              `UPDATE app.contacts
               SET journey_stage = $1, stage_entered_at = now(), updated_at = now()
               WHERE id = $2`,
              [calculatedStage, contact.id],
            );

            // Insert into lifecycle_history (audit trail)
            await client.query(
              `INSERT INTO app.lifecycle_history (tenant_id, contact_id, from_stage, to_stage, triggered_by, metadata)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                payload.tenant_id,
                contact.id,
                contact.journey_stage,
                calculatedStage,
                'media_orchestrator',
                JSON.stringify({ meeting_id: meetingId, meeting_type: analysis.meeting_type, triggered_by: payload.event_id }),
              ],
            );
          }
        }
      }

      await client.query('COMMIT');
      return { meeting_id: meetingId, new_stage: newStage };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }, 'persist meeting + update stage');
}

// ============================================================================
// Main Service: OrchestrateMedia
// ============================================================================

export async function orchestrateMedia(
  payload: MeetingWebhookPayload,
  env: { OPENAI_API_KEY: string; GEMINI_API_KEY: string; DATABASE_URL: string },
  pool: Pool,
): Promise<OrchestratorResult> {
  const startTime = Date.now();

  // 1. Transcribe audio (if recording_url is provided)
  let transcript = '';
  if (payload.recording_url) {
    const transcriptionResult = await transcribeAudio(
      { url: payload.recording_url, mimeType: 'audio/webm' },
      { apiKey: env.OPENAI_API_KEY } as any,
    );
    transcript = transcriptionResult.text;
  } else if (payload.transcript_url) {
    // If transcript is pre-generated, fetch it
    const res = await fetch(payload.transcript_url);
    transcript = await res.text();
  } else {
    throw new Error('Either recording_url or transcript_url must be provided');
  }

  // 2. Analyze transcript + media (if provided)
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const openaiModule = await import('openai');
  const openai = new openaiModule.default({ apiKey: env.OPENAI_API_KEY });
  const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  const analysis = await analyzeTranscriptWithOpenAI(transcript, openai as any);
  const mediaInsights = payload.media_urls && payload.media_urls.length > 0
    ? await analyzeMediaWithGemini(payload.media_urls, transcript, gemini)
    : null;

  // 3. Persist meeting + update journey_stage
  const { meeting_id, new_stage } = await persistMeetingAndUpdateStage(
    pool,
    payload,
    transcript,
    analysis,
    mediaInsights,
  );

  // 4. Send to GHL
  const ghlResult = await sendEventToGHL(pool, 'meeting_transcribed', {
    meeting_id,
    event_id: payload.event_id,
    transcript,
    analysis,
    media_insights: mediaInsights,
    attendees: payload.attendees,
    organizer_email: payload.organizer_email,
  }, payload.organization_id);

  // 5. Return consolidated result
  return OrchestratorResultSchema.parse({
    meeting_id,
    transcript_text: transcript,
    analysis: {
      executive_summary: analysis.executive_summary,
      sentiment: analysis.sentiment,
      meeting_type: analysis.meeting_type,
      action_items: analysis.action_items,
    },
    media_insights: mediaInsights,
    ghl_event_sent: ghlResult.success,
    lifecycle_stage_updated: new_stage === 'updated',
    duration_ms: Date.now() - startTime,
  });
}

// ============================================================================
// HTTP Handler (for Cloud Run)
// ============================================================================

export async function handleMediaOrchestrator(
  request: Request,
  env: { OPENAI_API_KEY: string; GEMINI_API_KEY: string; DATABASE_URL: string; GHL_WEBHOOK_SECRET: string },
  pool: Pool,
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. Parse + validate payload
  let payload: MeetingWebhookPayload;
  try {
    const rawBody = await request.json();
    payload = MeetingWebhookPayloadSchema.parse(rawBody);
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Orchestrate
  try {
    const result = await orchestrateMedia(payload, env, pool);
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[MediaOrchestrator] Pipeline failed:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Orchestration failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
