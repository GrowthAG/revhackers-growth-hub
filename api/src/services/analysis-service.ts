// @ts-nocheck
/**
 * analysis-service.ts
 *
 * GCP-native replacement for supabase/functions/analyze-meeting-transcript/index.ts.
 * 
 * PIPELINE (Dual-Model):
 * 1. Recebe transcript + opcionalmente mídias (slides/vídeo URLs)
 * 2. OpenAI GPT-4o (Structured Outputs): extrai insights estruturados (action items, sentiment, etc.)
 * 3. Google Gemini (multimodal): analisa mídias (slides/vídeo) se fornecidas
 * 4. Consolida insights de ambos os modelos
 * 5. Persiste em app.meetings (atualiza analysis_* + media_analysis)
 * 6. Retorna análise consolidada
 * 
 * OBSERVAÇÃO: Esta é a base do MediaOrchestrator (T9.6). Aqui usamos 2 modelos
 * (OpenAI + Gemini) em paralelo para máxima qualidade.
 */

import { Pool } from 'pg';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

const AnalysisResultSchema = z.object({
  executive_summary: z.string(),
  key_topics: z.array(z.string()),
  action_items: z.array(z.object({
    owner: z.enum(['client', 'revhackers', 'unassigned']),
    task: z.string(),
    deadline: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
  })),
  next_steps: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
  meeting_type: z.enum(['discovery', 'proposal', 'kickoff', 'review', 'expansion', 'support', 'other']),
  key_quotes: z.array(z.string()).optional(),
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

const MediaInsightSchema = z.object({
  visual_summary: z.string().optional(),
  slides_analyzed: z.number().optional(),
  key_visual_points: z.array(z.string()).optional(),
  detected_text: z.array(z.string()).optional(),
});

type MediaInsight = z.infer<typeof MediaInsightSchema>;

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
      console.warn(`[AnalysisService] ${context} attempt ${attempt} failed. Retrying in ${delayMs}ms...`, err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}

// ============================================================================
// Auth: Verify Firebase JWT
// ============================================================================

async function verifyFirebaseJwt(authHeader: string | null): Promise<{ user_id: string; email: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { status: 401, message: 'Missing or invalid Authorization header' };
  }
  const token = authHeader.replace('Bearer ', '');
  const { getAuth } = await import('firebase-admin/auth');
  const decoded = await getAuth().verifyIdToken(token);
  return { user_id: decoded.uid, email: decoded.email || '' };
}

// ============================================================================
// Service: AnalyzeTranscript (OpenAI GPT-4o Structured Outputs)
// ============================================================================

async function analyzeTranscriptWithOpenAI(
  transcript: string,
  openai: OpenAI,
): Promise<AnalysisResult> {
  return withAutoRetry(async () => {
    const prompt = `
Analise a transcrição de uma reunião de negócios em português brasileiro.
Extraia insights estruturados que ajudem o time da RevHackers (B2B RevOps consultancy) a fazer follow-up.

Retorne:
- executive_summary: resumo em 2-3 frases do que foi discutido
- key_topics: lista de 3-7 tópicos principais
- action_items: tasks específicas com owner (client/revhackers/unassigned) e priority
- next_steps: próximos passos sugeridos
- sentiment: sentiment geral da reunião (positive/neutral/negative/mixed)
- meeting_type: tipo da reunião (discovery/proposal/kickoff/review/expansion/support/other)
- key_quotes: 1-3 quotes impactantes ditas pelo cliente ou pelo time (opcional)

TRANSCRIÇÃO:
${transcript}
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert business meeting analyst for RevHackers (B2B RevOps consultancy).' },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'meeting_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              executive_summary: { type: 'string' },
              key_topics: { type: 'array', items: { type: 'string' } },
              action_items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    owner: { type: 'string', enum: ['client', 'revhackers', 'unassigned'] },
                    task: { type: 'string' },
                    deadline: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  },
                  required: ['owner', 'task', 'priority'],
                },
              },
              next_steps: { type: 'array', items: { type: 'string' } },
              sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'mixed'] },
              meeting_type: { type: 'string', enum: ['discovery', 'proposal', 'kickoff', 'review', 'expansion', 'support', 'other'] },
              key_quotes: { type: 'array', items: { type: 'string' } },
            },
            required: ['executive_summary', 'key_topics', 'action_items', 'next_steps', 'sentiment', 'meeting_type'],
          },
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');
    return AnalysisResultSchema.parse(JSON.parse(content));
  }, 'OpenAI transcript analysis');
}

// ============================================================================
// Service: AnalyzeMedia (Google Gemini Multimodal - Optional)
// ============================================================================

async function analyzeMediaWithGemini(
  mediaUrls: string[],
  transcript: string,
  gemini: GoogleGenerativeAI,
): Promise<MediaInsight | null> {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  return withAutoRetry(async () => {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Download media files
    const mediaParts = await Promise.all(
      mediaUrls.map(async (url) => {
        const res = await fetch(url);
        const buffer = Buffer.from(await res.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = url.includes('.pdf') ? 'application/pdf' :
          url.includes('.pptx') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
          url.includes('.png') ? 'image/png' : 'image/jpeg';
        return { inlineData: { data: base64, mimeType } };
      }),
    );

    const prompt = `Analise as mídias fornecidas (slides, vídeos, ou imagens) em conjunto com a transcrição da reunião.
Retorne:
- visual_summary: resumo do que é mostrado visualmente
- slides_analyzed: número de slides/imagens analisados
- key_visual_points: 2-5 pontos visuais importantes (gráficos, métricas, designs)
- detected_text: textos importantes detectados nas mídias (ex: headlines, números)

TRANSCRIÇÃO DA REUNIÃO:
${transcript.substring(0, 3000)}`.trim();

    const result = await model.generateContent([prompt, ...mediaParts]);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return MediaInsightSchema.parse(parsed);
  }, 'Gemini media analysis');
}

// ============================================================================
// Service: Persist to GCP Cloud SQL
// ============================================================================

async function persistAnalysis(
  pool: Pool,
  meetingId: string,
  tenantId: string,
  analysis: AnalysisResult,
  mediaInsight: MediaInsight | null,
): Promise<void> {
  return withAutoRetry(async () => {
    await pool.query(
      `UPDATE app.meetings
       SET analysis_summary = $1,
           analysis_topics = $2,
           analysis_action_items = $3,
           analysis_sentiment = $4,
           analysis_meeting_type = $5,
           analysis_next_steps = $6,
           analysis_key_quotes = $7,
           media_analysis = $8,
           updated_at = now()
       WHERE id = $9 AND tenant_id = $10`,
      [
        analysis.executive_summary,
        JSON.stringify(analysis.key_topics),
        JSON.stringify(analysis.action_items),
        analysis.sentiment,
        analysis.meeting_type,
        JSON.stringify(analysis.next_steps),
        analysis.key_quotes ? JSON.stringify(analysis.key_quotes) : null,
        mediaInsight ? JSON.stringify(mediaInsight) : null,
        meetingId,
        tenantId,
      ],
    );
  }, 'DB persist analysis');
}

// ============================================================================
// HTTP Handler (for Cloud Run)
// ============================================================================

export async function handleAnalyzeMeeting(
  request: Request,
  env: { OPENAI_API_KEY: string; GEMINI_API_KEY: string; DATABASE_URL: string },
  pool: Pool,
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Auth
  let user: { user_id: string; email: string };
  try {
    user = await verifyFirebaseJwt(request.headers.get('Authorization'));
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Auth failed' }), {
      status: err.status || 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Parse body
  let body: {
    meeting_id: string;
    media_urls?: string[];
  };

  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!body.meeting_id) {
    return new Response(JSON.stringify({ success: false, error: 'meeting_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Fetch existing meeting from DB
  const meetingResult = await pool.query(
    'SELECT tenant_id, transcript_text FROM app.meetings WHERE id = $1',
    [body.meeting_id],
  );

  if (meetingResult.rows.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Meeting not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const meeting = meetingResult.rows[0];
  const transcript = meeting.transcript_text;

  // 4. OpenAI GPT-4o Analysis
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const analysis = await analyzeTranscriptWithOpenAI(transcript, openai);

  // 5. Gemini Multimodal Analysis (if media URLs provided)
  const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const mediaInsight = await analyzeMediaWithGemini(body.media_urls || [], transcript, gemini);

  // 6. Persist
  await persistAnalysis(pool, body.meeting_id, meeting.tenant_id, analysis, mediaInsight);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        meeting_id: body.meeting_id,
        analysis,
        media_insight: mediaInsight,
      },
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}
