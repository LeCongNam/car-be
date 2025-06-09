import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { ROLE_CONSTANTS, THROTTLER_CONSTANTS } from 'src/constants';
import { RedisClientService } from 'src/core/redis/redis.service';
import { AuthService } from 'src/domain/auth/auth.service';
import { Role, User, UserDevice } from 'src/entities';
import { generateSecureOTP } from 'src/helper';
import { DeviceRepository } from 'src/repositories/device.repository';
import { RoleRepository } from 'src/repositories/role.repository';
import { TokenRepository } from 'src/repositories/token.repository';
import { UserDeviceRepository } from 'src/repositories/user-device.repository';
import { UserRoleRepository } from 'src/repositories/user-role.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { v7 } from 'uuid';
import { CreateUserDto, SignInDto } from '../dto/create-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SendOtpDto } from '../dto/send-otp.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class UserService {
  constructor(
    private _userRepo: UserRepository,
    private _authSvc: AuthService,
    private _redisService: RedisClientService,
    private _userDeviceRepo: UserDeviceRepository,
    private _deviceRepo: DeviceRepository,
    private _tokenRepo: TokenRepository,
    private readonly jwtService: JwtService,
    private _userRoleRepo: UserRoleRepository,
    private _roleRepo: RoleRepository,
  ) {}

  async singUp(createUserDto: CreateUserDto) {
    const oldUser = await this._userRepo.existsBy({
      email: createUserDto.email,
      isActive: true,
    });

    const role = await this._roleRepo.findOneBy({
      name: ROLE_CONSTANTS.TYPE.CUSTOMER,
      isActive: true,
    });

    if (oldUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    let user: User;

    await this._userRepo.executeTransaction(async (qr) => {
      const newUser = this._userRepo.create(new User(createUserDto));

      user = await this._userRepo.getRepository(qr).save(newUser);

      await this._userRoleRepo.getRepository(qr).save({
        role: role!,
        user: user,
      });
    });

    return {
      user: plainToInstance(User, user!),
      role: plainToInstance(Role, role),
    };
  }

  async signIn(dto: SignInDto, headers: Header) {
    const user = await this._userRepo.findOneBy({
      email: dto.email,
      isActive: true,
    });

    if (!user) {
      throw new HttpException(
        'Email invalid or password incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Email invalid or password incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Sinh token trước để dùng trong transaction
    const token = this._authSvc.generateToken(new User(user).serialize(), {
      isRefresh: true,
    });

    let isNewDevice = false;
    let userDevice: UserDevice;
    await this._userDeviceRepo.executeTransaction(async (qr) => {
      // 1) Phát hiện thiết bị cũ hay mới
      const oldDevice = await this._deviceRepo.findOne({
        where: { deviceId: headers.deviceId! },
        relations: ['userDevice'],
        transaction: true,
        order: {
          userDevice: {
            lastSeen: 'DESC', // Lấy thiết bị mới nhất
          },
        },
      });
      if (oldDevice) {
        // Thiết bị cũ: cập nhật lastSeen
        userDevice = oldDevice.userDevice;

        await this._userDeviceRepo
          .getRepository(qr)
          .update(
            { device: oldDevice, user },
            { device: oldDevice, user, lastSeen: new Date() },
          );
      } else {
        // Thiết bị mới: tạo device + userDevice
        isNewDevice = true;
        const newDevice = await this._deviceRepo.getRepository(qr).save({
          os: headers?.os || 'unknown',
          userAgent: headers?.userAgent || 'unknown',
          ipAddress: headers?.ipAddress || '127.0.0.1',
          country: headers.country || 'vn',
          deviceId: headers.deviceId || v7(),
        });

        userDevice = (await this._userDeviceRepo.getRepository(qr).save({
          device: newDevice,
          user,
          lastSeen: new Date(),
        })) as UserDevice;
      }

      // 2) Lưu token
      const iat = new Date(
        this.jwtService.decode(token.refreshToken!).iat * 1000,
      );

      await this._tokenRepo.getRepository(qr).save({
        userDevice,
        token: token.accessToken,
        iat,
        expiresAt: new Date(Date.now() + THROTTLER_CONSTANTS.TIME.HOUR * 24),
      });
    });

    return {
      user: plainToInstance(User, user),
      token,
      isNewDevice,
      device: userDevice!,
    };
  }

  async getProfile(user: User) {
    const userInfo = await this._userRepo.findOneBy({
      id: user.id,
    });

    if (!userInfo) {
      return user;
    }

    return plainToInstance(User, userInfo);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async sendOtp(payload: SendOtpDto) {
    const user = await this._userRepo.findOneBy({
      email: payload.email,
      isActive: true,
    });

    if (!user) {
      return;
    }

    const otp = generateSecureOTP(4);
    await this._redisService.setEx(
      `otp:${payload.email}:${otp}`,
      {
        email: payload.email,
        otp,
      },
      THROTTLER_CONSTANTS.TIME.MINUTE * 5,
    );
  }

  async verifyOtp(body: VerifyOtpDto) {
    const data = await this._redisService.get<{ email: string; otp: string }>(
      `otp:${body.email}:${body.otp}`,
    );

    if (!data) {
      throw new HttpException('OTP expired', HttpStatus.BAD_REQUEST);
    }

    if (data?.otp !== body.otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    const user = await this._userRepo.findOneBy({
      email: data.email,
      isActive: true,
    });

    if (!user) {
      throw new HttpException('Cannot verify OTP', HttpStatus.BAD_REQUEST);
    }

    await this._redisService.del(`otp:${user.email}:${body.otp}`);

    const token = this._authSvc.generateTokenForgotPassword({
      email: user.email,
    });

    return {
      user,
      token,
    };
  }

  async resetPassword(user: User, body: ResetPasswordDto) {
    const oldUser = await this._userRepo.findOneBy({
      id: user.id,
      email: user.email,
      isActive: true,
    });

    if (!oldUser) {
      throw new BadRequestException('Reset password failed');
    }

    const newData = this._userRepo.create({
      password: body.password,
      updatedBy: user.id,
    });

    await this._userRepo.update(oldUser.id, newData);
  }
}
