import { Injectable } from '@nestjs/common';
import { ChainableCommander, Redis } from 'ioredis';
import { LoggerService } from '../../shared/logger.service';
import { CACHING_PREFIX } from './redis.constants';
import { InjectRedis } from './redis.decorators';
import { HincrbyPayload, ICachingService } from './redis.interfaces';
import { convertUnitTime, UnitTime } from './redis.utils';

@Injectable()
export class RedisClientService implements ICachingService {
  private _logger = new LoggerService(RedisClientService.name);
  constructor(@InjectRedis() private readonly _redis: Redis) {}

  get redis() {
    return this._redis;
  }

  public async hset<T>(
    key: string,
    field: string,
    value: T,
    expireTime?: number,
  ) {
    const cacheKey = this._cacheKey(key);
    await this.multiExec((multi) => {
      multi.hset(cacheKey, field, JSON.stringify(value));
      if (expireTime) {
        const expireInSeconds = convertUnitTime(
          expireTime,
          UnitTime.Seconds,
          UnitTime.Milliseconds,
        );
        multi.expire(cacheKey, expireInSeconds);
      }
    });
  }

  public async hget<T>(key: string, field: string) {
    const data = (await this.redis.hget(this._cacheKey(key), field)) as any;
    try {
      const parsed = JSON.parse(data) as T;
      return parsed;
    } catch (error) {
      this._logger.error('hget error: ', error.message);
      return data as T;
    }
  }

  public async hdel(key: string, field: string): Promise<void> {
    await this.redis.hdel(this._cacheKey(key), field);
  }

  public async setEx<T>(key: string, value: T, expireTime: number) {
    const expireInSeconds = convertUnitTime(
      expireTime,
      UnitTime.Seconds,
      UnitTime.Milliseconds,
    );
    await this.redis.setex(
      this._cacheKey(key),
      expireInSeconds,
      JSON.stringify(value),
    );
  }

  public async setNx<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const result = await this.redis.setnx(
        this._cacheKey(key),
        JSON.stringify(value),
      );
      if (result === 1 && ttl) {
        await this.setExpire(key, ttl);
      }
    } catch (error) {
      this._logger.error('ERROR WHEN SETNX', error.message);
      throw error;
    }
  }

  public async setExpire(key: string, ttl: number) {
    const ttlInSeconds = convertUnitTime(
      ttl,
      UnitTime.Seconds,
      UnitTime.Milliseconds,
    );
    if (ttlInSeconds !== undefined) {
      await this.redis.expire(this._cacheKey(key), ttlInSeconds);
    }
  }

  public async get<T>(key: string) {
    const data = (await this.redis.get(this._cacheKey(key))) || null;
    if (!data) {
      return null as T;
    }
    try {
      const parsed = JSON.parse(data) as T;
      return parsed;
    } catch (error) {
      this._logger.error('get redis error: ', error);
      return data as T;
    }
  }

  public async set<T>(key: string, value: T, ttl?: number) {
    const params = [];
    if (ttl && ttl > 0) {
      const ttlInMilliseconds = convertUnitTime(
        ttl,
        UnitTime.Milliseconds,
        UnitTime.Seconds,
      ) as any;
      // @ts-expect-error - Redis set() method expects string parameters for options like 'PX'
      params.push(...['PX', ttlInMilliseconds]);
    }
    return this.redis.set(
      this._cacheKey(key),
      JSON.stringify(value),
      ...params,
    );
  }

  public async keys(pattern = this._cacheKey('*')) {
    return this.redis.keys(pattern);
  }

  public async hgetall(key: string) {
    return this.redis.hgetall(this._cacheKey(key));
  }

  public async del(keys: string | string[]) {
    if (Array.isArray(keys)) {
      const cacheKeys = keys.map((key) => this._cacheKey(key));
      return this.redis.del(...cacheKeys);
    }
    return this.redis.del(this._cacheKey(keys));
  }

  public async hincrby({ key, field, increment = 0 }: HincrbyPayload) {
    return this.redis.hincrby(this._cacheKey(key), field, increment);
  }

  public async multiHincrby(
    payload: HincrbyPayload[],
  ): Promise<[Error, unknown][]> {
    const multi = this.redis.multi();
    payload.forEach(({ key, field, increment = 0 }) => {
      multi.hincrby(this._cacheKey(key), field, increment);
    });
    const result = await multi.exec();

    if (!result) {
      return []; // Return empty array if result is null
    }

    // Transform the result to ensure errors are never null
    return result.map(([error, value]) => [
      error || new Error('Unknown error'),
      value,
    ]);
  }

  public async multiExec(
    fn: (multi: ChainableCommander) => void | ChainableCommander,
  ): Promise<[error: Error, result: unknown][]> {
    const initMulti = this.redis.multi();
    fn(initMulti);
    const result = await initMulti.exec();

    if (!result) {
      return []; // Return empty array if result is null
    }

    // Transform the result to ensure errors are never null
    return result.map(([error, value]) => [
      error || new Error('Unknown error'),
      value,
    ]);
  }

  private _cacheKey(key: string) {
    return CACHING_PREFIX + key;
  }

  public async getTTL(key: string): Promise<number> {
    const cacheKey = this._cacheKey(key);
    const keys = await this.redis.keys(cacheKey);
    return this._redis.ttl(keys.pop()!);
  }
}
