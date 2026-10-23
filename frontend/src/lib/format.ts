const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const formatBRL = (value: number) => brl.format(value);

/** minúsculas e sem acentos, para busca tolerante */
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Aceita "1299.90", "1.299,90", "R$ 49,9" etc. Retorna NaN se inválido. */
export function parsePrice(raw: string): number {
  let s = raw.replace(/[^\d.,-]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  return Number(s);
}
