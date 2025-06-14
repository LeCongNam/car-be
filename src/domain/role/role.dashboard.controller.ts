import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { BaseController } from '../../shared/base.controller';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionDto } from './dto/update-role.dto';
import { RoleDashboardService } from './role.dashboard.service';

@Controller('dashboard/roles')
// @UseGuards(AdminJwtAuthGuard, PermissionsAuthGuard)
export class RoleDashboardController extends BaseController {
  constructor(private readonly _roleDashboardService: RoleDashboardService) {
    super();
  }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this._roleDashboardService.create(createRoleDto);
  }

  @Post('init')
  initRole() {
    return this._roleDashboardService.initRole();
  }

  @Get()
  // @Permissions(
  //   PERMISSION_CONSTANT.ACTION.READ_ROLE,
  //   PERMISSION_CONSTANT.ACTION.CREATE_ROLE,
  // )
  async findAll() {
    const [data, total] = await this._roleDashboardService.findAll();
    return this.responseCustom(data, { total });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._roleDashboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this._roleDashboardService.update(+id, updateRoleDto);
  }

  @Put(':id/permissions')
  updateRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    return this._roleDashboardService.updateRolePermissions(
      id,
      updateRolePermissionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this._roleDashboardService.remove(id);
  }
}
