---
name: taskhub-project-conventions
description: Use this skill when working on the taskhub monorepo to follow project structure, Git, branch, commit, pull request, and documentation conventions.
---

# taskhub Project Conventions

Use this file as the working agreement for every task in this repository. Before changing code, read the current project structure and keep this file updated when the structure changes.

## Language Convention

Use English across the entire project:

- Write documentation, `SKILL.md` files, comments, commit messages, branch names, PR titles, and PR descriptions in English.
- Spell the product name as `taskhub` in lowercase everywhere, including headings, user-facing copy, documentation, branch names, and PR titles.
- Write code identifiers, file names, folders, test names, and fixtures in English.
- Use English as the default user-facing product copy unless a task is explicitly about localization.
- Avoid emojis in project documentation, including README files, tables, headings, and generated table of contents entries.
- If a task finds Vietnamese or any other non-English project text outside an explicit localization context, propose converting it to English in the same PR.

## Project Structure

Current structure:

```text
taskhub/
├── .gitignore
├── SKILL.md
├── README.md
├── turbo.json
├── package.json
├── yarn.lock
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.dev
├── apollo.config.cjs
├── .graphqlrc.yml
├── .env.example
├── .env.container.example
├── apps/
│   ├── api/
│   │   ├── SKILL.md
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── tasks/
│   │   │   ├── users/
│   │   │   ├── prisma/
│   │   │   ├── common/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── schema.gql
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── test/
│   └── web/
│       ├── SKILL.md
│       ├── AGENTS.md
│       ├── CLAUDE.md
│       └── src/
│           ├── proxy.ts
│           ├── app/
│           ├── actions/
│           ├── components/
│           ├── graphql/
│           └── lib/
```

## Skill Routing

Use the smallest relevant skill context for each task:

- Always start with the root `SKILL.md` for repository-wide rules.
- Then read only the local `SKILL.md` files for folders touched by the task.
- Treat local skill files as the source of truth for their area; do not rely on the root skill for area-specific details.
- If a change affects multiple areas, read each affected local skill before editing that area.
- If a task changes an area's structure, workflow, or recurring convention, update that area's local `SKILL.md` in the same PR.
- If a local change also affects repository-wide workflow, structure, language, or Git behavior, update the root `SKILL.md` too.
- Keep the root `SKILL.md` focused on routing and cross-repository rules so future tasks spend less context on irrelevant details.
- Do not duplicate detailed local rules in the root skill unless they apply across the whole repository.

Routing map:

```text
apps/api/**          -> apps/api/SKILL.md
apps/web/**          -> apps/web/SKILL.md
README.md            -> root SKILL.md
turbo.json           -> root SKILL.md
docker-compose.yml   -> root SKILL.md
package.json (root)  -> root SKILL.md
```

Folder responsibilities:

- `apps/api`: NestJS GraphQL backend — resolvers, services, guards, Prisma schema, migrations.
- `apps/web`: Next.js 16 App Router frontend — pages, server actions, components, GraphQL codegen.

## Code Quality

Follow clean code principles for every change:

- Prefer small, focused types and functions with clear names.
- Keep one responsibility per module, service, resolver, or component.
- Avoid duplicating business logic; extract shared calculation logic into services.
- Keep business rules out of UI components when they can live in testable code.
- Prefer readable code over clever code.
- Delete dead code instead of leaving commented-out blocks.
- Add comments only when the intent is not obvious from the code itself.
- Preserve existing project style unless there is a strong reason to improve it.
- When a change becomes too large, split it into smaller tasks or PRs.

## Path and Import Hygiene

- Use path aliases (`@/*`) for shared modules; use relative imports only for adjacent files in the same folder.
- Never use chains like `../../../../`.
- Do not hard-code environment-specific paths inside app code.
- Keep imports minimal; remove unused imports when touching a file.
- In docs, use paths from the repository root, for example `apps/web/src/lib/session.ts`.

## Git Workflow

Every task must be done on its own branch and completed through a pull request. Never push task changes directly to `main`.

Rules:

- `main` is protected and must only receive changes through merged pull requests.
- Do not commit task work directly on `main`.
- Start each task from the latest `main`.
- Open a PR for every task, even documentation-only work.
- Merge PRs before starting dependent work when possible.
- Delete local and remote task branches after their PRs are merged.
- Frontend and backend work MUST use separate branches; never mix them in the same branch.

Branch naming:

```text
feature/web-short-task-name
feature/api-short-task-name
fix/web-short-bug-name
fix/api-short-bug-name
docs/short-doc-name
refactor/web-short-name
refactor/api-short-name
test/web-short-name
test/api-short-name
chore/short-maintenance-name
ci/short-ci-name
```

Examples:

```text
feature/web-add-task-filters
feature/api-add-pagination
fix/web-session-expiry-redirect
fix/api-rounding-split-total
docs/update-skill-conventions
refactor/web-extract-session-logic
test/api-add-auth-guard-tests
chore/update-dependencies
```

Before starting a task:

```sh
git status --short --branch
git switch main
git pull --ff-only
git switch -c feature/web-short-task-name
```

## Multi-PR Workflow

When several branches or PRs are created in one work session, keep the flow simple and predictable.

Prefer independent PRs into `main`:

- Split work into independent branches only when each branch can be reviewed and merged on its own.
- Base each independent branch on the latest `main`.
- Open each independent PR against `main`.
- Merge independent PRs one at a time after review.

Use stacked PRs only when a later task truly depends on an earlier unmerged task:

- Make the dependency explicit in the PR body.
- Base the dependent PR on the branch it depends on.
- Merge from the bottom of the stack upward.
- After a base PR merges into `main`, immediately rebase or retarget dependent PRs onto the latest `main`.

Recommended order for one session:

1. Create branch from latest `main`.
2. Implement one task.
3. Commit using the commit convention.
4. Push the branch.
5. Open a PR.
6. Merge the PR before starting dependent work when practical.
7. Pull latest `main`.
8. Delete merged local and remote branches.
9. Start the next task from updated `main`.

## Commit Convention

Commit messages must follow:

```text
type/scope-ticket: message
```

Allowed types:

- `feat`: new feature or user-facing capability.
- `fix`: bug fix.
- `docs`: documentation-only change.
- `style`: formatting or visual polish without behavior changes.
- `refactor`: code restructuring without changing behavior.
- `test`: adding or updating tests.
- `chore`: maintenance, project settings, dependency or tooling changes.
- `ci`: continuous integration workflows and checks.
- `perf`: performance improvement without changing behavior.
- `revert`: revert a previous commit.

Scope is `web` or `api` followed by a feature area and optional ticket id.

Examples:

```text
feat/web-auth-123: add session expiry warning modal
fix/web-dashboard-456: correct filter reset behavior
refactor/api-users-789: simplify role assignment
docs/web-abc: update SKILL.md conventions
test/api-tasks: add pagination edge case tests
chore/deps: update prisma to latest
```

Rules:

- MUST include scope (web/api).
- MUST be lowercase after the colon unless a proper noun.
- MUST be concise (under 60 characters preferred).
- NEVER use vague messages like "update code" or "fix bug".

## Pull Request Convention

Each task must open a pull request before merging to `main`.

PR title format:

```text
[Scope - Area] Action Summary
```

Use Title Case for the content part: capitalize the first letter of each important word.

Examples:

```text
[Web - Auth] Add Auto-Signout On Token Expiry
[Web - Tasks] Fix Pagination Reset On Filter Change
[Api - Users] Refactor Role Assignment Logic
[Docs] Update SKILL.md Conventions
```

PR body format:

```markdown
Resolving <ISSUE_URL>

## Summary

Short explanation of what changed and why (2–3 lines max).

## Changes

- Backend: [list changes or N/A]
- Frontend: [list changes or N/A]
- Important logic: [describe if applicable]

## Technical Notes (if needed)

- DB migration
- API contract change
- Breaking change
- Performance impact

## Testing

- What was tested (web/api/both)
- Regression test added or N/A
```

Rules:

- English only; no long prose.
- No signature or "Requested by".
- Keep `Summary` concise and user-facing.
- Use `Changes` for concrete implementation notes.
- Do not merge a PR if the app does not build or relevant tests fail.

Merge method:

- Use a normal merge commit when merging PRs into `main`.
- Do not use squash merge or rebase merge by default.
- Keep the PR branch visible in the Git graph so each task branch and merge point remains traceable.

## Pre-PR Checklist

Run these before opening a PR:

**Web changes:**

```sh
yarn workspace @taskhub/web lint
yarn workspace @taskhub/web typecheck
yarn workspace @taskhub/web test
```

**API changes:**

```sh
yarn workspace @taskhub/api lint
yarn workspace @taskhub/api test
```

Always check the diff before committing:

```sh
git status --short --branch
git diff
```

Verify before push:

- Branch name is correct (`web-*` or `api-*`).
- All commits follow the required format.
- No debug logs or unused imports.
- No unrelated changes included.

## Generated File Hygiene

- Keep generated build outputs, user-specific IDE state, and local environment files out of Git.
- Prefer updating `.gitignore` when repeated generated files appear in `git status`.
- Do not ignore source files, shared project configuration, assets, fixtures, or documentation needed by other developers.
- Never edit `apps/web/src/graphql/generated.ts` by hand; always regenerate via codegen.

## Continuous Learning Rule

Capture useful lessons directly in the appropriate skill file:

- If a task reveals a better workflow, convention, or recurring mistake, propose updating the relevant `SKILL.md`.
- Use the root `SKILL.md` for repository-wide lessons (Git workflow, PRs, language, structure, validation).
- Use a local `SKILL.md` for lessons that only affect one area.
- Include skill updates in the same PR as the work that taught the lesson unless the user asks to split documentation separately.
- Keep skill updates concise, actionable, and written as rules future agents can follow.

Structure change rule:

- If a task adds, removes, renames, or moves a folder in the project, propose an update to this `SKILL.md`.
- If a task only edits implementation inside the existing structure, no structure update is required unless the change reveals that the current convention is misleading.
