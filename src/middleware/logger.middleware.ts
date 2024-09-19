import {
  ConsoleLogger,
  Injectable,
  Logger,
  NestMiddleware,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: Logger = new Logger(ConsoleLogger.name);

  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      this.logger.log(`[ START ] ${start}`);
      this.logger.log(`[ END ] ${start}`);
      this.logger.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    next();
  }
}
