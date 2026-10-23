'use client';

import { useState } from 'react';
import { formatBRL } from '@/lib/format';
import { categoryColor, placeholderImage } from '@/lib/placeholder';
import type { Product } from '@/lib/types';

export function ProductCard({
  product,
  isNew,
}: {
  product: Product;
  isNew: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const src = broken
    ? placeholderImage(product.name, product.category)
    : product.imageUrl;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <div className="relative aspect-[4/3] bg-paper">
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
        {isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
            Novo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex items-center gap-2 text-sm text-muted">
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ background: categoryColor(product.category) }}
          />
          {product.category}
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          {product.name}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">
          {product.description}
        </p>
        <p className="mt-auto pt-3 text-2xl font-bold tabular-nums tracking-tight">
          {formatBRL(product.price)}
        </p>
      </div>
    </article>
  );
}
