# Database And Migration Guide

Crumb Stall uses local PostgreSQL 17 for development and Prisma migrations for schema changes. Docker is not required for PostgreSQL in this project.

Redis is optional in local development. When `server/.env: REDIS_URL` points to a running Redis instance, the backend uses Redis for shared cache/rate-limit counters. When Redis is missing or unavailable, the backend falls back to in-memory counters so local development still starts.

## Local PostgreSQL 17

The default development connection string is:

```text
postgresql://crumbstall:crumbstall@localhost:5432/crumbstall?schema=public
```

Create the user and database if they do not already exist:

```bash
createuser crumbstall --pwprompt
createdb crumbstall --owner crumbstall
```

If your local PostgreSQL uses a different user, password, database, port, or schema, update only this value:

```text
server/.env: DATABASE_URL
```

Quick checks:

```bash
psql --version
pg_isready -h localhost -p 5432
psql "postgresql://crumbstall:crumbstall@localhost:5432/crumbstall?schema=public" -c "select current_database(), current_schema();"
```

## First-Time Setup

Run these commands from the server directory:

```bash
cd server
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

`npm run db:migrate` applies every migration in `server/prisma/migrations` and regenerates the Prisma client when needed. `npm run db:seed` creates starter categories, food items, coupons, and the super admin.

## Creating A Migration

When the Prisma schema changes, create a migration instead of using `db:push`:

```bash
cd server
npm run db:migrate -- --name describe_the_change
```

Use short snake_case names, for example:

```bash
npm run db:migrate -- --name add_customer_address
```

After the migration is created:

```bash
npm run db:generate
npm run test
npm run build
```

Commit both `server/prisma/schema.prisma` and the generated folder under `server/prisma/migrations`.

## Updating An Existing Local Database

When you pull new migrations:

```bash
cd server
npm run db:migrate
npm run db:generate
```

Run the seed again only when seed data changed or your local database needs starter records:

```bash
npm run db:seed
```

## Production Notes

Use `prisma migrate deploy` in production instead of `prisma migrate dev`. The current package does not expose a script for it yet, so the command is:

```bash
cd server
npx prisma migrate deploy
```

Never run `prisma db push` against production. Keep production `DATABASE_URL` in the backend host environment only.
