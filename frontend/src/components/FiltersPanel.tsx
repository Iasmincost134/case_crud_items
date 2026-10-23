'use client';

import { hasActiveFilters, priceRangeInvalid } from '@/lib/products';
import { useProductsStore } from '@/store/products';
import { fieldClass, secondaryButton } from './ui';

export function FiltersPanel({ categories }: { categories: string[] }) {
  const filters = useProductsStore((s) => s.filters);
  const setFilters = useProductsStore((s) => s.setFilters);
  const resetFilters = useProductsStore((s) => s.resetFilters);
  const rangeInvalid = priceRangeInvalid(filters);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-4">
      <div>
        <label htmlFor="f-query" className="mb-1.5 block text-sm font-medium">
          Buscar por nome
        </label>
        <input
          id="f-query"
          type="search"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Ex.: teclado"
          className={fieldClass}
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Faixa de preço (R$)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            aria-label="Preço mínimo"
            inputMode="decimal"
            value={filters.minPrice}
            onChange={(e) => setFilters({ minPrice: e.target.value })}
            placeholder="Mín."
            aria-invalid={rangeInvalid}
            className={fieldClass}
          />
          <input
            aria-label="Preço máximo"
            inputMode="decimal"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ maxPrice: e.target.value })}
            placeholder="Máx."
            aria-invalid={rangeInvalid}
            className={fieldClass}
          />
        </div>
        {rangeInvalid && (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            O mínimo é maior que o máximo.
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="f-cat" className="mb-1.5 block text-sm font-medium">
          Categoria
        </label>
        <select
          id="f-cat"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
          className={fieldClass}
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        disabled={!hasActiveFilters(filters)}
        className={`${secondaryButton} disabled:opacity-50`}
      >
        Limpar filtros
      </button>
    </div>
  );
}
