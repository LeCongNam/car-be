import { Injectable } from '@nestjs/common';
import { UserDevice } from 'src/entities';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDevice> {
  constructor(private _dataSource: DataSource) {
    super(UserDevice, _dataSource);
  }
}
