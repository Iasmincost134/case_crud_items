/** O produto não pode ser excluído porque já aparece em algum pedido. */
export class ProductInUseError extends Error {
  constructor(public readonly productId: number) {
    super(`Produto ${productId} está associado a pedidos`);
    this.name = 'ProductInUseError';
  }
}
