---
name: new-module
description: Scaffold a new NestJS module in the backend. Use when the user wants to add a new feature module, resource, or domain to the backend API.
---

Scaffold a new NestJS module in `apps/backend/src/`. The module name comes from $ARGUMENTS. If not provided, ask the user for the name and its primary responsibility before proceeding.

## Steps

### 1. Gather context

Ask (if not already clear from $ARGUMENTS):

- Module name (e.g. `notifications`)
- Does it need database access? (→ import `PrismaModule`)
- Does it need auth guards? (→ use `AccessTokenGuard`)

### 2. Create the file structure

```
apps/backend/src/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.service.spec.ts
└── dto/
    ├── create-<module-name>.dto.ts
    └── update-<module-name>.dto.ts
```

### 3. Follow project conventions

**Module (`*.module.ts`)**

- Import `PrismaModule` if DB access is needed
- Import and provide the service
- Import and declare the controller

**Controller (`*.controller.ts`)**

- Use `@ApiTags('<module-name>')` and `@ApiOperation({ summary: '...' })` on every route
- Use `@UseGuards(AccessTokenGuard)` on protected routes
- Use standard HTTP decorators: `@Get`, `@Post`, `@Patch`, `@Delete`

**Service (`*.service.ts`)**

- Inject `PrismaService` via constructor if DB access needed
- Keep business logic here, not in the controller

**DTOs (`dto/*.dto.ts`)**

- Add `@ApiProperty()` to every field — required for OpenAPI generation
- Use `class-validator` decorators (`@IsString()`, `@IsOptional()`, etc.)

**Unit test (`*.service.spec.ts`)**

- Mock Prisma with `jest.fn()` — never hit a real DB
- Follow the pattern from existing specs (e.g. `apps/backend/src/auth/auth.service.spec.ts`)

### 4. Register in AppModule

Add the new module to the `imports` array in `apps/backend/src/app.module.ts`.

### 5. Remind the user

After scaffolding, print:

- Run `pnpm gen:openapi` to update frontend types
- Run `pnpm gen:error-codes` if new error codes were added
- Run `pnpm test` to verify the unit test passes
