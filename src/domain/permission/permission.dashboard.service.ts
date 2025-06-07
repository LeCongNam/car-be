import { Injectable } from '@nestjs/common';
import { PERMISSION_CONSTANT } from 'src/constants';

@Injectable()
export class PermissionDashboardService {
  findAll() {
    return Object.entries(PERMISSION_CONSTANT.ACTION).map(([key, value]) => ({
      key: key.split('_').join(' '),
      value,
    }));
  }
}
