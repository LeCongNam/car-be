import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisClientService } from 'src/core/redis/redis.service';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UserDashboardController } from './controllers/user.dashboard.controller';
import { UserDashboardService } from './services/user.dashboard.service';
import { UserService } from './services/user.service';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [UserController, UserDashboardController],
  providers: [UserService, RedisClientService, UserDashboardService],
})
export class UserModule {}
