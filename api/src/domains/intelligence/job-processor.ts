import type { PostgresIntelligenceJobsRepository } from './postgres-repository-jobs';
import type { PostgresIntelligenceRepository } from './postgres-repository';
import type { FonteDataIntelligenceConnector } from './fonte-data-connector';
import type { IntelligenceJobRecord } from './types';

export interface JobProcessorDependencies {
  jobsRepository: PostgresIntelligenceJobsRepository;
  intelligenceRepository: PostgresIntelligenceRepository;
  fonteDataConnector: FonteDataIntelligenceConnector;
}

export class IntelligenceJobProcessor {
  private isProcessing = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private deps: JobProcessorDependencies) {}

  async processBatch(batchSize: number = 10): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;
    let processed = 0;
    try {
      const jobs = await this.deps.jobsRepository.findPendingJobs(batchSize);
      for (const job of jobs) {
        await this.processJob(job);
        processed++;
      }
    } finally {
      this.isProcessing = false;
    }
    return processed;
  }

  private async processJob(job: IntelligenceJobRecord): Promise<void> {
    try {
      await this.deps.jobsRepository.markJobProcessing(job.id);
      const attempts = await this.deps.jobsRepository.incrementJobAttempts(job.id);
      if (attempts > (job.max_attempts || 3)) {
        await this.deps.jobsRepository.markJobFailed(job.id, 'Max attempts exceeded');
        return;
      }
      let output: Record<string, any> = {};
      switch (job.job_type) {
        case 'competitor_enrichment':
          if (job.competitor_id) {
            const cnpj = (job.input_payload as any).cnpj;
            if (cnpj) {
              const enriched = await this.deps.fonteDataConnector.enrichCompetitorByCNPJ(cnpj);
              if (enriched) {
                await this.deps.intelligenceRepository.upsertIntelligence({
                  tenant_id: job.tenant_id,
                  competitor_id: job.competitor_id,
                  ...(enriched as any),
                });
                output = { enriched: true, spi_score: (enriched as any).spi_score };
              } else {
                await this.deps.intelligenceRepository.markEnrichmentFailed(job.tenant_id, job.competitor_id, 'FonteData returned null');
                output = { enriched: false };
              }
            }
          }
          break;
        case 'signal_detection':
          output = { signals_detected: 0 };
          break;
        default:
          output = { status: 'noop' };
      }
      await this.deps.jobsRepository.markJobCompleted(job.id, output);
    } catch (err) {
      await this.deps.jobsRepository.markJobFailed(job.id, err instanceof Error ? err.message : 'Unknown error');
    }
  }

  start(intervalMs: number = 30000): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.processBatch().catch((err) => console.error('[JobProcessor] Error:', err));
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }
}
