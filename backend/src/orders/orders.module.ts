import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { PrismaOrdersRepository } from './prisma-orders.repository';

@Module({
  imports: [ProductsModule], // fornece o ProductsRepository
  controllers: [OrdersController],
  providers: [
    OrdersService,
    { provide: OrdersRepository, useClass: PrismaOrdersRepository },
  ],
})
export class OrdersModule {}
