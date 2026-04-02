import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TaskStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  todo: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  done: number;

  @Field(() => Int)
  overdue: number;
}
