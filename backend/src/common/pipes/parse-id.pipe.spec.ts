import { BadRequestException } from '@nestjs/common';
import { ParseIdPipe } from './parse-id.pipe';

describe('ParseIdPipe', () => {
  const pipe = new ParseIdPipe();

  it('converte inteiros positivos', () => {
    expect(pipe.transform('42')).toBe(42);
  });

  it.each(['abc', '1.5', '-3', '0', '', '99999999999', '1e3'])(
    'rejeita "%s"',
    (valor) => {
      expect(() => pipe.transform(valor)).toThrow(BadRequestException);
    },
  );
});
