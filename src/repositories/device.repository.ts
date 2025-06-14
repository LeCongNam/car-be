import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Device } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceRepository extends BaseRepository<Device> {
  constructor(private _dataSource: DataSource) {
    super(Device, _dataSource);
  }
}
