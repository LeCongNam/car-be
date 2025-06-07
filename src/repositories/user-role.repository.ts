import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/entities';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRoleRepository extends BaseRepository<UserRole> {
  constructor(private _dataSource: DataSource) {
    super(UserRole, _dataSource);
  }
}
