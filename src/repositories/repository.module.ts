import { Global, Module } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import { RoleRepository } from './role.repository';
import { TokenRepository } from './token.repository';
import { UserDeviceRepository } from './user-device.repository';
import { UserRoleRepository } from './user-role.repository';
import { UserRepository } from './user.repository';

const providers = [
  UserRepository,
  RoleRepository,
  UserRoleRepository,
  DeviceRepository,
  UserDeviceRepository,
  TokenRepository,
];

@Global()
@Module({
  providers,
  exports: providers,
})
export class RepositoryModule {}
