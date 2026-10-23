/** Tentativa de alterar um pedido que já foi concluído ou cancelado. */
export class OrderNotPendingError extends Error {
  constructor(public readonly orderId: number) {
    super(`Pedido ${orderId} não está pendente`);
    this.name = 'OrderNotPendingError';
  }
}
