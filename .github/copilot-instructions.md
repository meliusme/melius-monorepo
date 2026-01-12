# Melius Monorepo - AI Coding Agent Instructions

## Architecture Overview

**Monorepo structure** with pnpm workspaces:

- `apps/backend` - NestJS REST API with Prisma ORM (PostgreSQL)
- `apps/web` - Next.js 16 frontend with next-intl i18n
- `packages/error-codes` - Shared error code enums, auto-synced between backend/frontend

**Tech stack**: NestJS, Prisma, PostgreSQL 17, Next.js, TypeScript, Docker, pnpm

## Development Workflow

### Starting the project

```bash
./dev.sh up      # Start dev environment with hot reload
./dev.sh down    # Stop services
./dev.sh logs [service]  # View logs
```

**CRITICAL**: Development runs inside Docker containers. All Prisma commands **must** be executed inside the backend container:

```bash
# Run from workspace root, not inside container
pnpm prisma:migrate      # Create and apply migrations
pnpm prisma:generate     # Generate Prisma Client
pnpm prisma:studio       # Open Prisma Studio on port 5556
pnpm seed                # Run seed.ts
```

### Database workflows

- Schema location: [apps/backend/prisma/schema.prisma](apps/backend/prisma/schema.prisma)
- After schema changes: Run `pnpm prisma:migrate` (creates migration + generates client)
- Migrations run inside Docker via `docker exec melius-backend-dev`
- Use `pnpm prisma:status` to check pending migrations

### OpenAPI/Type generation

```bash
pnpm gen:openapi         # Generate OpenAPI types from running backend
pnpm gen:error-codes     # Sync error codes from packages/error-codes/error-codes.json
```

**Important**: OpenAPI generation requires backend running on port 3000.

### Testing

```bash
pnpm test                # Run backend Jest tests
pnpm --filter @melius/backend test:watch  # Watch mode
```

## Code Patterns & Conventions

### Backend (NestJS)

**Error handling** - Custom AppException system:

- Error codes defined in `packages/error-codes/error-codes.json`
- Throw errors: `throwAppError(ErrorCode.EMAIL_EXISTS, HttpStatus.BAD_REQUEST, 'Email already registered')`
- AppHttpExceptionFilter returns: `{ statusCode, code, message }`
- Example: [apps/backend/src/common/errors/app-expection.filter.ts](apps/backend/src/common/errors/app-expection.filter.ts)

**Authentication & Authorization**:

- JWT tokens in HTTP-only cookies (access + refresh)
- `@CurrentUser()` decorator extracts User from request
- `@Roles(Role.user)` decorator for role-based access (user/doc/admin)
- RolesGuard checks user.role against required roles
- Example: [apps/backend/src/auth/auth.controller.ts](apps/backend/src/auth/auth.controller.ts)

**Event-driven architecture**:

- EventEmitter2 for async operations (emails, notifications)
- Emit: `this.eventEmitter.emit('auth.registered', { userId })`
- Listen: `@OnEvent('auth.registered')` in EmailEventsListener
- Example: [apps/backend/src/email/email-events.listener.ts](apps/backend/src/email/email-events.listener.ts)

**Validation**:

- DTOs with class-validator decorators
- Global ValidationPipe with `whitelist: true` strips unknown properties

**Swagger documentation**:

- Available at http://localhost:3000/api
- Use `@ApiOkResponse()`, `@ApiProperty()` decorators

### Frontend (Next.js)

**API communication**:

- Server-side: `backendFetch()` from [apps/web/src/lib/api/server/backend.ts](apps/web/src/lib/api/server/backend.ts)
- Auto-forwards cookies, supports auth flag
- Always wrap in `safeFetch()` for error handling: returns `{ data, error }`
- Type-safe with generated OpenAPI types: `ApiResponse<'/path', 'get'>`

**Internationalization**:

- next-intl with `[locale]` dynamic routes
- Server components: `await getTranslations('Home')`
- Use `setRequestLocale(locale)` in page components
- Message files in `apps/web/src/messages/`

**Styling**:

- SCSS modules with normalize.css baseline

## Critical Integration Points

**Payment providers**:

- Stripe + Przelewy24 (P24) dual support
- Stripe requires STRIPE_SECRET_KEY env var
- P24 config: P24_MERCHANT_ID, P24_API_KEY, P24_BASE_URL
- Webhook handlers in PaymentsController

**Email system**:

- SendGrid + Nodemailer adapters
- Templates in [apps/backend/src/email/templates/](apps/backend/src/email/templates/)
- Event-driven: listens to auth/payment/meeting events

**CORS configuration**:

- Backend allows CLIENT_URL origin (default: http://localhost:3001)
- Credentials enabled for cookie-based auth

## Common Gotchas

1. **Prisma commands**: Always use `pnpm prisma:*` scripts from root, NOT `cd apps/backend && npx prisma`
2. **Hot reload**: Development mode mounts source code as volumes - changes apply instantly without rebuild
3. **Error codes**: After updating `packages/error-codes/error-codes.json`, run `pnpm gen:error-codes`
4. **Docker exec pattern**: All database operations go through container: `docker exec melius-backend-dev sh -c 'cd /app/apps/backend && ...'`
5. **pnpm filters**: Use `pnpm --filter @melius/backend` or `pnpm --filter @melius/web` for workspace-specific commands

## Deployment

- **Backend**: Railway with Docker (auto-deploy from Git)
- **Frontend**: Vercel with Next.js (auto-deploy from Git)
- Production env vars in `.env.production` (gitignored)
- See [README.md](README.md) for full deployment guide
