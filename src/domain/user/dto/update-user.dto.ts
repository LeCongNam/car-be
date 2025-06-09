import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: true, description: 'Is user active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: ['customer', 'admin'], description: 'User roles' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({
    example: '2025-06-06T12:30:37.485Z',
    description: 'User creation date',
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({
    example: '2025-06-09T14:31:24.000Z',
    description: 'User last update date',
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  @ApiProperty({ example: 'admin', description: 'User who updated the record' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
