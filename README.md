# taskhub

A full-stack task management application built as a Turborepo monorepo. Users can register, log in, and manage their personal tasks with filtering, sorting, pagination, and real-time stat charts — all backed by a type-safe GraphQL API.

---

## Table of Contents

- [taskhub](#taskhub)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Tech Stack](#tech-stack)
    - [API (`apps/api`)](#api-appsapi)
    - [Web (`apps/web`)](#web-appsweb)
    - [Monorepo](#monorepo)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Running Locally](#running-locally)
    - [Running with Docker](#running-with-docker)
  - [Database](#database)
  - [GraphQL API](#graphql-api)
  - [Scripts Reference](#scripts-reference)
  - [Testing](#testing)
  - [Architecture Notes](#architecture-notes)

---

## Overview

TaskHub lets each authenticated user maintain their own task list. Key capabilities:

| Feature             | Details                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Authentication      | Register / login with bcrypt-hashed passwords and signed JWTs                                                    |
| Task management     | Create, edit, update status, and delete tasks                                                                    |
| Filtering & sorting | Filter by status / priority; sort by title, deadline, or created date                                            |
| Pagination          | Configurable page size (10 / 20 / 50 items)                                                                      |
| Dashboard stats     | Four donut charts — total breakdown by status and by priority per status                                         |
| Profile page        | View account info and sign out                                                                                   |
| Route protection    | Middleware guards all `/dashboard` routes; authenticated users are redirected away from `/login` and `/register` |

---

## Tech Stack

### API (`apps/api`)

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Runtime   | Node.js 22, TypeScript                                  |
| Framework | NestJS 11                                               |
| Transport | GraphQL (Apollo Server 5, code-first schema)            |
| ORM       | Prisma 5                                                |
| Database  | PostgreSQL 16                                           |
| Auth      | Passport.js + `passport-jwt`, `bcryptjs`, `@nestjs/jwt` |

### Web (`apps/web`)

| Layer           | Technology                                                 |
| --------------- | ---------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)                         |
| Language        | TypeScript                                                 |
| Styling         | Tailwind CSS v4, `tw-animate-css`                          |
| Components      | shadcn/ui primitives, Recharts (charts)                    |
| Data fetching   | `graphql-request` with a fully typed generated SDK         |
| Code generation | GraphQL Codegen (`@graphql-codegen/cli`)                   |
| Auth            | `jose` JWT verification, `httpOnly` session cookie (7-day) |

### Monorepo

| Tool              | Role                                  |
| ----------------- | ------------------------------------- |
| Turborepo         | Task orchestration, build caching     |
| Yarn 1 Workspaces | Dependency management                 |
| Docker Compose    | Local Postgres + API containerisation |

---

## Project Structure

```
taskhub/
├── apps/
│   ├── api/                      NestJS GraphQL backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── auth/             Register, login, JWT strategy
│   │       ├── tasks/            CRUD, filter, sort, stats
│   │       ├── users/            Profile resolver
│   │       └── prisma/           PrismaService module
│   └── web/                      Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/       /login, /register pages + _components
│           │   ├── (dashboard)/  /dashboard, /tasks, /profile + _components
│           │   └── actions/      Server Actions for auth and tasks
│           ├── components/
│           │   ├── ui/           shadcn/ui primitives
│           │   └── shared/       DatePicker, FormError
│           ├── graphql/          .gql documents + Codegen output
│           └── lib/              session, graphql client, utils
├── docker-compose.yml
├── Dockerfile.dev
├── turbo.json
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **Yarn** 1.22
- **PostgreSQL** 16 — or Docker if you prefer the containerised setup

### Environment Variables

Create a `.env` file in `apps/api/`:

```env
DATABASE_URL="postgresql://taskhub:taskhub@localhost:5432/taskhub"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=4000
```

Create a `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"
JWT_SECRET="change-this-to-a-long-random-string"
```

> `JWT_SECRET` must be identical in both files — the API signs tokens and the web middleware verifies them independently.

### Running Locally

```bash
# 1. Install dependencies
yarn install

# 2. Generate the Prisma client
yarn prisma:generate

# 3. Run database migrations
yarn prisma:migrate

# 4. (Optional) Seed sample data
yarn seed

# 5. Start both apps in watch mode
yarn dev:all
```

| Service            | URL                           |
| ------------------ | ----------------------------- |
| GraphQL playground | http://localhost:4000/graphql |
| Web app            | http://localhost:3000         |

To start only one app:

```bash
yarn api   # API only
yarn web   # web only
```

### Running with Docker

Docker Compose starts a Postgres 16 container and the API together. The Next.js dev server must still run on the host.

```bash
# Copy the container-specific env file and fill in JWT_SECRET
cp .env.container.example .env.container

# Start Postgres + API
docker compose up -d

# Run migrations against the containerised database
yarn prisma:migrate

# Start the web app on the host
yarn web
```

---

## Database

Managed with **Prisma Migrate**. The schema defines two models:

```
User  — id, name, email (unique), password (hashed), role (USER|ADMIN)
Task  — id, title, description?, status (TODO|IN_PROGRESS|DONE),
        priority (LOW|MEDIUM|HIGH), deadline?, userId (FK → User)
```

Common commands:

```bash
yarn prisma:migrate          # Create + apply a new migration
yarn prisma:migrate:create   # Create migration file without applying
yarn prisma:reset            # Drop and rebuild the database
yarn prisma:studio           # Open Prisma Studio in the browser
yarn seed                    # Seed the database with sample data
```

---

## GraphQL API

The schema is auto-generated from NestJS decorators and written to `apps/api/src/schema.gql`.

**Queries**

| Query                       | Auth | Description                                              |
| --------------------------- | ---- | -------------------------------------------------------- |
| `me`                        | ✅   | Return the current user's profile                        |
| `tasks(filter, skip, take)` | ✅   | Paginated, filtered task list                            |
| `tasksCount(filter)`        | ✅   | Total count for a given filter                           |
| `taskStats`                 | ✅   | Aggregate counts: total, todo, inProgress, done, overdue |

**Mutations**

| Mutation                  | Auth | Description                                        |
| ------------------------- | ---- | -------------------------------------------------- |
| `register(input)`         | ❌   | Create a new account; returns `accessToken` + user |
| `login(input)`            | ❌   | Authenticate; returns `accessToken` + user         |
| `createTask(input)`       | ✅   | Create a task owned by the current user            |
| `updateTask(input)`       | ✅   | Update title, description, priority, deadline      |
| `updateTaskStatus(input)` | ✅   | Update status only                                 |
| `deleteTask(id)`          | ✅   | Delete a task (ownership enforced)                 |

All authenticated operations require a `Authorization: Bearer <token>` header.

After modifying `.gql` files, regenerate the typed SDK:

```bash
yarn generate          # Run once
yarn generate:watch    # Watch mode
```

---

## Scripts Reference

Run from the repo root:

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `yarn dev:all`         | Start API + web in watch mode            |
| `yarn api`             | Start API in watch mode only             |
| `yarn web`             | Start web in watch mode only             |
| `yarn build`           | Production build for all apps            |
| `yarn typecheck`       | TypeScript check across all packages     |
| `yarn lint`            | ESLint across all packages               |
| `yarn test`            | Unit tests across all packages           |
| `yarn generate`        | Regenerate GraphQL typed SDK             |
| `yarn prisma:generate` | Regenerate Prisma client                 |
| `yarn prisma:migrate`  | Create and apply a new migration         |
| `yarn prisma:reset`    | Drop, recreate, and re-seed the database |
| `yarn prisma:studio`   | Open Prisma Studio                       |
| `yarn seed`            | Seed the database                        |

---

## Testing

```bash
# All tests
yarn test

# API unit tests only
yarn workspace @taskhub/api test

# Web unit tests only
yarn workspace @taskhub/web test

# API end-to-end tests (requires no live database — uses in-memory mock)
yarn workspace @taskhub/api test:e2e
```

The API e2e suite in `apps/api/test/app.e2e-spec.ts` boots the full NestJS application with a mocked `PrismaService` and exercises the complete auth + tasks flow over HTTP.

---

## Architecture Notes

**Monorepo layout** — Turborepo orchestrates `build`, `typecheck`, `lint`, and `test` tasks with dependency-aware ordering and local caching.

**Type safety end-to-end** — GraphQL Codegen produces a fully typed SDK from the `.gql` documents. Every query and mutation called by the web app is typed against the API schema with no manual type duplication.

**Authentication flow**

1. The API issues a signed JWT on successful register or login.
2. The web server stores it in a `httpOnly`, `SameSite=lax` cookie valid for 7 days.
3. Next.js Middleware (`src/proxy.ts`) verifies the cookie on every request before rendering, redirecting unauthenticated users to `/login`.
4. Server Components and Server Actions read the cookie via `getSession()` and pass the token to the GraphQL SDK directly — no client-side token storage.

**Component co-location** — Components are scoped to the narrowest folder that covers their usage:

| Folder                         | Contents                                            |
| ------------------------------ | --------------------------------------------------- |
| `components/ui/`               | Pure shadcn/ui primitives with no business logic    |
| `components/shared/`           | Cross-feature utilities (`DatePicker`, `FormError`) |
| `app/(auth)/_components/`      | Auth-flow-only components                           |
| `app/(dashboard)/_components/` | Dashboard feature components                        |
