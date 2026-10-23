import { Injectable } from '@nestjs/common';
import { calcularSubtotal } from '../common/money';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import { OrderNotPendingError } from './errors/order-not-pending.error';
import { NewOrderData, OrdersRepository } from './orders.repository';

const ORDER_INCLUDE = {
  itens: {
    orderBy: { id: 'asc' },
    include: { product: { select: { nome: true } } },
  },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

// O Prisma devolve DECIMAL como objeto Decimal; a API trabalha com number.
function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    status: row.status,
    total: row.total.toNumber(),
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
    itens: row.itens.map((item) => {
      const precoUnitario = item.precoUnitario.toNumber();
      return {
        id: item.id,
        productId: item.productId,
        nomeProduto: item.product.nome,
        quantidade: item.quantidade,
        precoUnitario,
        subtotal: calcularSubtotal(precoUnitario, item.quantidade),
      };
    }),
  };
}

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ total, itens }: NewOrderData): Promise<Order> {
    // Criar o pedido e seus itens num único create aninhado já é transacional.
    const row = await this.prisma.order.create({
      data: { total, itens: { create: itens } },
      include: ORDER_INCLUDE,
    });
    return toOrder(row);
  }

  async findAll(): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      orderBy: { id: 'desc' },
      include: ORDER_INCLUDE,
    });
    return rows.map(toOrder);
  }

  async findById(id: number): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    return row ? toOrder(row) : null;
  }

  async complete(id: number): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // 1) Só avança se AINDA estiver pendente. Se dois pedidos de conclusão
      //    chegarem juntos, apenas um enxerga count === 1.
      const claimed = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDENTE },
        data: { status: OrderStatus.CONCLUIDO },
      });
      if (claimed.count === 0) throw new OrderNotPendingError(id);

      // 2) Baixa o estoque. A condição `quantidadeEstoque >= quantidade` vai no
      //    próprio UPDATE, então checar e decrementar é uma operação só: dois
      //    pedidos concorrentes nunca vendem o mesmo saldo duas vezes.
      //    Ordenar por productId mantém uma ordem de travas igual para todos
      //    (evita deadlock entre pedidos que compartilham produtos).
      const itens = await tx.orderItem.findMany({
        where: { orderId: id },
        orderBy: { productId: 'asc' },
      });
      for (const item of itens) {
        const baixa = await tx.product.updateMany({
          where: {
            id: item.productId,
            quantidadeEstoque: { gte: item.quantidade },
          },
          data: { quantidadeEstoque: { decrement: item.quantidade } },
        });
        // Lançar aqui desfaz a transação inteira (inclusive o passo 1).
        if (baixa.count === 0) throw new InsufficientStockError(item.productId);
      }

      const row = await tx.order.findUniqueOrThrow({
        where: { id },
        include: ORDER_INCLUDE,
      });
      return toOrder(row);
    });
  }

  async cancel(id: number): Promise<Order> {
    const claimed = await this.prisma.order.updateMany({
      where: { id, status: OrderStatus.PENDENTE },
      data: { status: OrderStatus.CANCELADO },
    });
    if (claimed.count === 0) throw new OrderNotPendingError(id);

    const row = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: ORDER_INCLUDE,
    });
    return toOrder(row);
  }
}
