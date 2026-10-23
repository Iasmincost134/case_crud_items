import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PrismaErrorCode, isPrismaError } from '../database/prisma-errors';
import type { Product as ProductRow } from '../generated/prisma/client';
import { Product } from './entities/product.entity';
import { ProductInUseError } from './errors/product-in-use.error';
import {
  CreateProductData,
  ProductsRepository,
  UpdateProductData,
} from './products.repository';

// O Prisma devolve DECIMAL como objeto Decimal; a API trabalha com number.
function toProduct(row: ProductRow): Product {
  return { ...row, preco: row.preco.toNumber() };
}

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductData): Promise<Product> {
    return toProduct(await this.prisma.product.create({ data }));
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({ orderBy: { id: 'asc' } });
    return rows.map(toProduct);
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(toProduct);
  }

  async update(id: number, data: UpdateProductData): Promise<Product | null> {
    try {
      return toProduct(
        await this.prisma.product.update({ where: { id }, data }),
      );
    } catch (error) {
      if (isPrismaError(error, PrismaErrorCode.RECORD_NOT_FOUND)) return null;
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isPrismaError(error, PrismaErrorCode.RECORD_NOT_FOUND)) return false;
      if (isPrismaError(error, PrismaErrorCode.FOREIGN_KEY_VIOLATION)) {
        throw new ProductInUseError(id);
      }
      throw error;
    }
  }
}
