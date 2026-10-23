import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductInUseError } from './errors/product-in-use.error';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

const produto: Product = {
  id: 1,
  nome: 'Teclado',
  categoria: 'Periféricos',
  descricao: 'ABNT2',
  preco: 199.9,
  quantidadeEstoque: 10,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
};

describe('ProductsService', () => {
  let repo: jest.Mocked<ProductsRepository>;
  let service: ProductsService;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new ProductsService(repo);
  });

  it('cadastra um produto pelo repository', async () => {
    repo.create.mockResolvedValue(produto);
    const dto = {
      nome: 'Teclado',
      categoria: 'Periféricos',
      descricao: 'ABNT2',
      preco: 199.9,
      quantidadeEstoque: 10,
    };
    await expect(service.create(dto)).resolves.toBe(produto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('findOne retorna o produto existente', async () => {
    repo.findById.mockResolvedValue(produto);
    await expect(service.findOne(1)).resolves.toBe(produto);
  });

  it('findOne lança 404 quando o produto não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('update lança 404 quando o produto não existe', async () => {
    repo.update.mockResolvedValue(null);
    await expect(service.update(99, { preco: 1 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove lança 404 quando o produto não existe', async () => {
    repo.delete.mockResolvedValue(false);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });

  it('remove lança 409 quando o produto já foi usado em pedidos', async () => {
    repo.delete.mockRejectedValue(new ProductInUseError(1));
    await expect(service.remove(1)).rejects.toThrow(ConflictException);
  });

  it('remove conclui sem erro quando o produto existe', async () => {
    repo.delete.mockResolvedValue(true);
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
});
