import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
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
  @Exclude()
  createdAt?: string;

  @ApiProperty({
    example: '2025-06-09T14:31:24.000Z',
    description: 'User last update date',
  })
  @Exclude()
  updatedAt?: string;

  @ApiProperty({ example: 'admin', description: 'User who updated the record' })
  @Exclude()
  updatedBy?: string;
}
