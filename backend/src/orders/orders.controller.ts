import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary:
      'Criar pedido (status inicial PENDENTE; total calculado no servidor)',
  })
  @ApiCreatedResponse({ type: Order })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Algum produto não existe' })
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiOkResponse({ type: [Order] })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar pedido por id' })
  @ApiOkResponse({ type: Order })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Concluir ou cancelar um pedido pendente',
    description:
      'CONCLUIDO confere e baixa o estoque; CANCELADO não altera o estoque. ' +
      'Pedidos já concluídos ou cancelados não podem mais mudar.',
  })
  @ApiOkResponse({ type: Order })
  @ApiBadRequestResponse({ description: 'Status inválido' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiConflictResponse({
    description: 'Estoque insuficiente ou pedido não está mais pendente',
  })
  updateStatus(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
