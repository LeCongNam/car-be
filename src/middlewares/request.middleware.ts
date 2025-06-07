import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as httpContext from 'express-http-context';
import { COMMON_CONSTANTS } from 'src/constants';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      req.headers[COMMON_CONSTANTS.HEADER.REQUEST_ID] || uuidv4();
    httpContext.set(COMMON_CONSTANTS.HEADER.REQUEST_ID, requestId);
    next();
  }
}
