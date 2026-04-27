import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { RankingsBridgeService } from './rankings-bridge.service';
import { RankingSyncService } from './ranking-sync.service';

@Module({
  imports: [AuthModule],
  controllers: [GamificationController],
  providers: [GamificationService, RankingsBridgeService, RankingSyncService],
  exports: [GamificationService, RankingsBridgeService],
})
export class GamificationModule {}
