import { Order } from '../../src/orders/entities/order.entity';
import { OrderStatus } from '../../src/orders/entities/order-status';
import { InsufficientStockError } from '../../src/orders/errors/insufficient-stock.error';
import { OrderNotPendingError } from '../../src/orders/errors/order-not-pending.error';
import {
  NewOrderData,
  OrdersRepository,
} from '../../src/orders/orders.repository';
import { Product } from '../../src/products/entities/product.entity';
import { ProductInUseError } from '../../src/products/errors/product-in-use.error';
import {
  CreateProductData,
  ProductsRepository,
  UpdateProductData,
} from '../../src/products/products.repository';

/** Repositórios em memória: permitem testar a API inteira sem banco de dados. */
export class InMemoryProductsRepository implements ProductsRepository {
  readonly rows = new Map<number, Product>();
  private seq = 0;
  /** ids de produtos já usados em pedidos (simula a FK RESTRICT) */
  readonly usados = new Set<number>();

  create(data: CreateProductData): Promise<Product> {
    const now = new Date();
    const p: Product = {
      id: ++this.seq,
      ...data,
      criadoEm: now,
      atualizadoEm: now,
    };
    this.rows.set(p.id, p);
    return Promise.resolve({ ...p });
  }
  findAll(): Promise<Product[]> {
    return Promise.resolve([...this.rows.values()].map((p) => ({ ...p })));
  }
  findById(id: number): Promise<Product | null> {
    const p = this.rows.get(id);
    return Promise.resolve(p ? { ...p } : null);
  }
  findByIds(ids: number[]): Promise<Product[]> {
    return Promise.resolve(
      ids.flatMap((id) =>
        this.rows.has(id) ? [{ ...this.rows.get(id)! }] : [],
      ),
    );
  }
  update(id: number, data: UpdateProductData): Promise<Product | null> {
    const p = this.rows.get(id);
    if (!p) return Promise.resolve(null);
    Object.assign(p, data, { atualizadoEm: new Date() });
    return Promise.resolve({ ...p });
  }
  delete(id: number): Promise<boolean> {
    if (!this.rows.has(id)) return Promise.resolve(false);
    if (this.usados.has(id)) return Promise.reject(new ProductInUseError(id));
    this.rows.delete(id);
    return Promise.resolve(true);
  }
}

export class InMemoryOrdersRepository implements OrdersRepository {
  private readonly rows = new Map<number, Order>();
  private seq = 0;
  constructor(private readonly products: InMemoryProductsRepository) {}

  create({ total, itens }: NewOrderData): Promise<Order> {
    const now = new Date();
    const order: Order = {
      id: ++this.seq,
      status: OrderStatus.PENDENTE,
      total,
      criadoEm: now,
      atualizadoEm: now,
      itens: itens.map((i, idx) => ({
        id: idx + 1,
        productId: i.productId,
        nomeProduto: this.products.rows.get(i.productId)!.nome,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        subtotal: i.precoUnitario * i.quantidade,
      })),
    };
    itens.forEach((i) => this.products.usados.add(i.productId));
    this.rows.set(order.id, order);
    return Promise.resolve(structuredClone(order));
  }
  findAll(): Promise<Order[]> {
    return Promise.resolve(
      [...this.rows.values()].reverse().map((o) => structuredClone(o)),
    );
  }
  findById(id: number): Promise<Order | null> {
    const o = this.rows.get(id);
    return Promise.resolve(o ? structuredClone(o) : null);
  }
  complete(id: number): Promise<Order> {
    const o = this.rows.get(id)!;
    if (o.status !== OrderStatus.PENDENTE) throw new OrderNotPendingError(id);
    for (const i of o.itens) {
      if (
        this.products.rows.get(i.productId)!.quantidadeEstoque < i.quantidade
      ) {
        throw new InsufficientStockError(i.productId);
      }
    }
    o.itens.forEach(
      (i) =>
        (this.products.rows.get(i.productId)!.quantidadeEstoque -=
          i.quantidade),
    );
    o.status = OrderStatus.CONCLUIDO;
    return Promise.resolve(structuredClone(o));
  }
  cancel(id: number): Promise<Order> {
    const o = this.rows.get(id)!;
    if (o.status !== OrderStatus.PENDENTE) throw new OrderNotPendingError(id);
    o.status = OrderStatus.CANCELADO;
    return Promise.resolve(structuredClone(o));
  }
}
