import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Queue } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';
import { RedisClientService } from '../../../core/redis/redis.service';
import { User } from '../../../entities';
import { DeviceRepository } from '../../../repositories/device.repository';
import { RoleRepository } from '../../../repositories/role.repository';
import { TokenRepository } from '../../../repositories/token.repository';
import { UserDeviceRepository } from '../../../repositories/user-device.repository';
import { UserRoleRepository } from '../../../repositories/user-role.repository';
import { UserRepository } from '../../../repositories/user.repository';
import { BaseFilter } from '../../../shared/base.filter';
import { AuthService } from '../../auth/auth.service';
import { CreateUserDashboardDto } from '../dto/create-user.dashboard.dto';
import { GetListDashboardDto } from '../dto/get-list.dashboard.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserDashboardService {
  private _logger = new Logger(UserDashboardService.name);

  constructor(
    private readonly _userRepo: UserRepository,
    @InjectQueue('cloudinary') private _cloudinaryQueue: Queue,
    private _authSvc: AuthService,
    private _redisService: RedisClientService,
    private _userDeviceRepo: UserDeviceRepository,
    private _deviceRepo: DeviceRepository,
    private _tokenRepo: TokenRepository,
    private readonly jwtService: JwtService,
    private _userRoleRepo: UserRoleRepository,
    private _roleRepo: RoleRepository,
  ) {}

  async getList(query: GetListDashboardDto) {
    const { filter, limit, skip } = new BaseFilter(query);

    const { roleId } = filter;

    const where: Record<string, any> = {};

    // if (roleId) {
    //   where.userRoles = {
    //     role: {
    //       id: roleId,
    //     },
    //   };
    // }

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
    console.log(
      '🚀 ~ UserDashboardService ~ usersResponse ~ usersResponse:',
      usersResponse,
    );

    return [usersResponse, total];
  }

  async getDetail(id: string) {
    const result = await this._userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async updateAvatar(userId: string, body: { avatar: string }) {
    const user = await this._userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this._cloudinaryQueue.add(
      'moveAvatar',
      { userId, pathTemp: body.avatar },
      {
        delay: 1000 * 5,
      },
    );

    user.avatar = body.avatar;
    return this._userRepo.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this._userRepo.findOneBy({ id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Update basic user fields
    Object.assign(user, updateUserDto);

    // Handle roles update if provided
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      await this._userRoleRepo.executeTransaction(async (qr) => {
        // Remove existing roles for the user
        await this._userRoleRepo.getRepository(qr).delete({ user: { id } });

        // Find new roles by name
        const newRoles = await this._roleRepo.find({
          where: updateUserDto.roles!.map((roleName) => ({ name: roleName })),
        });

        if (newRoles.length !== updateUserDto.roles!.length) {
          throw new HttpException(
            'One or more roles not found',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Add new roles to the user
        const userRoles = newRoles.map((role) =>
          this._userRoleRepo.create({ user, role }),
        );
        await this._userRoleRepo.getRepository(qr).save(userRoles);
      });
    }

    return this._userRepo.save(user);
  }

  async create(createUserDto: CreateUserDashboardDto): Promise<User> {
    const existingUser = await this._userRepo.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const user = this._userRepo.create(createUserDto);

    // Handle roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roles = await this._roleRepo.find({
        where: { id: In(createUserDto.roleIds) },
      });

      if (roles.length !== createUserDto.roleIds.length) {
        throw new HttpException(
          { message: 'One or more roles not found' },
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = 'abcd1234';

      user.userRoles = roles.map((role) =>
        this._userRoleRepo.create({ user, role }),
      );
    }
    let newUser: User;
    await this._userRepo.executeTransaction(async (qr) => {
      const promises: Promise<any>[] = [];
      for (const userRole of user.userRoles) {
        newUser = await this._userRepo.save(user);=-70=-
        promises.push(
          this._userRoleRepo.getRepository(qr).save({
            role: userRole.role,
            user: user,
          }),
        );
      }

      await Promise.all(promises);
    });

    return newUser!;
  }
}
