import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from './order-status';

export class OrderItem {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  productId: number;

  @ApiProperty({ example: 'Teclado mecânico' })
  nomeProduto: string;

  @ApiProperty({ example: 2 })
  quantidade: number;

  @ApiProperty({
    example: 199.9,
    description: 'Preço do produto no momento em que o pedido foi criado',
  })
  precoUnitario: number;

  @ApiProperty({ example: 399.8 })
  subtotal: number;
}

export class Order {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: Object.values(OrderStatus),
    example: OrderStatus.PENDENTE,
  })
  status: OrderStatus;

  @ApiProperty({ example: 399.8, description: 'Calculado pelo servidor' })
  total: number;

  @ApiProperty({ type: [OrderItem] })
  itens: OrderItem[];

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;
}
