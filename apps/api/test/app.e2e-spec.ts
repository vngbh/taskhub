import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App as SupertestApp } from 'supertest/types';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { Priority, TaskStatus } from '@/tasks/entities/task.entity';
import { Role } from '@/users/entities/user.entity';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

type StoredTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('GraphQL auth + tasks (e2e)', () => {
  let app: INestApplication;
  let users: StoredUser[];
  let tasks: StoredTask[];

  const prismaMock = {
    user: {
      findUnique: jest.fn(
        async ({ where }: { where: { id?: string; email?: string } }) => {
          if (where.id) {
            return users.find((user) => user.id === where.id) ?? null;
          }
          if (where.email) {
            return (
              users.find(
                (user) =>
                  user.email.toLowerCase() === where.email?.toLowerCase(),
              ) ?? null
            );
          }
          return null;
        },
      ),
      create: jest.fn(
        async ({
          data,
        }: {
          data: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt' | 'role'> &
            Partial<Pick<StoredUser, 'role'>>;
        }) => {
          const now = new Date();
          const user: StoredUser = {
            id: `user-${users.length + 1}`,
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role ?? Role.USER,
            createdAt: now,
            updatedAt: now,
          };
          users.push(user);
          return user;
        },
      ),
    },
    task: {
      findMany: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return tasks
          .filter((task) => task.userId === where.userId)
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          );
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return tasks.find((task) => task.id === where.id) ?? null;
      }),
      create: jest.fn(
        async ({
          data,
        }: {
          data: Omit<StoredTask, 'id' | 'createdAt' | 'updatedAt'>;
        }) => {
          const now = new Date();
          const task: StoredTask = {
            id: `task-${tasks.length + 1}`,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            deadline: data.deadline ?? null,
            userId: data.userId,
            createdAt: now,
            updatedAt: now,
          };
          tasks.push(task);
          return task;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Partial<StoredTask>;
        }) => {
          const task = tasks.find((item) => item.id === where.id);
          if (!task) return null;
          Object.assign(task, data, { updatedAt: new Date() });
          return task;
        },
      ),
      delete: jest.fn(async ({ where }: { where: { id: string } }) => {
        const index = tasks.findIndex((task) => task.id === where.id);
        if (index === -1) return null;
        const [task] = tasks.splice(index, 1);
        return task;
      }),
      count: jest.fn(
        async ({
          where,
        }: {
          where: {
            userId: string;
            status?: TaskStatus | { not: TaskStatus };
            deadline?: { lt?: Date };
          };
        }) => {
          return tasks.filter((task) => {
            if (task.userId !== where.userId) return false;
            if (
              typeof where.status === 'string' &&
              task.status !== where.status
            ) {
              return false;
            }
            if (
              where.status &&
              typeof where.status === 'object' &&
              'not' in where.status &&
              task.status === where.status.not
            ) {
              return false;
            }
            if (where.deadline?.lt) {
              if (!task.deadline || !(task.deadline < where.deadline.lt)) {
                return false;
              }
            }
            return true;
          }).length;
        },
      ),
    },
  } as unknown as PrismaService;

  async function graphql<TData>(
    query: string,
    variables?: Record<string, unknown>,
    token?: string,
  ) {
    const req = request(app.getHttpServer() as SupertestApp)
      .post('/graphql')
      .send({ query, variables });
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req.expect(200) as Promise<{
      body: { data?: TData; errors?: Array<{ message: string }> };
    }>;
  }

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    users = [];
    tasks = [];
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, logs in, creates a task, and returns task stats', async () => {
    const registerMutation = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          user {
            id
            email
            name
            role
          }
        }
      }
    `;
    const loginMutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user {
            id
            email
          }
        }
      }
    `;
    const createTaskMutation = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          id
          title
          status
          priority
          userId
        }
      }
    `;
    const taskStatsQuery = `
      query TaskStats {
        taskStats {
          total
          todo
          inProgress
          done
          overdue
        }
      }
    `;

    const registerResponse = await graphql<{
      register: {
        accessToken: string;
        user: { id: string; email: string; name: string; role: Role };
      };
    }>(registerMutation, {
      input: {
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
      },
    });

    expect(registerResponse.body.errors).toBeUndefined();
    expect(registerResponse.body.data?.register.user).toMatchObject({
      email: 'user@example.com',
      name: 'Test User',
      role: 'USER',
    });

    const loginResponse = await graphql<{
      login: { accessToken: string; user: { id: string; email: string } };
    }>(loginMutation, {
      input: {
        email: 'user@example.com',
        password: 'password123',
      },
    });

    expect(loginResponse.body.errors).toBeUndefined();
    const accessToken = loginResponse.body.data?.login.accessToken;
    expect(accessToken).toBeTruthy();

    const createTaskResponse = await graphql<{
      createTask: {
        id: string;
        title: string;
        status: TaskStatus;
        priority: Priority;
        userId: string;
      };
    }>(
      createTaskMutation,
      {
        input: {
          title: 'Ship taskhub',
        },
      },
      accessToken,
    );

    expect(createTaskResponse.body.errors).toBeUndefined();
    expect(createTaskResponse.body.data?.createTask).toMatchObject({
      title: 'Ship taskhub',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: registerResponse.body.data?.register.user.id,
    });

    tasks.push({
      id: 'task-overdue',
      title: 'Old task',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      deadline: new Date('2026-01-01T00:00:00.000Z'),
      userId: registerResponse.body.data!.register.user.id,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const statsResponse = await graphql<{
      taskStats: {
        total: number;
        todo: number;
        inProgress: number;
        done: number;
        overdue: number;
      };
    }>(taskStatsQuery, undefined, accessToken);

    expect(statsResponse.body.errors).toBeUndefined();
    expect(statsResponse.body.data?.taskStats).toEqual({
      total: 2,
      todo: 1,
      inProgress: 1,
      done: 0,
      overdue: 1,
    });
  });

  it('rejects protected task operations without a token', async () => {
    const createTaskMutation = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          id
        }
      }
    `;

    const response = await graphql(createTaskMutation, {
      input: { title: 'Unauthorized task' },
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors?.[0]?.message).toContain('Unauthorized');
  });
});
