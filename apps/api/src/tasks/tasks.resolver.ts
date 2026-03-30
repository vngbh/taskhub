import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { name: 'tasks' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Query(() => Task, { name: 'task', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.findById(id);
  }
}
