import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { FastifyReply } from "fastify";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private logger: Logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    try {
      const context = host.switchToHttp();
      const response = context.getResponse<FastifyReply>();
      const request = context.getRequest();

      let status: HttpStatus;
      let message = exception.message || "Internal server error";
      const code = exception.code;

      switch (true) {
        case exception instanceof ConflictException:
          status = HttpStatus.CONFLICT;
          break;
        case exception instanceof NotFoundException:
          status = HttpStatus.NOT_FOUND;
          message = (exception.getResponse() as any).message || message;
          break;
        case exception instanceof UnauthorizedException:
          status = HttpStatus.UNAUTHORIZED;
          break;
        case exception instanceof BadRequestException:
          status = HttpStatus.BAD_REQUEST;
          message = (exception.getResponse() as any).message || message;
          break;
        case exception instanceof HttpException:
          status = exception.getStatus();
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      this.logger.error(
        `[${request.method}] ${request.url} >> Status: ${status}, Message: ${message}`,
      );

      if (response.status instanceof Function) {
        response.status(status).send({ message, code });
      }
    } catch (error) {
      this.logger.error(`[ERROR All] ${error}`);
    } finally {
      super.catch(exception, host);
    }
  }
}
