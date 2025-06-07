import { Controller, Get } from '@nestjs/common';
import { BaseController } from 'src/shared/base.controller';
import { PermissionDashboardService } from './permission.dashboard.service';

@Controller('dashboard/permissions')
export class PermissionDashboardController extends BaseController {
  constructor(
    private readonly _permissionDBService: PermissionDashboardService,
  ) {
    super();
  }

  @Get()
  findAll() {
    const data = this._permissionDBService.findAll();
    return this.responseCustom(data);
  }
}
