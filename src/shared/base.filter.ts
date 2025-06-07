import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class BaseFilter {
  constructor(data?: Partial<BaseFilter>) {
    if (data) {
      const { page, limit, skip, ...filter } = data;

      this.skip = skip ? skip - 1 : page! * limit!;
      this.limit = limit!;

      delete filter.filter;
      this.filter = Object.assign({}, filter);
    }
  }

  @ApiProperty({ description: 'Get skip then limit someone', example: 0 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  skip: number;

  @ApiProperty({ description: 'Limit something after...', example: 10 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number;

  @ApiProperty({ description: 'Page number', example: 1 })
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    description: 'Filter object',
    example: { fullName: 'someone' },
  })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value) as Record<string, any>;
    } catch {
      return false;
    }
  })
  @IsObject({
    message: 'Invalid filter',
  })
  @IsOptional()
  filter: Record<string, any> = {};

  public static toFilter(data?: Partial<BaseFilter>, extraFilter = {}) {
    const {
      filter = {},
      skip = 0,
      page = 0,
      limit = 10,
    } = new BaseFilter(data);
    delete filter?.filter;
    for (const key in extraFilter) {
      filter[key] = extraFilter[key];
    }
    filter['skip'] = page * limit;
    filter['limit'] = limit;

    return {
      filter,
      skip,
      limit,
    };
  }
}
