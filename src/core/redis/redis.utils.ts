import { Redis } from 'ioredis';
import {
  REDIS_MODULE_CONNECTION,
  REDIS_MODULE_CONNECTION_TOKEN,
  REDIS_MODULE_OPTIONS_TOKEN,
} from './redis.constants';
import { RedisModuleOptions } from './redis.interfaces';

export function getRedisOptionsToken(connection?: string): string {
  return `${connection || REDIS_MODULE_CONNECTION}_${REDIS_MODULE_OPTIONS_TOKEN}`;
}

export function getRedisConnectionToken(connection?: string): string {
  return `${connection || REDIS_MODULE_CONNECTION}_${REDIS_MODULE_CONNECTION_TOKEN}`;
}

export function createRedisConnection(options: RedisModuleOptions) {
  const { config } = options;
  if (config.url) {
    return new Redis(config.url, config);
  } else {
    return new Redis(config);
  }
}

export const convertUnitTime = (
  time: number,
  sourceUnit: UnitTime,
  targetUnit: UnitTime,
): number => {
  if (sourceUnit === targetUnit) return time;

  if (sourceUnit === UnitTime.Seconds && targetUnit === UnitTime.Milliseconds) {
    return time * 1000;
  }

  if (sourceUnit === UnitTime.Milliseconds && targetUnit === UnitTime.Seconds) {
    return time / 1000;
  }

  throw new Error(`Unsupported conversion from ${sourceUnit} to ${targetUnit}`);
};

export enum UnitTime {
  Seconds = 'seconds',
  Milliseconds = 'miliseconds',
}
