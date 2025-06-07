import { Injectable } from '@nestjs/common';
import { Device } from 'src/entities';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceRepository extends BaseRepository<Device> {
  constructor(private _dataSource: DataSource) {
    super(Device, _dataSource);
  }
}
