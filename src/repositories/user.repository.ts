import { Injectable } from '@nestjs/common';
import { User } from 'src/entities';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private _dataSource: DataSource) {
    super(User, _dataSource);
  }
}
