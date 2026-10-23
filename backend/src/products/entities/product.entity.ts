import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Teclado mecânico' })
  nome: string;

  @ApiProperty({ example: 'Periféricos' })
  categoria: string;

  @ApiProperty({
    example: 'Teclado mecânico com switches azuis e layout ABNT2',
  })
  descricao: string;

  @ApiProperty({ example: 199.9 })
  preco: number;

  @ApiProperty({ example: 25 })
  quantidadeEstoque: number;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;
}
