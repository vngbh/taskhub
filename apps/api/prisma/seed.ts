import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createAdmin, createUser } from './factories/user.factory';
import { createTaskBatch } from './factories/task.factory';

const prisma = new PrismaClient();

// ─── Config ──────────────────────────────────────────────────────────────────

const DEFAULT_PASSWORD = 'Password123!';

const FIXED_USERS = [
  { name: 'Admin', email: 'admin@taskhub.dev', role: 'ADMIN' as const },
  { name: 'Alice Nguyen', email: 'alice@taskhub.dev' },
  { name: 'Bob Tran', email: 'bob@taskhub.dev' },
  { name: 'Carol Le', email: 'carol@taskhub.dev' },
  { name: 'David Pham', email: 'david@taskhub.dev' },
];

// Extra randomly generated users
const RANDOM_USER_COUNT = 5;

// Tasks per user: random in [min, max]
const TASKS_PER_USER = { min: 12, max: 20 };

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database…');

  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  console.log('  🗑️  Cleared existing data');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 1. Fixed users ────────────────────────────────────────────────────────────
  const fixedUserData = FIXED_USERS.map((u) => {
    const base =
      u.role === 'ADMIN'
        ? createAdmin({ name: u.name, email: u.email })
        : createUser({ name: u.name, email: u.email });
    return { ...base, password: hashedPassword };
  });

  const fixedUsers = await Promise.all(
    fixedUserData.map((data) => prisma.user.create({ data })),
  );
  console.log(`  ✅ ${fixedUsers.length} fixed users created`);

  // 2. Random users ───────────────────────────────────────────────────────────
  const randomUserData = Array.from({ length: RANDOM_USER_COUNT }, () => ({
    ...createUser(),
    password: hashedPassword,
  }));

  const randomUsers = await Promise.all(
    randomUserData.map((data) => prisma.user.create({ data })),
  );
  console.log(`  ✅ ${randomUsers.length} random users created`);

  // 3. Tasks ──────────────────────────────────────────────────────────────────
  const allUsers = [...fixedUsers, ...randomUsers];
  let totalTasks = 0;

  for (const user of allUsers) {
    const count =
      Math.floor(
        Math.random() * (TASKS_PER_USER.max - TASKS_PER_USER.min + 1),
      ) + TASKS_PER_USER.min;

    const tasks = createTaskBatch(user.id, count);
    await prisma.task.createMany({ data: tasks });
    totalTasks += count;
    console.log(`  📋 ${count} tasks → ${user.email}`);
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Users : ${allUsers.length}`);
  console.log(`   Tasks : ${totalTasks}`);
  console.log(`   Password for all accounts: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
