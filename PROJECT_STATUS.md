# Crumb Stall Project Status

This document tracks completed implementation work and the setup steps the project owner needs to do locally. `TODO.md` remains the forward-looking task list; this file is the handoff/status record.

Last updated: 2026-06-07

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
- Hardened checkout so the backend creates a `PENDING_PAYMENT` order before Razorpay checkout starts.
- Added checkout attempt idempotency, unique Razorpay order/payment identifiers, captured-payment verification before order placement, and captured-payment recovery for page reloads during payment confirmation.
- Added a Razorpay webhook endpoint with raw-body signature verification and duplicate event tracking.
- Removed customer-side usage of arbitrary amount-based Razorpay order creation; checkout now uses server-owned start/confirm/recover routes.
- Removed the exposed legacy checkout proxy/route so order placement cannot skip the pending-order payment contract.
- Added real order creation after successful payment.
- Added backend order history.
- Added real order tracking statuses.
- Added OTP display for ready orders.
- Added invoice generation service.
- Added invoice view backed by backend invoice/order/payment data.
- Added PDF invoice download from the invoice page.
- Added persisted favorites with backend APIs and saved-item UI.
- Added order-level star ratings for paid customer orders. A customer rates the order once, and the same rating is applied to every food item in that order for menu rating averages.
- Added Swagger/OpenAPI documentation at `/api/docs` and JSON schema at `/api/docs-json`.
- Added global Nest validation pipe with whitelist, transform, and unknown-field rejection.
- Added Google OAuth/Auth.js integration on the client.
- Added Auth.js JWT session handling and a backend Google profile sync endpoint.
- Added authenticated backend cart APIs with item quantity and note persistence.
- Connected signed-in customer carts to backend sync while unauthenticated browsing carts remain local-only.
- Added reusable backend RBAC guards for authenticated users and role-based admin access.
- Protected the Next.js admin shell so only `ADMIN` users can open admin pages.
- Added backend coupon validation APIs and connected cart/checkout coupon validation to them.
- Added session-aware checkout order creation through a Next.js proxy, so every persisted order belongs to a real signed-in user.
- Hardened Razorpay create/verify APIs with class-based validation and live signature verification tests.
- Added webhook signature and raw payload parsing tests for the Razorpay service.
- Added admin-protected order status update APIs and connected the admin orders page to real order data/status controls.
- Added admin-protected OTP generation and verification APIs with hashed storage, expiry, attempt limits, and order completion on successful verification.
- Added authenticated notifications APIs, Next.js proxies, and notification creation hooks for order, status, OTP, and completion events.
- Added a customer navbar notifications popover with unread badges, latest order alerts, order-detail links, and mark-read actions.
- Added food recommendation APIs with user-order/favorite personalization and popular-item fallback.
- Connected recommendations to the menu page with personalized copy, recommendation reasons, and a recommendation-backed quick filter.
- Made logged-out customer navigation public-only, routed add-to-cart/cart actions to login, and preserved the clicked item so it is added after Google login.
- Added separate admin credentials auth with admin registration requests, pending approval state, a seeded super admin, and a super-admin approval page.
- Added admin-protected analytics APIs for summary metrics, revenue trend, top foods, and live queue, plus a Next.js proxy/helper for admin UI consumption.
- Connected the admin dashboard and analytics page to real analytics data, including live summary cards, revenue trend bars, best sellers, and live queue snapshots.
- Fixed server-rendered order history and tracking pages so their internal API requests forward the logged-in user's Auth.js cookies.
- Completed the current `bug.txt` pass: upgraded invoice PDF styling, added customer order live refresh, tightened notification polling, clarified ready/OTP handover, added admin order detail pages, redesigned admin login, added pending-payment detail recovery, and introduced 401/403/404 route handling.
- Added admin category management with protected backend create/update/deactivate APIs, Next.js admin proxies, and a real `/admin/menu` category CRUD UI.
- Added admin food item management with protected backend create/update/deactivate APIs, Next.js admin proxies, and `/admin/menu` food item CRUD for category, pricing, image URL, tags, ingredients, veg/non-veg, featured, popularity, and availability.
- Added a local admin food-image upload flow. Admins can upload JPG, PNG, or WebP images up to 5MB from `/admin/menu`; files are stored under `client/public/uploads/foods` and the returned `/uploads/foods/...` URL is saved on the food item. Cloudflare R2 remains the later production storage task.
- Added quick admin menu operations for item availability/inventory state and featured placement. Staff can hide/show items from the customer menu and feature/unfeature items without saving the full food form.
- Hardened admin order status management with per-order allowed transitions. Admins can move orders through valid operational steps only, terminal orders cannot be reopened manually, and completion remains OTP-only.
- Simplified the active order flow by treating paid/placed orders as the same operational state. Admins now move paid/placed orders directly to preparing or cancelled; the separate confirmed step remains supported only for legacy orders already in that state.
- Added admin coupon management with protected backend list/create/update/deactivate APIs, Next.js admin proxies, and a real `/admin/coupons` CRUD UI for code, discount type/value, minimum amount, validity window, usage limit, and active state.
- Added review moderation with protected backend admin review list/update APIs, Next.js admin proxies, a `/admin/reviews` UI, and hide/restore actions that recalculate visible food ratings.
- Added customer insights with a protected analytics endpoint and `/admin/customers` page showing total/new/active/repeat customers, repeat rate, average lifetime value, and top customers by spend.

## Current Next Task

- Add reports export UI.

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

   The latest payment hardening migration adds checkout idempotency fields and the Razorpay webhook event ledger, so `npm run db:migrate` is required before testing real payments.

   The seed creates the super admin:

   ```text
   email: crumbhouse2026@gmail.com
   password: value of SUPER_ADMIN_PASSWORD, or CrumbHouse@2026 if unset
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
- For Razorpay webhooks, set:
  - `server/.env`: `RAZORPAY_WEBHOOK_SECRET`
  - Razorpay Dashboard webhook URL: `https://YOUR_BACKEND_DOMAIN/api/v1/payments/razorpay/webhook`
- Subscribe the webhook to captured and failed payment events, at minimum `payment.captured`, `payment.failed`, and `order.paid`.
- The client no longer needs a Razorpay secret. Keep `RAZORPAY_KEY_SECRET` only in `server/.env`.

## Google OAuth Setup Notes

- Auth.js is mounted at `client/app/api/auth/[...nextauth]/route.ts`.
- Google sign-in is launched from `/login`.
- After Google sign-in, the frontend calls `POST /api/v1/auth/google/sync` to upsert the customer profile and ensure a cart exists.
- In production, `server/.env` must include `AUTH_SYNC_SECRET`; local development allows missing sync secret but will be less strict.

## Admin Auth Setup Notes

- Customer login remains Google-only at `/login`.
- Admin login is separate at `/admin/login` and is not linked from customer navigation.
- Admin registration creates a pending admin account. It cannot access admin pages until approved.
- Super admin approval is available at `/admin/approvals` after signing in as `crumbhouse2026@gmail.com`.
- Set `server/.env: SUPER_ADMIN_PASSWORD` before running `npm run db:seed` to avoid using the local fallback password.
- Set `server/.env: ADMIN_APPROVAL_EMAIL=crumbhouse2026@gmail.com`.
- Outgoing approval email delivery still needs SMTP or an email provider integration. Until that is configured, approval requests are persisted in the database, visible in `/admin/approvals`, and logged in the backend console.

## Known Notes And Caveats

- The root `README.md` mentions a root `.env.example`, but this repo currently has `server/.env.example` and `client/.env.example`.
- Unauthenticated cart data remains client-local and is not represented by a database user.
- Favorites require login and are persisted against the signed-in user.
- Reviews require login for submission and are restricted to the signed-in user's paid/placed-or-later order history. Customers rate an order once, and that star rating is applied to all food items in the order.
- Validation strategy: new request DTOs should use class-based DTOs with `class-validator` decorators. Existing manual parser DTOs remain valid for current endpoints and can be migrated feature-by-feature when those APIs are expanded.
- Invoice PDF download is implemented as a generated backend PDF response. Cloud storage for persisted invoice PDFs is still a later infrastructure task.
- Redis is optional for now and only needed once caching, queues, or rate limiting are wired.
- If an order detail page says the order is missing, first confirm PostgreSQL and the backend are running, then verify the order belongs to the same Google account currently signed in.

## Verification Already Run

- Server tests: `npm test`
- Server build: `npm run build`
- Client lint: `npm run lint`
- Client build: `npm run build`
