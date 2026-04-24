import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { type SessionView, toSessionView } from './sessions.types';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(userId: string, currentSessionId: string): Promise<SessionView[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastSeenAt: 'desc' },
    });
    return sessions.map((session) => toSessionView(session, currentSessionId));
  }

  async revokeOne(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.revokedAt) {
      return;
    }
    await this.revoke(sessionId);
  }

  async revokeOthers(userId: string, currentSessionId: string): Promise<number> {
    const targets = await this.prisma.session.findMany({
      where: { userId, revokedAt: null, NOT: { id: currentSessionId } },
      select: { id: true },
    });
    if (targets.length === 0) return 0;

    const now = new Date();
    const ids = targets.map((s) => s.id);
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { id: { in: ids } },
        data: { revokedAt: now },
      }),
      this.prisma.refreshToken.updateMany({
        where: { sessionId: { in: ids }, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);
    return ids.length;
  }

  private async revoke(sessionId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: now },
      }),
      this.prisma.refreshToken.updateMany({
        where: { sessionId, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);
  }
}
