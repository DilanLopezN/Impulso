import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RankingsBridgeService } from './rankings-bridge.service';

@Injectable()
export class RankingSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RankingSyncService.name);
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly rankingsBridge: RankingsBridgeService) {}

  onModuleInit(): void {
    const enabled = (process.env.GO_WORKERS_CRON_ENABLED ?? '1') === '1';
    const baseUrl = (process.env.GO_WORKERS_BASE_URL ?? '').trim();
    if (!enabled || baseUrl.length === 0) {
      this.logger.log('ranking sync cron disabled (missing GO_WORKERS_BASE_URL or flag off)');
      return;
    }

    const intervalMs = Number(process.env.GO_WORKERS_CRON_INTERVAL_MS ?? '300000');
    this.runSnapshot().catch((error: unknown) => {
      this.logger.error('initial ranking sync failed', error as Error);
    });

    this.timer = setInterval(() => {
      this.runSnapshot().catch((error: unknown) => {
        this.logger.error('ranking sync failed', error as Error);
      });
    }, intervalMs);

    this.logger.log(`ranking sync cron started (every ${intervalMs}ms)`);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runSnapshot(): Promise<void> {
    await this.rankingsBridge.refreshSnapshots();
    this.logger.debug('ranking snapshots refreshed via workers api');
  }
}
