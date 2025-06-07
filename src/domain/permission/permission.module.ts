import { Module } from '@nestjs/common';
import { PermissionDashboardController } from './permission.dashboard.controller';
import { PermissionDashboardService } from './permission.dashboard.service';

@Module({
  controllers: [PermissionDashboardController],
  providers: [PermissionDashboardService],
})
export class PermissionModule {}
