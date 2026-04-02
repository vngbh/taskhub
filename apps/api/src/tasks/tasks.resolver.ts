import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskStats } from './entities/task-stats.entity';
import { CreateTaskInput } from '@/tasks/dto/create-task.input';
import { UpdateTaskInput } from '@/tasks/dto/update-task.input';
import { UpdateTaskStatusInput } from '@/tasks/dto/update-task-status.input';
import { TaskFilterInput } from '@/tasks/dto/task-filter.input';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import type { Task as PrismaTask } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { name: 'tasks' })
  findAll(
    @CurrentUser() user: User,
    @Args('filter', { type: () => TaskFilterInput, nullable: true })
    filter?: TaskFilterInput,
  ): Promise<PrismaTask[]> {
    return this.tasksService.findAll(user.id, filter);
  }

  @Query(() => TaskStats, { name: 'taskStats' })
  getStats(@CurrentUser() user: User): Promise<TaskStats> {
    return this.tasksService.getStats(user.id);
  }

  @Query(() => Task, { name: 'task', nullable: true })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<PrismaTask | null> {
    return this.tasksService.findById(id, user.id);
  }

  @Mutation(() => Task)
  createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: User,
  ): Promise<PrismaTask> {
    return this.tasksService.create(user.id, input);
  }

  @Mutation(() => Task)
  updateTask(@Args('input') input: UpdateTaskInput, @CurrentUser() user: User) {
    return this.tasksService.update(user.id, input);
  }

  @Mutation(() => Task)
  updateTaskStatus(
    @Args('input') input: UpdateTaskStatusInput,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.updateStatus(user.id, input);
  }

  @Mutation(() => Boolean)
  deleteTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.remove(user.id, id);
  }
}
