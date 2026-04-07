# Scaffold a new NestJS module in the backend

Create a new NestJS module following the patterns used in this project. The module name should come from $ARGUMENTS.

**Steps to create a new module:**

1. Use the NestJS CLI (if available) or create files manually following this structure:
```
apps/backend/src/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.service.spec.ts
├── dto/
│   ├── create-<module-name>.dto.ts
│   └── update-<module-name>.dto.ts
└── entities/  (optional, if needed)
```

2. Follow existing module conventions:
   - Import `PrismaModule` if database access is needed
   - Use `@ApiTags()` and `@ApiOperation()` for Swagger documentation
   - Use `@UseGuards(AccessTokenGuard)` for protected routes
   - Add `@ApiProperty()` to all DTO fields for OpenAPI generation
   - Write unit tests in the `.spec.ts` file with Prisma mocked

3. Register the module in `apps/backend/src/app.module.ts`

4. After creating, remind the user to:
   - Run `pnpm gen:openapi` to update frontend types
   - Run `pnpm gen:error-codes` if new error codes were added

Ask the user for the module name if not in $ARGUMENTS, and what its primary responsibility will be.
