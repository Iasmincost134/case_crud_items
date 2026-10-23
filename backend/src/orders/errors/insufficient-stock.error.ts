/** O estoque de um produto acabou antes de o pedido ser concluído. */
export class InsufficientStockError extends Error {
  constructor(public readonly productId: number) {
    super(`Estoque insuficiente para o produto ${productId}`);
    this.name = 'InsufficientStockError';
  }
}
