import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import type { AuthenticatedRequestUser } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedRequestUser => {
    const req = ctx
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: AuthenticatedRequestUser }>();
    if (!req.user) {
      throw new Error('CurrentUser used on an unprotected route');
    }
    return req.user;
  },
);
