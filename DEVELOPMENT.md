# Development with Hot Reload

## Quick Start

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker compose -f docker-compose.dev.yml down
```

## What's Different in Dev Mode?

**Development (`docker-compose.dev.yml`):**

- ✅ **Hot Reload**: Code changes are instantly reflected
- ✅ **Fast**: No container rebuilds needed
- ✅ **Volume Mounts**: Source code is mounted from your local filesystem
- ✅ **Dev Servers**: NestJS watch mode + Next.js dev server
- 🐌 Slower initial startup (installs dependencies on first run)

**Production (`docker-compose.yml`):**

- ✅ **Optimized**: Multi-stage builds, smaller images
- ✅ **Fast Startup**: Pre-built images start instantly
- ✅ **Production Ready**: Minified, optimized bundles
- 🔧 Requires rebuild after code changes

## Making Code Changes

1. **Start dev environment:**

   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

2. **Edit your code** in `apps/backend/` or `apps/web/`

3. **See changes immediately** - no rebuild needed!
   - Backend: Changes reload automatically
   - Frontend: Refresh your browser at http://localhost:3001

4. **Watch logs** to see recompilation:
   ```bash
   docker compose -f docker-compose.dev.yml logs -f backend
   ```

## Testing Hot Reload

Try editing a file to see hot reload in action:

```bash
# Watch the backend logs
docker compose -f docker-compose.dev.yml logs -f backend

# In another terminal, edit a file
echo "// test change" >> apps/backend/src/app.service.ts

# You'll see the backend automatically recompile!
```

## When to Use Each Mode

**Use Development Mode (`docker-compose.dev.yml`) when:**

- Actively writing code
- Need fast feedback loops
- Want to see changes immediately

**Use Production Mode (`docker-compose.yml`) when:**

- Testing production builds
- Deploying to staging/production
- Need optimized performance
- Validating Docker images

## Switching Between Modes

```bash
# Stop whatever is running
docker compose down
docker compose -f docker-compose.dev.yml down

# Start dev mode
docker compose -f docker-compose.dev.yml up -d

# OR start production mode
docker compose up -d
```

## Troubleshooting

**Changes not reflecting?**

- Make sure you're running `docker-compose.dev.yml`
- Check logs: `docker compose -f docker-compose.dev.yml logs -f backend`
- Restart if needed: `docker compose -f docker-compose.dev.yml restart backend`

**Slow initial startup?**

- First run downloads and installs all dependencies
- Subsequent starts are much faster (dependencies are cached in volumes)

**Port conflicts?**

- Stop the other mode first: `docker compose down`
