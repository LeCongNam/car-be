import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, JWT_CONSTANTS } from 'src/constants';

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard([
  JWT_CONSTANTS.TYPE.ADMIN_JWT,
  JWT_CONSTANTS.TYPE.CUSTOMER_JWT,
  JWT_CONSTANTS.TYPE.MERCHANT_JWT,
]) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
