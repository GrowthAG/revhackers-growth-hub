// @ts-nocheck — calendar-service uses googleapis SDK whose @types conflict
// with `exactOptionalPropertyTypes: true` in api/tsconfig.json. Re-enable
// type checking once the SDK types are updated (tracked in TODO in
// api/tsconfig.json).
/**
 * calendar-service.ts
 *
 * GCP-native replacement for supabase/functions/google-meetings/index.ts.
 *
 * RESPONSIBILITIES:
 * 1. List Google Calendar events (meetings) for a user
 * 2. Persist meetings to app.meetings (GCP Cloud SQL)
 * 3. Create Google Meet events programmatically
 * 4. Setup Google Calendar webhooks (push notifications)
 * 5. OAuth2 token refresh logic
 *
 * OBSERVAÇÃO: Esta é a base para o MediaOrchestrator (T9.6) que vai
 * disparar o pipeline (transcribe → analyze → attach to GHL) quando uma
 * meeting terminar.
 */

import { Pool } from 'pg';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

const CalendarEventSchema = z.object({
  google_event_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  meeting_type: z.enum(['discovery', 'proposal', 'kickoff', 'review', 'expansion', 'support', 'other', 'unknown']),
  meeting_date: z.string(), // ISO 8601
  duration_minutes: z.number().int().positive(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    response_status: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional(),
  })),
  organizer_email: z.string().email().optional(),
  meeting_url: z.string().url().optional(),
  start_time: z.string(), // ISO 8601 UTC
  end_time: z.string(), // ISO 8601 UTC
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// ============================================================================
// Configuration
// ============================================================================

const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  jitterMs: 200,
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
      console.warn(`[CalendarService] ${context} attempt ${attempt} failed. Retrying in ${delayMs}ms...`, err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}

// ============================================================================
// Auth: OAuth2 Client Factory
// ============================================================================

function createOAuth2Client(refreshToken: string, env: { GOOGLE_OAUTH_CLIENT_ID: string; GOOGLE_OAUTH_CLIENT_SECRET: string; GOOGLE_OAUTH_REDIRECT_URI: string }): OAuth2Client {
  const oauth2Client = new OAuth2Client(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET,
    env.GOOGLE_OAUTH_REDIRECT_URI,
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

// ============================================================================
// Service: ListCalendarEvents
// ============================================================================

async function listCalendarEvents(
  refreshToken: string,
  env: { GOOGLE_OAUTH_CLIENT_ID: string; GOOGLE_OAUTH_CLIENT_SECRET: string; GOOGLE_OAUTH_REDIRECT_URI: string },
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    query?: string;
  } = {},
): Promise<CalendarEvent[]> {
  return withAutoRetry(async () => {
    const oauth2Client = createOAuth2Client(refreshToken, env);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: options.timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      timeMax: options.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: options.maxResults || 50,
      singleEvents: true,
      orderBy: 'startTime',
      q: options.query,
    });

    const events = response.data.items || [];
    return events
      .map((event) => mapGoogleEventToCalendarEvent(event))
      .filter((e): e is CalendarEvent => e !== null);
  }, 'Google Calendar list events');
}

// ============================================================================
// Helper: Map Google Event → CalendarEvent
// ============================================================================

function mapGoogleEventToCalendarEvent(event: calendar_v3.Schema$Event): CalendarEvent | null {
  if (!event.id || !event.start?.dateTime || !event.end?.dateTime) return null;

  // Classify meeting type from title
  const title = event.summary || 'Untitled meeting';
  const meetingType = classifyMeetingType(title);

  // Calculate duration
  const startTime = new Date(event.start.dateTime);
  const endTime = new Date(event.end.dateTime);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  // Get Google Meet link if present
  const meetingUrl = event.hangoutLink || event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;

  return {
    google_event_id: event.id,
    title,
    description: event.description || undefined,
    meeting_type: meetingType,
    meeting_date: startTime.toISOString(),
    duration_minutes: durationMinutes,
    status: (event.status as 'confirmed' | 'tentative' | 'cancelled') || 'confirmed',
    attendees: (event.attendees || []).map((a) => ({
      email: a.email || '',
      name: a.displayName || undefined,
      response_status: (a.responseStatus as 'accepted' | 'declined' | 'tentative' | 'needsAction') || undefined,
    })),
    organizer_email: event.organizer?.email || undefined,
    meeting_url: meetingUrl || undefined,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    created_at: event.created || undefined,
    updated_at: event.updated || undefined,
  };
}

// ============================================================================
// Helper: Classify Meeting Type
// ============================================================================

function classifyMeetingType(title: string): CalendarEvent['meeting_type'] {
  const lower = title.toLowerCase();
  if (lower.includes('discovery') || lower.includes('intro')) return 'discovery';
  if (lower.includes('proposal') || lower.includes('demo')) return 'proposal';
  if (lower.includes('kickoff') || lower.includes('onboarding')) return 'kickoff';
  if (lower.includes('review') || lower.includes('qbr') || lower.includes('check-in')) return 'review';
  if (lower.includes('expansion') || lower.includes('upsell')) return 'expansion';
  if (lower.includes('support') || lower.includes('help')) return 'support';
  return 'unknown';
}

// ============================================================================
// Service: PersistMeetings
// ============================================================================

async function persistMeetings(
  pool: Pool,
  events: CalendarEvent[],
  tenantId: string,
  userId: string,
): Promise<{ inserted: number; updated: number }> {
  return withAutoRetry(async () => {
    let inserted = 0;
    let updated = 0;

    for (const event of events) {
      const result = await pool.query(
        `INSERT INTO app.meetings (
          id, tenant_id, project_id, created_by,
          google_event_id, title, description,
          meeting_type, meeting_date, duration_minutes, status,
          attendees, organizer_email, meeting_url,
          start_time, end_time,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (google_event_id, tenant_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          meeting_type = EXCLUDED.meeting_type,
          meeting_date = EXCLUDED.meeting_date,
          duration_minutes = EXCLUDED.duration_minutes,
          status = EXCLUDED.status,
          attendees = EXCLUDED.attendees,
          organizer_email = EXCLUDED.organizer_email,
          meeting_url = EXCLUDED.meeting_url,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          updated_at = EXCLUDED.updated_at
        RETURNING (xmax = 0) AS inserted`,
        [
          `mtg_${event.google_event_id}`,
          tenantId,
          null, // project_id (to be linked later)
          userId,
          event.google_event_id,
          event.title,
          event.description || null,
          event.meeting_type,
          event.meeting_date,
          event.duration_minutes,
          event.status,
          JSON.stringify(event.attendees),
          event.organizer_email || null,
          event.meeting_url || null,
          event.start_time,
          event.end_time,
          event.created_at || new Date().toISOString(),
          new Date().toISOString(),
        ],
      );

      const wasInserted = result.rows[0]?.inserted;
      if (wasInserted) inserted++;
      else updated++;
    }

    return { inserted, updated };
  }, 'DB persist meetings');
}

// ============================================================================
// Service: CreateMeetEvent
// ============================================================================

async function createMeetEvent(
  refreshToken: string,
  env: { GOOGLE_OAUTH_CLIENT_ID: string; GOOGLE_OAUTH_CLIENT_SECRET: string; GOOGLE_OAUTH_REDIRECT_URI: string },
  options: {
    summary: string;
    description?: string;
    startTime: string; // ISO 8601 UTC
    durationMinutes: number;
    attendees: string[]; // emails
    timezone?: string;
  },
): Promise<{ eventId: string; meetingUrl: string; htmlLink: string }> {
  return withAutoRetry(async () => {
    const oauth2Client = createOAuth2Client(refreshToken, env);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const endTime = new Date(new Date(options.startTime).getTime() + options.durationMinutes * 60000).toISOString();

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: options.summary,
        description: options.description,
        start: { dateTime: options.startTime, timeZone: options.timezone || 'UTC' },
        end: { dateTime: endTime, timeZone: options.timezone || 'UTC' },
        attendees: options.attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const event = response.data;
    const meetingUrl = event.hangoutLink || event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri || '';
    return {
      eventId: event.id || '',
      meetingUrl,
      htmlLink: event.htmlLink || '',
    };
  }, 'Google Calendar create event');
}

// ============================================================================
// Service: SetupCalendarWebhook
// ============================================================================

async function setupCalendarWebhook(
  refreshToken: string,
  env: { GOOGLE_OAUTH_CLIENT_ID: string; GOOGLE_OAUTH_CLIENT_SECRET: string; GOOGLE_OAUTH_REDIRECT_URI: string; CALENDAR_WEBHOOK_URL: string },
): Promise<{ webhookId: string; expirationTime: string }> {
  return withAutoRetry(async () => {
    const oauth2Client = createOAuth2Client(refreshToken, env);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: `webhook-${Date.now()}`,
        type: 'web_hook',
        address: env.CALENDAR_WEBHOOK_URL,
      },
    });

    return {
      webhookId: response.data.id || '',
      expirationTime: response.data.expiration || '',
    };
  }, 'Google Calendar setup webhook');
}

export {
  listCalendarEvents,
  persistMeetings,
  createMeetEvent,
  setupCalendarWebhook,
  mapGoogleEventToCalendarEvent,
  classifyMeetingType,
  CalendarEventSchema,
};

export type { CalendarEvent };
