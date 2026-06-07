# Deployment Guide

Crumb Stall has two deployable apps:

- `client`: Next.js frontend, recommended host: Vercel.
- `server`: NestJS API, recommended host: any long-running Node.js host such as Render, Railway, Fly.io, DigitalOcean App Platform, or an equivalent VPS/container host.

The backend should not be deployed as a short-lived serverless function because it owns webhooks, file proxying, SSE routes, Prisma, and shared operational APIs.

## Production Targets

Use separate domains:

```text
Frontend: https://your-frontend-domain.com
Backend:  https://api.your-domain.com
```

Backend API base URL:

```text
https://api.your-domain.com/api/v1
```

## 1. Provision Infrastructure

Create:

- Supabase PostgreSQL project.
- Redis instance from Upstash, Redis Cloud, Railway, Render, or another managed Redis provider.
- Cloudflare R2 bucket and API token.
- Razorpay live account keys and webhook.
- Google OAuth production credentials.

Keep the full variable list in `docs/ENVIRONMENT.md` open while deploying.

## 2. Database: Supabase Postgres

In Supabase:

1. Create a project.
2. Copy the production Postgres connection string.
3. Prefer the provider's recommended pooled URL for app runtime if connection count is limited.
4. Use a direct/non-pooled URL for Prisma migrations if Supabase provides both.

Set backend:

```text
DATABASE_URL="postgresql://..."
```

Apply migrations from the server directory:

```bash
cd server
npm install
npx prisma migrate deploy
npx prisma generate
```

Seed only when intentionally bootstrapping a fresh production database:

```bash
SUPER_ADMIN_PASSWORD="..." npm run db:seed
```

Do not use `prisma db push` in production.

## 3. Backend Host

Configure the backend service with:

```text
Root directory: server
Build command: npm install && npm run build && npx prisma migrate deploy
Start command: npm run start:prod
Node version: 22 or newer
```

Set all backend variables from `docs/ENVIRONMENT.md`.

Important production values:

```text
NODE_ENV="production"
CLIENT_ORIGIN="https://your-frontend-domain.com"
AUTH_SYNC_SECRET="same-value-as-frontend"
RAZORPAY_WEBHOOK_SECRET="..."
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="..."
LOG_FORMAT="json"
LOG_STACKS="false"
```

After deployment, verify:

```text
https://api.your-domain.com/api/v1/health
https://api.your-domain.com/api/docs
```

## 4. Frontend: Vercel

In Vercel:

```text
Root directory: client
Build command: npm run build
Output: Next.js default
Install command: npm install
```

Set frontend variables from `docs/ENVIRONMENT.md`:

```text
NEXT_PUBLIC_API_URL="https://api.your-domain.com/api/v1"
SERVER_API_URL="https://api.your-domain.com/api/v1"
NEXTAUTH_URL="https://your-frontend-domain.com"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
AUTH_SYNC_SECRET="same-value-as-backend"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."
```

Redeploy after any `NEXT_PUBLIC_*` value changes.

## 5. Redis

Redis is used for shared rate-limit counters and cache fallback behavior.

Set backend:

```text
REDIS_URL="redis://..."
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="120"
```

Use a managed Redis service in production. Local `docker-compose.yml` is only for local development.

## 6. Cloudflare R2

The R2 bucket can remain private.

Set backend only:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
```

The app stores objects under:

```text
foods/YYYY/MM
reviews/YYYY/MM
invoices/YYYY/MM
```

Frontend serves files through app routes:

```text
/api/uploads/objects/:scope/:year/:month/:fileName
```

## 7. Google OAuth

Google Cloud Console redirect URI:

```text
https://your-frontend-domain.com/api/auth/callback/google
```

Authorized JavaScript origin:

```text
https://your-frontend-domain.com
```

## 8. Razorpay

Use live keys in production.

Webhook URL:

```text
https://api.your-domain.com/api/v1/payments/razorpay/webhook
```

Subscribe to:

```text
payment.captured
payment.failed
order.paid
```

Set the webhook secret in:

```text
server env: RAZORPAY_WEBHOOK_SECRET
```

## 9. CORS And Domains

Backend `CLIENT_ORIGIN` must include the frontend origin exactly:

```text
CLIENT_ORIGIN="https://your-frontend-domain.com"
```

For multiple frontend origins:

```text
CLIENT_ORIGIN="https://your-frontend-domain.com,https://www.your-frontend-domain.com"
```

Keep `NEXTAUTH_URL` aligned with the canonical frontend domain.

In production, localhost origins are not auto-allowed. Add every production frontend origin explicitly in `CLIENT_ORIGIN`.

## 10. Smoke Test Checklist

After deployment:

1. Open `/menu`.
2. Sign in with Google as a customer.
3. Add item to cart.
4. Start checkout with Razorpay test/live flow as appropriate.
5. Confirm order appears in `/orders`.
6. Open admin login.
7. Confirm admin dashboard loads.
8. Upload a food image, save the item, and confirm it appears in customer menu.
9. Generate OTP from admin order page and confirm customer order page updates.
10. Download invoice PDF.
11. Download reports from `/admin/reports`.
12. Confirm backend logs include request IDs for each flow.

## 11. Rollback

Frontend rollback:

- Use Vercel deployment rollback.

Backend rollback:

- Redeploy the previous backend version.
- Do not roll back database migrations unless a specific reverse migration has been prepared and tested.

Database rollback:

- Prefer forward fixes.
- Restore from Supabase backup only for serious data corruption.

## 12. Production Commands Reference

Backend build:

```bash
cd server
npm install
npm run build
```

Backend start:

```bash
cd server
npm run start:prod
```

Production migration:

```bash
cd server
npx prisma migrate deploy
```

Frontend build:

```bash
cd client
npm install
npm run build
```
