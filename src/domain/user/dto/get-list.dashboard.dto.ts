import { Type } from 'class-transformer';
import { BaseFilter } from 'src/shared/base.filter';

export class GetListDashboardDto extends BaseFilter {
  @Type(() => Number)
  roleId?: number;
}
