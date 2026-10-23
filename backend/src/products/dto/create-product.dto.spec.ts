import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

const valido = {
  nome: 'Teclado',
  categoria: 'Periféricos',
  descricao: 'ABNT2',
  preco: 199.9,
  quantidadeEstoque: 10,
};

async function erros(payload: object): Promise<string[]> {
  const dto = plainToInstance(CreateProductDto, payload);
  const result = await validate(dto, { stopAtFirstError: true });
  return result.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('CreateProductDto', () => {
  it('aceita um produto válido (inclusive preço 0 e estoque 0)', async () => {
    expect(await erros(valido)).toEqual([]);
    expect(await erros({ ...valido, preco: 0, quantidadeEstoque: 0 })).toEqual(
      [],
    );
  });

  it('rejeita preço negativo', async () => {
    expect(await erros({ ...valido, preco: -0.01 })).toEqual([
      'O preço não pode ser negativo',
    ]);
  });

  it.each([-1, 1.5, '3', null])(
    'rejeita quantidade em estoque inválida: %p',
    async (q) => {
      expect(await erros({ ...valido, quantidadeEstoque: q })).toHaveLength(1);
    },
  );

  it.each([1.005, '10', NaN, Infinity])(
    'rejeita preço inválido: %p',
    async (p) => {
      expect(await erros({ ...valido, preco: p })).toHaveLength(1);
    },
  );

  it.each(['nome', 'categoria', 'descricao'])(
    'rejeita %s vazio ou só com espaços',
    async (campo) => {
      expect(await erros({ ...valido, [campo]: '   ' })).toHaveLength(1);
      expect(await erros({ ...valido, [campo]: undefined })).toHaveLength(1);
    },
  );
});
