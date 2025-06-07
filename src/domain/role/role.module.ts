import { Module } from '@nestjs/common';
import { RoleDashboardController } from './role.dashboard.controller';
import { RoleDashboardService } from './role.dashboard.service';

@Module({
  controllers: [RoleDashboardController],
  providers: [RoleDashboardService],
})
export class RoleModule {}
