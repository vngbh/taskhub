import { InputType, Field } from '@nestjs/graphql';
import { TaskStatus } from '@/tasks/entities/task.entity';
import { Priority } from '@/tasks/entities/task.entity';

@InputType()
export class TaskFilterInput {
  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  priority?: Priority;

  @Field({ nullable: true })
  deadlineBefore?: Date;

  @Field({ nullable: true })
  deadlineAfter?: Date;
}
