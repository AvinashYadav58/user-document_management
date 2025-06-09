import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './user.entity';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: User }>();
    if (!request.user) {
      throw new Error('User not found in request');
    }
    return request.user; // This will be the user object set by the JwtStrategy
  },
);
