# Create and apply a new Prisma database migration

Ask the user for a migration name if not provided in $ARGUMENTS. Then run:

```bash
cd /Users/ssymax/projects/melius-monorepo && pnpm prisma:migrate
```

The command will prompt interactively for the migration name. After migrating, remind the user to run `pnpm prisma:generate` if there were schema changes that require a new Prisma client.

Show the output and report success or any errors clearly.
