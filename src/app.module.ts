import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as httpContext from 'express-http-context';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { RedisModule } from './core/redis';
import { RedisClientService } from './core/redis/redis.service';
import { PermissionModule } from './domain/permission/permission.module';
import { RoleModule } from './domain/role/role.module';
import { UserRoleModule } from './domain/user-role/user-role.module';
import { UserModule } from './domain/user/user.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { RequestContextMiddleware } from './middlewares/request.middleware';
import { ThrottlerBehindGuard } from './middlewares/throttler-behind.middleware';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          // url: process.env.REDIS_URL,
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT!,
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        return {
          throttlers: [
            {
              name: 'short',
              ttl: 10000,
              limit: 10,
            },
            {
              name: 'medium',
              ttl: 10000,
              limit: 20,
            },
            {
              name: 'long',
              ttl: 60000,
              limit: 100,
            },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis({
              host: process.env.REDIS_HOST,
              port: +process.env.REDIS_PORT!,
              password: process.env.REDIS_PASSWORD,
            }),
          ),
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configSrv: ConfigService) => ({
        type: 'mysql',
        host: configSrv.get('MYSQL_HOST'),
        port: +configSrv.get('MYSQL_PORT'),
        username: configSrv.get('MYSQL_USERNAME'),
        password: configSrv.get('MYSQL_PASSWORD'),
        database: configSrv.get('MYSQL_DATABASE'),
        synchronize: true,
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: ['query', 'error'],
      }),
      inject: [ConfigService],
    }),
    RepositoryModule,
    UserModule,
    RoleModule,
    UserRoleModule,
    PermissionModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisClientService,
    { provide: APP_GUARD, useClass: ThrottlerBehindGuard },
  ],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(httpContext.middleware, RequestContextMiddleware)
      .forRoutes('*')
      .apply(LoggerMiddleware)
      .exclude({
        path: '/api/health',
        method: RequestMethod.GET,
      })
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
