import { Product } from './entities/product.entity';

export type CreateProductData = Omit<
  Product,
  'id' | 'criadoEm' | 'atualizadoEm'
>;
export type UpdateProductData = Partial<CreateProductData>;

/**
 * Contrato de persistência de produtos. O service depende desta abstração
 * (e não do Prisma), o que permite trocar o banco e testar sem banco.
 */
export abstract class ProductsRepository {
  abstract create(data: CreateProductData): Promise<Product>;
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: number): Promise<Product | null>;
  abstract findByIds(ids: number[]): Promise<Product[]>;
  /** Retorna null quando o produto não existe. */
  abstract update(id: number, data: UpdateProductData): Promise<Product | null>;
  /**
   * Retorna false quando o produto não existe.
   * Lança ProductInUseError se o produto já foi usado em algum pedido.
   */
  abstract delete(id: number): Promise<boolean>;
}
