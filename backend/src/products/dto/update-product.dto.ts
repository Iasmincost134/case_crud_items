import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// PartialType do @nestjs/swagger: todos os campos viram opcionais, mas as
// validações (preço >= 0, estoque inteiro...) continuam valendo quando enviados.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
