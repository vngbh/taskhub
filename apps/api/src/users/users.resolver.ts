import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/entities/user.entity';
import type { User as PrismaUser } from '@prisma/client';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll(): Promise<PrismaUser[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PrismaUser | null> {
    return this.usersService.findById(id);
  }
}
