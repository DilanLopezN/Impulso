import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { AuthService } from '../auth.service';
import type { AuthenticatedRequestUser } from '../auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest & {
      user?: AuthenticatedRequestUser;
    }>();
    const token = this.extractBearer(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = this.authService.verifyAccessToken(token);
    await this.authService.assertSessionActive(payload.sid);

    req.user = { userId: payload.sub, sessionId: payload.sid };
    return true;
  }

  private extractBearer(header: string | string[] | undefined): string | null {
    if (!header || Array.isArray(header)) {
      return null;
    }
    const [scheme, value] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !value) {
      return null;
    }
    return value.trim();
  }
}
