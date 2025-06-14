import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRole } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRoleRepository extends BaseRepository<UserRole> {
  constructor(private _dataSource: DataSource) {
    super(UserRole, _dataSource);
  }
}
