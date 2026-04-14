---
name: taskhub-web-conventions
description: Use this skill when working in apps/web to follow Next.js, React, Tailwind, shadcn/ui, GraphQL codegen, session, and server action conventions.
---

# taskhub Web Conventions

Read the root `SKILL.md` first for repository-wide Git, PR, and language rules. This file covers conventions specific to `apps/web`.

> The full rule set for this app also lives in `AGENTS.md`. AGENTS.md is the authoritative source for detailed code, UI, and validation rules. This file provides the SKILL-routing summary and key invariants.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui |
| GraphQL | graphql-request + @graphql-codegen/cli |
| Auth | JWT (HS256) via jose, httpOnly cookie + expiry cookie |
| Compiler | React Compiler (no manual useMemo/useCallback) |
| Tests | Jest + Testing Library |

## Folder Structure

```text
apps/web/src/
├── proxy.ts                       # Edge auth — Next.js 16 proxy convention (not middleware.ts)
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── (auth)/
│   │   ├── _components/           # AppBranding, AuthCard, TermsDialog
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx             # Fetches user, mounts SessionWatcher
│       ├── _components/           # TasksTable, dialogs, charts, NavLinks
│       └── dashboard/
│           ├── page.tsx           # Stats overview
│           ├── tasks/page.tsx     # Task list with filters, sort, pagination
│           └── profile/page.tsx
├── actions/
│   ├── auth.ts                    # login, register, logout (server actions)
│   └── tasks.ts                   # createTask, updateTask, deleteTask
├── components/
│   ├── ui/                        # shadcn/ui primitives — zero business logic
│   └── shared/                    # DatePicker, FormError, SessionWatcher
├── graphql/
│   ├── queries/*.gql
│   ├── mutations/*.gql
│   └── generated.ts               # Auto-generated SDK — NEVER edit by hand
└── lib/
    ├── session.ts                 # createSession, deleteSession, getSession
    ├── graphql.ts                 # getClient(token?), getSdkClient(token?)
    ├── task-visuals.ts            # Status/priority labels and colors
    └── utils.ts
```

## Component Scope Rules

| Folder | Rule |
|--------|------|
| `components/ui/` | shadcn/ui primitives only — zero business logic |
| `components/shared/` | Cross-feature reusable components |
| `(auth)/_components/` | Auth screens only |
| `(dashboard)/_components/` | Dashboard screens only |

Never create a component in a shared folder that only one feature uses. Never duplicate an existing component.

## GraphQL Codegen

After adding or editing any `.gql` file in `graphql/queries/` or `graphql/mutations/`:

```sh
yarn workspace @taskhub/web codegen
```

Rules:

- NEVER edit `src/graphql/generated.ts` by hand.
- Always regenerate after `.gql` changes.
- Import types and SDK from `@/graphql/generated` only.
- If codegen fails, fix the `.gql` file first before retrying.

## Session Management

Session cookies MUST always be managed together:

```ts
// Correct
createSession(token);  // sets both taskhub_token (httpOnly) + taskhub_expires (public)
deleteSession();       // deletes both cookies

// Forbidden
cookieStore.delete("taskhub_token");  // ❌ leaves the expires cookie orphaned
```

Rules:

- ALWAYS use `createSession()` / `deleteSession()` from `@/lib/session`.
- NEVER delete cookies individually.
- NEVER hardcode cookie names; use the constants from `session.ts`.
- `SessionWatcher` reads `taskhub_expires`, shows a 2-minute warning, and auto-signouts at expiry.
- Mount `SessionWatcher` in the dashboard layout — already wired, do not remove it.

## Auth Flow

```text
Login
  → auth.ts Server Action
  → API returns JWT
  → createSession(token) sets both cookies
  → Every request → proxy.ts verifies token at edge
  → Expired token on protected route → redirect to login + clear cookies
  → Client-side: SessionWatcher reads taskhub_expires, warns at T-2min, signouts at expiry
```

## Data Flow

```text
Request
  → proxy.ts (verify JWT at edge)
  → Server Component (getSession() → getSdkClient(token).Query())
  → Client Component ("use client") for UI interaction only
  → Server Action mutation (getSdkClient(token).Mutation() → revalidatePath)
```

Rules:

- GraphQL mutations via Server Actions only — never from client components.
- Never call API endpoints directly from client components.
- Server Components fetch data; Client Components handle interaction.

## Design Tokens

The color system uses a warm neutral palette. All token values live in `globals.css`; task-specific colors live in `lib/task-visuals.ts`.

### Global palette (key tokens)

| Token | Value | Role |
|-------|-------|------|
| `--background` | `oklch(1 0 0)` | Pure white page canvas |
| `--foreground` | `oklch(0.09 0.008 65)` | Near-black with warm hue |
| `--secondary` / `--muted` / `--accent` | `oklch(0.97 0.006 75)` | Warm white surface — yellow-brown undertone |
| `--primary` | `oklch(0.52 0.18 247)` | Blue `#0075de` — the only saturated UI accent |
| `--border` | `oklch(0 0 0 / 10%)` | Whisper border — ultra-thin, barely visible |
| `--input` | `oklch(0.88 0 0)` | `#dddddd` input border |
| `--destructive` | `oklch(0.55 0.22 25)` | Warm red for error/delete states |
| `--radius` | `0.25rem` (4px) | Tight radius applied to all shadcn components |

### Task visual colors (`lib/task-visuals.ts`)

Status badges:

| Status | Color | Hex |
|--------|-------|-----|
| Todo | Warm gray | `#a39e98` |
| In Progress | Blue | `#0075de` |
| Done | Green | `#1aae39` |

Priority badges:

| Priority | Color | Hex |
|----------|-------|-----|
| Low | Warm gray | `#a39e98` |
| Medium | Orange | `#dd5b00` |
| High | Red | `#e03131` |

Rules:

- NEVER add a new saturated color to the UI chrome — use CSS tokens only.
- Status and priority chips are solid color badges with white centered text (`text-white font-medium`).
- When adding a new task state or priority level, add its visual to `task-visuals.ts` following the warm neutral palette above; do not introduce colors outside this palette.
- Dark mode mirrors the same palette with a warm dark brown-gray background (`oklch(0.24 0.010 65)`).

## Tailwind and UI Rules

- Use design tokens from Tailwind config. No arbitrary values unless genuinely unavoidable.
- Preferred: `h-12 px-4 text-sm rounded-md bg-background`
- Forbidden: `h-[48px] px-[16px] text-[14px]`
- Use existing spacing scale: 1, 2, 3, 4, 6, 8, 12, 16, 24…
- Use existing font sizes: xs, sm, base, lg, xl, 2xl…
- Use shadcn/ui primitives for all common patterns (Button, Input, Dialog, Select).
- Do NOT reinvent components that shadcn already provides.
- Check `components/ui/` and `components/shared/` before creating anything new.

## Import Path Rules

- Use `@/*` aliases for all imports outside the current folder.
- Use relative imports only for adjacent files in the same feature folder.
- Never use chains like `../../../../`.
- Import order: external packages → internal aliases (`@/...`) → local relative imports.

## Validation Commands

Run before every commit:

```sh
yarn workspace @taskhub/web lint
yarn workspace @taskhub/web typecheck
yarn workspace @taskhub/web test
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Edge token verification in `proxy.ts` and `lib/session.ts` — must match API |
| `NEXT_PUBLIC_API_URL` | GraphQL endpoint used in `lib/graphql.ts` |

## Critical Invariants — Never Break

- **Session cookies managed together** — never delete one alone.
- **`generated.ts` auto-generated only** — regenerate via codegen; never edit.
- **React Compiler enabled** — no manual `useMemo` / `useCallback`.
- **GraphQL mutations via Server Actions only** — never from client components.
- **`proxy.ts` not `middleware.ts`** — Next.js 16 uses proxy convention.
- **Component scope strict** — each folder has a specific responsibility; respect it.

## Continuous Learning Rule

If a task reveals a better convention, recurring mistake, or useful reminder specific to this web app, update this `SKILL.md` in the same PR. For detailed code and UI rules, update `AGENTS.md` if the rule applies to the full web app. Keep updates concise and actionable.
