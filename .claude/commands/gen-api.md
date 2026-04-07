# Regenerate OpenAPI types for the frontend

Run the OpenAPI generation script that exports the backend OpenAPI spec and generates TypeScript types for the frontend client:

```bash
cd /Users/ssymax/projects/melius-monorepo && pnpm gen:openapi
```

This will:
1. Export `apps/backend/openapi.yaml` from the running NestJS app
2. Generate `apps/web/src/generated/openapi.ts` with type-safe API client types

**Note:** The backend must be running (`./dev.sh up` or `pnpm dev:backend`) for this to work, as it fetches the spec from `http://localhost:3000/api-json`.

After generation, remind the user to update any frontend API calls if the types have changed.
