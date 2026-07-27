/**
 * Secure credential loader for finance connectors.
 *
 * Resolution order (per-secret):
 *   1. process.env[NAME]                       (preferred in Cloud Run / CI)
 *   2. ~/.aside/u/0/credentials.json -> env.*  (dev only — explicit allowlist)
 *
 * Nunca hardcode secrets no código. Nenhum secret vaza em string de erro,
 * log ou response. O loader é síncrono (cache em memória) e seguro para
 * uso em hot-path: chama só uma vez por chave por processo.
 *
 * Ref: AGENTS.md (PROIBIDO hardcodar chaves de API).
 */

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { ApiError } from '../../../contracts/errors';

const CREDENTIALS_PATH = join(homedir(), '.aside', 'u', '0', 'credentials.json');

/**
 * Lista branca de chaves de ambiente que o loader pode expor do
 * credentials.json. Se uma chave não estiver aqui, NÃO é lida.
 */
const ALLOWED_CREDENTIAL_KEYS = new Set<string>([
  'STRIPE_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'INFINITEPAY_API_KEY',
  'PAGBANK_API_TOKEN',
  'PAGBANK_API_KEY',
  'PLUGGY_CLIENT_ID',
  'PLUGGY_CLIENT_SECRET',
]);

interface CredentialsFile {
  env?: Record<string, string>;
}

let cachedFile: CredentialsFile | null = null;
let cacheAttempted = false;

function readCredentialsFile(): CredentialsFile {
  if (cacheAttempted) return cachedFile ?? {};
  cacheAttempted = true;
  if (!existsSync(CREDENTIALS_PATH)) {
    cachedFile = {};
    return cachedFile;
  }
  try {
    const raw = readFileSync(CREDENTIALS_PATH, 'utf8');
    const parsed = JSON.parse(raw) as CredentialsFile;
    cachedFile = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    // Falha de parse não é fatal — cai em "sem secret".
    cachedFile = {};
  }
  return cachedFile;
}

function resolveFromFile(key: string): string | undefined {
  if (!ALLOWED_CREDENTIAL_KEYS.has(key)) return undefined;
  const file = readCredentialsFile();
  const value = file.env?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Resolve um secret por nome. Lança ApiError se a chave for obrigatória
 * e não estiver disponível em nenhuma fonte.
 */
export function requireSecret(key: string): string {
  const fromEnv = process.env[key];
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  const fromFile = resolveFromFile(key);
  if (fromFile) return fromFile;
  throw new ApiError('internal', `Connector secret missing: ${key}`);
}

/**
 * Resolução opcional — útil em dev/test onde o secret pode não existir.
 * Retorna string vazia se ausente. NUNCA usar para autenticar chamadas reais.
 */
export function optionalSecret(key: string): string {
  const fromEnv = process.env[key];
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  const fromFile = resolveFromFile(key);
  return fromFile ?? '';
}

/**
 * Indica se um secret está disponível (em qualquer fonte). Útil para
 * habilitar/desabilitar rotas de webhook em runtime sem crash.
 */
export function hasSecret(key: string): boolean {
  return optionalSecret(key).length > 0;
}

/**
 * Test/dev helper: invalida o cache em memória do arquivo de credenciais.
 * Não deve ser chamado em produção.
 */
export function __resetCredentialsCacheForTests(): void {
  cachedFile = null;
  cacheAttempted = false;
}

/**
 * Identifica o arquivo de credenciais que está sendo usado.
 * Útil para diagnóstico. Não inclui o conteúdo.
 */
export function credentialsDiagnostics(): { path: string; exists: boolean; allowed_keys: readonly string[] } {
  return {
    path: CREDENTIALS_PATH,
    exists: existsSync(CREDENTIALS_PATH),
    allowed_keys: [...ALLOWED_CREDENTIAL_KEYS].sort(),
  };
}
