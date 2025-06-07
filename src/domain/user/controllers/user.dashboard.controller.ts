import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { BaseController } from 'src/shared/base.controller';
import { HttpExceptionFilter } from 'src/shared/http-exception.filter';
import { GetListDashboardDto } from '../dto/get-list.dashboard.dto';
import { UserDashboardService } from '../services/user.dashboard.service';

@Controller('dashboard/users')
// @UseGuards(CustomerJwtAuthGuard)
@UseFilters(new HttpExceptionFilter())
export class UserDashboardController extends BaseController {
  constructor(private readonly _userDBService: UserDashboardService) {
    super();
  }

  @Get()
  async getList(@Query() query: GetListDashboardDto) {
    const [data, total] = await this._userDBService.getList(query);
    return this.responseCustom(data, { total: total as number });
  }
}
