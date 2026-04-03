import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
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
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadlineBefore?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadlineAfter?: Date;

  @Field(() => SortBy, { nullable: true })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
