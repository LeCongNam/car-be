import { Module } from '@nestjs/common';
import { UserRoleDashboardController } from './user-role.dashboard.controller';
import { UserRoleDashboardService } from './user-role.dashboard.service';

@Module({
  controllers: [UserRoleDashboardController],
  providers: [UserRoleDashboardService],
})
export class UserRoleModule {}
