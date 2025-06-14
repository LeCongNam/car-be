import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilter } from '../../../shared/base.filter';

export class GetListDashboardDto extends BaseFilter {
  @ApiProperty({ example: 1, description: 'Role ID', required: false })
  @Type(() => Number)
  roleId?: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Search by name or email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
