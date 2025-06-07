import { IsArray, IsString } from 'class-validator';

export class CreateUserRoleDto {
  @IsString()
  userId: string;

  @IsArray()
  roleIds: number[];
}
