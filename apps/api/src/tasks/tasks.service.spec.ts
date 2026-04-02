import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Priority, TaskStatus } from '@/tasks/entities/task.entity';
import { TasksService } from '@/tasks/tasks.service';
import { PrismaService } from '@/prisma/prisma.service';

type MockPrismaTask = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
};

function createPrismaMock(): PrismaService {
  return {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let prismaTask: MockPrismaTask;

  beforeEach(() => {
    prisma = createPrismaMock();
    prismaTask = prisma.task as unknown as MockPrismaTask;
    service = new TasksService(prisma);
  });

  describe('findAll', () => {
    it('builds filters and sorts by newest first', async () => {
      const deadlineBefore = new Date('2026-04-30T00:00:00.000Z');
      const deadlineAfter = new Date('2026-04-01T00:00:00.000Z');
      prismaTask.findMany.mockResolvedValue([]);

      await service.findAll('user-1', {
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        deadlineBefore,
        deadlineAfter,
      });

      expect(prismaTask.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          deadline: {
            lte: deadlineBefore,
            gte: deadlineAfter,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('throws when task does not exist', async () => {
      prismaTask.findUnique.mockResolvedValue(null);

      await expect(service.findById('task-1', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws when task belongs to another user', async () => {
      prismaTask.findUnique.mockResolvedValue({
        id: 'task-1',
        userId: 'user-2',
      });

      await expect(service.findById('task-1', 'user-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('applies default status and priority', async () => {
      prismaTask.create.mockResolvedValue({ id: 'task-1' });

      await service.create('user-1', { title: 'Write tests' });

      expect(prismaTask.create).toHaveBeenCalledWith({
        data: {
          title: 'Write tests',
          status: 'TODO',
          priority: 'MEDIUM',
          userId: 'user-1',
        },
      });
    });
  });

  describe('updateStatus', () => {
    it('updates status after ownership check', async () => {
      prismaTask.findUnique.mockResolvedValue({
        id: 'task-1',
        userId: 'user-1',
      });
      prismaTask.update.mockResolvedValue({ id: 'task-1', status: 'DONE' });

      await service.updateStatus('user-1', {
        id: 'task-1',
        status: TaskStatus.DONE,
      });

      expect(prismaTask.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { status: 'DONE' },
      });
    });
  });

  describe('remove', () => {
    it('deletes task after ownership check and returns true', async () => {
      prismaTask.findUnique.mockResolvedValue({
        id: 'task-1',
        userId: 'user-1',
      });
      prismaTask.delete.mockResolvedValue({ id: 'task-1' });

      await expect(service.remove('user-1', 'task-1')).resolves.toBe(true);
      expect(prismaTask.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });
  });

  describe('getStats', () => {
    it('returns aggregated task counts including overdue', async () => {
      prismaTask.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      await expect(service.getStats('user-1')).resolves.toEqual({
        total: 9,
        todo: 4,
        inProgress: 3,
        done: 2,
        overdue: 1,
      });

      expect(prismaTask.count).toHaveBeenNthCalledWith(1, {
        where: { userId: 'user-1', status: 'TODO' },
      });
      expect(prismaTask.count).toHaveBeenNthCalledWith(2, {
        where: { userId: 'user-1', status: 'IN_PROGRESS' },
      });
      expect(prismaTask.count).toHaveBeenNthCalledWith(3, {
        where: { userId: 'user-1', status: 'DONE' },
      });
      expect(prismaTask.count).toHaveBeenNthCalledWith(4, {
        where: {
          userId: 'user-1',
          status: { not: 'DONE' },
          deadline: { lt: expect.any(Date) },
        },
      });
    });
  });
});
