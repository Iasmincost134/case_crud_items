import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const MAX_INT32 = 2_147_483_647;

/**
 * Converte o parâmetro de rota em um ID inteiro positivo.
 * Rejeita "abc", "1.5", "0", "-3" e valores acima do limite do INTEGER do
 * Postgres (que, sem esta checagem, estourariam como erro 500 no banco).
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^\d+$/.test(value)) {
      throw new BadRequestException('O id deve ser um número inteiro positivo');
    }
    const id = Number(value);
    if (id < 1 || id > MAX_INT32) {
      throw new BadRequestException('O id deve ser um número inteiro positivo');
    }
    return id;
  }
}
