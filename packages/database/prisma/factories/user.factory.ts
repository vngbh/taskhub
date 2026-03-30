import { faker } from "@faker-js/faker";
import { Role } from "@prisma/client";

interface CreateUserInput {
  overrides?: {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
  };
}

export function createUser(input: CreateUserInput = {}) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    role: Role.USER,
    ...input.overrides,
  };
}

export function createAdmin(overrides?: CreateUserInput["overrides"]) {
  return createUser({ overrides: { ...overrides, role: Role.ADMIN } });
}
