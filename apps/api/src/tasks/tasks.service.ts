import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTaskInput } from '@/tasks/dto/create-task.input';
import { UpdateTaskInput } from '@/tasks/dto/update-task.input';
import { UpdateTaskStatusInput } from '@/tasks/dto/update-task-status.input';
import { TaskFilterInput } from '@/tasks/dto/task-filter.input';
import { TaskStatus, Priority } from '@/tasks/entities/task.entity';
import {
  Prisma,
  TaskStatus as PrismaTaskStatus,
  Priority as PrismaPriority,
} from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, filter?: TaskFilterInput) {
    const where: Prisma.TaskWhereInput = { userId };

    if (filter?.status)
      where.status = filter.status as unknown as PrismaTaskStatus;
    if (filter?.priority)
      where.priority = filter.priority as unknown as PrismaPriority;
    if (filter?.deadlineBefore || filter?.deadlineAfter) {
      where.deadline = {};
      if (filter.deadlineBefore)
        (where.deadline as Prisma.DateTimeNullableFilter).lte =
          filter.deadlineBefore;
      if (filter.deadlineAfter)
        (where.deadline as Prisma.DateTimeNullableFilter).gte =
          filter.deadlineAfter;
    }

    return this.prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  create(userId: string, input: CreateTaskInput) {
    return this.prisma.task.create({
      data: {
        ...input,
        status: (input.status ??
          TaskStatus.TODO) as unknown as PrismaTaskStatus,
        priority: (input.priority ??
          Priority.MEDIUM) as unknown as PrismaPriority,
        userId,
      },
    });
  }

  async update(userId: string, input: UpdateTaskInput) {
    await this.findById(input.id, userId);
    const { id, ...data } = input;
    return this.prisma.task.update({ where: { id }, data });
  }

  async updateStatus(userId: string, input: UpdateTaskStatusInput) {
    await this.findById(input.id, userId);
    return this.prisma.task.update({
      where: { id: input.id },
      data: { status: input.status as unknown as PrismaTaskStatus },
    });
  }

  async remove(userId: string, id: string) {
    await this.findById(id, userId);
    await this.prisma.task.delete({ where: { id } });
    return true;
  }
}
