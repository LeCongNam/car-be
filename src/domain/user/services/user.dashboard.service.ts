import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/entities';
import { UserRepository } from 'src/repositories/user.repository';
import { BaseFilter } from 'src/shared/base.filter';
import { GetListDashboardDto } from '../dto/get-list.dashboard.dto';

@Injectable()
export class UserDashboardService {
  constructor(private readonly _userRepo: UserRepository) {}

  async getList(query: GetListDashboardDto) {
    const { filter, limit, skip } = new BaseFilter(query);

    const { roleId } = filter;

    const where: Record<string, any> = {};

    if (roleId) {
      where.userRoles = {
        role: {
          id: roleId,
        },
      };
    }

    const [users, total] = await this._userRepo.findAndCount({
      relations: {
        userRoles: {
          role: true,
        },
      },
      where,
      skip,
      take: limit,
    });

    const usersResponse = users.map((user) => {
      const userInstance = plainToInstance(User, user);
      return userInstance;
    });

    return [usersResponse, total];
  }
}
