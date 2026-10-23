import { Prisma } from '../generated/prisma/client';

/** Códigos de erro do Prisma que o projeto trata explicitamente. */
export const PrismaErrorCode = {
  RECORD_NOT_FOUND: 'P2025',
  FOREIGN_KEY_VIOLATION: 'P2003',
} as const;

export function isPrismaError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}
