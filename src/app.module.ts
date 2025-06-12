import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as httpContext from 'express-http-context';
import Redis from 'ioredis';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { RedisModule } from './core/redis';
import { RedisClientService } from './core/redis/redis.service';
import { FileModule } from './domain/file/file.module';
import { PermissionModule } from './domain/permission/permission.module';
import { RoleModule } from './domain/role/role.module';
import { UserRoleModule } from './domain/user-role/user-role.module';
import { UserModule } from './domain/user/user.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { RequestContextMiddleware } from './middlewares/request.middleware';
import { ThrottlerBehindGuard } from './middlewares/throttler-behind.middleware';
import { RepositoryModule } from './repositories/repository.module';
import { HttpExceptionFilter } from './shared/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          // url: configService.get('REDIS_URL'),
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT')!,
          password: configService.get('REDIS_PASSWORD'),
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
        // logging: ['query', 'error'],
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT')!,
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
        },
      }),
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
    RepositoryModule,
    UserModule,
    RoleModule,
    UserRoleModule,
    CoreModule,
    FileModule,
    PermissionModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisClientService,
    { provide: APP_GUARD, useClass: ThrottlerBehindGuard },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(httpContext.middleware, RequestContextMiddleware)
      .forRoutes({ path: '/*splat', method: RequestMethod.ALL })
      .apply(LoggerMiddleware)
      .exclude({ path: '/health', method: RequestMethod.GET })
      .forRoutes({ path: '/*splat', method: RequestMethod.ALL });
  }
}
