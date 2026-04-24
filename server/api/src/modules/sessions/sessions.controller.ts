import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequestUser } from '../auth/auth.types';
import { SessionsService } from './sessions.service';
import type { SessionView } from './sessions.types';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<SessionView[]> {
    return this.sessionsService.listActive(user.userId, user.sessionId);
  }

  @Delete('others')
  @HttpCode(HttpStatus.OK)
  async revokeOthers(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<{ revoked: number }> {
    const revoked = await this.sessionsService.revokeOthers(
      user.userId,
      user.sessionId,
    );
    return { revoked };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeOne(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.sessionsService.revokeOne(user.userId, id);
  }
}
