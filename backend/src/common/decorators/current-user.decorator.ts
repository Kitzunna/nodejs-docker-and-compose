import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type JwtUser = { userId: number; username: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | null => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: JwtUser }>();
    return req.user ?? null;
  },
);
