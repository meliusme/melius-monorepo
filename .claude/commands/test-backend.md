# Run backend unit tests

Run the backend test suite. Use $ARGUMENTS to pass specific options or file patterns.

If no arguments provided, run all tests with coverage:
```bash
cd /Users/ssymax/projects/melius-monorepo && pnpm test:cov
```

If $ARGUMENTS contains a filename or pattern (e.g. `auth`, `meetings.service`):
```bash
cd /Users/ssymax/projects/melius-monorepo && pnpm --filter @melius/backend test --testPathPattern="<pattern>"
```

Common patterns:
- `pnpm test` — Run all tests once
- `pnpm test:watch` — Watch mode (re-runs on file changes)
- `pnpm test:cov` — Full run with coverage report

**Testing conventions in this project:**
- Prisma is always mocked with `jest.fn()` — never hit real DB
- bcrypt is mocked at `apps/backend/src/__mocks__/bcrypt.ts`
- Tests live as `*.spec.ts` next to their service files
- Focus on service behavior (return values + thrown errors), not internal Prisma call shapes

Report the test results and highlight any failures with their error messages.
