import { Resolver } from '@nestjs/graphql';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
}
