// src/entities/user-device.entity.ts
import { USER_DEVICE_CONSTANTS } from 'src/constants';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Device } from './device.entity';
import { User } from './user.entity';

@Entity(USER_DEVICE_CONSTANTS.MODEL_NAME)
@Index('user_device_idx', ['user', 'device'], { unique: true })
export class UserDevice {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Device, (device) => device.userDevice, { nullable: false })
  @JoinColumn({
    name: 'device_id', // FK column trên bảng user_device
    referencedColumnName: 'deviceId', // property trong Device entity
  })
  device: Device;

  @ManyToOne(() => User, (user) => user.userDevices, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp' })
  lastSeen: Date;

  constructor(data: Partial<UserDevice> = {}) {
    Object.assign(this, data);
  }
}
