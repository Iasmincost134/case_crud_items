import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductInUseError } from './errors/product-in-use.error';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(dto: CreateProductDto): Promise<Product> {
    return this.productsRepository.create(dto);
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findById(id);
    if (!product) throw this.notFound(id);
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepository.update(id, dto);
    if (!product) throw this.notFound(id);
    return product;
  }

  async remove(id: number): Promise<void> {
    try {
      const removed = await this.productsRepository.delete(id);
      if (!removed) throw this.notFound(id);
    } catch (error) {
      if (error instanceof ProductInUseError) {
        throw new ConflictException(
          `O produto ${id} já foi usado em pedidos e não pode ser excluído`,
        );
      }
      throw error;
    }
  }

  private notFound(id: number): NotFoundException {
    return new NotFoundException(`Produto com id ${id} não encontrado`);
  }
}
