import { InputType, Field, ID } from '@nestjs/graphql';
import { TaskStatus } from '@/tasks/entities/task.entity';

@InputType()
export class UpdateTaskStatusInput {
  @Field(() => ID)
  id!: string;

  @Field(() => TaskStatus)
  status!: TaskStatus;
}
