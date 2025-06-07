import { PartialType } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateRolePermissionDto {
  @IsArray()
  permissions: string[];
}
