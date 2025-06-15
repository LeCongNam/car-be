import { Injectable } from '@nestjs/common';
import { Role, User } from '../../entities';
import { UserRoleRepository } from '../../repositories/user-role.repository';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserRoleDashboardService {
  constructor(private _userRoleRepo: UserRoleRepository) {}

  create(createUserRoleDto: CreateUserRoleDto) {
    const data = createUserRoleDto.roleIds.map((roleId) => {
      return this._userRoleRepo.create({
        user: new User({ id: createUserRoleDto.userId }),
        role: new Role({ id: roleId }),
      });
    });

    return this._userRoleRepo.save(data);
  }

  findAll() {
    return this._userRoleRepo.findAndCount({
      where: {
        isActive: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} userRole`;
  }

  update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    return `This action updates a #${id} userRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} userRole`;
  }
}
