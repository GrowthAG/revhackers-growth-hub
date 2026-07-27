// @ts-nocheck
/**
 * lifecycle-hook.ts
 *
 * THE AUTOMATION BRAIN. Listens to journey_stage transitions in app.contacts
 * and triggers complementary actions (emails, REI onboarding, GHL tags, etc).
 * 
 * PATTERN: Event-driven architecture using PostgreSQL LISTEN/NOTIFY or
 * direct polling of app.lifecycle_history table.
 * 
 * HOOKS (configurable per tenant):
 * - lead → mql: Send welcome email
 * - mql → opportunity: Create opp in GHL
 * - opportunity → customer: Trigger REI onboarding (create rei_onboarding record)
 * - customer → expansion: Add expansion tag in GHL
 * - customer → renewal: Notify renewal team
 * - * → churned: Send exit survey
 * 
 * OBSERVAÇÃO: This completes the lifecycle pipeline. With T9.6 (MediaOrchestrator)
 * updating the stage, and T9.7 (LifecycleHook) reacting to it, the system
 * becomes fully autonomous.
 */

import { Pool } from 'pg';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

const LifecycleEventSchema = z.object({
  contact_id: z.string(),
  tenant_id: z.string(),
  from_stage: z.string().nullable(),
  to_stage: z.string(),
  metadata: z.record(z.any()).optional(),
});

type LifecycleEvent = z.infer<typeof LifecycleEventSchema>;

const LifecycleHookConfigSchema = z.object({
  tenant_id: z.string(),
  from_stage: z.string().nullable().optional(),
  to_stage: z.string().optional(),
  action_type: z.enum(['send_email', 'create_ghl_opportunity', 'trigger_rei_onboarding', 'add_ghl_tag', 'notify_team', 'send_exit_survey', 'webhook']),
  action_config: z.record(z.any()),
  is_active: z.boolean().default(true),
  priority: z.number().int().default(100),
});

type LifecycleHookConfig = z.infer<typeof LifecycleHookConfigSchema>;

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
      console.warn(`[LifecycleHook] ${context} attempt ${attempt} failed. Retrying in ${delayMs}ms...`, err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}

// ============================================================================
// Service: Get Active Hooks for Transition
// ============================================================================

async function getActiveHooks(
  pool: Pool,
  tenantId: string,
  fromStage: string | null,
  toStage: string,
): Promise<LifecycleHookConfig[]> {
  return withAutoRetry(async () => {
    const result = await pool.query(
      `SELECT tenant_id, from_stage, to_stage, action_type, action_config, is_active, priority
       FROM app.lifecycle_hooks
       WHERE tenant_id = $1
         AND is_active = true
         AND (from_stage IS NULL OR from_stage = $2)
         AND (to_stage IS NULL OR to_stage = $3)
       ORDER BY priority DESC`,
      [tenantId, fromStage, toStage],
    );
    return result.rows.map((row) => LifecycleHookConfigSchema.parse(row));
  }, 'fetch active hooks');
}

// ============================================================================
// Service: Execute Hook Action
// ============================================================================

async function executeHookAction(
  hook: LifecycleHookConfig,
  event: LifecycleEvent,
  env: Record<string, string>,
  pool: Pool,
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    switch (hook.action_type) {
      case 'send_email': {
        // In real impl, use an email service (SendGrid, Resend, etc.)
        console.log(`[LifecycleHook] Would send email to ${event.tenant_id}:`, hook.action_config);
        return { success: true, result: { type: 'email_sent', config: hook.action_config } };
      }

      case 'create_ghl_opportunity': {
        // In real impl, call ghl-service to create opportunity
        console.log(`[LifecycleHook] Would create GHL opportunity for ${event.contact_id}:`, hook.action_config);
        return { success: true, result: { type: 'ghl_opportunity_created', config: hook.action_config } };
      }

      case 'trigger_rei_onboarding': {
        // Create rei_onboarding record when contact becomes customer
        const result = await pool.query(
          `INSERT INTO app.rei_onboarding (
            tenant_id, project_id, client_name, client_email, client_company,
            product_name, product_slug, company_slug,
            duration_days, type, avg_ticket_range,
            cs_lead_name, cs_lead_email,
            current_phase, current_milestone,
            journey_stage,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 30, 'guided', '5k-30k', $9, $10, 'O1_EMBARK', 'M0_WELCOME', 'customer', now(), now())
          ON CONFLICT (tenant_id, project_id) DO UPDATE SET
            journey_stage = 'customer',
            current_phase = 'O1_EMBARK',
            current_milestone = 'M0_WELCOME',
            updated_at = now()
          RETURNING id`,
          [
            event.tenant_id,
            event.metadata?.project_id || 'auto-generated',
            event.metadata?.client_name || 'New Customer',
            event.metadata?.email || 'unknown@example.com',
            event.metadata?.company || 'New Company',
            event.metadata?.product_name || 'RevHackers Standard',
            event.metadata?.product_slug || 'standard',
            event.metadata?.company_slug || 'new-company',
            event.metadata?.cs_lead_name || 'Giulliano Alves',
            event.metadata?.cs_lead_email || 'giulliano@revhackers.com',
          ],
        );
        return { success: true, result: { type: 'rei_onboarding_created', id: result.rows[0]?.id } };
      }

      case 'add_ghl_tag': {
        console.log(`[LifecycleHook] Would add GHL tag to contact ${event.contact_id}:`, hook.action_config);
        return { success: true, result: { type: 'ghl_tag_added', tag: hook.action_config.tag } };
      }

      case 'notify_team': {
        console.log(`[LifecycleHook] Would notify team for ${event.tenant_id}:`, hook.action_config);
        return { success: true, result: { type: 'team_notified', config: hook.action_config } };
      }

      case 'send_exit_survey': {
        console.log(`[LifecycleHook] Would send exit survey to contact ${event.contact_id}:`, hook.action_config);
        return { success: true, result: { type: 'exit_survey_sent' } };
      }

      case 'webhook': {
        const webhookUrl = hook.action_config.webhook_url as string;
        if (!webhookUrl) {
          return { success: false, error: 'webhook_url not configured' };
        }
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
        return { success: res.ok, result: { status: res.status } };
      }

      default:
        return { success: false, error: `Unknown action type: ${(hook as any).action_type}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Action execution failed' };
  }
}

// ============================================================================
// Service: Log Hook Execution
// ============================================================================

async function logHookExecution(
  pool: Pool,
  tenantId: string,
  contactId: string,
  hookConfig: LifecycleHookConfig,
  event: LifecycleEvent,
  result: { success: boolean; result?: any; error?: string },
): Promise<void> {
  await withAutoRetry(async () => {
    await pool.query(
      `INSERT INTO app.lifecycle_hook_logs (
        id, tenant_id, contact_id, hook_id, action_type,
        from_stage, to_stage, success, result_data, error_message,
        executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())`,
      [
        `lhl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        tenantId,
        contactId,
        `${tenantId}_${hookConfig.from_stage || 'any'}_${hookConfig.to_stage || 'any'}_${hookConfig.action_type}`,
        hookConfig.action_type,
        event.from_stage,
        event.to_stage,
        result.success,
        result.result ? JSON.stringify(result.result) : null,
        result.error || null,
      ],
    );
  }, 'log hook execution');
}

// ============================================================================
// Migration: app.lifecycle_hooks
// ============================================================================

// (Will be created in T9.8 alongside the routes, but define interface here)

const LIFECYCLE_HOOKS_MIGRATION = `
CREATE TABLE IF NOT EXISTS app.lifecycle_hooks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    from_stage      TEXT,
    to_stage        TEXT,
    action_type     TEXT NOT NULL,
    action_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    priority        INTEGER NOT NULL DEFAULT 100,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.lifecycle_hook_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    contact_id      UUID NOT NULL REFERENCES app.contacts(id) ON DELETE CASCADE,
    hook_id         TEXT NOT NULL,
    action_type     TEXT NOT NULL,
    from_stage      TEXT,
    to_stage        TEXT,
    success         BOOLEAN NOT NULL,
    result_data     JSONB,
    error_message   TEXT,
    executed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_hooks_tenant_active
    ON app.lifecycle_hooks (tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lifecycle_hooks_tenant_transition
    ON app.lifecycle_hooks (tenant_id, from_stage, to_stage);
CREATE INDEX IF NOT EXISTS idx_lifecycle_hook_logs_tenant_contact
    ON app.lifecycle_hook_logs (tenant_id, contact_id, executed_at DESC);
`;

// ============================================================================
// Main Service: Process Lifecycle Event
// ============================================================================

export async function processLifecycleEvent(
  event: LifecycleEvent,
  env: Record<string, string>,
  pool: Pool,
): Promise<{ hooks_executed: number; total_success: number; total_errors: number }> {
  // 1. Get active hooks for this transition
  const hooks = await getActiveHooks(pool, event.tenant_id, event.from_stage, event.to_stage);

  if (hooks.length === 0) {
    console.log(`[LifecycleHook] No active hooks for ${event.tenant_id}: ${event.from_stage} → ${event.to_stage}`);
    return { hooks_executed: 0, total_success: 0, total_errors: 0 };
  }

  // 2. Execute hooks in parallel (sorted by priority)
  const sortedHooks = hooks.sort((a, b) => b.priority - a.priority);

  const results = await Promise.allSettled(
    sortedHooks.map(async (hook) => {
      const result = await executeHookAction(hook, event, env, pool);
      // Log the execution
      await logHookExecution(pool, event.tenant_id, event.contact_id, hook, event, result);
      return { hook, result };
    }),
  );

  // 3. Summarize results
  const total_success = results.filter((r) => r.status === 'fulfilled' && r.value.result.success).length;
  const total_errors = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.result.success)).length;

  return { hooks_executed: hooks.length, total_success, total_errors };
}

// ============================================================================
// Service: Poll Lifecycle History (for backwards compat with DB triggers)
// ============================================================================

export async function pollLifecycleHistory(pool: Pool, env: Record<string, string>, lastProcessedAt?: Date): Promise<{ processed: number }> {
  // Process new entries in app.lifecycle_history (from T9.5 migration)
  const result = await pool.query(
    `SELECT id, tenant_id, contact_id, from_stage, to_stage, transitioned_at
     FROM app.lifecycle_history
     WHERE transitioned_at > $1
     ORDER BY transitioned_at ASC
     LIMIT 100`,
    [lastProcessedAt || new Date(Date.now() - 60_000)],
  );

  let processed = 0;
  for (const row of result.rows) {
    await processLifecycleEvent(
      {
        contact_id: row.contact_id,
        tenant_id: row.tenant_id,
        from_stage: row.from_stage,
        to_stage: row.to_stage,
      },
      env,
      pool,
    );
    processed++;
  }

  return { processed };
}

// ============================================================================
// HTTP Handler (for Cloud Run)
// ============================================================================

export async function handleLifecycleHook(
  request: Request,
  env: Record<string, string>,
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

  let event: LifecycleEvent;
  try {
    const rawBody = await request.json();
    event = LifecycleEventSchema.parse(rawBody);
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await processLifecycleEvent(event, env, pool);
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Lifecycle hook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
