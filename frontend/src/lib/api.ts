import type { FieldErrors, NewProduct, Product } from './types';

// Vazio = API mock embutida (/api/products). Troque por http://localhost:3000
// quando o backend NestJS expuser /products com os mesmos campos.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError('Não foi possível carregar os produtos.');
  return res.json();
}

export async function createProduct(input: NewProduct): Promise<Product> {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 422) {
    const { errors } = await res.json();
    throw new ApiError('Dados inválidos.', errors);
  }
  if (!res.ok) throw new ApiError('Não foi possível salvar o produto.');
  return res.json();
}
