import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { Priority, TaskStatus } from '@/tasks/entities/task.entity';

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field(() => String, { nullable: true })
  @ValidateIf((o) => o.deadline !== null)
  @IsOptional()
  @IsDate()
  deadline?: Date | null;
}
