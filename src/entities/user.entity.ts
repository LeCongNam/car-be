import { genSalt, hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import _ from 'lodash-es';
import { USER_CONSTANTS } from 'src/constants';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { EntityDecorator } from './entity.decorator';
import { Role } from './role.entity';
import { UserDevice } from './user-device.entity';
import { UserRole } from './user-role.entity';

@EntityDecorator(USER_CONSTANTS.MODEL_NAME)
export class User extends BaseEntity {
  constructor(partial: Partial<User> | null = null) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  avatar: string;

  @Column()
  @Exclude() // Exclude from serialization
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: null })
  updatedBy: string;

  @OneToMany(() => UserRole, (ur) => ur.user, { eager: true })
  userRoles: UserRole[];

  @OneToMany(() => UserDevice, (ud) => ud.user)
  userDevices: UserDevice[];

  roles?: string[];

  // Reference to Role entity without creating a relationship
  referenceRoles?: Role[];

  serialize() {
    return _.omit(this, ['password', 'isActive', 'createdAt', 'updatedAt']);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) return;
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
  }

  @AfterLoad()
  afterLoad() {
    if (this.userRoles?.length) {
      this.roles = this.userRoles.map((ur) => ur.role.name);
    }
  }
}
