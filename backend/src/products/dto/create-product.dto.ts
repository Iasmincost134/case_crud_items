import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/transformers/trim.transformer';

// Limites compatíveis com as colunas do banco (DECIMAL(10,2) e INTEGER),
// para que valores absurdos virem 400 e não um erro 500 do banco.
export const PRECO_MAXIMO = 9_999_999.99;
export const ESTOQUE_MAXIMO = 2_147_483_647;

// ATENÇÃO À ORDEM DOS DECORATORS: o de BAIXO é avaliado primeiro. Com
// stopAtFirstError, a mensagem exibida é a do check mais básico (tipo / vazio),
// e não uma enxurrada de mensagens sem sentido para o mesmo campo.
export class CreateProductDto {
  @ApiProperty({ example: 'Teclado mecânico', maxLength: 120 })
  @Trim()
  @MaxLength(120, { message: 'O campo nome deve ter no máximo 120 caracteres' })
  @IsString({ message: 'O campo nome deve ser um texto' })
  @IsNotEmpty({ message: 'O campo nome não pode estar vazio' })
  nome: string;

  @ApiProperty({ example: 'Periféricos', maxLength: 60 })
  @Trim()
  @MaxLength(60, {
    message: 'O campo categoria deve ter no máximo 60 caracteres',
  })
  @IsString({ message: 'O campo categoria deve ser um texto' })
  @IsNotEmpty({ message: 'O campo categoria não pode estar vazio' })
  categoria: string;

  @ApiProperty({
    example: 'Teclado mecânico com switches azuis e layout ABNT2',
    maxLength: 1000,
  })
  @Trim()
  @MaxLength(1000, {
    message: 'O campo descricao deve ter no máximo 1000 caracteres',
  })
  @IsString({ message: 'O campo descricao deve ser um texto' })
  @IsNotEmpty({ message: 'O campo descricao não pode estar vazio' })
  descricao: string;

  @ApiProperty({
    example: 199.9,
    minimum: 0,
    maximum: PRECO_MAXIMO,
    description: 'Preço em reais, com no máximo 2 casas decimais',
  })
  @Max(PRECO_MAXIMO, {
    message: `O preço deve ser de no máximo ${PRECO_MAXIMO}`,
  })
  @Min(0, { message: 'O preço não pode ser negativo' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    {
      message:
        'O campo preco deve ser um número com no máximo 2 casas decimais',
    },
  )
  preco: number;

  @ApiProperty({ example: 25, minimum: 0, maximum: ESTOQUE_MAXIMO })
  @Max(ESTOQUE_MAXIMO, {
    message: `A quantidade em estoque deve ser de no máximo ${ESTOQUE_MAXIMO}`,
  })
  @Min(0, { message: 'A quantidade em estoque não pode ser negativa' })
  @IsInt({ message: 'O campo quantidadeEstoque deve ser um número inteiro' })
  quantidadeEstoque: number;
}
