# DEOMS PIZZA

A full-stack food delivery web app for DEOMS PIZZA — a pizza/burger/sandwich restaurant in Greater Noida, India. Customers can browse the menu, add items to cart, checkout with delivery details, and track orders. Admins can manage products, orders, banners, and settings from a dedicated dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/deoms-pizza run dev` — run the frontend (port 20141)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, Wouter, Framer Motion
- API: Express 5, express-session (PostgreSQL-backed), bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (single source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (users, categories, products, banners, cart, orders, favorites, settings, sessions)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, categories, products, banners, cart, orders, favorites, settings)
- `artifacts/deoms-pizza/src/` — React frontend (pages, components, hooks)
- `artifacts/deoms-pizza/src/index.css` — Theme (DEOMS Deep Red primary, Golden Yellow secondary, Warm Orange accent)

## Product

- **Customer features**: Home page with banner carousel, category browsing, menu search, product detail with size options, cart management, coupon codes (WELCOME10 / PIZZA20 / DEOMS50), checkout with delivery address, order tracking (4-step timeline), order history, favorites/wishlist, dark mode
- **Admin features**: Dashboard with revenue stats, product management (CRUD), order status management, banner management, settings (owner phone, WhatsApp, Paytm UPI, delivery fee)
- **Auth**: Custom email/password auth with sessions stored in PostgreSQL

## Credentials

- Admin login: `admin@deomspizza.com` / `admin123`
- Shop address: Surajpur, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh, India

## Architecture decisions

- Sessions stored in PostgreSQL via `connect-pg-simple` (table: `session`) — avoids Redis dependency
- All API contracts defined in OpenAPI spec first, then codegen generates typed React Query hooks and Zod validation schemas
- Size options stored as JSONB in the products table — flexible per-category sizing
- Coupon logic is server-side only — codes: WELCOME10 (₹10), PIZZA20 (₹20), DEOMS50 (₹50)
- Cart is stored in the database per user (not localStorage) — survives page refreshes

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing `lib/db/src/schema/` before checking `artifacts/api-server` typecheck
- Run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- Google Fonts must be loaded via `<link>` in `index.html`, NOT via `@import` in CSS (Tailwind v4 PostCSS processes CSS first and rejects @import after other rules)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
