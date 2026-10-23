import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Limites escolhidos para que o total do pedido sempre caiba com folga em
// número inteiro de centavos (e na coluna DECIMAL(18,2)).
export const QUANTIDADE_MAXIMA_POR_ITEM = 10_000;
export const MAXIMO_DE_ITENS = 100;

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'Id do produto' })
  @Max(2_147_483_647, { message: 'O campo productId é inválido' })
  @Min(1, { message: 'O campo productId deve ser maior que zero' })
  @IsInt({ message: 'O campo productId deve ser um número inteiro' })
  productId: number;

  @ApiProperty({ example: 2, minimum: 1, maximum: QUANTIDADE_MAXIMA_POR_ITEM })
  @Max(QUANTIDADE_MAXIMA_POR_ITEM, {
    message: `A quantidade deve ser de no máximo ${QUANTIDADE_MAXIMA_POR_ITEM} por item`,
  })
  @Min(1, { message: 'A quantidade deve ser de pelo menos 1' })
  @IsInt({ message: 'O campo quantidade deve ser um número inteiro' })
  quantidade: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @Type(() => CreateOrderItemDto)
  @ValidateNested({ each: true })
  @ArrayMaxSize(MAXIMO_DE_ITENS, {
    message: `O pedido pode ter no máximo ${MAXIMO_DE_ITENS} itens`,
  })
  @ArrayNotEmpty({ message: 'O pedido precisa ter pelo menos um item' })
  @IsArray({ message: 'O campo itens deve ser uma lista' })
  itens: CreateOrderItemDto[];
}
