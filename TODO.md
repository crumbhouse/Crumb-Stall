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
- [x] Verify client lint and build.
- [x] Verify server tests and build after backend foundation work.

## Next Task

- [ ] Connect cart to backend cart APIs after auth exists.

## Customer Flow

- [x] Make menu search/filter UI fully interactive.
- [x] Add item customization notes if needed, such as “less spicy” or “no onion”.
- [x] Add cart coupon input and validation UI.
- [ ] Connect cart to backend cart APIs after auth exists.
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

## Backend APIs

- [x] Add Swagger/OpenAPI setup.
- [x] Add validation pipe and DTO validation strategy.
- [x] Add Google OAuth/Auth.js integration.
- [x] Add user session/JWT flow.
- [ ] Add RBAC guards for admin routes.
- [ ] Add cart APIs.
- [ ] Add coupon validation APIs.
- [ ] Add checkout/order creation APIs.
- [ ] Add Razorpay payment create/verify APIs.
- [ ] Add order status update APIs.
- [ ] Add OTP generation, hashing, expiry, attempts, and verification APIs.
- [x] Add invoice generation service.
- [x] Add review APIs.
- [x] Add favorites APIs.
- [ ] Add notifications APIs.
- [ ] Add recommendation APIs.
- [ ] Add analytics APIs.
- [ ] Add reports APIs.

## Admin Flow

- [ ] Connect admin dashboard to real analytics.
- [ ] Add category CRUD UI.
- [ ] Add food item CRUD UI.
- [ ] Add image upload flow for food images.
- [ ] Add availability/inventory toggles.
- [ ] Add order management with status updates.
- [ ] Add OTP handover verification panel.
- [ ] Add coupon CRUD UI.
- [ ] Add review moderation UI.
- [ ] Add customer insights page.
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
- [ ] Add payment signature verification tests.
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
