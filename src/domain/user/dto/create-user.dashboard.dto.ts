import { IsArray, IsBoolean, IsString } from 'class-validator';

export class CreateUserDashboardDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  avatar?: string;

  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  roleIds?: number[];

  password?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}
