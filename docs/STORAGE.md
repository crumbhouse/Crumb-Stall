# Cloudflare R2 Storage Guide

Crumb Stall uses Cloudflare R2 for files that must survive deployment on Vercel or another serverless host.

The bucket does not need to be public. The app uploads to private R2 from the backend and serves objects through application routes.

## What Uses R2

- Admin food image uploads are stored under `foods/`.
- Customer review image uploads are stored under `reviews/`.
- Generated invoice PDFs are stored under `invoices/`.

The frontend stores and renders relative app URLs such as:

```text
/api/uploads/objects/foods/2026/06/filename.webp
```

That frontend route proxies to the backend, and the backend reads the private object from R2.

## Required Server Environment Variables

Set these in `server/.env` locally and in the backend host environment in production:

```text
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""
```

`R2_ENDPOINT` is optional. If it is blank, the backend derives it from `R2_ACCOUNT_ID`:

```text
https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

The frontend does not need R2 credentials and does not need a public R2 base URL.

## Cloudflare Setup

1. Create an R2 bucket.
2. Create an R2 API token with object read/write access for that bucket.
3. Add the R2 values to `server/.env`.
4. Add the same values to the production backend host.
5. Do not put R2 secrets in public frontend variables.

If R2 returns `Unauthorized`, regenerate the R2 API token and confirm it has object read/write access to the same bucket name used in `R2_BUCKET`. After editing `server/.env`, restart the backend because env values are loaded at startup.

You can verify the backend sees the expected non-secret values with:

```bash
cd server
node -e "require('dotenv').config(); console.log({ account: !!process.env.R2_ACCOUNT_ID, key: !!process.env.R2_ACCESS_KEY_ID, secret: !!process.env.R2_SECRET_ACCESS_KEY, bucket: process.env.R2_BUCKET, endpoint: process.env.R2_ENDPOINT || 'derived' })"
```

## Frontend Proxy

The frontend upload routes forward authenticated uploads to the backend:

```text
POST /api/admin/uploads/food-image
POST /api/uploads/review-image
```

The frontend object route serves private R2 objects through the app:

```text
GET /api/uploads/objects/:scope/:year/:month/:fileName
```

Allowed scopes are:

```text
foods
reviews
invoices
```

## R2 Folder Format

Objects are stored with date-based folders:

```text
foods/YYYY/MM/<generated-file-name>
reviews/YYYY/MM/<generated-file-name>
invoices/YYYY/MM/<invoice-number>.pdf
```
