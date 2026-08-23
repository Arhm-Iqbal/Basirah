# Basirah

Community security infrastructure for Canadian mosques.

Read [CLAUDE.md](./CLAUDE.md) before contributing. It defines folder ownership, the stack, the
API contract, and the security and ethical constraints.

```
frontend/   Next.js app
backend/    Hono API on Cloudflare Workers
shared/     zod schemas shared by both
supabase/   migrations and RLS policies
```

## Setup

Requires Node 22.

```bash
npm i -g pnpm
pnpm install

cp .env.example frontend/.env.local
cp .env.example backend/.dev.vars

pnpm dev:frontend   # http://localhost:3000
pnpm dev:backend    # http://localhost:8787
```

## Checks

```bash
pnpm typecheck
pnpm format
```
