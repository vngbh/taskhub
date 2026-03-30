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

  return {
    title: faker.hacker.phrase().slice(0, 80),
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    status: faker.helpers.arrayElement(statuses),
    priority: faker.helpers.arrayElement(priorities),
    deadline: faker.datatype.boolean(0.7)
      ? faker.date.between({
          from: new Date(),
          to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        })
      : null,
    userId: input.userId,
    ...input.overrides,
  };
}

export function createTaskBatch(userId: string, count: number) {
  return Array.from({ length: count }, () => createTask({ userId }));
}
