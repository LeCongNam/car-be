import { Injectable } from '@nestjs/common';
import { Role } from 'src/entities';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(private _dataSource: DataSource) {
    super(Role, _dataSource);
  }
}
