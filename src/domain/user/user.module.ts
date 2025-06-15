import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisClientService } from '../../core/redis/redis.service';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UserDashboardController } from './controllers/user.dashboard.controller';
import { CloudinaryQueue } from './queue/cloudinary.queue';
import { UserDashboardService } from './services/user.dashboard.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    BullModule.registerQueue({ name: 'cloudinary' }),
  ],
  controllers: [UserController, UserDashboardController],
  providers: [
    UserService,
    RedisClientService,
    UserDashboardService,
    CloudinaryQueue,
  ],
})
export class UserModule {}
