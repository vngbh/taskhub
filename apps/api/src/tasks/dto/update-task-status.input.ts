import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@/tasks/entities/task.entity';

@InputType()
export class UpdateTaskStatusInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field(() => TaskStatus)
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
