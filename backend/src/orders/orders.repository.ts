import { Order } from './entities/order.entity';

export interface NewOrderItemData {
  productId: number;
  quantidade: number;
  precoUnitario: number;
}

export interface NewOrderData {
  total: number;
  itens: NewOrderItemData[];
}

/** Contrato de persistência de pedidos (o service depende só desta abstração). */
export abstract class OrdersRepository {
  abstract create(data: NewOrderData): Promise<Order>;
  abstract findAll(): Promise<Order[]>;
  abstract findById(id: number): Promise<Order | null>;

  /**
   * PENDENTE -> CONCLUIDO, baixando o estoque de todos os itens em UMA
   * transação atômica (ou conclui tudo, ou não muda nada).
   * @throws OrderNotPendingError se o pedido já não estiver PENDENTE
   * @throws InsufficientStockError se algum produto não tiver saldo
   */
  abstract complete(id: number): Promise<Order>;

  /**
   * PENDENTE -> CANCELADO.
   * @throws OrderNotPendingError se o pedido já não estiver PENDENTE
   */
  abstract cancel(id: number): Promise<Order>;
}
