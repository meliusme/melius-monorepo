import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'schema.prisma',

  datasource: {
    url: process.env.DATABASE_URL!,
  },

  migrations: {
    path: 'migrations',
    seed: 'tsx prisma/seed.ts && tsx prisma/seed2.ts',
  },
});
