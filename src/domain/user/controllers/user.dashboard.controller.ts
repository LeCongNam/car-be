import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PERMISSION_CONSTANT } from '../../../constants';
import { BaseController } from '../../../shared/base.controller';
import { Permissions } from '../../../shared/base.decorators';
import { CreateUserDashboardDto } from '../dto/create-user.dashboard.dto';
import { GetListDashboardDto } from '../dto/get-list.dashboard.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDashboardService } from '../services/user.dashboard.service';

@Controller('dashboard/users')
// @UseGuards(AdminJwtAuthGuard, PermissionsAuthGuard)
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

  @Post()
  // @Permissions(PERMISSION_CONSTANT.ACTION.CREATE_USER)
  async create(@Body() body: CreateUserDashboardDto) {
    const data = await this._userDBService.create(body);
    return this.responseCustom(data);
  }
}
