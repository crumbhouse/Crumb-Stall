# Crumb Stall

Crumb Stall is a mobile-first food ordering platform for a student-focused food stall.

## Project Layout

- `client`: Next.js frontend for customers and admins
- `server`: NestJS API
- `server/prisma`: Prisma schema and seed data
- `docker-compose.yml`: Optional local Redis service

## Phase 0 Foundation

This milestone establishes:

- PostgreSQL 17 local database setup
- Optional Redis local infrastructure
- Prisma data model for the ordering platform
- NestJS database provider and feature module skeletons
- Shared environment templates
- Basic API health route

## Local Development

1. Copy environment files:

   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   ```

2. Create the local PostgreSQL database and user if they do not already exist.

   The default environment files expect:

   ```text
   postgresql://crumbstall:crumbstall@localhost:5432/crumbstall?schema=public
   ```

   Example using `psql`:

   ```bash
   createuser crumbstall --pwprompt
   createdb crumbstall --owner crumbstall
   ```

   If your local PostgreSQL 17 uses a different user, password, port, or database name, update
   `DATABASE_URL` in `.env` and `server/.env`.

3. Start Redis if you want the optional local cache service:

   ```bash
   docker compose up -d
   ```

   If you already run Redis locally too, you can skip Docker entirely.

4. Install server dependencies added for Prisma:

   ```bash
   cd server
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Run the apps in separate terminals:

   ```bash
   cd server
   npm run start:dev
   ```

   ```bash
   cd client
   npm run dev
   ```
