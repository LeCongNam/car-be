import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONSTANTS } from '../../../constants';
import { User } from '../../../entities';
import { UserRepository } from '../../../repositories/user.repository';
import { AuthService, TokenPayload } from '../auth.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  JWT_CONSTANTS.TYPE.CUSTOMER_JWT,
) {
  constructor(
    private authService: AuthService,
    private _configSrv: ConfigService,
    private _userRepo: UserRepository,
  ) {
    const jwtSecret = _configSrv.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: TokenPayload): Promise<User> {
    const user = await this._userRepo.findOne({
      where: { email: payload.email },
      relations: {
        userRoles: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
