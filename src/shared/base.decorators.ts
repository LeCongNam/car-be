import { SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IS_PUBLIC_KEY } from '../constants';

export const ArrayTransform = () => {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return Array.isArray(value) ? value : value ? [value] : [];
  });
};

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<string>) => SetMetadata(ROLES_KEY, roles);

export const PERMISSION_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
