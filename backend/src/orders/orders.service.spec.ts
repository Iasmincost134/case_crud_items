import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Product } from '../products/entities/product.entity';
import { ProductsRepository } from '../products/products.repository';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import { OrderNotPendingError } from './errors/order-not-pending.error';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

const produto = (id: number, preco: number, estoque: number): Product => ({
  id,
  nome: `P${id}`,
  categoria: 'c',
  descricao: 'd',
  preco,
  quantidadeEstoque: estoque,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
});

const pedido = (status: OrderStatus, quantidade = 2): Order => ({
  id: 1,
  status,
  total: 0,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  itens: [
    {
      id: 1,
      productId: 10,
      nomeProduto: 'P10',
      quantidade,
      precoUnitario: 5,
      subtotal: 5 * quantidade,
    },
  ],
});

describe('OrdersService', () => {
  let orders: jest.Mocked<OrdersRepository>;
  let products: jest.Mocked<ProductsRepository>;
  let service: OrdersService;

  beforeEach(() => {
    orders = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
    };
    products = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    orders.create.mockImplementation((data) =>
      Promise.resolve({ ...pedido(OrderStatus.PENDENTE), total: data.total }),
    );
    service = new OrdersService(orders, products);
  });

  describe('create', () => {
    it('calcula o total no servidor sem erro de ponto flutuante', async () => {
      // 3 x 0.10 + 3 x 0.20 = 0.90 (em float puro daria 0.9000000000000001)
      products.findByIds.mockResolvedValue([
        produto(1, 0.1, 99),
        produto(2, 0.2, 99),
      ]);
      await service.create({
        itens: [
          { productId: 1, quantidade: 3 },
          { productId: 2, quantidade: 3 },
        ],
      });
      expect(orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ total: 0.9 }),
      );
    });

    it('usa o preço do banco como preço unitário do item', async () => {
      products.findByIds.mockResolvedValue([produto(1, 50, 5)]);
      await service.create({ itens: [{ productId: 1, quantidade: 2 }] });
      expect(orders.create).toHaveBeenCalledWith({
        total: 100,
        itens: [{ productId: 1, quantidade: 2, precoUnitario: 50 }],
      });
    });

    it('soma as quantidades do mesmo produto repetido', async () => {
      products.findByIds.mockResolvedValue([produto(1, 10, 5)]);
      await service.create({
        itens: [
          { productId: 1, quantidade: 2 },
          { productId: 1, quantidade: 1 },
        ],
      });
      expect(orders.create).toHaveBeenCalledWith({
        total: 30,
        itens: [{ productId: 1, quantidade: 3, precoUnitario: 10 }],
      });
    });

    it('lança 404 se algum produto não existe e não cria o pedido', async () => {
      products.findByIds.mockResolvedValue([produto(1, 10, 5)]);
      await expect(
        service.create({
          itens: [
            { productId: 1, quantidade: 1 },
            { productId: 2, quantidade: 1 },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(orders.create).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('lança 404 se o pedido não existe', async () => {
      orders.findById.mockResolvedValue(null);
      await expect(service.updateStatus(1, 'CONCLUIDO')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('conclui o pedido quando há estoque suficiente', async () => {
      orders.findById.mockResolvedValue(pedido(OrderStatus.PENDENTE, 2));
      products.findByIds.mockResolvedValue([produto(10, 5, 2)]); // exatamente o necessário
      orders.complete.mockResolvedValue(pedido(OrderStatus.CONCLUIDO));
      const result = await service.updateStatus(1, 'CONCLUIDO');
      expect(result.status).toBe(OrderStatus.CONCLUIDO);
      expect(orders.complete).toHaveBeenCalledWith(1);
    });

    it('recusa concluir com estoque insuficiente (409) e não baixa estoque', async () => {
      orders.findById.mockResolvedValue(pedido(OrderStatus.PENDENTE, 3));
      products.findByIds.mockResolvedValue([produto(10, 5, 2)]);
      await expect(service.updateStatus(1, 'CONCLUIDO')).rejects.toThrow(
        ConflictException,
      );
      expect(orders.complete).not.toHaveBeenCalled();
    });

    it('traduz falta de estoque detectada na baixa atômica (concorrência) para 409', async () => {
      orders.findById.mockResolvedValue(pedido(OrderStatus.PENDENTE, 1));
      products.findByIds.mockResolvedValue([produto(10, 5, 1)]);
      orders.complete.mockRejectedValue(new InsufficientStockError(10));
      await expect(service.updateStatus(1, 'CONCLUIDO')).rejects.toThrow(
        ConflictException,
      );
    });

    it('traduz pedido que deixou de ser pendente durante a operação para 409', async () => {
      orders.findById.mockResolvedValue(pedido(OrderStatus.PENDENTE));
      orders.cancel.mockRejectedValue(new OrderNotPendingError(1));
      await expect(service.updateStatus(1, 'CANCELADO')).rejects.toThrow(
        ConflictException,
      );
    });

    it('cancela um pedido pendente sem consultar nem alterar estoque', async () => {
      orders.findById.mockResolvedValue(pedido(OrderStatus.PENDENTE));
      orders.cancel.mockResolvedValue(pedido(OrderStatus.CANCELADO));
      await service.updateStatus(1, 'CANCELADO');
      expect(orders.cancel).toHaveBeenCalledWith(1);
      expect(products.findByIds).not.toHaveBeenCalled();
    });

    it.each([OrderStatus.CONCLUIDO, OrderStatus.CANCELADO])(
      'não permite alterar um pedido %s (estado final)',
      async (statusAtual) => {
        orders.findById.mockResolvedValue(pedido(statusAtual));
        await expect(service.updateStatus(1, 'CANCELADO')).rejects.toThrow(
          ConflictException,
        );
        expect(orders.cancel).not.toHaveBeenCalled();
        expect(orders.complete).not.toHaveBeenCalled();
      },
    );
  });
});
