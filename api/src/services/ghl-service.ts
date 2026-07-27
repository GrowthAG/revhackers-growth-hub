// @ts-nocheck
/**
 * ghl-service.ts
 *
 * GCP-native replacement for supabase/functions/ghl-outbound-relay/index.ts.
 * 
 * RESPONSIBILITIES:
 * 1. Send events to GoHighLevel via REST API (POST https://services.leadconnectorhq.com/...)
 * 2. Multi-tenant routing (per-organization webhook URLs)
 * 3. HMAC signature verification (for incoming webhooks from GHL)
 * 4. Webhook event parsing (lead_created, opportunity_updated, etc.)
 * 5. Retry with exponential backoff
 * 
 * OBSERVAÇÃO: GHL URLs never appear in the frontend bundle (security best practice).
 * All GHL communication happens server-side via this service.
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

const GHLWebhookEventSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
});

type GHLWebhookEvent = z.infer<typeof GHLWebhookEventSchema>;

const GHLEventTypeSchema = z.enum([
  'rei_completed',
  'contact_form',
  'newsletter',
  'roi_calculator',
  'score_captured',
  'lead_capture',
  'download',
  'email_material',
  'meeting_transcribed',
  'meeting_analyzed',
  'meeting_recorded',
  'expansion_opportunity',
]);

type GHLEventType = z.infer<typeof GHLEventTypeSchema>;

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

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

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
      console.warn(`[GHLService] ${context} attempt ${attempt} failed. Retrying in ${delayMs}ms...`, err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}

// ============================================================================
// Service: Get Webhook URL (Multi-tenant Routing)
// ============================================================================

async function getWebhookUrl(
  pool: Pool,
  eventType: GHLEventType,
  organizationId?: string,
): Promise<string | null> {
  // 1. Try per-organization webhook URL first
  if (organizationId) {
    const result = await withAutoRetry(async () => {
      return pool.query(
        `SELECT settings->'ghl_webhooks'->>$1 AS webhook_url
         FROM app.organizations
         WHERE id = $2`,
        [eventType, organizationId],
      );
    }, 'lookup org webhook');

    const orgWebhook = result.rows[0]?.webhook_url;
    if (orgWebhook) return orgWebhook;
  }

  // 2. Fallback to global GHL_WEBHOOK_<EVENT> from env
  const envKey = `GHL_WEBHOOK_${eventType.toUpperCase()}`;
  const globalUrl = process.env[envKey];
  if (globalUrl) return globalUrl;

  return null;
}

// ============================================================================
// Service: Send Event to GHL
// ============================================================================

async function sendEventToGHL(
  pool: Pool,
  eventType: GHLEventType,
  payload: Record<string, any>,
  organizationId?: string,
): Promise<{ success: boolean; webhook_url: string | null; error?: string }> {
  const webhookUrl = await getWebhookUrl(pool, eventType, organizationId);

  if (!webhookUrl) {
    console.warn(`[GHLService] No webhook URL configured for event "${eventType}"`);
    return { success: false, webhook_url: null, error: 'No webhook URL configured' };
  }

  const event = { event: eventType, data: payload, organizationId, timestamp: new Date().toISOString() };

  return withAutoRetry(async () => {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      throw new Error(`GHL webhook failed: ${res.status} ${res.statusText}`);
    }

    return { success: true, webhook_url: webhookUrl };
  }, `GHL webhook ${eventType}`);
}

// ============================================================================
// Service: Verify Webhook Signature (Incoming from GHL)
// ============================================================================

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex'),
  );
}

// ============================================================================
// Service: Parse Incoming Webhook (from GHL)
// ============================================================================

async function parseIncomingWebhook(
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<GHLWebhookEvent> {
  // 1. Verify HMAC signature
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    throw { status: 401, message: 'Invalid webhook signature' };
  }

  // 2. Parse JSON
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    throw { status: 400, message: 'Invalid JSON body' };
  }

  // 3. Validate schema
  return GHLWebhookEventSchema.parse(payload);
}

// ============================================================================
// Service: Persist GHL Event to GCP Cloud SQL
// ============================================================================

async function persistGHLEvent(
  pool: Pool,
  event: GHLWebhookEvent,
  tenantId: string,
  organizationId: string,
  webhookUrl: string,
  success: boolean,
  responseBody: string,
): Promise<void> {
  await withAutoRetry(async () => {
    await pool.query(
      `INSERT INTO app.ghl_events (
        id, tenant_id, organization_id, event_type, event_data,
        webhook_url, success, response_body, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
      [
        `ghl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        tenantId,
        organizationId,
        event.event,
        JSON.stringify(event.data),
        webhookUrl,
        success,
        responseBody,
      ],
    );
  }, 'persist GHL event');
}

// ============================================================================
// HTTP Handler (for Cloud Run)
// ============================================================================

export async function handleGHLOutbound(
  request: Request,
  env: { GHL_WEBHOOK_SECRET: string; DATABASE_URL: string; GHL_WEBHOOK_REI: string; GHL_WEBHOOK_CONTACT: string; GHL_WEBHOOK_SCORE: string; GHL_WEBHOOK_DOWNLOAD: string; GHL_WEBHOOK_EMAIL: string; GHL_WEBHOOK_MEETING_TRANSCRIBED: string; GHL_WEBHOOK_MEETING_ANALYZED: string; GHL_WEBHOOK_MEETING_RECORDED: string; GHL_WEBHOOK_EXPANSION_OPPORTUNITY: string },
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

  // 1. Parse body
  let body: { eventType: GHLEventType; payload: Record<string, any>; organizationId?: string };

  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Validate eventType
  if (!body.eventType) {
    return new Response(JSON.stringify({ success: false, error: 'eventType is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Send to GHL
  const result = await sendEventToGHL(pool, body.eventType, body.payload || {}, body.organizationId);

  // 4. Persist log (optional, requires tenantId from auth context)
  // In real impl, get tenantId from authenticated user context
  if (body.payload?.tenant_id) {
    try {
      await persistGHLEvent(
        pool,
        { event: body.eventType, data: body.payload },
        body.payload.tenant_id,
        body.organizationId || 'default',
        result.webhook_url || '',
        result.success,
        result.error || JSON.stringify({ success: result.success }),
      );
    } catch (err) {
      console.warn('[GHLService] Failed to persist event log:', err);
    }
  }

  return new Response(
    JSON.stringify({
      success: result.success,
      data: {
        eventType: body.eventType,
        webhook_url: result.webhook_url,
        error: result.error,
      },
    }),
    { status: result.success ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

export async function handleGHLIncomingWebhook(
  request: Request,
  env: { GHL_WEBHOOK_SECRET: string; DATABASE_URL: string },
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

  // 1. Read raw body
  const rawBody = await request.text();

  // 2. Parse + verify signature
  let event: GHLWebhookEvent;
  try {
    event = await parseIncomingWebhook(
      rawBody,
      request.headers.get('x-ghl-signature'),
      env.GHL_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Webhook validation failed' }), {
      status: err.status || 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Process event (in real impl, dispatch to appropriate handler)
  console.log('[GHLService] Received webhook event:', event.event, event.data);

  return new Response(
    JSON.stringify({ success: true, data: { event: event.event, processed: true } }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}
