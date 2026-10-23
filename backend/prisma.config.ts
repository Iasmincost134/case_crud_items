import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7: a URL de conexão fica aqui (não mais no schema.prisma).
// Usamos process.env (e não env()) para que `prisma generate` funcione
// mesmo sem .env, já que gerar o client não precisa do banco.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
