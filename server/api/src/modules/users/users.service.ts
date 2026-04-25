import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { type PublicUser, toPublicUser } from '../auth/auth.types';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserDataExport } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getById(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }
    return toPublicUser(user);
  }

  async update(userId: string, dto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName ?? undefined,
        avatarUrl: dto.avatarUrl ?? undefined,
        timezone: dto.timezone ?? undefined,
      },
    });
    return toPublicUser(updated);
  }

  /**
   * Builds a portable JSON snapshot of everything we hold about the user.
   * Today this covers identity + sessions; new domains (goals, habits, xp
   * ledger, etc.) must be added here as they ship so the export stays
   * complete for LGPD purposes.
   */
  async exportData(userId: string): Promise<UserDataExport> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: { orderBy: { createdAt: 'desc' } },
        goals: {
          include: { milestones: { orderBy: { order: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      user: toPublicUser(user),
      sessions: user.sessions.map((session) => ({
        id: session.id,
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt.toISOString(),
        lastSeenAt: session.lastSeenAt.toISOString(),
        revokedAt: session.revokedAt ? session.revokedAt.toISOString() : null,
      })),
      goals: user.goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        type: goal.type,
        icon: goal.icon,
        color: goal.color,
        deadline: goal.deadline ? goal.deadline.toISOString() : null,
        targetValue: goal.targetValue,
        targetUnit: goal.targetUnit,
        frequency: goal.frequency,
        progress: goal.progress,
        archivedAt: goal.archivedAt ? goal.archivedAt.toISOString() : null,
        deletedAt: goal.deletedAt ? goal.deletedAt.toISOString() : null,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        milestones: goal.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          date: m.date ? m.date.toISOString() : null,
          done: m.done,
          xp: m.xp,
          order: m.order,
          completedAt: m.completedAt ? m.completedAt.toISOString() : null,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
      })),
    };
  }

  /**
   * Soft-deletes the account and scrubs identifying fields. We keep the row
   * (with `deletedAt`) so foreign keys and audit trails still resolve, but the
   * email is anonymized and the password is rendered unusable. All sessions
   * and refresh tokens are revoked.
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date();
    const anonymizedEmail = `deleted+${user.id}@impulso.invalid`;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: now,
        email: anonymizedEmail,
        displayName: 'Conta removida',
        avatarUrl: null,
        // Replace the hash with a value bcrypt will never match.
        passwordHash: 'deleted',
      },
    });

    await this.authService.revokeAllSessions(userId);
  }
}
