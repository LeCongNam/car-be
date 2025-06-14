import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserDevice } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDevice> {
  constructor(private _dataSource: DataSource) {
    super(UserDevice, _dataSource);
  }
}
