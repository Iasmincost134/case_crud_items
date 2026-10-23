import { create } from 'zustand';
import { ApiError, createProduct, listProducts } from '@/lib/api';
import { initialFilters } from '@/lib/products';
import type { Filters, NewProduct, Product, SortKey } from '@/lib/types';

interface ProductsState {
  products: Product[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  filters: Filters;
  sort: SortKey;
  lastAddedId: number | null;

  load: () => Promise<void>;
  add: (input: NewProduct) => Promise<Product>;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  setSort: (sort: SortKey) => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  status: 'idle',
  error: null,
  filters: initialFilters,
  sort: 'recent',
  lastAddedId: null,

  async load() {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });
    try {
      set({ products: await listProducts(), status: 'ready' });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Falha de conexão.';
      set({ status: 'error', error: message });
    }
  },

  async add(input) {
    const product = await createProduct(input);
    // limpa filtros/ordenação para garantir que o novo item apareça na lista
    set((s) => ({
      products: [product, ...s.products],
      filters: initialFilters,
      sort: 'recent',
      lastAddedId: product.id,
    }));
    return product;
  },

  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: initialFilters }),
  setSort: (sort) => set({ sort }),
}));
