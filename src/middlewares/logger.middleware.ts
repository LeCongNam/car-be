import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from 'src/shared/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private _logger = new LoggerService(LoggerMiddleware.name);
  public use(request: Request, response: Response, next: NextFunction) {
    const ipAddress = (request.headers['x-forwarded-for'] ||
      request.ip) as unknown as string;

    this._logger.log(
      `${ipAddress} - [${request.method}] - ${request.url} - REQUEST HEADER -`,
      request.headers,
    );
    this._logger.log(
      `${ipAddress} - [${request.method}] - ${request.url} - REQUEST BODY -`,
      request?.body,
    );
    next();
  }
}
