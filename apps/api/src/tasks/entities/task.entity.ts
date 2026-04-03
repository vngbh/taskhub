import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

registerEnumType(TaskStatus, { name: 'TaskStatus' });
registerEnumType(Priority, { name: 'Priority' });

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field({ nullable: true })
  deadline?: Date;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
