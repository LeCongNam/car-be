import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { MerchantJwtStrategy } from './strategies/merchant-jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],

  providers: [
    AuthService,
    AdminJwtStrategy,
    MerchantJwtStrategy,
    CustomerJwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
