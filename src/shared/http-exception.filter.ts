import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private _logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const {
      code,
      message,
      data = null,
    }: ResponseException = exception.getResponse() as ResponseException;
    this._logger.error('Unhandled exception', exception.getResponse());

    response.status(status).json({
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      code: code || 'unknown',
      message,
      data,
    });
  }
}

export type ResponseException = {
  status?: HttpStatus;
  error?: string;
  code?: string;
  url?: string;
  message?: string;
  module?: string;
  data?: object | null;
};
