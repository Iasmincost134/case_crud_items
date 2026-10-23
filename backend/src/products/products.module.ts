import { Module } from '@nestjs/common';
import { PrismaProductsRepository } from './prisma-products.repository';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    // Inversão de dependência: quem pedir ProductsRepository recebe a versão Prisma.
    { provide: ProductsRepository, useClass: PrismaProductsRepository },
  ],
  // O módulo de pedidos precisa consultar preço e estoque dos produtos.
  exports: [ProductsRepository],
})
export class ProductsModule {}
