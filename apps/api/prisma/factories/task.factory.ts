import { faker } from "@faker-js/faker";
import { Priority, TaskStatus } from "@prisma/client";

interface CreateTaskInput {
  userId: string;
  overrides?: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    deadline?: Date | null;
  };
}

export function createTask(input: CreateTaskInput) {
  const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
  const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];

  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  // 70 % have a deadline: half past (overdue), half future
  let deadline: Date | null = null;
  if (faker.datatype.boolean(0.7)) {
    deadline = faker.datatype.boolean()
      ? faker.date.between({
          from: new Date(now - 60 * MS_PER_DAY),
          to: new Date(now - MS_PER_DAY),
        })
      : faker.date.between({
          from: new Date(now + MS_PER_DAY),
          to: new Date(now + 90 * MS_PER_DAY),
        });
  }

  return {
    title: faker.hacker.phrase().slice(0, 80),
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    status: faker.helpers.arrayElement(statuses),
    priority: faker.helpers.arrayElement(priorities),
    deadline,
    userId: input.userId,
    ...input.overrides,
  };
}

export function createTaskBatch(userId: string, count: number) {
  return Array.from({ length: count }, () => createTask({ userId }));
}
