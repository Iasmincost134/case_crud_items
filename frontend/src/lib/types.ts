export const DEFAULT_CATEGORIES = [
  'Eletrônicos',
  'Casa',
  'Moda',
  'Esporte',
  'Livros',
  'Outros',
] as const;

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
}

export type NewProduct = Omit<Product, 'id'>;

export type SortKey =
  | 'recent'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc';

export interface Filters {
  query: string;
  minPrice: string;
  maxPrice: string;
  category: string;
}

export type FieldErrors = Partial<
  Record<'name' | 'price' | 'description' | 'imageUrl' | 'category', string>
>;
