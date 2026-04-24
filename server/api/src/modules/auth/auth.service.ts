import { randomBytes, createHash } from 'node:crypto';

import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { RefreshToken, Session, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';
import {
  type AccessTokenPayload,
  type AuthResult,
  type AuthTokens,
  type RequestContext,
  toPublicUser,
} from './auth.types';

const REFRESH_TOKEN_BYTES = 48;
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TTL_MINUTES = 30;

export interface PasswordResetIssue {
  token: string | null;
  expiresAt: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto, ctx: RequestContext): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const rounds = this.config.get<number>('PASSWORD_HASH_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: dto.displayName,
        timezone: dto.timezone ?? 'UTC',
      },
    });

    const tokens = await this.createSessionWithTokens(user, {
      ...ctx,
      deviceName: dto.deviceName ?? ctx.deviceName,
      deviceId: dto.deviceId ?? ctx.deviceId,
    });

    return { user: toPublicUser(user), tokens };
  }

  async login(dto: LoginDto, ctx: RequestContext): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.createSessionWithTokens(user, {
      ...ctx,
      deviceName: dto.deviceName ?? ctx.deviceName,
      deviceId: dto.deviceId ?? ctx.deviceId,
    });

    return { user: toPublicUser(user), tokens };
  }

  async refresh(rawToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashRefreshToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true, session: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      // Token reuse: revoke the whole session as a safety measure.
      await this.revokeSession(stored.sessionId);
      this.logger.warn(
        `Refresh token reuse detected for session ${stored.sessionId}; session revoked.`,
      );
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (stored.session.revokedAt || stored.user.deletedAt) {
      throw new UnauthorizedException('Session no longer active');
    }

    return this.rotateRefreshToken(stored);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!stored) {
      return;
    }
    await this.revokeSession(stored.sessionId);
  }

  /**
   * Issues a password-reset token. Always returns a structurally identical
   * response from the controller (we never reveal whether the email exists).
   * The raw token is returned here only when a real user matches; the
   * controller is responsible for handing it off to the email channel and
   * NOT echoing it on the public response. In dev environments we surface it
   * via logs so the flow can be exercised end-to-end without an SMTP server.
   */
  async issuePasswordReset(
    email: string,
    ctx: RequestContext,
  ): Promise<PasswordResetIssue> {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user || user.deletedAt) {
      return { token: null, expiresAt: null };
    }

    const rawToken = this.generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(rawToken),
        expiresAt,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
    });

    if (this.config.get<string>('NODE_ENV') !== 'production') {
      this.logger.log(
        `[dev] password reset token for ${normalized}: ${rawToken} (expires ${expiresAt.toISOString()})`,
      );
    }

    return { token: rawToken, expiresAt: expiresAt.toISOString() };
  }

  /**
   * Consumes a password-reset token: validates it, updates the password, marks
   * the token as used and revokes ALL active sessions for that user as a
   * safety measure (the user must log in again on every device).
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(rawToken);
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.user.deletedAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    if (stored.usedAt) {
      throw new UnauthorizedException('Reset token already used');
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Reset token expired');
    }

    const rounds = this.config.get<number>('PASSWORD_HASH_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: now },
      }),
      this.prisma.passwordResetToken.updateMany({
        where: { userId: stored.userId, usedAt: null, id: { not: stored.id } },
        data: { usedAt: now },
      }),
    ]);

    await this.revokeAllSessions(stored.userId);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);
  }

  async assertSessionActive(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Session no longer active');
    }
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwt.verify<AccessTokenPayload>(token, {
        secret: this.requireString('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async createSessionWithTokens(
    user: User,
    ctx: RequestContext,
  ): Promise<AuthTokens> {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        deviceId: ctx.deviceId,
        deviceName: ctx.deviceName,
        userAgent: ctx.userAgent,
        ipAddress: ctx.ipAddress,
      },
    });

    return this.issueTokens(user.id, session);
  }

  private async rotateRefreshToken(
    current: RefreshToken & { session: Session; user: User },
  ): Promise<AuthTokens> {
    const nextToken = this.generateRefreshToken();
    const nextExpiresAt = this.refreshTokenExpiresAt();

    const next = await this.prisma.refreshToken.create({
      data: {
        userId: current.userId,
        sessionId: current.sessionId,
        tokenHash: this.hashRefreshToken(nextToken),
        expiresAt: nextExpiresAt,
      },
    });

    await this.prisma.refreshToken.update({
      where: { id: current.id },
      data: { revokedAt: new Date(), replacedBy: next.id },
    });

    await this.prisma.session.update({
      where: { id: current.sessionId },
      data: { lastSeenAt: new Date() },
    });

    return this.buildTokens(current.userId, current.sessionId, nextToken, nextExpiresAt);
  }

  private async issueTokens(userId: string, session: Session): Promise<AuthTokens> {
    const rawToken = this.generateRefreshToken();
    const expiresAt = this.refreshTokenExpiresAt();

    await this.prisma.refreshToken.create({
      data: {
        userId,
        sessionId: session.id,
        tokenHash: this.hashRefreshToken(rawToken),
        expiresAt,
      },
    });

    return this.buildTokens(userId, session.id, rawToken, expiresAt);
  }

  private buildTokens(
    userId: string,
    sessionId: string,
    refreshToken: string,
    refreshTokenExpiresAt: Date,
  ): AuthTokens {
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const payload: AccessTokenPayload = { sub: userId, sid: sessionId };
    const accessToken = this.jwt.sign(payload, {
      secret: this.requireString('JWT_ACCESS_SECRET'),
      expiresIn: accessTtl,
    });

    return {
      accessToken,
      accessTokenExpiresAt: this.computeAccessExpiry(accessTtl).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    };
  }

  private async revokeSession(sessionId: string): Promise<void> {
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

  private hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private generateRefreshToken(): string {
    return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
  }

  private generatePasswordResetToken(): string {
    return randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('base64url');
  }

  private refreshTokenExpiresAt(): Date {
    const days = this.config.get<number>('JWT_REFRESH_TTL_DAYS', 30);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private computeAccessExpiry(ttl: string): Date {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) {
      return new Date(Date.now() + 15 * 60 * 1000);
    }
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + value * multipliers[unit]);
  }

  private requireString(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`Missing required config ${key}`);
    }
    return value;
  }
}
