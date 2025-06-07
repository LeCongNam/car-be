import { USER_ROLE_CONSTANTS } from 'src/constants/user-role.constant';
import {
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { EntityDecorator } from './entity.decorator';
import { Role } from './role.entity';
import { User } from './user.entity';

@EntityDecorator(USER_ROLE_CONSTANTS.MODEL_NAME)
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn()
  @Index()
  @ManyToOne(() => Role, (role) => role.userRoles, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  role: Role;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.userRoles)
  user: User;

  @Column({ default: USER_ROLE_CONSTANTS.STATUS.ACTIVE })
  isActive: boolean;
}
