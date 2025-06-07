import {
  Controller,
  HttpStatus,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { COMMON_CONSTANTS } from 'src/constants';
import { User } from 'src/entities';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggerService } from './logger.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(new HttpExceptionFilter())
@SkipThrottle()
export class BaseController {
  private _logger = new LoggerService(BaseController.name);

  constructor() {}

  getUserInfo(req: Request): User {
    return req?.user as User;
  }

  responseCustom(
    data: any = null,
    {
      message = 'OK',
      statusCode = HttpStatus.OK,
      extraData = null,
      total = 0,
    } = {},
  ) {
    return {
      data,
      total: total || null,
      message,
      statusCode,
      extraData,
    };
  }

  getHeaders(req: Request): Header {
    return {
      os: req.headers[COMMON_CONSTANTS.HEADER.OS] || null,
      deviceId: req.headers[COMMON_CONSTANTS.HEADER.DEVICE_ID] || null,
      userAgent: req.headers[COMMON_CONSTANTS.HEADER.USER_AGENT] || null,
      requestId: req.headers[COMMON_CONSTANTS.HEADER.REQUEST_ID] || null,
    } as Header;
  }
}
