# Vercel Deployment Configuration for Frontend

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

```bash
# Backend API URL (your Docker backend URL)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# Or if using Railway/Render/other service
# NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.up.railway.app
```

## Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm install && cd apps/web && pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

## Important Notes

1. **CORS Configuration**: Make sure your backend's `CLIENT_URL` environment variable is set to your Vercel domain

   ```bash
   CLIENT_URL=https://your-app.vercel.app
   ```

2. **API Calls**: All API calls from frontend should use `NEXT_PUBLIC_BACKEND_URL`

3. **Monorepo Setup**: Vercel needs to know this is a monorepo
   - Root Directory: `apps/web`
   - Include all workspace dependencies

## Backend CORS Setup

The backend is already configured to accept requests from `CLIENT_URL`. Just set it to your Vercel URL:

```bash
# In your backend .env.production
CLIENT_URL=https://your-app.vercel.app
```

## Deployment Flow

1. **Backend** → Docker (Railway/Render/VPS/AWS)
2. **Frontend** → Vercel (automatic from Git)
3. **Database** → Included in Docker stack

## Vercel CLI Deployment (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from apps/web directory
cd apps/web
vercel

# Or deploy production
vercel --prod
```
