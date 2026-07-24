import { loadConfig } from './config';
import { PostgresIdempotencyStore } from './context/postgres-idempotency-store';
import { loadDatabaseConfig } from './db/config';
import { checkPostgresReady, createPostgresResources } from './db/postgres';
import { PostgresClientRepository } from './domains/clients/postgres-repository';
import { ClientService } from './domains/clients/service';
import { PostgresGrowthMapRepository } from './domains/growthmap/postgres-repository';
import { GrowthMapService } from './domains/growthmap/service';
import { PostgresReiProjectRepository } from './domains/rei-projects/postgres-repository';
import { ReiProjectService } from './domains/rei-projects/service';
import { PostgresStrategicPlanRepository } from './domains/strategic-plans/postgres-repository';
import { StrategicPlanService } from './domains/strategic-plans/service';
import { createClientsRoutes } from './http/clients-routes';
import { createGrowthMapRoutes } from './http/growthmap-routes';
import { createIdentityRoutes } from './http/identity-routes';
import { createReiProjectsRoutes } from './http/rei-projects-routes';
import { createStrategicPlansRoutes } from './http/strategic-plans-http-routes';
import { GoogleIdentityTokenVerifier } from './identity/google-identity-verifier';
import { PostgresIdentityRepository } from './identity/postgres-identity-repository';
import { createApiServer } from './server';

async function main(): Promise<void> {
  const config = loadConfig();
  const databaseConfig = loadDatabaseConfig();
  const postgres = await createPostgresResources(databaseConfig);
  const googleProjectId = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  if (!googleProjectId) throw new Error('GOOGLE_CLOUD_PROJECT is required.');
  const verifier = new GoogleIdentityTokenVerifier({ projectId: googleProjectId });
  const identities = new PostgresIdentityRepository(postgres.pool);

  const identityRoutes = createIdentityRoutes({ verifier, identities });
  const clientRoutes = createClientsRoutes({
    verifier,
    identities,
    service: new ClientService(new PostgresClientRepository(postgres.pool)),
  });
  const reiProjectRoutes = createReiProjectsRoutes({
    verifier,
    identities,
    service: new ReiProjectService(new PostgresReiProjectRepository(postgres.pool)),
  });
  const strategicPlanRoutes = createStrategicPlansRoutes({
    verifier,
    identities,
    service: new StrategicPlanService(new PostgresStrategicPlanRepository(postgres.pool)),
  });
  const growthMapRoutes = createGrowthMapRoutes({
    verifier,
    identities,
    service: new GrowthMapService(new PostgresGrowthMapRepository(postgres.pool)),
    idempotency: new PostgresIdempotencyStore(postgres.pool),
  });

  const route = async (request: Request, requestId: string) =>
    (await identityRoutes(request)) ??
    (await clientRoutes(request)) ??
    (await reiProjectRoutes(request)) ??
    (await strategicPlanRoutes(request)) ??
    growthMapRoutes(request, requestId);

  const api = createApiServer(config, undefined, {
    route,
    readiness: async () => {
      try {
        return { ready: await checkPostgresReady(postgres.pool) };
      } catch {
        return { ready: false, reason: 'postgres_unavailable' };
      }
    },
    close: () => postgres.close(),
  });

  api.server.listen(config.port, '0.0.0.0', () => {
    console.log(JSON.stringify({
      severity: 'INFO',
      event: 'server_started',
      service: config.service,
      version: config.version,
      environment: config.environment,
      port: config.port,
    }));
  });

  let shutdownStarted = false;
  const handleSignal = async (signal: NodeJS.Signals) => {
    if (shutdownStarted) return;
    shutdownStarted = true;
    console.log(JSON.stringify({ severity: 'INFO', event: 'shutdown_started', signal }));
    try {
      await api.shutdown();
      console.log(JSON.stringify({ severity: 'INFO', event: 'shutdown_completed' }));
      process.exitCode = 0;
    } catch (error) {
      console.error(JSON.stringify({
        severity: 'ERROR',
        event: 'shutdown_failed',
        error: error instanceof Error ? error.message : 'unknown',
      }));
      process.exitCode = 1;
    }
  };

  process.once('SIGTERM', () => void handleSignal('SIGTERM'));
  process.once('SIGINT', () => void handleSignal('SIGINT'));
}

void main().catch((error: unknown) => {
  console.error(JSON.stringify({
    severity: 'CRITICAL',
    event: 'startup_failed',
    error: error instanceof Error ? error.message : 'unknown',
  }));
  process.exitCode = 1;
});
