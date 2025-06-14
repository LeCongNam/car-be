import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../../shared/base.controller';
import { PermissionDashboardService } from './permission.dashboard.service';

@Controller('dashboard/permissions')
export class PermissionDashboardController extends BaseController {
  constructor(private readonly permissionService: PermissionDashboardService) {
    super();
  }

  @Get()
  findAll() {
    const data = this.permissionService.findAll();

    return this.responseCustom(data);
  }
}
