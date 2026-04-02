import { Module } from '@nestjs/common';
import { TasksService } from '@/tasks/tasks.service';
import { TasksResolver } from '@/tasks/tasks.resolver';

@Module({
  providers: [TasksService, TasksResolver],
})
export class TasksModule {}
