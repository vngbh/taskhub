import { InputType, Field } from '@nestjs/graphql';
import { Priority, TaskStatus } from '@/tasks/entities/task.entity';

@InputType()
export class CreateTaskInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  priority?: Priority;

  @Field({ nullable: true })
  deadline?: Date;
}
