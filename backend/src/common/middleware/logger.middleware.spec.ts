import { jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import type { Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';

function executar(statusCode: number) {
  const res = Object.assign(new EventEmitter(), {
    statusCode,
  }) as unknown as Response;
  const req = { method: 'GET', originalUrl: '/products?x=1' } as Request;
  const next = jest.fn();
  new LoggerMiddleware().use(req, res, next);
  return { res, next };
}

describe('LoggerMiddleware', () => {
  let log: ReturnType<typeof jest.spyOn>;
  let warn: ReturnType<typeof jest.spyOn>;
  let error: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('chama next() imediatamente e só loga quando a resposta termina', () => {
    const { res, next } = executar(200);
    expect(next).toHaveBeenCalledTimes(1);
    expect(log).not.toHaveBeenCalled();
    res.emit('finish');
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/products\?x=1 200 - [\d.]+ms$/),
    );
  });

  it('usa warn para 4xx e error para 5xx', () => {
    executar(404).res.emit('finish');
    executar(500).res.emit('finish');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(' 404 '));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(' 500 '));
  });
});
