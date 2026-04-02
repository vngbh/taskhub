import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { AuthPayload } from '@/auth/dto/auth-payload.type';
import { RegisterInput } from '@/auth/dto/register.input';
import { LoginInput } from '@/auth/dto/login.input';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'me' })
  me(@CurrentUser() user: User) {
    return user;
  }
}
