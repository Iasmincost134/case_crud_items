'use client';

import { useEffect, useMemo, useState } from 'react';
import { filterAndSort, hasActiveFilters } from '@/lib/products';
import { DEFAULT_CATEGORIES, type SortKey } from '@/lib/types';
import { useProductsStore } from '@/store/products';
import { FiltersPanel } from './FiltersPanel';
import { ProductCard } from './ProductCard';
import { ProductFormDialog } from './ProductFormDialog';
import { fieldClass, primaryButton, secondaryButton } from './ui';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'name-asc', label: 'Nome (A–Z)' },
  { value: 'name-desc', label: 'Nome (Z–A)' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
];

export function ProductsApp() {
  const products = useProductsStore((s) => s.products);
  const status = useProductsStore((s) => s.status);
  const error = useProductsStore((s) => s.error);
  const filters = useProductsStore((s) => s.filters);
  const sort = useProductsStore((s) => s.sort);
  const lastAddedId = useProductsStore((s) => s.lastAddedId);
  const load = useProductsStore((s) => s.load);
  const setSort = useProductsStore((s) => s.setSort);
  const resetFilters = useProductsStore((s) => s.resetFilters);

  const [formOpen, setFormOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => filterAndSort(products, filters, sort),
    [products, filters, sort],
  );
  const categories = useMemo(
    () => Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category)])),
    [products],
  );

  const loading = status === 'idle' || status === 'loading';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Produtos</h1>
          <p className="mt-1 text-muted">Cadastre, busque e organize o catálogo.</p>
        </div>
        <button type="button" onClick={() => setFormOpen(true)} className={primaryButton}>
          Novo produto
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-6">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="filters"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`${secondaryButton} w-full lg:hidden`}
          >
            {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
            {hasActiveFilters(filters) && !filtersOpen ? ' (ativos)' : ''}
          </button>
          <div id="filters" className={`${filtersOpen ? 'mt-3 block' : 'hidden'} lg:mt-0 lg:block`}>
            <FiltersPanel categories={categories} />
          </div>
        </aside>

        <section aria-label="Lista de produtos">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-muted">
              {loading ? 'Carregando…' : `${visible.length} de ${products.length} produtos`}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium">
                Ordenar por
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={`${fieldClass} w-auto`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {status === 'error' ? (
            <div role="alert" className="rounded-xl border border-danger/30 bg-surface p-8 text-center">
              <p className="font-semibold">{error}</p>
              <button type="button" onClick={load} className={`${primaryButton} mt-4`}>
                Tentar novamente
              </button>
            </div>
          ) : loading ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="h-80 rounded-xl border border-line bg-surface motion-safe:animate-pulse" />
              ))}
            </ul>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
              <p className="font-semibold">Nenhum produto encontrado</p>
              <p className="mt-1 text-sm text-muted">Ajuste a busca ou a faixa de preço.</p>
              {hasActiveFilters(filters) && (
                <button type="button" onClick={resetFilters} className={`${secondaryButton} mt-4`}>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} isNew={p.id === lastAddedId} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ProductFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
