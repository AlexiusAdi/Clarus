# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

Next.js 16 (App Router, React 19) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (new-york style, `rsc: true`) · Prisma 7 on PostgreSQL (Neon serverless driver) · NextAuth v5 (Google) · Zod v4 · pnpm.

## Commands

```bash
pnpm dev                       # dev server on :3000
pnpm build                     # prisma generate && prisma migrate deploy && next build
pnpm lint                      # eslint (flat config, next core-web-vitals + typescript)
pnpm exec tsc --noEmit         # typecheck

pnpm prisma migrate dev --name <name>   # create + apply a migration locally
pnpm prisma generate                    # regenerate client into lib/generated/prisma
pnpm prisma db seed                     # seeds global default categories (prisma/seed.ts)
pnpm prisma studio
```

There is no test suite in this repo — verification is `pnpm lint` + `tsc --noEmit` + running the app.

`.env` must define: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.

## Architecture

Clarus is a personal-finance tracker (IDR): transactions, assets, investments with live prices, savings goals, and scheduled/recurring transactions, gated by a FREE/PRO/ELITE plan.

### Prisma client is generated into the repo

`prisma/schema.prisma` sets `output = "../lib/generated/prisma"`, so **`lib/generated/prisma/` is checked-in generated code — never edit it by hand**; change the schema and regenerate. Import enums from `@/lib/generated/prisma/enums` (server) or `.../browser` (client-safe), not from `@prisma/client`. The singleton client in [lib/prisma.ts](lib/prisma.ts) is wired through `PrismaNeon`.

### Route protection lives in proxy.ts, not middleware.ts

[proxy.ts](proxy.ts) at the repo root is the Next 16 proxy/middleware entry and holds all the gating logic, in order: public routes (`/`, `/login`) → logged-in redirect to `/home`; unauthenticated → `/login`; no `UserDetail` row → forced to `/onboarding`; `plan === FREE` visiting `/goals` → `/upgrade`. Its matcher excludes `api`, `_next`, `favicon.ico`. ([app/middleware.ts](app/middleware.ts) is a vestigial one-line re-export and is not the active gate.)

Routes are split by `app/(public)` and `app/(private)`; `(private)/layout.tsx` re-checks `auth()` and wraps children in `SessionProvider` + `Toaster`.

### Data flow: server pages fetch, client tabs paginate

Server components (e.g. [app/(private)/home/page.tsx](<app/(private)/home/page.tsx>)) call the loaders in `lib/data/*` and `lib/helper/*` in a single `Promise.all` and pass plain DTOs down. Client components then re-fetch paginated slices from `/api/user/*` via [hooks/useTabData.ts](hooks/useTabData.ts), which returns `{ data, total, page, pageSize, totalPages, refetch, ... }` and expects every list endpoint to answer `?page=N` with exactly that shape. Page size is per-user (`UserDetail.pageSize`), not a constant.

### Decimal → number at the boundary

All money columns are `Decimal(18,2)`. Prisma `Decimal` cannot cross the server/client boundary, so loaders convert with `.toNumber()` into hand-written DTO types (`GoalDTO`, `TransactionDTO`, …), or use the generic [lib/helper/serialize.ts](lib/helper/serialize.ts). Never hand a raw Prisma row to a client component.

### API route convention

Every handler under `app/api/user/*` follows the same shape: `auth()` → 401 if no `session.user.id`; a module-level Zod schema `safeParse`d against the JSON body or `searchParams`, returning `{ error: parsed.error.flatten().fieldErrors }` with 400; scope **every** query by `userId`; wrap in try/catch returning `{ error: "Something went wrong" }` with 500. Follow this when adding endpoints — validation is Zod-only across both API routes and forms (react-hook-form + `@hookform/resolvers`).

### Cash balance is derived, not stored

There is no balance column. Cash = `INCOME − EXPENSE − SAVINGS − INVESTMENTS` summed over transactions, computed in [lib/helper/getUserNetWorth.ts](lib/helper/getUserNetWorth.ts) and re-derived in the transaction POST to reject overspending. Net worth adds `Investment.totalInvestment` and `Asset.value`. Any new transaction type must be accounted for in both places.

### Plans

`PlanType` FREE/PRO/ELITE with `planExpiresAt` and a `PlanHistory` audit trail. Gate features through the helpers in [lib/helper/plan.ts](lib/helper/plan.ts) (`isPro`, `isElite`, `canUse*`) rather than comparing enums inline. The plan is on the session (`session.user.plan`, typed in [types/next-auth.d.ts](types/next-auth.d.ts)). FREE users are limited to their 2 oldest incomplete goals. `/api/upgrade` currently stubs the payment step (Midtrans).

### Cron jobs

[vercel.json](vercel.json) schedules `GET /api/cron/daily` at 00:00 UTC. It authenticates on `Authorization: Bearer ${CRON_SECRET}` and runs two jobs: refresh `AssetPrice` rows (Yahoo Finance for stocks/gold, CoinGecko for crypto — see [lib/helper/fetchAndCacheAssetPrices.ts](lib/helper/fetchAndCacheAssetPrices.ts), note the hardcoded `IDR_PER_USD`), then materialize due `ScheduledTransaction`s into real transactions and advance `nextRunDate` via `computeNextRunDate`.

### Investments and predefined assets

`Investment.assetIdentifier` is a soft FK into `AssetPrice.identifier`; the known universe of tickers lives in `constants/` (`PREDEFINED_ASSETS`) and is resolved by [lib/helper/getAssetByIdentifier.ts](lib/helper/getAssetByIdentifier.ts). `trackOnly` investments are watch-list entries. Default categories/assets/investment types also live in [constants/index.ts](constants/index.ts) and are the seed source.

## Conventions

- Path alias `@/*` maps to the repo root.
- Shared app-level types live in [app/Types/index.ts](app/Types/index.ts) (note the capital `T`).
- Add shadcn components with `pnpm dlx shadcn@latest add <name>` — they land in `components/ui/` and should not be edited casually; app-specific components sit flat in `components/`.
- Toasts are `sonner`; currency formatting goes through [lib/helper/formatCurrency.ts](lib/helper/formatCurrency.ts).
- Work happens on `development`; PRs target `main`.
- Do not add a `Co-Authored-By: Claude ...` trailer to commit messages.
