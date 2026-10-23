import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * Registra cada requisição HTTP: método, URL, status e tempo de resposta.
 * Corpo e headers NÃO são logados de propósito (podem conter dados sensíveis).
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const inicio = process.hrtime.bigint();

    res.on('finish', () => {
      const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
      const mensagem = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duracaoMs.toFixed(1)}ms`;

      if (res.statusCode >= 500) {
        this.logger.error(mensagem);
      } else if (res.statusCode >= 400) {
        this.logger.warn(mensagem);
      } else {
        this.logger.log(mensagem);
      }
    });

    next();
  }
}
