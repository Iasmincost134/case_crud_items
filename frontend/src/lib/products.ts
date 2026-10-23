import { normalize, parsePrice } from './format';
import type { Filters, Product, SortKey } from './types';

export const initialFilters: Filters = {
  query: '',
  minPrice: '',
  maxPrice: '',
  category: '',
};

export function hasActiveFilters(f: Filters) {
  return Boolean(f.query || f.minPrice || f.maxPrice || f.category);
}

export function priceRangeInvalid(f: Filters) {
  const min = parsePrice(f.minPrice);
  const max = parsePrice(f.maxPrice);
  return !Number.isNaN(min) && !Number.isNaN(max) && min > max;
}

export function filterAndSort(
  products: Product[],
  f: Filters,
  sort: SortKey,
): Product[] {
  const q = normalize(f.query);
  const min = parsePrice(f.minPrice);
  const max = parsePrice(f.maxPrice);

  const list = products.filter(
    (p) =>
      (!q || normalize(p.name).includes(q)) &&
      (!f.category || p.category === f.category) &&
      (Number.isNaN(min) || p.price >= min) &&
      (Number.isNaN(max) || p.price <= max),
  );

  const byName = (a: Product, b: Product) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });

  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    recent: (a, b) => b.id - a.id,
    'name-asc': byName,
    'name-desc': (a, b) => byName(b, a),
    'price-asc': (a, b) => a.price - b.price || byName(a, b),
    'price-desc': (a, b) => b.price - a.price || byName(a, b),
  };
  return list.sort(sorters[sort]);
}
