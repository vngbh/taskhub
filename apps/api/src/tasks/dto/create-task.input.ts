import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Priority, TaskStatus } from '@/tasks/entities/task.entity';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500)
  description?: string;

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
  @IsDate()
  deadline?: Date;
}
