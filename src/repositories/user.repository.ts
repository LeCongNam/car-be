import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private _dataSource: DataSource) {
    super(User, _dataSource);
  }
}
