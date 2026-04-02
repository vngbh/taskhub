import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { TaskStatus } from '@/tasks/entities/task.entity';
import { Priority } from '@/tasks/entities/task.entity';

export enum SortBy {
  CREATED_AT = 'createdAt',
  DEADLINE = 'deadline',
  PRIORITY = 'priority',
  TITLE = 'title',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortBy, { name: 'SortBy' });
registerEnumType(SortOrder, { name: 'SortOrder' });

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

  @Field(() => SortBy, { nullable: true })
  sortBy?: SortBy;

  @Field(() => SortOrder, { nullable: true })
  sortOrder?: SortOrder;
}
