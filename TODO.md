# Crumb Stall TODO

This is the working implementation checklist for Crumb Stall. We will proceed from the first unchecked item unless priorities change.

## Done

- [x] Read full product specification and split into phases.
- [x] Keep existing `client` and `server` project structure.
- [x] Configure local PostgreSQL-first setup instead of Docker Postgres.
- [x] Keep Docker Compose only for optional Redis.
- [x] Add Prisma schema for users, categories, food items, cart, coupons, orders, payments, OTPs, invoices, reviews, favorites, notifications, and analytics snapshots.
- [x] Add Prisma seed data for starter categories, food items, admin user, and welcome coupon.
- [x] Add Prisma config and explicit env loading.
- [x] Add NestJS database module and Prisma service.
- [x] Add backend module skeletons for auth, users, categories, food, cart, coupons, orders, payments, OTP, invoices, reviews, favorites, notifications, recommendations, analytics, admin, and reports.
- [x] Add backend health route.
- [x] Add public category API: `GET /api/v1/categories`.
- [x] Add public food APIs:
  - [x] `GET /api/v1/foods`
  - [x] `GET /api/v1/foods/featured`
  - [x] `GET /api/v1/foods/popular`
  - [x] `GET /api/v1/foods/:slug`
- [x] Add food query parsing for search, category, food type, availability, featured, price range, sorting, and pagination.
- [x] Add tests for food query parsing.
- [x] Create QR-first customer menu UI at `/` and `/menu`.
- [x] Add customer pages:
  - [x] `/food/[slug]`
  - [x] `/cart`
  - [x] `/checkout`
  - [x] `/orders`
  - [x] `/orders/[orderId]`
  - [x] `/invoices/[invoiceNumber]`
  - [x] `/favorites`
  - [x] `/login`
- [x] Add admin page shells:
  - [x] `/admin`
  - [x] `/admin/menu`
  - [x] `/admin/orders`
  - [x] `/admin/coupons`
  - [x] `/admin/analytics`
- [x] Improve customer UI to a modern food-ordering style.
- [x] Add real food imagery through `next/image`.
- [x] Add local client cart store with `localStorage`.
- [x] Wire menu and food detail add-to-cart actions.
- [x] Add cart quantity controls, remove controls, live subtotal, tax, and total.
- [x] Add checkout summary using live cart state.
- [x] Add live menu search and filters on the client.
- [x] Add item customization notes such as “less spicy” or “no onion”.
- [x] Add cart coupon input and validation UI.
- [x] Add checkout pickup-time validation.
- [x] Integrate Razorpay order creation and payment verification.
- [x] Start checkout from a pending internal order instead of browser-created payment amount.
- [x] Recover captured Razorpay payments after checkout reloads.
- [x] Create real order after successful payment.
- [x] Add real order tracking statuses.
- [x] Add OTP display for ready orders.
- [x] Add order history from backend.
- [x] Add invoice view from backend invoice data.
- [x] Add PDF invoice download.
- [x] Add favorites persistence.
- [x] Add purchased-item-only reviews.
- [x] Add Swagger/OpenAPI setup.
- [x] Add validation pipe and DTO validation strategy.
- [x] Add Google OAuth/Auth.js integration.
- [x] Add user session/JWT flow.
- [x] Connect cart to backend cart APIs after auth exists.
- [x] Add cart APIs.
- [x] Add RBAC guards for admin routes.
- [x] Add coupon validation APIs.
- [x] Add checkout/order creation APIs.
- [x] Add Razorpay payment create/verify APIs.
- [x] Harden checkout payments with pending internal orders before Razorpay checkout.
- [x] Add checkout attempt idempotency and unique Razorpay order/payment IDs.
- [x] Add captured-payment recovery after checkout reloads.
- [x] Add Razorpay webhook event ledger and raw-body webhook endpoint.
- [x] Remove browser usage of arbitrary amount-based Razorpay order creation.
- [x] Remove exposed legacy checkout route that could skip pending-order creation.
- [x] Add order status update APIs.
- [x] Add OTP generation, hashing, expiry, attempts, and verification APIs.
- [x] Add OTP handover verification panel.
- [x] Add coupon CRUD UI.
- [x] Add notifications APIs.
- [x] Add customer notifications popover UI.
- [x] Add review moderation UI.
- [x] Add customer insights page.
- [x] Add recommendation APIs.
- [x] Add customer recommendation section on the menu page.
- [x] Make unauthenticated customer navigation and add-to-cart behavior explicit.
- [x] Preserve clicked cart item across customer login.
- [x] Add separate admin credentials login, registration request, and super-admin approval flow.
- [x] Add analytics APIs.
- [x] Connect admin dashboard to real analytics.
- [x] Fix server-rendered order history/tracking auth cookie forwarding.
- [x] Verify client lint and build.
- [x] Verify server tests and build after backend foundation work.

## Next Task

- [ ] Add reports export UI.

## Customer Flow

- [x] Make menu search/filter UI fully interactive.
- [x] Add item customization notes if needed, such as “less spicy” or “no onion”.
- [x] Add cart coupon input and validation UI.
- [x] Connect cart to backend cart APIs after auth exists.
- [x] Add checkout pickup-time validation.
- [x] Integrate Razorpay order creation and payment verification.
- [x] Create real order after successful payment.
- [x] Add real order tracking statuses.
- [x] Add OTP display for ready orders.
- [x] Add order history from backend.
- [x] Add invoice view from backend invoice data.
- [x] Add PDF invoice download.
- [x] Add favorites persistence.
- [x] Add purchased-item-only reviews.
- [x] Add personalized recommendation strip on the menu page.
- [x] Require login before cart actions while keeping menu browsing public.
- [x] Add clicked item to cart after Google login completes.

## Backend APIs

- [x] Add Swagger/OpenAPI setup.
- [x] Add validation pipe and DTO validation strategy.
- [x] Add Google OAuth/Auth.js integration.
- [x] Add user session/JWT flow.
- [x] Add RBAC guards for admin routes.
- [x] Add cart APIs.
- [x] Add coupon validation APIs.
- [x] Add checkout/order creation APIs.
- [x] Add Razorpay payment create/verify APIs.
- [x] Add checkout start, confirm, and recover APIs for idempotent payment finalization.
- [x] Add Razorpay webhook endpoint with duplicate event tracking.
- [x] Add order status update APIs.
- [x] Add OTP generation, hashing, expiry, attempts, and verification APIs.
- [x] Add invoice generation service.
- [x] Add review APIs.
- [x] Add favorites APIs.
- [x] Add notifications APIs.
- [x] Add recommendation APIs.
- [x] Add analytics APIs.
- [ ] Add reports APIs.

## Admin Flow

- [x] Connect admin dashboard to real analytics.
- [x] Add hidden admin credentials login and approval request flow.
- [x] Add super-admin admin approval page.
- [x] Add category CRUD UI.
- [x] Add food item CRUD UI.
- [x] Add image upload flow for food images.
- [x] Add availability/inventory toggles.
- [x] Add order management with status updates.
- [x] Add OTP handover verification panel.
- [x] Add coupon CRUD UI.
- [x] Add review moderation UI.
- [x] Add customer insights page.
- [ ] Add reports export UI.

## Data And Infrastructure

- [ ] Confirm local PostgreSQL 17 database setup for every developer environment.
- [ ] Add migration documentation.
- [ ] Add richer seed data.
- [ ] Add Redis integration where needed for caching/rate limiting.
- [ ] Add Cloudflare R2 storage integration for food images, review images, and invoice PDFs.
- [ ] Add environment variable documentation for production.
- [ ] Add deployment docs for Vercel, backend host, Supabase Postgres, and Redis.

## Security And Quality

- [ ] Add request rate limiting.
- [ ] Add secure CORS config per environment.
- [x] Add payment signature verification tests.
- [ ] Add webhook integration tests for Razorpay captured/failed events.
- [ ] Add OTP hashing tests.
- [ ] Add audit logs for admin actions.
- [ ] Add API integration tests.
- [ ] Add customer checkout E2E test.
- [ ] Add admin menu management E2E test.
- [ ] Add accessibility pass for customer UI.
- [ ] Add mobile visual QA pass.

## Notes

- The app is QR-first: `/` must remain the menu entry point.
- Customer UI should prioritize fast mobile ordering over marketing content.
- Backend should stay modular by feature.
- Use local PostgreSQL 17, not Docker Postgres.
- Docker Compose is optional for Redis only.
