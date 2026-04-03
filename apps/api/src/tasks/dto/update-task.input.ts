import { InputType, Field, ID } from '@nestjs/graphql';
import { Priority, TaskStatus } from '@/tasks/entities/task.entity';

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  priority?: Priority;

  @Field({ nullable: true })
  deadline?: Date | null;
}
