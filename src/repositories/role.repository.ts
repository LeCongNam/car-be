import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(private _dataSource: DataSource) {
    super(Role, _dataSource);
  }
}
