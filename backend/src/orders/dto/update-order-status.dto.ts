import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { OrderStatus } from '../entities/order-status';

// Só se pode mover um pedido PENDENTE para CONCLUIDO ou CANCELADO.
// "PENDENTE" não é um destino válido (é o estado inicial).
export const STATUS_DESTINO = [
  OrderStatus.CONCLUIDO,
  OrderStatus.CANCELADO,
] as const;

export type StatusDestino = (typeof STATUS_DESTINO)[number];

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: STATUS_DESTINO, example: OrderStatus.CONCLUIDO })
  @IsIn(STATUS_DESTINO, {
    message: `O status deve ser um destes: ${STATUS_DESTINO.join(', ')}`,
  })
  status: StatusDestino;
}
