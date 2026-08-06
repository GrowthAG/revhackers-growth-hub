/**
 * HTTP routes para /v1/ai/* — handlers migrados das Supabase edge functions.
 *
 * Endpoints:
 *   POST /v1/ai/analyze-diagnostic
 *   POST /v1/ai/generate-growthmap
 *   POST /v1/ai/swot-analysis         (NOVA — MiniMax growth hub)
 *   POST /v1/ai/growthmap-suggest     (NOVA — MiniMax growth hub)
 *
 * Auth: AuthMiddleware (Firebase ID Token via Bearer).
 *
 * Ref: docs/architecture/gcp-migration/ai-supabase-to-gcp-migration.md
 */

import { z, ZodError } from 'zod';
import { ApiError } from '../contracts/errors';
import type { AuthMiddleware } from './auth-middleware';
import type { QueryablePool } from '../db/postgres';
import { handleAnalyzeDiagnostic } from '../ai/handlers/analyze-diagnostic';
import { handleGenerateGrowthmap } from '../ai/handlers/generate-growthmap';
import { handleSwotAnalysis } from '../ai/handlers/swot-analysis';
import { handleGrowthMapSuggest } from '../ai/handlers/growthmap-suggest';

interface AiRoutesDependencies {
  auth: AuthMiddleware;
  pool: QueryablePool;
}

const PATH_PREFIX = '/v1/ai/';

type HandlerFn = (
  deps: { pool: QueryablePool; userId: string; tenantId: string },
  body: unknown,
) => Promise<Record<string, unknown>>;

const ROUTE_TABLE: Record<string, HandlerFn> = {
  'analyze-diagnostic': handleAnalyzeDiagnostic,
  'generate-growthmap': handleGenerateGrowthmap,
  'swot-analysis': handleSwotAnalysis,
  'growthmap-suggest': handleGrowthMapSuggest,
};

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function toValidationError(err: ZodError): ApiError {
  const fieldErrors = err.flatten().fieldErrors;
  return ApiError.validation(`Payload invalido: ${JSON.stringify(fieldErrors)}`);
}

export function createAiRoutes(deps: AiRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(PATH_PREFIX)) return null;

    // Extrai o handlerName (string antes do primeiro '/' apos o prefixo).
    const remainder = url.pathname.slice(PATH_PREFIX.length);
    const slashIdx = remainder.indexOf('/');
    const handlerName = slashIdx === -1 ? remainder : remainder.slice(0, slashIdx);

    // Healthcheck no path raiz.
    if (handlerName === '' && request.method === 'GET') {
      return json(200, {
        status: 'ok',
        handlers: Object.keys(ROUTE_TABLE),
        version: 'wave-1',
      });
    }

    // Qualquer outro path sem handler especifico cai fora.
    if (handlerName === '') return null;

    if (request.method !== 'POST') {
      return json(405, { error: { code: 'validation', message: 'Metodo nao permitido.' } });
    }

    const handler = ROUTE_TABLE[handlerName];
    if (!handler) {
      return json(404, {
        error: { code: 'not_found', message: `Handler AI nao encontrado: ${handlerName}` },
        available: Object.keys(ROUTE_TABLE),
      });
    }

    const authResult = await deps.auth.authenticate(request);
    if (authResult instanceof Response) return authResult;
    const { user, tenantId } = authResult;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: { code: 'validation', message: 'Body JSON invalido.' } });
    }

    try {
      const result = await handler(
        { pool: deps.pool, userId: user.id, tenantId },
        body,
      );
      return json(200, { data: result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return json(400, toValidationError(err).toBody());
      }
      if (err instanceof ApiError) {
        return json(err.status, err.toBody());
      }
      console.error(JSON.stringify({
        severity: 'ERROR',
        event: 'ai_handler_error',
        handler: handlerName,
        user_id: user.id,
        error: err instanceof Error ? err.message : String(err),
      }));
      return json(500, { error: { code: 'internal', message: 'Erro interno no handler AI.' } });
    }
  };
}
