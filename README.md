<p align="center">
  <img src="./frontend/public/basirah-logo.png" alt="Basirah" width="240" />
</p>

# Basirah

Privacy-first incident reporting and community support for Muslims facing hate in Canada.

[Try the live app](https://basirah-hazel.vercel.app) · [Watch the unlisted demo](https://www.youtube.com/watch?v=yF5vLf88a18)

Basirah was built for The Harvest Anti-Muslim Hate Hackathon. It gives someone one place to document an online or in-person incident, keep supporting evidence together, and get practical next steps for the situation they described. It also provides nearby mosque discovery and an Edmonton directory of community businesses and professionals.

## What it does

- Accepts anonymous reports without requiring an account, name, email, phone number, IP address, or browser details.
- Lets signed-in users save, edit, download, hide, or permanently delete their reports.
- Changes the form based on whether an incident happened online or in person, so people only see relevant questions.
- Returns a clear action plan after submission. Online plans include the selected platform's official reporting page; in-person plans cover safety, evidence, police, workplace, school, transit, and human-rights options when relevant.
- Stores report PDFs and uploaded evidence in private storage behind short-lived signed links.
- Shows nearby mosques on a mobile-friendly map and lets members add a missing mosque to their profile.
- Provides searchable businesses, health professionals, and lawyers, with authenticated community submissions reviewed before publication.

Basirah does not submit reports to a platform, police service, or support organization on a user's behalf. If anyone is in immediate danger, call 911.

## How it was built

1. Shared Zod schemas define the report, mosque, resource, and API data shapes used by both the frontend and backend.
2. Supabase migrations create the Postgres and PostGIS tables, private storage buckets, database functions, and row-level access policies.
3. A Hono API validates requests, separates anonymous tips from account-linked reports, generates report PDFs, and returns situation-specific next steps.
4. The Next.js app turns those APIs into guided reporting, account, resource-directory, and map flows that work on desktop and mobile.
5. MapLibre renders OpenFreeMap tiles while OpenStreetMap data and PostGIS power mosque discovery and nearby searches.
6. Optional services add explicit writing help, current mosque details, and bot protection. The core reporting flow still works when writing help or place enrichment is unavailable.
7. The monorepo is type-checked, production-built, and deployed to Vercel with the API mounted under the same origin as the web app.

## Tech stack

| Area                  | Technology                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| Web app               | Next.js 15, React 19, TypeScript, Tailwind CSS 4                        |
| API                   | Hono, Zod, Next.js route handler, Wrangler for local Worker development |
| Data and auth         | Supabase Postgres, PostGIS, Auth, Storage, Row Level Security           |
| Maps                  | MapLibre GL, OpenFreeMap, OpenStreetMap, Nominatim                      |
| Documents             | pdf-lib                                                                 |
| Optional integrations | OpenAI, Google Places, Cloudflare Turnstile                             |
| Tooling and hosting   | pnpm workspaces, Node.js 24, Vercel                                     |

## Privacy choices

- Anonymous tips use a separate table and route with no account, contact, IP, or user-agent columns.
- Optional name, email, and phone fields in the signed-in report form stay in that browser for prefilling and are not sent with the report.
- A map location requested by the browser is used to find nearby mosques and is not added to the database. A location typed into a report is saved as part of that report.
- Report evidence and generated PDFs are private. Access is controlled with row-level policies and short-lived signed URLs.
- The writing assistant is opt-in. Report text is sent to OpenAI only when the user selects **Fix spelling and grammar**.
- Public incident data is limited and passes through a verification workflow before it can be broadcast.

The full plain-language policy is available at [basirah-hazel.vercel.app/privacy](https://basirah-hazel.vercel.app/privacy).

## Run locally

### Requirements

- Node.js 24
- pnpm
- A Supabase project

### Setup

```bash
pnpm install
cp .env.example frontend/.env.local
cp .env.example backend/.dev.vars
```

Create a Supabase project, then apply the SQL files in `supabase/migrations/` in filename order. Fill the frontend values in `frontend/.env.local` and the backend values in `backend/.dev.vars`. Never commit either filled file.

Required frontend variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Required backend variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`

`OPENAI_API_KEY`, `GOOGLE_API_KEY`, and the Turnstile key pair are optional for local development. Production should set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` together.

Start the API and web app in separate terminals:

```bash
pnpm dev:backend
```

```bash
pnpm dev:frontend
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
pnpm typecheck
pnpm format:check
pnpm --filter @basirah/frontend build
```

## Repository layout

```text
frontend/   Next.js application and same-origin production API adapter
backend/    Hono API, report guidance, document generation, and integrations
shared/     Zod schemas and TypeScript types shared across the monorepo
supabase/   Database migrations, storage setup, functions, and RLS policies
```

Read [CLAUDE.md](./CLAUDE.md) before contributing. It documents the API contract, privacy boundaries, folder ownership, and security constraints.
