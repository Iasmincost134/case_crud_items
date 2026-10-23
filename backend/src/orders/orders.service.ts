import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { calcularTotal } from '../common/money';
import { ProductsRepository } from '../products/products.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { StatusDestino } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import { OrderNotPendingError } from './errors/order-not-pending.error';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  /**
   * Cria um pedido PENDENTE. O preço de cada item e o total vêm SEMPRE do
   * banco: o cliente informa só produto e quantidade, nunca valores.
   * O estoque NÃO é reservado aqui; ele só é conferido e baixado na conclusão.
   */
  async create(dto: CreateOrderDto): Promise<Order> {
    // O mesmo produto repetido na lista vira um único item com a soma das quantidades.
    const quantidadePorProduto = new Map<number, number>();
    for (const { productId, quantidade } of dto.itens) {
      quantidadePorProduto.set(
        productId,
        (quantidadePorProduto.get(productId) ?? 0) + quantidade,
      );
    }

    const ids = [...quantidadePorProduto.keys()];
    const produtos = await this.productsRepository.findByIds(ids);
    const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

    const inexistentes = ids.filter((id) => !produtoPorId.has(id));
    if (inexistentes.length > 0) {
      throw new NotFoundException(
        `Produto(s) não encontrado(s): ${inexistentes.join(', ')}`,
      );
    }

    const itens = ids.map((productId) => ({
      productId,
      quantidade: quantidadePorProduto.get(productId)!,
      precoUnitario: produtoPorId.get(productId)!.preco,
    }));

    return this.ordersRepository.create({ total: calcularTotal(itens), itens });
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Pedido com id ${id} não encontrado`);
    }
    return order;
  }

  /**
   * Regras de status: só um pedido PENDENTE pode mudar, e apenas para
   * CONCLUIDO (se houver estoque para todos os itens) ou CANCELADO.
   * CONCLUIDO e CANCELADO são estados finais.
   */
  async updateStatus(id: number, status: StatusDestino): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDENTE) {
      throw new ConflictException(
        `O pedido ${id} está ${order.status} e não pode mais ser alterado`,
      );
    }

    try {
      if (status === OrderStatus.CANCELADO) {
        return await this.ordersRepository.cancel(id);
      }

      await this.assertEstoqueSuficiente(order);
      return await this.ordersRepository.complete(id);
    } catch (error) {
      throw this.traduzirErro(error, id);
    }
  }

  /**
   * Confere o estoque ANTES de concluir e informa todos os itens com falta de
   * uma vez. Isto é só a checagem amigável: a garantia contra concorrência
   * (dois pedidos disputando o último item) é a baixa atômica do repository.
   */
  private async assertEstoqueSuficiente(order: Order): Promise<void> {
    const produtos = await this.productsRepository.findByIds(
      order.itens.map((item) => item.productId),
    );
    const estoquePorId = new Map(
      produtos.map((p) => [p.id, p.quantidadeEstoque]),
    );

    const faltas = order.itens.filter(
      (item) => (estoquePorId.get(item.productId) ?? 0) < item.quantidade,
    );

    if (faltas.length > 0) {
      const detalhes = faltas
        .map(
          (item) =>
            `"${item.nomeProduto}" (disponível: ${estoquePorId.get(item.productId) ?? 0}, pedido: ${item.quantidade})`,
        )
        .join('; ');
      throw new ConflictException(
        `Estoque insuficiente para concluir o pedido ${order.id}: ${detalhes}`,
      );
    }
  }

  // Traduz erros de domínio do repository para respostas HTTP.
  private traduzirErro(error: unknown, orderId: number): unknown {
    if (error instanceof InsufficientStockError) {
      return new ConflictException(
        `Estoque insuficiente para concluir o pedido ${orderId} (produto ${error.productId})`,
      );
    }
    if (error instanceof OrderNotPendingError) {
      return new ConflictException(
        `O pedido ${orderId} não está mais pendente e não pode ser alterado`,
      );
    }
    return error;
  }
}
