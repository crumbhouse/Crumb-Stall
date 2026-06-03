# Crumb Stall Project Status

This document tracks completed implementation work and the setup steps the project owner needs to do locally. `TODO.md` remains the forward-looking task list; this file is the handoff/status record.

Last updated: 2026-06-03

## Completed Work

### Foundation

- Kept the existing `client` and `server` project structure.
- Configured the project for local PostgreSQL 17 instead of Docker Postgres.
- Kept Docker Compose only for optional Redis.
- Added Prisma schema coverage for users, categories, food items, cart, coupons, orders, payments, OTPs, invoices, reviews, favorites, notifications, and analytics snapshots.
- Added seed data for starter categories, food items, an admin user, and welcome coupons.
- Added Prisma config with explicit environment loading.
- Added NestJS database module and Prisma service.
- Added backend module shells for the planned feature areas.
- Added backend health route.

### Public Menu APIs

- Added `GET /api/v1/categories`.
- Added food listing/detail APIs:
  - `GET /api/v1/foods`
  - `GET /api/v1/foods/featured`
  - `GET /api/v1/foods/popular`
  - `GET /api/v1/foods/:slug`
- Added food query parsing for search, category, type, availability, featured, price range, sorting, and pagination.
- Added tests for food query parsing.

### QR-First Customer UI

- Made `/` and `/menu` the QR-first menu entry experience.
- Added customer pages:
  - `/food/[slug]`
  - `/cart`
  - `/checkout`
  - `/orders`
  - `/orders/[orderId]`
  - `/invoices/[invoiceNumber]`
  - `/favorites`
  - `/login`
- Added admin page shells:
  - `/admin`
  - `/admin/menu`
  - `/admin/orders`
  - `/admin/coupons`
  - `/admin/analytics`
- Improved the customer UI toward a modern food-ordering style.
- Added real food imagery through `next/image`.

### Cart And Checkout

- Added local cart state with `localStorage`.
- Wired menu and food detail add-to-cart actions.
- Added cart quantity controls, remove controls, live subtotal, tax, and total.
- Added checkout summary using live cart state.
- Added live client-side menu search and filters.
- Added item customization notes.
- Added cart coupon input and validation UI.
- Added checkout pickup-time validation.

### Payments, Orders, OTP, And Invoices

- Integrated Razorpay order creation and payment verification.
- Added real order creation after successful payment.
- Added backend order history.
- Added real order tracking statuses.
- Added OTP display for ready orders.
- Added invoice generation service.
- Added invoice view backed by backend invoice/order/payment data.
- Added PDF invoice download from the invoice page.
- Added persisted favorites with backend APIs and saved-item UI.
- Added purchased-item-only reviews on food detail pages.
- Added Swagger/OpenAPI documentation at `/api/docs` and JSON schema at `/api/docs-json`.
- Added global Nest validation pipe with whitelist, transform, and unknown-field rejection.
- Added Google OAuth/Auth.js integration on the client.
- Added Auth.js JWT session handling and a backend Google profile sync endpoint.

## Current Next Task

- Connect cart to backend cart APIs after auth exists.

## Local Setup Steps For You

1. Make sure PostgreSQL 17 is running locally.
2. Create the `crumbstall` database if it does not already exist.
3. Update `server/.env` with your real local `DATABASE_URL`.
4. Update `client/.env.local` if your API URL differs from:

   ```text
   http://localhost:3001/api/v1
   ```

5. Install dependencies if needed:

   ```bash
   cd server
   npm install
   ```

   ```bash
   cd client
   npm install
   ```

6. Generate Prisma client and apply migrations:

   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

7. Run the backend:

   ```bash
   cd server
   npm run start:dev
   ```

8. Run the frontend:

   ```bash
   cd client
   npm run dev
   ```

9. Open the customer app. The QR target should point to the menu entry page:

   ```text
   http://localhost:3000/
   ```

   In this workspace, the current browser session has also used:

   ```text
   http://127.0.0.1:3002/
   ```

10. Open API documentation after the backend is running:

   ```text
   http://localhost:3001/api/docs
   ```

11. To enable Google login locally, create Google OAuth credentials with this redirect URI:

   ```text
   http://localhost:3000/api/auth/callback/google
   ```

12. Set the Google/Auth.js values:

   ```text
   client/.env.local: NEXTAUTH_URL
   client/.env.local: NEXTAUTH_SECRET
   client/.env.local: GOOGLE_CLIENT_ID
   client/.env.local: GOOGLE_CLIENT_SECRET
   client/.env.local: AUTH_SYNC_SECRET
   server/.env: AUTH_SYNC_SECRET
   ```

   `AUTH_SYNC_SECRET` must be the same value in both client and server env files.

## Razorpay Setup Notes

- If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are empty in `server/.env`, the backend uses mock mode for Razorpay order creation.
- For real Razorpay checkout, set:
  - `server/.env`: `RAZORPAY_KEY_ID`
  - `server/.env`: `RAZORPAY_KEY_SECRET`
  - `client/.env.local`: `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Google OAuth Setup Notes

- Auth.js is mounted at `client/app/api/auth/[...nextauth]/route.ts`.
- Google sign-in is launched from `/login`.
- After Google sign-in, the frontend calls `POST /api/v1/auth/google/sync` to upsert the customer profile and ensure a cart exists.
- In production, `server/.env` must include `AUTH_SYNC_SECRET`; local development allows missing sync secret but will be less strict.

## Known Notes And Caveats

- The root `README.md` mentions a root `.env.example`, but this repo currently has `server/.env.example` and `client/.env.example`.
- Cart data is still client-local until backend cart APIs are implemented and connected to the authenticated session.
- Favorites are persisted for the guest customer until auth/session ownership is implemented.
- Reviews are restricted to items found in the guest customer's paid/placed-or-later order history until auth/session ownership is implemented.
- Validation strategy: new request DTOs should use class-based DTOs with `class-validator` decorators. Existing manual parser DTOs remain valid for current endpoints and can be migrated feature-by-feature when those APIs are expanded.
- Invoice PDF download is implemented as a generated backend PDF response. Cloud storage for persisted invoice PDFs is still a later infrastructure task.
- Redis is optional for now and only needed once caching, queues, or rate limiting are wired.

## Verification Already Run

- Server tests: `npm test`
- Server build: `npm run build`
- Client lint: `npm run lint`
- Client build: `npm run build`
