import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PERMISSION_CONSTANT } from 'src/constants';
import { AdminJwtAuthGuard } from 'src/domain/auth/guards/admin-auth.guard';
import { PermissionsAuthGuard } from 'src/domain/auth/guards/permissions.guard';
import { BaseController } from 'src/shared/base.controller';
import { Permissions } from 'src/shared/base.decorators';
import { GetListDashboardDto } from '../dto/get-list.dashboard.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDashboardService } from '../services/user.dashboard.service';

@Controller('dashboard/users')
@UseGuards(AdminJwtAuthGuard, PermissionsAuthGuard)
export class UserDashboardController extends BaseController {
  constructor(private readonly _userDBService: UserDashboardService) {
    super();
  }

  @Get()
  @Permissions(PERMISSION_CONSTANT.ACTION.CREATE_PERMISSION)
  async getList(@Query() query: GetListDashboardDto) {
    const [data, total] = await this._userDBService.getList(query);
    return this.responseCustom(data, { total: total as number });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const data = await this._userDBService.getDetail(id);
    return this.responseCustom(data);
  }

  @Patch(':id/avatar')
  async updateAvatar(
    @Body() body: { avatar: string },
    @Param('id') id: string,
  ) {
    const data = await this._userDBService.updateAvatar(id, body);
    return this.responseCustom(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const data = await this._userDBService.update(id, body);
    return this.responseCustom(data);
  }
}
