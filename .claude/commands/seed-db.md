# Seed the database

Run all seed scripts in the correct order to populate the development database with test data:

```bash
cd /Users/ssymax/projects/melius-monorepo && pnpm db:seed:all
```

This runs in sequence:
1. `seed.ts` — Base users, patient profiles, therapist specializations
2. `seed2.ts` — Availability slots and therapist-patient matches
3. `seed-docs.ts` — Therapist verification documents

If the user wants to run only a specific seed, use:
- `pnpm seed` — Base data only
- `pnpm seed:matches` — Availability + matches only
- `pnpm seed:docs` — Verification documents only

**Note:** The database must be running and migrations must be up to date. Run `pnpm prisma:status` to verify migration state before seeding.
