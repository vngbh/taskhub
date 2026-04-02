import { faker } from '@faker-js/faker';
import { Priority, TaskStatus } from '@prisma/client';

// ─── Realistic task titles grouped by domain ──────────────────────────────────

const TASK_TEMPLATES = [
  // Engineering
  'Refactor {module} module to use dependency injection',
  'Write unit tests for {module} service',
  'Fix memory leak in {module} handler',
  'Migrate {module} to TypeScript strict mode',
  'Add OpenAPI docs for {module} endpoints',
  'Optimize {module} database queries',
  'Set up CI pipeline for {module}',
  'Review pull request for {module} feature',
  'Update {module} dependencies to latest versions',
  'Implement rate limiting on {module} API',
  // Product / Design
  'Design wire frames for {module} page',
  'Conduct user research on {module} flow',
  'Create A/B test plan for {module} onboarding',
  'Update {module} copy based on feedback',
  'Audit accessibility issues on {module} screen',
  // Data / Analytics
  'Build dashboard report for {module} metrics',
  'Investigate drop in {module} conversion rate',
  'Export {module} data to analytics warehouse',
  'Define KPIs for {module} initiative',
  // General / Dev-ops
  'Deploy {module} service to staging',
  'Rotate API keys for {module} integration',
  'Document runbook for {module} incident response',
  'Schedule post-mortem for {module} outage',
  'Onboard new team member to {module} codebase',
];

const MODULES = [
  'auth',
  'notifications',
  'billing',
  'dashboard',
  'tasks',
  'users',
  'reporting',
  'search',
  'webhook',
  'email',
  'admin panel',
  'file uploads',
  'integrations',
  'settings',
];

const DESCRIPTIONS = [
  'This task is part of the Q{quarter} {year} roadmap. Acceptance criteria defined in Notion.',
  'Tracked in sprint {sprint}. Blocks the {module} release.',
  "Raised by the {team} team during last week's retro. Low risk, high impact.",
  'See the related Jira ticket for full context and edge cases to cover.',
  'Prerequisite for the upcoming {module} launch. Coordinate with design before closing.',
  'Follow the existing patterns in the codebase and add a changelog entry.',
  'Include smoke tests and update the README once done.',
  undefined, // 1-in-8 chance of no description
];

function pickTitle(): string {
  const template = faker.helpers.arrayElement(TASK_TEMPLATES);
  const module = faker.helpers.arrayElement(MODULES);
  return template.replace('{module}', module);
}

function pickDescription(): string | undefined {
  const tpl = faker.helpers.arrayElement(DESCRIPTIONS);
  if (!tpl) return undefined;
  return tpl
    .replace('{quarter}', String(faker.number.int({ min: 1, max: 4 })))
    .replace('{year}', String(faker.date.recent({ days: 365 }).getFullYear()))
    .replace('{sprint}', String(faker.number.int({ min: 1, max: 20 })))
    .replace('{module}', faker.helpers.arrayElement(MODULES))
    .replace(
      '{team}',
      faker.helpers.arrayElement(['product', 'engineering', 'design', 'data']),
    );
}

// ─── Weighted priority distribution ──────────────────────────────────────────

function weightedPriority(): Priority {
  const r = Math.random();
  if (r < 0.5) return Priority.MEDIUM; // 50%
  if (r < 0.75) return Priority.HIGH; // 25%
  return Priority.LOW; // 25%
}

// ─── Weighted status distribution ────────────────────────────────────────────

function weightedStatus(): TaskStatus {
  const r = Math.random();
  if (r < 0.4) return TaskStatus.TODO; // 40%
  if (r < 0.7) return TaskStatus.IN_PROGRESS; // 30%
  return TaskStatus.DONE; // 30%
}

// ─── Deadline logic ───────────────────────────────────────────────────────────

function pickDeadline(status: TaskStatus, createdAt: Date): Date | null {
  // Done tasks: 50% have a (past) deadline
  // Active tasks: 70% have a deadline (mix of past/future)
  const hasDead =
    status === TaskStatus.DONE
      ? faker.datatype.boolean(0.5)
      : faker.datatype.boolean(0.7);

  if (!hasDead) return null;

  const now = new Date();
  const MS = 24 * 60 * 60 * 1000;

  if (status === TaskStatus.DONE) {
    // past deadline — between created and now
    return faker.date.between({ from: createdAt, to: now });
  }

  // Active: 40% overdue, 60% future
  if (faker.datatype.boolean(0.4)) {
    return faker.date.between({
      from: new Date(now.getTime() - 60 * MS),
      to: new Date(now.getTime() - MS),
    });
  }
  return faker.date.between({
    from: new Date(now.getTime() + MS),
    to: new Date(now.getTime() + 90 * MS),
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type TaskOverrides = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  deadline?: Date | null;
  createdAt?: Date;
};

export function createTask(userId: string, overrides: TaskOverrides = {}) {
  const status = overrides.status ?? weightedStatus();
  const createdAt =
    overrides.createdAt ??
    faker.date.between({
      from: new Date('2024-01-01'),
      to: new Date(),
    });
  const deadline =
    overrides.deadline !== undefined
      ? overrides.deadline
      : pickDeadline(status, createdAt);

  return {
    title: pickTitle(),
    description: pickDescription() ?? null,
    status,
    priority: weightedPriority(),
    deadline,
    createdAt,
    userId,
    ...overrides,
  };
}

export function createTaskBatch(
  userId: string,
  count: number,
  overrides: TaskOverrides = {},
) {
  return Array.from({ length: count }, () => createTask(userId, overrides));
}
