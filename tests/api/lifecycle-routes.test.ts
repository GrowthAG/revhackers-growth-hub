import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'node:crypto';
import {
  handleProcessLifecycle,
  handleCalendarWebhook,
  handleGHLWebhook,
  handleListHooks,
  handleCreateHook,
  handleContactJourney,
} from '../../api/src/http/lifecycle-routes';

function createMockPool() {
  return {
    query: vi.fn(),
  } as any;
}

const mockEnv = {
  OPENAI_API_KEY: 'sk-test',
  GEMINI_API_KEY: 'AIza-test',
  DATABASE_URL: 'postgresql://test',
  GHL_WEBHOOK_SECRET: 'test-secret',
} as any;

describe('Lifecycle Routes', () => {
  let pool: ReturnType<typeof createMockPool>;
  const request = (url: string, init?: RequestInit) => new Request(`https://api.test${url}`, init);

  beforeEach(() => {
    pool = createMockPool();
  });

  // ============================================
  // POST /v1/lifecycle/process
  // ============================================
  describe('POST /v1/lifecycle/process', () => {
    it('processes a lifecycle event successfully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // logHookExecution

      const res = await handleProcessLifecycle(
        request('/v1/lifecycle/process', {
          method: 'POST',
          body: JSON.stringify({
            contact_id: 'c-123',
            tenant_id: 't-1',
            from_stage: 'mql',
            to_stage: 'sql',
          }),
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(200);
      const body = (await res?.json()) as any;
      expect(body.success).toBe(true);
    });

    it('returns 400 for invalid JSON body', async () => {
      const res = await handleProcessLifecycle(
        request('/v1/lifecycle/process', {
          method: 'POST',
          body: 'invalid json{',
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(400);
    });

    it('returns null for non-POST methods (not its route)', async () => {
      const res = await handleProcessLifecycle(
        request('/v1/lifecycle/process', { method: 'GET' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });
  });

  // ============================================
  // POST /v1/lifecycle/webhook/calendar
  // ============================================
  describe('POST /v1/lifecycle/webhook/calendar', () => {
    it('rejects payload with missing required fields', async () => {
      const res = await handleCalendarWebhook(
        request('/v1/lifecycle/webhook/calendar', {
          method: 'POST',
          body: JSON.stringify({ event_id: 'evt-1' }), // missing start_time, end_time
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(400);
    });

    it('returns null for non-POST methods (not its route)', async () => {
      const res = await handleCalendarWebhook(
        request('/v1/lifecycle/webhook/calendar', { method: 'GET' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });
  });

  // ============================================
  // POST /v1/lifecycle/webhook/ghl
  // ============================================
  describe('POST /v1/lifecycle/webhook/ghl', () => {
    const GHL_SECRET = 'test-secret';
    function signGhlPayload(payload: string): string {
      return crypto.createHmac('sha256', GHL_SECRET).update(payload).digest('hex');
    }

    it('processes a GHL webhook with valid HMAC signature', async () => {
      const payload = JSON.stringify({ event_type: 'contact_updated', contact_id: 'c-1' });
      const signature = signGhlPayload(payload);
      const res = await handleGHLWebhook(
        request('/v1/lifecycle/webhook/ghl', {
          method: 'POST',
          body: payload,
          headers: { 'x-ghl-signature': signature },
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(200);
    });

    it('returns 401 when signature header is missing', async () => {
      const res = await handleGHLWebhook(
        request('/v1/lifecycle/webhook/ghl', {
          method: 'POST',
          body: JSON.stringify({ event_type: 'contact_updated', contact_id: 'c-1' }),
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(401);
    });

    it('returns 401 when signature is invalid', async () => {
      const res = await handleGHLWebhook(
        request('/v1/lifecycle/webhook/ghl', {
          method: 'POST',
          body: JSON.stringify({ event_type: 'contact_updated', contact_id: 'c-1' }),
          headers: { 'x-ghl-signature': 'deadbeef'.repeat(8) }, // 64 hex chars válidos mas signature errada
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(401);
    });

    it('returns 500 when GHL_WEBHOOK_SECRET is not configured', async () => {
      const envNoSecret = { ...mockEnv, GHL_WEBHOOK_SECRET: undefined } as any;
      const res = await handleGHLWebhook(
        request('/v1/lifecycle/webhook/ghl', {
          method: 'POST',
          body: JSON.stringify({ event_type: 'contact_updated', contact_id: 'c-1' }),
          headers: { 'x-ghl-signature': 'deadbeef'.repeat(8) },
        }),
        envNoSecret,
        pool,
      );

      expect(res?.status).toBe(500);
    });

    it('returns null for non-POST methods (not its route)', async () => {
      const res = await handleGHLWebhook(
        request('/v1/lifecycle/webhook/ghl', { method: 'DELETE' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });
  });

  // ============================================
  // GET /v1/lifecycle/hooks
  // ============================================
  describe('GET /v1/lifecycle/hooks', () => {
    it('returns 400 when tenant_id is missing', async () => {
      const res = await handleListHooks(
        request('/v1/lifecycle/hooks', { method: 'GET' }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(400);
    });

    it('returns null for non-GET methods (not its route)', async () => {
      const res = await handleListHooks(
        request('/v1/lifecycle/hooks', { method: 'POST' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });
  });

  // ============================================
  // POST /v1/lifecycle/hooks
  // ============================================
  describe('POST /v1/lifecycle/hooks', () => {
    it('returns 400 when tenant_id is missing', async () => {
      const res = await handleCreateHook(
        request('/v1/lifecycle/hooks?tenant_id=', {
          method: 'POST',
          body: JSON.stringify({ action_type: 'send_email' }),
        }),
        mockEnv,
        pool,
      );

      expect(res?.status).toBe(400);
    });

    it('returns null for non-POST methods (not its route)', async () => {
      const res = await handleCreateHook(
        request('/v1/lifecycle/hooks?tenant_id=t-1', { method: 'GET' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });
  });

  // ============================================
  // GET /v1/lifecycle/contacts/:id/journey
  // ============================================
  describe('GET /v1/lifecycle/contacts/:id/journey', () => {
    it('returns null for invalid contact_id format (not its route)', async () => {
      const res = await handleContactJourney(
        request('/v1/lifecycle/contacts/invalid-id/journey', { method: 'GET' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });

    it('returns null for non-GET methods (not its route)', async () => {
      const res = await handleContactJourney(
        request('/v1/lifecycle/contacts/12345678-1234-1234-1234-123456789012/journey', { method: 'POST' }),
        mockEnv,
        pool,
      );

      expect(res).toBeNull();
    });
  });
});
