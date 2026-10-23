/**
 * Dinheiro é calculado em CENTAVOS (inteiros) para evitar erros de ponto
 * flutuante: em JS, 0.1 + 0.2 === 0.30000000000000004.
 */
export const paraCentavos = (valor: number): number => Math.round(valor * 100);

export const deCentavos = (centavos: number): number => centavos / 100;

export function calcularSubtotal(
  precoUnitario: number,
  quantidade: number,
): number {
  return deCentavos(paraCentavos(precoUnitario) * quantidade);
}

export function calcularTotal(
  itens: { precoUnitario: number; quantidade: number }[],
): number {
  const centavos = itens.reduce(
    (soma, item) => soma + paraCentavos(item.precoUnitario) * item.quantidade,
    0,
  );
  return deCentavos(centavos);
}
