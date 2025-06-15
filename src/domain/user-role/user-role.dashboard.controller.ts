import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRoleDashboardService } from './user-role.dashboard.service';

@Controller('dashboard/user-roles')
export class UserRoleDashboardController {
  constructor(private readonly _userRoleDBService: UserRoleDashboardService) {}

  @Post()
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this._userRoleDBService.create(createUserRoleDto);
  }

  @Get()
  findAll() {
    return this._userRoleDBService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._userRoleDBService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this._userRoleDBService.update(+id, updateUserRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._userRoleDBService.remove(+id);
  }
}
