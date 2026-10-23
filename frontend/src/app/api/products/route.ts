import { NextResponse } from 'next/server';
import { placeholderImage } from '@/lib/placeholder';
import { seedProducts } from '@/lib/seed';
import type { Product } from '@/lib/types';
import { validateNewProduct } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// "Banco" em memória (sobrevive ao hot reload; zera ao reiniciar o servidor).
const g = globalThis as unknown as { __products?: Product[] };
const db = (g.__products ??= seedProducts());

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  await delay(350); // simula latência de rede
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  await delay(350);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const result = validateNewProduct((body ?? {}) as Record<string, unknown>);
  if (!result.ok)
    return NextResponse.json({ errors: result.errors }, { status: 422 });

  const id = db.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const { value } = result;
  const product: Product = {
    id,
    ...value,
    imageUrl: value.imageUrl || placeholderImage(value.name, value.category),
  };
  db.push(product);
  return NextResponse.json(product, { status: 201 });
}
