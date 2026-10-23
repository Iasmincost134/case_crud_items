'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { DEFAULT_CATEGORIES, type FieldErrors } from '@/lib/types';
import { validateNewProduct } from '@/lib/validation';
import { useProductsStore } from '@/store/products';
import { fieldClass, primaryButton, secondaryButton } from './ui';

export function ProductFormDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="form-title"
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-surface p-0 text-ink backdrop:bg-ink/50 md:w-[30rem]"
    >
      {/* o formulário só existe com o diálogo aberto: o estado reinicia a cada abertura */}
      {open && <ProductForm onDone={onClose} />}
    </dialog>
  );
}

function ProductForm({ onDone }: { onDone: () => void }) {
  const add = useProductsStore((s) => s.add);
  const [values, setValues] = useState({
    name: '',
    category: 'Outros',
    price: '',
    description: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const result = validateNewProduct(values);
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    setSaving(true);
    try {
      await add(result.value);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
      else setFormError(err instanceof ApiError ? err.message : 'Falha de conexão.');
    } finally {
      setSaving(false);
    }
  }

  const err = (k: keyof FieldErrors) =>
    errors[k] && (
      <p id={`e-${k}`} className="mt-1.5 text-sm text-danger">
        {errors[k]}
      </p>
    );
  const a11y = (k: keyof FieldErrors) => ({
    'aria-invalid': Boolean(errors[k]),
    'aria-describedby': errors[k] ? `e-${k}` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-4">
        <h2 id="form-title" className="text-xl font-bold tracking-tight">
          Novo produto
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        <div>
          <label htmlFor="p-name" className="mb-1.5 block text-sm font-medium">
            Nome
          </label>
          <input id="p-name" value={values.name} onChange={set('name')} className={fieldClass} {...a11y('name')} />
          {err('name')}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-price" className="mb-1.5 block text-sm font-medium">
              Preço (R$)
            </label>
            <input
              id="p-price"
              inputMode="decimal"
              placeholder="0,00"
              value={values.price}
              onChange={set('price')}
              className={fieldClass}
              {...a11y('price')}
            />
            {err('price')}
          </div>
          <div>
            <label htmlFor="p-cat" className="mb-1.5 block text-sm font-medium">
              Categoria
            </label>
            <select id="p-cat" value={values.category} onChange={set('category')} className={fieldClass}>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="p-desc" className="mb-1.5 block text-sm font-medium">
            Descrição
          </label>
          <textarea
            id="p-desc"
            rows={4}
            value={values.description}
            onChange={set('description')}
            className={fieldClass}
            {...a11y('description')}
          />
          {err('description')}
        </div>

        <div>
          <label htmlFor="p-img" className="mb-1.5 block text-sm font-medium">
            URL da imagem
          </label>
          <input
            id="p-img"
            type="url"
            placeholder="https://..."
            value={values.imageUrl}
            onChange={set('imageUrl')}
            className={fieldClass}
            {...a11y('imageUrl')}
          />
          {err('imageUrl') || (
            <p className="mt-1.5 text-sm text-muted">
              Opcional: sem URL, usamos uma imagem gerada pela categoria.
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        )}
      </div>

      <div className="flex gap-3 border-t border-line px-5 py-4">
        <button type="button" onClick={onDone} className={`${secondaryButton} flex-1`}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={`${primaryButton} flex-1`}>
          {saving ? 'Salvando…' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}
