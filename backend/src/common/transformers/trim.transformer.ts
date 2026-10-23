import { Transform } from 'class-transformer';

/** Remove espaços nas pontas de strings, para que "   " seja tratado como vazio. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
