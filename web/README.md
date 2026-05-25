# Firstline IT Hub — Asset Management (Web)

React + Vite + TypeScript + Tailwind CSS frontend for the Asset Management
module of the Firstline IT Hub platform.

## Stack

- **React 19** + **TypeScript** (Vite 8)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router 7** for client-side routing
- **TanStack Query 5** for server state (wiring stub in `src/lib/api.ts`)
- **lucide-react** for icons

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

## Scripts

| Script          | What it does                              |
| --------------- | ----------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR            |
| `npm run build`   | Type-check (`tsc -b`) and produce `dist/` |
| `npm run preview` | Preview the production build              |
| `npm run lint`    | Run ESLint                                |

## Project structure

```
src/
  components/
    layout/       AppShell, Sidebar, Header
    PageHeader.tsx
  features/
    assets/       Asset-domain types, mock data, badges
  lib/
    auth.tsx      Auth context (stub for Logto)
    api.ts        fetch wrapper, base URL from env
    queryClient.ts
    cn.ts         classnames helper
  pages/          Route components
  routes.tsx      Route table
  App.tsx         Providers (Query, Auth, Router)
  main.tsx        Entry
```

Path alias `@/*` resolves to `src/*` (see `vite.config.ts` and
`tsconfig.app.json`).

## Integration notes

- **Auth (Logto)** — currently stubbed in `src/lib/auth.tsx` with a hard-coded
  developer user. Replace with `@logto/react` once the IAM module from the
  platform team is available. Env vars `VITE_LOGTO_*` are reserved.
- **API** — `src/lib/api.ts` reads `VITE_API_BASE_URL`. The C# Web API lives
  alongside this app in the `api/` folder (to be added).
- **Tenant context** — not yet modeled; the tenant management module will
  inject a tenant id into requests, likely via Logto claims.
