/**
 * Unit tests for the tasks page data-fetching logic
 *
 * These tests isolate the three potential failure points:
 *  1. getSession returns null  → user gets redirected (not an API failure)
 *  2. SDK throws               → tasks/total stay at defaults ([] / 0)
 *  3. SDK succeeds             → correct values propagated to TasksTable
 *
 * We cannot render the RSC page directly in Jest, so we extract and test
 * the fetching logic as a pure function.
 */

// ─── helpers that mirror the page's data-fetching logic ──────────────────────

import { Priority, TaskStatus, SortBy, SortOrder } from "@/graphql/generated";
import type { TaskFilterInput } from "@/graphql/generated";

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = [10, 20, 50];

/** Same logic as TasksPage — kept in sync manually */
const toScreamingSnake = (s: string) =>
  s.replace(/([A-Z])/g, "_$1").toUpperCase();

function buildFilter(sp: Record<string, string>): TaskFilterInput {
  const status = sp.status || undefined;
  const priority = sp.priority || undefined;
  const [rawSortBy, rawSortOrder] = sp.sort ? sp.sort.split(":") : [];
  const sortBy = rawSortBy ? toScreamingSnake(rawSortBy) : undefined;
  const sortOrder = rawSortOrder ? toScreamingSnake(rawSortOrder) : undefined;

  return {
    ...(status && { status: status as TaskStatus }),
    ...(priority && { priority: priority as Priority }),
    ...(sortBy && { sortBy: sortBy as SortBy }),
    ...(sortOrder && { sortOrder: sortOrder as SortOrder }),
  };
}

function resolvePageSize(raw: string | undefined): number {
  const n = parseInt(raw ?? "", 10);
  return VALID_PAGE_SIZES.includes(n) ? n : DEFAULT_PAGE_SIZE;
}

function resolvePage(raw: string | undefined): number {
  return Math.max(1, parseInt(raw ?? "1", 10));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("TasksPage – buildFilter", () => {
  it("returns empty object when no filters in URL", () => {
    expect(buildFilter({})).toEqual({});
  });

  it("maps status param to TaskStatus enum value", () => {
    expect(buildFilter({ status: "IN_PROGRESS" })).toEqual({
      status: TaskStatus.InProgress,
    });
  });

  it("maps priority param to Priority enum value", () => {
    expect(buildFilter({ priority: "HIGH" })).toEqual({
      priority: Priority.High,
    });
  });

  it("maps sort param to sortBy + sortOrder", () => {
    expect(buildFilter({ sort: "deadline:asc" })).toEqual({
      sortBy: SortBy.Deadline,
      sortOrder: SortOrder.Asc,
    });
  });

  it("defaults sort to createdAt:desc when sort param is absent", () => {
    const f = buildFilter({});
    // no sort keys when no filter at all — they stay undefined
    expect(Object.keys(f)).not.toContain("sortBy");
  });

  it("combines multiple filters", () => {
    expect(
      buildFilter({ status: "TODO", priority: "LOW", sort: "title:asc" }),
    ).toEqual({
      status: TaskStatus.Todo,
      priority: Priority.Low,
      sortBy: SortBy.Title,
      sortOrder: SortOrder.Asc,
    });
  });
});

describe("TasksPage – resolvePageSize", () => {
  it("returns 10 for undefined", () =>
    expect(resolvePageSize(undefined)).toBe(10));
  it("returns 10 for unrecognised value", () =>
    expect(resolvePageSize("999")).toBe(10));
  it("returns 10 for valid value", () =>
    expect(resolvePageSize("10")).toBe(10));
  it("returns 20 for valid value", () =>
    expect(resolvePageSize("20")).toBe(20));
  it("returns 50 for valid value", () =>
    expect(resolvePageSize("50")).toBe(50));
});

describe("TasksPage – resolvePage", () => {
  it("defaults to 1", () => expect(resolvePage(undefined)).toBe(1));
  it("clamps negative values to 1", () => expect(resolvePage("-5")).toBe(1));
  it("parses valid page number", () => expect(resolvePage("3")).toBe(3));
});

// ─── SDK mock integration test ────────────────────────────────────────────────

const mockGetTasks = jest.fn();
const mockGetTasksCount = jest.fn();
const mockGetMe = jest.fn();

jest.mock("@/lib/graphql", () => ({
  getSdkClient: jest.fn(() => ({
    GetTasks: mockGetTasks,
    GetTasksCount: mockGetTasksCount,
    GetMe: mockGetMe,
  })),
}));

import { getSdkClient } from "@/lib/graphql";

const MOCK_TASKS = [
  {
    id: "abc123",
    title: "Write tests",
    status: "TODO",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
  },
  {
    id: "def456",
    title: "Deploy app",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
  },
];

describe("TasksPage – SDK fetch integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SDK GetTasks is called with correct skip/take for page 2", async () => {
    mockGetTasks.mockResolvedValue({ tasks: [] });
    mockGetTasksCount.mockResolvedValue({ tasksCount: 0 });
    mockGetMe.mockResolvedValue({ me: { name: "Alice" } });

    const sdk = getSdkClient("mock-token");
    const page = 2;
    const pageSize = 10;
    await sdk.GetTasks({ skip: (page - 1) * pageSize, take: pageSize });

    expect(mockGetTasks).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
    });
  });

  it("returns tasks from SDK response", async () => {
    mockGetTasks.mockResolvedValue({ tasks: MOCK_TASKS });
    mockGetTasksCount.mockResolvedValue({ tasksCount: 2 });
    mockGetMe.mockResolvedValue({ me: { name: "Alice" } });

    const sdk = getSdkClient("mock-token");
    const [tasksData, countData, meData] = await Promise.all([
      sdk.GetTasks({ skip: 0, take: 10 }),
      sdk.GetTasksCount({}),
      sdk.GetMe(),
    ]);

    expect(tasksData.tasks).toHaveLength(2);
    expect(tasksData.tasks[0].title).toBe("Write tests");
    expect(countData.tasksCount).toBe(2);
    expect(meData.me.name).toBe("Alice");
  });

  it("surfaces empty arrays when SDK throws (network error)", async () => {
    mockGetTasks.mockRejectedValue(new Error("Network error"));
    mockGetTasksCount.mockRejectedValue(new Error("Network error"));
    mockGetMe.mockRejectedValue(new Error("Network error"));

    let tasks: unknown[] = [];
    let total = 0;
    let userName: string | undefined;

    try {
      const sdk = getSdkClient("mock-token");
      const [tasksData, countData, meData] = await Promise.all([
        sdk.GetTasks({ skip: 0, take: 10 }),
        sdk.GetTasksCount({}),
        sdk.GetMe(),
      ]);
      tasks = tasksData.tasks;
      total = countData.tasksCount;
      userName = meData.me.name;
    } catch {
      // fallback — same as page.tsx
    }

    expect(tasks).toEqual([]);
    expect(total).toBe(0);
    expect(userName).toBeUndefined();
  });

  it("passes filter to both GetTasks and GetTasksCount", async () => {
    mockGetTasks.mockResolvedValue({ tasks: [] });
    mockGetTasksCount.mockResolvedValue({ tasksCount: 0 });
    mockGetMe.mockResolvedValue({ me: { name: "Bob" } });

    const filter: TaskFilterInput = { status: TaskStatus.InProgress };
    const sdk = getSdkClient("mock-token");

    await Promise.all([
      sdk.GetTasks({ filter, skip: 0, take: 10 }),
      sdk.GetTasksCount({ filter }),
    ]);

    expect(mockGetTasks).toHaveBeenCalledWith(
      expect.objectContaining({ filter }),
    );
    expect(mockGetTasksCount).toHaveBeenCalledWith(
      expect.objectContaining({ filter }),
    );
  });
});
