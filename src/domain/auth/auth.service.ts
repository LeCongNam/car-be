import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private _configSvc: ConfigService,
  ) {}

  generateToken(
    payload: TokenPayload,
    { isRefresh = false }: GenerateTokenOptions,
  ) {
    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this._configSvc.get<string>('JWT_SECRET'),
        expiresIn: this._configSvc.get<string>('JWT_EXPIRES_IN') || '1h',
        algorithm: 'HS256',
      },
    );

    let refreshToken = '';

    if (isRefresh) {
      refreshToken = this.jwtService.sign(
        { ...payload },
        {
          secret: this._configSvc.get<string>('JWT_REFRESH_SECRET'),
          expiresIn:
            this._configSvc.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d',
          algorithm: 'HS256',
        },
      );
    }

    return {
      accessToken,
      refreshToken: isRefresh ? refreshToken : null,
    };
  }

  generateTokenForgotPassword(payload: { email: string }) {
    try {
      const accessToken = this.jwtService.sign(
        { ...payload },
        {
          secret: this._configSvc.get<string>('JWT_SECRET'),
          expiresIn: this._configSvc.get<string>('JWT_EXPIRES_IN') || '1h',
          algorithm: 'HS256',
        },
      );

      return {
        accessToken,
      };
    } catch (error) {
      throw new Error('Error generating token', error);
    }
  }
}

export type TokenPayload = {
  email: string;
  name: string;
  id: string;
  iat: number;
  exp: number;
};

type GenerateTokenOptions = {
  isRefresh?: boolean;
};
