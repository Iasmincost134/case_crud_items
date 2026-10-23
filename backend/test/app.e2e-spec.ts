import { jest } from '@jest/globals';
import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/database/prisma.service';
import { OrdersRepository } from '../src/orders/orders.repository';
import { ProductsRepository } from '../src/products/products.repository';
import {
  InMemoryOrdersRepository,
  InMemoryProductsRepository,
} from './support/in-memory.repositories';

const produto = {
  nome: 'Teclado',
  categoria: 'Periféricos',
  descricao: 'ABNT2',
  preco: 10.1,
  quantidadeEstoque: 5,
};

describe('API de produtos e pedidos (e2e, sem banco)', () => {
  let app: INestApplication<App>;
  let http: ReturnType<typeof request>;
  let logSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(async () => {
    const products = new InMemoryProductsRepository();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService) // não conecta em banco nenhum
      .useValue({})
      .overrideProvider(ProductsRepository)
      .useValue(products)
      .overrideProvider(OrdersRepository)
      .useValue(new InMemoryOrdersRepository(products))
      .compile();

    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    http = request(app.getHttpServer());
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  const criarProduto = async (extra = {}) =>
    (await http.post('/products').send({ ...produto, ...extra })).body as {
      id: number;
    };

  describe('produtos', () => {
    it('cria, consulta, lista, edita e exclui', async () => {
      const criado = await http.post('/products').send(produto).expect(201);
      const id = criado.body.id as number;

      await http
        .get(`/products/${id}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.nome).toBe('Teclado');
        });
      await http
        .get('/products')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveLength(1);
        });
      await http
        .patch(`/products/${id}`)
        .send({ preco: 20 })
        .expect(200)
        .expect(({ body }) => {
          expect(body.preco).toBe(20);
          expect(body.nome).toBe('Teclado');
        });
      await http.delete(`/products/${id}`).expect(204);
      await http.get(`/products/${id}`).expect(404);
    });

    it('impede preço negativo e quantidades inválidas (400)', async () => {
      await http
        .post('/products')
        .send({ ...produto, preco: -1 })
        .expect(400);
      await http
        .post('/products')
        .send({ ...produto, quantidadeEstoque: -1 })
        .expect(400);
      await http
        .post('/products')
        .send({ ...produto, quantidadeEstoque: 1.5 })
        .expect(400);
      await http
        .post('/products')
        .send({ ...produto, nome: '   ' })
        .expect(400);
      await http
        .post('/products')
        .send({ ...produto, id: 7 })
        .expect(400); // campo extra
      const { id } = await criarProduto();
      await http.patch(`/products/${id}`).send({ preco: -5 }).expect(400);
    });

    it('retorna 404 para produto inexistente e 400 para id inválido', async () => {
      await http.get('/products/999').expect(404);
      await http.patch('/products/999').send({ preco: 1 }).expect(404);
      await http.delete('/products/999').expect(404);
      await http.get('/products/abc').expect(400);
    });

    it('retorna 409 ao excluir produto já usado em pedido', async () => {
      const { id } = await criarProduto();
      await http
        .post('/orders')
        .send({ itens: [{ productId: id, quantidade: 1 }] })
        .expect(201);
      await http.delete(`/products/${id}`).expect(409);
    });
  });

  describe('pedidos', () => {
    it('calcula o total no servidor, ignorando valores do cliente', async () => {
      const a = await criarProduto({ preco: 0.1 });
      const b = await criarProduto({ preco: 0.2 });
      const res = await http
        .post('/orders')
        .send({
          itens: [
            { productId: a.id, quantidade: 3 },
            { productId: b.id, quantidade: 3 },
          ],
        })
        .expect(201);
      expect(res.body.total).toBe(0.9);
      expect(res.body.status).toBe('PENDENTE');

      await http
        .post('/orders')
        .send({ total: 1, itens: [{ productId: a.id, quantidade: 1 }] })
        .expect(400);
    });

    it('valida o corpo e produtos inexistentes', async () => {
      await http.post('/orders').send({ itens: [] }).expect(400);
      await http.post('/orders').send({}).expect(400);
      await http
        .post('/orders')
        .send({ itens: [{ productId: 1, quantidade: 0 }] })
        .expect(400);
      await http
        .post('/orders')
        .send({ itens: [{ productId: 999, quantidade: 1 }] })
        .expect(404);
    });

    it('conclui baixando estoque; depois o status fica final (409)', async () => {
      const { id } = await criarProduto({ quantidadeEstoque: 5 });
      const pedido = await http
        .post('/orders')
        .send({ itens: [{ productId: id, quantidade: 3 }] });
      const oid = pedido.body.id as number;

      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'CONCLUIDO' })
        .expect(200)
        .expect(({ body }) => expect(body.status).toBe('CONCLUIDO'));
      await http
        .get(`/products/${id}`)
        .expect(({ body }) => expect(body.quantidadeEstoque).toBe(2));

      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'CONCLUIDO' })
        .expect(409);
      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'CANCELADO' })
        .expect(409);
    });

    it('recusa concluir sem estoque suficiente (409) e mantém o pedido pendente', async () => {
      const { id } = await criarProduto({ quantidadeEstoque: 1 });
      const pedido = await http
        .post('/orders')
        .send({ itens: [{ productId: id, quantidade: 3 }] });
      const oid = pedido.body.id as number;

      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'CONCLUIDO' })
        .expect(409);
      await http
        .get(`/orders/${oid}`)
        .expect(({ body }) => expect(body.status).toBe('PENDENTE'));
      await http
        .get(`/products/${id}`)
        .expect(({ body }) => expect(body.quantidadeEstoque).toBe(1));
    });

    it('cancela pedido pendente sem mexer no estoque e rejeita status inválido', async () => {
      const { id } = await criarProduto({ quantidadeEstoque: 5 });
      const pedido = await http
        .post('/orders')
        .send({ itens: [{ productId: id, quantidade: 2 }] });
      const oid = pedido.body.id as number;

      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'PENDENTE' })
        .expect(400);
      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'XYZ' })
        .expect(400);
      await http
        .patch(`/orders/${oid}/status`)
        .send({ status: 'CANCELADO' })
        .expect(200);
      await http
        .get(`/products/${id}`)
        .expect(({ body }) => expect(body.quantidadeEstoque).toBe(5));
      await http.get('/orders/999').expect(404);
      await http
        .get('/orders')
        .expect(200)
        .expect(({ body }) => expect(body).toHaveLength(1));
    });
  });

  it('o middleware registra as requisições (método, URL, status)', async () => {
    await http.get('/products').expect(200);
    await new Promise((r) => setTimeout(r, 20));
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/products 200 - /),
    );
  });
});
