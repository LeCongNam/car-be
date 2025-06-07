import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const rawIp = req.ips.length ? req.ips[0] : req.ip;

    if (process.env.NODE_ENV === 'production') {
      return req.headers['x-food-device-id'];
    } else {
      // Chuẩn hóa các dạng localhost về '127.0.0.1'
      const ip = ['::1', '::ffff:127.0.0.1', 'localhost'].includes(rawIp)
        ? '127.0.0.1'
        : rawIp;

      return ip;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new HttpException(
      {
        status: HttpStatus.TOO_MANY_REQUESTS,
        code: 429,
        message: 'Too many requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
