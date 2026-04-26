import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequestUser } from '../auth/auth.types';
import { ListLedgerQuery } from './dto/list-ledger.query';
import { GamificationService } from './gamification.service';
import type {
  AchievementView,
  ProfileSummaryView,
  XpLedgerEntryView,
} from './gamification.types';

@Controller()
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('profile/summary')
  summary(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<ProfileSummaryView> {
    return this.gamification.getSummary(user.userId);
  }

  @Get('gamification/ledger')
  ledger(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: ListLedgerQuery,
  ): Promise<{ items: XpLedgerEntryView[]; nextCursor: string | null }> {
    return this.gamification.listLedger(user.userId, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @Get('achievements')
  achievements(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<AchievementView[]> {
    return this.gamification.listAchievements(user.userId);
  }
}
