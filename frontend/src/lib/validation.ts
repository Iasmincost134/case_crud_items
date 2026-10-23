import { parsePrice } from './format';
import type { FieldErrors, NewProduct } from './types';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Usada no formulário (cliente) e na API mock (servidor). */
export function validateNewProduct(
  raw: Raw,
): { ok: true; value: NewProduct } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = str(raw.name);
  const description = str(raw.description);
  const category = str(raw.category) || 'Outros';
  const imageUrl = str(raw.imageUrl);
  const price =
    typeof raw.price === 'number' ? raw.price : parsePrice(str(raw.price));

  if (name.length < 2) errors.name = 'Informe o nome (mín. 2 caracteres).';
  if (name.length > 80) errors.name = 'Nome muito longo (máx. 80).';
  if (!Number.isFinite(price) || price < 0)
    errors.price = 'Informe um preço válido, ex.: 49,90.';
  if (description.length < 5)
    errors.description = 'Descreva o produto (mín. 5 caracteres).';
  if (imageUrl && !isHttpUrl(imageUrl))
    errors.imageUrl = 'Use uma URL http(s) válida ou deixe em branco.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { name, category, price: Math.round(price * 100) / 100, description, imageUrl },
  };
}
