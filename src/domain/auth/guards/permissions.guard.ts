import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JWT_CONSTANTS } from 'src/constants';
import { PERMISSION_KEY } from 'src/shared/base.decorators';

@Injectable()
export class PermissionsAuthGuard extends AuthGuard([
  JWT_CONSTANTS.TYPE.ADMIN_JWT,
  JWT_CONSTANTS.TYPE.CUSTOMER_JWT,
  JWT_CONSTANTS.TYPE.MERCHANT_JWT,
]) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.dir(user, { depth: null });
    const userPermissions = user?.userRoles?.flatMap((userRole) => {
      return userRole?.role?.permissions || [];
    });

    const hasPermission = permissions.every((permission) =>
      userPermissions?.includes(permission),
    );

    if (!hasPermission) {
      console.log('---fb--');

      throw new ForbiddenException();
    }

    console.log('-----past');

    return super.canActivate(context);
  }
}
