# AGENTS.md — taskhub/web

## 🚨 EXECUTION PRIORITY

When working in this repository, follow rules in this order:

1. Repository Rules
2. Workflow Rules
3. Code Rules
4. UI/Tailwind Rules
5. Validation Rules
6. Project Context

If any generated output conflicts with Repository Rules, **Repository Rules always win**.

---

## 1. REPOSITORY RULES (HIGHEST PRIORITY)

### 1.1 Branch separation

Frontend and backend work MUST use separate branches.

**Frontend branch format:**

```
feature/web-ticket-description
```

**Backend/API branch format:**

```
feature/api-ticket-description
```

Rules:

- NEVER mix frontend and backend work in the same branch
- If work affects both, split clearly and mention both scopes in PR

---

### 1.2 Commit message format (MANDATORY)

Allowed prefixes ONLY: `feat` · `fix` · `refactor` · `perf` · `test` · `docs` · `chore` · `ci` · `style` · `revert`

**Format:**

```
<type>/<scope>-ticket: short message
```

**Correct examples:**

```
feat/web-auth-123: add session expiry warning modal
fix/web-dashboard-456: correct filter reset behavior
refactor/api-users-789: simplify role assignment
docs/web-abc: update AGENTS.md
```

**Forbidden examples:**

```
feat(web): add session expiry warning          ❌ Wrong format
update code                                     ❌ Vague
feat: fix bug                                   ❌ No scope/ticket
```

Rules:

- MUST include scope (web/api)
- MUST include ticket id
- MUST be lowercase after colon unless proper noun
- MUST be concise (< 60 chars preferred)
- NEVER omit scope or ticket id
- NEVER use vague messages

---

### 1.3 Pull Request title (MANDATORY)

**Web changes:**

```
[Web - Feature/Area] Action Summary
```

**Backend/API changes:**

```
[Admin - Feature/Area] Action Summary
```

**Correct examples:**

```
[Web - Auth] Add auto-signout on token expiry
[Web - Tasks] Fix pagination reset on filter change
[Admin - Users] Refactor role assignment logic
```

**Forbidden examples:**

```
[Web] Add feature                               ❌ No area
Update things                                   ❌ No prefix
[web - auth] add thing                          ❌ Wrong case
```

Rules:

- Action Summary MUST start with capital letter
- MUST use clear verb (Add, Fix, Refactor, Improve, Remove, Update)
- MUST be specific and short

---

### 1.4 Pull Request description (MANDATORY)

Rules:

- English only
- Concise (no long prose)
- No signature or "Requested by"
- No URLs except issue link
- Compare against `develop` branch
- MUST follow template exactly

**Template:**

```markdown
Resolving <ISSUE_URL>

### Summary

Short explanation of what this PR does (2–3 lines max).

### Changes

- Backend: [list changes]
- Frontend: [list changes]
- Important logic: [describe if applicable]

### Technical Notes (if needed)

- DB migration
- API contract change
- Breaking change
- Performance impact

### Testing

- What was tested (web/api/both)
- Regression test added or N/A
```

---

### 1.5 Issue writing rules (MANDATORY)

All issues MUST be written in English and follow this structure:

**Template:**

```markdown
### Summary

Short description of the problem or feature.

### Background

Why this is needed.

### Scope

- In scope:
- Out of scope:

### Acceptance Criteria

- [ ] Condition 1 (testable)
- [ ] Condition 2 (testable)
- [ ] Condition 3 (testable)

### Technical Notes (if needed)

- API impact
- UI impact
- DB impact
- Dependency concerns
```

Rules:

- Issue title MUST use Title Case (capitalize first letter of each word)
- Acceptance Criteria MUST be testable
- Avoid vague wording like "improve UX" — be measurable
- Keep issue focused on ONE problem or feature
- If affects both web and API, separate requirements clearly

---

## 2. WORKFLOW RULES

### 2.1 Before every commit

Run validation commands for the affected scope:

**Web changes:**

```bash
yarn workspace @taskhub/web lint
yarn workspace @taskhub/web typecheck
yarn workspace @taskhub/web test
```

**API changes:**

```bash
yarn workspace @taskhub/api lint
yarn workspace @taskhub/api test
```

Rules:

- NEVER commit with lint warnings or failing tests
- NEVER ignore errors
- If tests cannot run, explicitly explain why

---

### 2.2 Before push

Verify:

- branch name is correct (web-_ or api-_)
- all commits follow required format
- lint passes
- tests pass
- no debug logs in code
- no unused imports

---

### 2.3 Before opening PR

Verify:

- branch name is correct
- commit messages follow format
- PR title is correct
- PR description matches template
- target branch is `develop`
- no unrelated changes included
- no large refactors mixed with feature work

---

## 3. CODE RULES

### 3.1 Import path rules

Use path aliases for shared modules, relative imports for local files.

**Preferred:**

```ts
import { Button } from "@/components/ui/button";
import { SessionWatcher } from "@/components/shared/SessionWatcher";
import { getSession } from "@/lib/session";
```

**Avoid:**

```ts
import { Button } from "../../../../components/ui/button";
import { createTask } from "../../../actions/tasks";
```

Rules:

- Always use alias imports for `@/*` modules
- Use relative imports only for adjacent files in same feature folder
- NEVER use chains like `../../../../`
- Keep import groups ordered:
  1. External packages
  2. Internal aliases (`@/...`)
  3. Local relative imports

---

### 3.2 Scope separation — CRITICAL

**Frontend work stays in `apps/web`:**

- Components, pages, layouts, actions
- Client-side utilities, hooks patterns
- UI styling, animations
- Never place API logic inside UI code

**Backend work stays in `apps/api`:**

- Resolvers, services, guards, strategies
- Database queries, business logic
- Never place UI code inside API code

Rules:

- NEVER call API endpoints directly from client components (use Server Actions)
- NEVER access private backend modules from frontend
- NEVER add UI-specific logic to backend services

---

### 3.3 File editing rules

- Edit the smallest possible scope
- Do not refactor unrelated code in same task
- Do not rename files unless required
- Do not introduce new dependencies without explaining why

---

### 3.4 GraphQL codegen

After adding/editing any `.gql` file in `graphql/queries/` or `graphql/mutations/`:

```bash
yarn workspace @taskhub/web codegen
```

Rules:

- NEVER edit `src/graphql/generated.ts` by hand
- Always regenerate after `.gql` changes
- Import types from `@/graphql/generated` only
- If codegen fails, fix the `.gql` file first

---

### 3.5 Session management (Web-specific)

Session cookies MUST always be managed together:

```ts
// Correct
createSession(token); // sets both taskhub_token + taskhub_expires
deleteSession(); // deletes both cookies

// Forbidden
cookieStore.delete("taskhub_token"); // ❌ leaves expires cookie
```

Rules:

- ALWAYS use `createSession()` / `deleteSession()` from `@/lib/session`
- NEVER delete cookies individually
- NEVER hardcode cookie names (use constants)
- `SessionWatcher` component reads `taskhub_expires`, shows 2-min warning, auto-signouts at expiry

---

## 4. UI / TAILWIND RULES

### 4.1 Tailwind utility usage

Use design tokens from config. No arbitrary values unless unavoidable.

**Preferred:**

```tsx
className = "h-12 px-4 text-sm rounded-md bg-background";
className = "space-y-4 flex items-center gap-2";
```

**Forbidden:**

```tsx
className = "h-[48px] px-[16px] text-[14px]"; // ❌ arbitrary values
className = "h-12 px-4 h-16"; // ❌ conflicting utilities
```

Rules:

- Use existing spacing: 1, 2, 3, 4, 6, 8, 12, 16, 24…
- Use existing font sizes: xs, sm, base, lg, xl, 2xl…
- Use existing radii: none, sm, md, lg…
- Check Tailwind config before writing custom class
- If value doesn't exist, add to config, don't use arbitrary value

---

### 4.2 Component reuse

Before adding new UI, check existing components in:

- `components/ui/` — shadcn primitives
- `components/shared/` — cross-feature utilities (DatePicker, FormError, SessionWatcher)

Rules:

- NEVER create duplicate components
- Reuse existing variants before creating new ones
- Extract repeated class patterns into components

---

### 4.3 Strict shadcn/ui adoption

- Use shadcn/ui primitives for all common UI patterns
- Do NOT reinvent Button, Input, Dialog, Select, etc.
- Follow shadcn structure for accessibility and consistency

---

## 5. VALIDATION RULES

Before closing/pushing any task, verify:

### 5.1 Code quality

- [ ] lint passes (`yarn workspace @taskhub/web lint`)
- [ ] tests pass (`yarn workspace @taskhub/web test`)
- [ ] no TypeScript errors (`yarn workspace @taskhub/web typecheck`)
- [ ] no unused imports
- [ ] no console.log or debugger statements

### 5.2 Repository compliance

- [ ] branch name matches format (feature/web-_ or feature/api-_)
- [ ] all commits follow required format
- [ ] PR title follows format
- [ ] PR description matches template
- [ ] target branch is `develop`
- [ ] issue is referenced in PR description

### 5.3 Styling compliance (Web)

- [ ] no arbitrary Tailwind values
- [ ] no duplicate utilities
- [ ] uses existing design tokens
- [ ] components reuse existing patterns

### 5.4 Session/Auth compliance (Web)

- [ ] session cookies managed together (both set/both deleted)
- [ ] token verified via proxy.ts
- [ ] SessionWatcher mounted on dashboard routes if new auth feature
- [ ] no hardcoded cookie names

---

## 6. RESPONSE RULES FOR AGENT

When reporting completed work, include:

**What was done:**

- Separate web vs API changes clearly
- List files modified/created

**Validation:**

- Which lint/test commands were run
- Whether they passed
- Any errors encountered and how resolved

**Exceptions:**

- If any rule could not be followed, explicitly state:
  - Which rule
  - Why it could not be followed
  - What alternative was used

---

## 7. PROJECT CONTEXT

### Tech Stack

| Layer         | Technology                                                         |
| ------------- | ------------------------------------------------------------------ |
| **Framework** | Next.js 16 (App Router, React 19)                                  |
| **Language**  | TypeScript strict                                                  |
| **Styling**   | Tailwind CSS v4 + shadcn/ui                                        |
| **GraphQL**   | graphql-request + codegen                                          |
| **Auth**      | JWT (HS256) via jose, httpOnly cookie + non-httpOnly expiry cookie |
| **Compiler**  | React Compiler (no manual useMemo/useCallback)                     |
| **Tests**     | Jest + Testing Library                                             |
| **Backend**   | Nest.js (separate `apps/api` repo)                                 |
| **Database**  | Prisma ORM                                                         |

### Folder Structure (Frontend)

```
apps/web/src/
├── proxy.ts                      # Edge auth (Next.js 16 proxy convention)
├── app/
│   ├── layout.tsx                # Root layout
│   ├── (auth)/
│   │   ├── _components/          # AppBranding, AuthCard, TermsDialog
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx            # Fetches user, renders SessionWatcher
│       ├── _components/          # TasksTable, dialogs, charts, NavLinks
│       └── dashboard/
│           ├── page.tsx          # Stats
│           ├── tasks/page.tsx    # Task list (filters, sort, pagination)
│           └── profile/page.tsx
├── actions/
│   ├── auth.ts                   # login, register, logout (server actions)
│   └── tasks.ts                  # createTask, updateTask, deleteTask
├── components/
│   ├── ui/                       # shadcn/ui primitives (zero business logic)
│   └── shared/                   # DatePicker, FormError, SessionWatcher
├── graphql/
│   ├── queries/*.gql
│   ├── mutations/*.gql
│   └── generated.ts              # Auto-generated (NEVER edit)
└── lib/
    ├── session.ts                # createSession, deleteSession, getSession
    ├── graphql.ts                # getClient(token?), getSdkClient(token?)
    ├── task-visuals.ts           # Status/priority labels & colors
    └── utils.ts
```

### Commands

```bash
yarn dev              # start dev server (root)
yarn workspace @taskhub/web build            # production build
yarn workspace @taskhub/web test             # Jest
yarn workspace @taskhub/web typecheck        # tsc --noEmit
yarn workspace @taskhub/web lint             # ESLint
yarn workspace @taskhub/web codegen          # regenerate GraphQL types
```

### Key Architecture

**Auth Flow:**

1. Login → `auth.ts` Server Action → API returns JWT
2. `createSession(token)` sets both `taskhub_token` (httpOnly) + `taskhub_expires` (public timestamp)
3. Every request → `proxy.ts` verifies token at edge
4. Expired token on protected route → redirect to login + clear cookies
5. Client-side: `SessionWatcher` reads `taskhub_expires`, shows 2-min warning, auto-signout at expiry

**Data Flow:**

```
Request
  → proxy.ts (verify JWT)
  → Server Component (getSession() → getSdkClient(token).Query())
  → Client Component ("use client") for UI only
  → Server Action mutation (getSdkClient(token).Mutation() → revalidatePath)
```

### Environment Variables

| Variable              | Where used               | Default                       |
| --------------------- | ------------------------ | ----------------------------- |
| `JWT_SECRET`          | proxy.ts, lib/session.ts | must match API                |
| `NEXT_PUBLIC_API_URL` | lib/graphql.ts           | http://localhost:4000/graphql |

### Critical Invariants — Never Break

- **Session cookies managed together** — never delete one alone
- **`generated.ts` auto-generated only** — regenerate via codegen
- **React Compiler enabled** — no manual useMemo/useCallback
- **GraphQL mutations via Server Actions only** — never from client components
- **`proxy.ts` not middleware.ts** — Next.js 16 deprecates old name
- **Component scope strict** — ui/ = primitives, shared/ = reusable, (auth)/\_components/ = auth-only, (dashboard)/\_components/ = dashboard-only
