---
name: add-endpoint
description: Add a new REST endpoint to an existing NestJS module — controller method, DTO, Swagger decorators, unit test stub — then regenerate OpenAPI types. Use when extending an existing module with a new route.
---

Add a new endpoint to an existing NestJS backend module. $ARGUMENTS may specify the module and route (e.g. `meetings GET /me/summary`). If not provided, ask the user:

1. Which module? (e.g. `meetings`, `auth`, `users`)
2. HTTP method and path? (e.g. `GET /me/summary`)
3. Who can call it? (public / `Role.user` / `Role.doc` / `Role.admin`)
4. What does it return? (brief description — used to name the response DTO)

## Steps

### 1. Read the existing module

Read the controller, service, and any existing DTOs in `apps/backend/src/<module>/`. Understand the patterns already in use before adding anything.

### 2. Create the request DTO (if needed)

For `POST` / `PATCH` requests, create `apps/backend/src/<module>/dtos/<action>-<module>.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class <Action><Module>Dto {
  @ApiProperty({ description: '...' })
  @IsString()
  fieldName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  optionalField?: number;
}
```

Rules:

- Every field needs `@ApiProperty()` — required for OpenAPI generation
- Use `class-validator` decorators for validation
- `required: false` in `@ApiProperty` for optional fields, `@IsOptional()` as the first class-validator decorator

### 3. Create the response DTO (if needed)

If the response shape is not already covered by an existing DTO:

```ts
import { ApiProperty } from '@nestjs/swagger';

export class <Name>ResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fieldName: string;
}
```

### 4. Add the service method

In `apps/backend/src/<module>/<module>.service.ts`, add the business logic method. Inject `PrismaService` if not already injected.

### 5. Add the controller method

In `apps/backend/src/<module>/<module>.controller.ts`, add the route following these patterns:

```ts
@Get('me/summary')                        // adjust method + path
@Roles(Role.user)                         // omit if public
@UseGuards(JwtAuthGuard, RolesGuard)      // omit if public
@HttpCode(200)                            // for POST that returns 200 (not 201)
@ApiOkResponse({ type: SomeResponseDto }) // or @ApiCreatedResponse for POST 201
async methodName(
  @CurrentUser() user: User,              // only when auth is required
  @Body() dto: SomeDto,                   // for POST/PATCH
  @Param('id', ParseIntPipe) id: number,  // for :id params
  @Query() query: SomeQueryDto,           // for GET with query params
) {
  return this.service.methodName(...);
}
```

### 6. Add a unit test to the service spec

In `apps/backend/src/<module>/<module>.service.spec.ts`, add a `describe` block for the new method:

```ts
describe('<methodName>', () => {
  it('should return ... when ...', async () => {
    mockPrisma.<model>.findMany.mockResolvedValue([...]);
    const result = await service.methodName(...);
    expect(result).toEqual(...);
  });

  it('should throw when ...', async () => {
    mockPrisma.<model>.findUnique.mockResolvedValue(null);
    await expect(service.methodName(...)).rejects.toThrow(...);
  });
});
```

Prisma is always mocked — never hit a real DB in tests.

### 7. Regenerate OpenAPI types

```bash
cd /Users/ssymax/projects/melius-monorepo && pnpm gen:openapi
```

The backend must be running for this to work. If it's not, remind the user to start it first with `./dev.sh up` or `pnpm dev:backend`, then re-run the command.

### 8. Summary

Print:

- Route added (`METHOD /path`)
- DTOs created or reused
- Whether the test stub was added
- Reminder to update frontend API calls if the generated types changed
