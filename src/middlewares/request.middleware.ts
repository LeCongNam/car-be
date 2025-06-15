import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as httpContext from 'express-http-context';
import { v4 as uuidv4 } from 'uuid';
import { COMMON_CONSTANTS } from '../constants';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private logger = new Logger(RequestContextMiddleware.name);

  public use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      (req.headers[COMMON_CONSTANTS.HEADER.REQUEST_ID] as string) || uuidv4();

    httpContext.set(COMMON_CONSTANTS.HEADER.REQUEST_ID, requestId);
    next();
  }
}
