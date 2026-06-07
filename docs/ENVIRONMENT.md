# Production Environment Variables

This guide lists the production environment variables needed for Crumb Stall. Keep frontend and backend variables separate.

## Frontend Host

Set these on Vercel or whichever platform hosts `client`.

```text
NEXT_PUBLIC_API_URL="https://api.your-domain.com/api/v1"
SERVER_API_URL="https://api.your-domain.com/api/v1"
NEXTAUTH_URL="https://your-frontend-domain.com"
NEXTAUTH_SECRET="long-random-secret"
GOOGLE_CLIENT_ID="google-oauth-client-id"
GOOGLE_CLIENT_SECRET="google-oauth-client-secret"
AUTH_SYNC_SECRET="same-value-as-backend"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxx"
```

Notes:

- `NEXT_PUBLIC_API_URL` is browser-visible and should only contain the backend API URL.
- `SERVER_API_URL` is used by server-side Next.js routes. In production it should usually match `NEXT_PUBLIC_API_URL`.
- `NEXTAUTH_URL` must be the exact production frontend origin.
- `NEXTAUTH_SECRET` must be a strong random value and must not be shared publicly.
- `AUTH_SYNC_SECRET` must match the backend value exactly.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is safe to expose. Do not expose the Razorpay secret in the frontend.

## Backend Host

Set these on the backend API host.

```text
NODE_ENV="production"
PORT="3001"
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
CLIENT_ORIGIN="https://your-frontend-domain.com"

AUTH_SYNC_SECRET="same-value-as-frontend"
JWT_SECRET="long-random-server-secret"
OTP_SECRET="long-random-otp-secret"

GOOGLE_CLIENT_ID="google-oauth-client-id"
GOOGLE_CLIENT_SECRET="google-oauth-client-secret"

RAZORPAY_KEY_ID="rzp_live_xxxxx"
RAZORPAY_KEY_SECRET="razorpay-live-secret"
RAZORPAY_WEBHOOK_SECRET="razorpay-webhook-secret"

R2_ACCOUNT_ID="cloudflare-account-id"
R2_ACCESS_KEY_ID="r2-access-key-id"
R2_SECRET_ACCESS_KEY="r2-secret-access-key"
R2_BUCKET="crumbstall-assets"
R2_ENDPOINT=""

SUPER_ADMIN_PASSWORD="strong-initial-super-admin-password"
ADMIN_APPROVAL_EMAIL="crumbhouse2026@gmail.com"

RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="120"
LOG_FORMAT="json"
LOG_LEVEL="info"
LOG_STACKS="false"
```

Notes:

- `DATABASE_URL` should point to production PostgreSQL. Use pooled/non-pooled URLs according to the database provider guidance.
- `REDIS_URL` is optional for local development but recommended in production so rate-limit counters are shared across instances.
- `CLIENT_ORIGIN` can be comma-separated if multiple frontend origins are allowed.
- In production, `CLIENT_ORIGIN` is required and local development origins are not auto-allowed.
- `AUTH_SYNC_SECRET` is required in production. Missing or mismatched values will break authenticated client-to-server proxy calls.
- `JWT_SECRET` and `OTP_SECRET` should be different strong secrets.
- If `OTP_SECRET` is missing, the backend falls back to `JWT_SECRET`; production should set both.
- `R2_ENDPOINT` can stay empty. The backend derives `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`.
- R2 secrets belong only on the backend.
- `SUPER_ADMIN_PASSWORD` is used by seed. Set it before running production seed/bootstrap.
- `LOG_STACKS=false` is recommended in production.

## Google OAuth

Production Google OAuth redirect URI:

```text
https://your-frontend-domain.com/api/auth/callback/google
```

Local redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Make sure the OAuth consent screen allows the accounts you use for testing.

## Razorpay

Use live Razorpay credentials in production:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
```

Webhook URL:

```text
https://api.your-domain.com/api/v1/payments/razorpay/webhook
```

Subscribe to at least:

```text
payment.captured
payment.failed
order.paid
```

`RAZORPAY_WEBHOOK_SECRET` is generated in the Razorpay Dashboard when creating the webhook.

## Cloudflare R2

R2 is private. The frontend does not need R2 secrets or a public R2 base URL.

Required backend values:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
```

Object layout:

```text
foods/YYYY/MM/<generated-file-name>
reviews/YYYY/MM/<generated-file-name>
invoices/YYYY/MM/<invoice-number>.pdf
```

The app serves private R2 objects through:

```text
/api/uploads/objects/:scope/:year/:month/:fileName
```

## Secret Checklist

Never expose these to the browser:

```text
DATABASE_URL
SERVER_API_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_SECRET
AUTH_SYNC_SECRET
JWT_SECRET
OTP_SECRET
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
SUPER_ADMIN_PASSWORD
```

Browser-visible variables must use `NEXT_PUBLIC_` and should be limited to public identifiers/URLs.

## After Changing Env

Restart the affected app after changing env values:

```text
frontend env change -> redeploy/restart frontend
backend env change -> redeploy/restart backend
```

For Next.js, any `NEXT_PUBLIC_*` value is baked into the frontend build, so it requires a rebuild/redeploy.
