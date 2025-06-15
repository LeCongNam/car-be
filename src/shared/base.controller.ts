import {
  Controller,
  HttpStatus,
  Inject,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { COMMON_CONSTANTS } from '../constants';
import { User } from '../entities';

@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
@SkipThrottle()
export class BaseController {
  @Inject() private readonly i18n: I18nService;

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
      message:
        this.i18n.t(`message.$${message}`, {
          lang: I18nContext.current()!.lang,
        }) || message,
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
