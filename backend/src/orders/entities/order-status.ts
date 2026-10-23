/**
 * Status do pedido. Mesmos valores do enum do banco (Prisma).
 *   PENDENTE  -> "Pendente"
 *   CONCLUIDO -> "Concluído"
 *   CANCELADO -> "Cancelado"
 */
export const OrderStatus = {
  PENDENTE: 'PENDENTE',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
