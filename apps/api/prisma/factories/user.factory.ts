import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

type UserOverrides = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  createdAt?: Date;
};

/**
 * Build a plain user data object (no password hashing — caller must hash before persisting).
 */
export function createUser(overrides: UserOverrides = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet
      .email({ firstName, lastName, provider: 'taskhub.dev' })
      .toLowerCase(),
    // raw placeholder — seed.ts replaces this with a bcrypt hash
    password: 'PLACEHOLDER',
    role: Role.USER,
    createdAt: faker.date.between({
      from: new Date('2024-01-01'),
      to: new Date(),
    }),
    ...overrides,
  };
}

export function createAdmin(overrides: UserOverrides = {}) {
  return createUser({ ...overrides, role: Role.ADMIN });
}
