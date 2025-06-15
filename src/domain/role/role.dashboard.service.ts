import { BadRequestException, Injectable } from '@nestjs/common';
import { PERMISSION_CONSTANT, ROLE_CONSTANTS } from '../../constants';
import { Role } from '../../entities';
import { RoleRepository } from '../../repositories/role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionDto } from './dto/update-role.dto';

@Injectable()
export class RoleDashboardService {
  constructor(private _roleRepo: RoleRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this._roleRepo.findOne({
      where: { name: createRoleDto.name },
    });
    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    const role = this._roleRepo.create(createRoleDto);
    return this._roleRepo.save(role);
  }

  async initRole() {
    const roles: Role[] = [];

    await this._roleRepo.deleteAll();

    for (const type of Object.values(ROLE_CONSTANTS.TYPE)) {
      const role = this._roleRepo.create({
        name: type,
        description: `This is the ${type} role`,
        isActive: true,
      });
      if (type === ROLE_CONSTANTS.TYPE.ADMIN) {
        Object.assign(role, {
          permissions: Object.values(PERMISSION_CONSTANT.ACTION),
        });
      } else {
        Object.assign(role, {
          permissions: [],
        });
      }

      roles.push(role);
    }

    return this._roleRepo.save(roles);
  }

  findAll() {
    return this._roleRepo.findAndCount({
      where: {
        // isActive: true,
      },
    });
  }

  findOne(id: number) {
    return this._roleRepo.findOne({ where: { id } });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this._roleRepo.update(id, updateRoleDto);
  }

  async updateRolePermissions(
    id: number,
    updateRoleDto: UpdateRolePermissionDto,
  ) {
    const role = this._roleRepo.create({
      permissions: updateRoleDto.permissions,
    });
    await this._roleRepo.update(id, role);

    return this.findOne(id);
  }

  remove(id: number) {
    return this._roleRepo.delete(id);
  }
}
