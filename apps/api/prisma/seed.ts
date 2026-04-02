import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createAdmin, createUser } from "./factories/user.factory";
import { createTaskBatch } from "./factories/task.factory";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data in order (tasks first, then users)
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const SALT_ROUNDS = 10;
  const DEFAULT_PASSWORD = await bcrypt.hash("password123", SALT_ROUNDS);

  // 1. Create admin
  const adminData = createAdmin({ email: "admin@taskhub.dev", name: "Admin" });
  const admin = await prisma.user.create({
    data: {
      ...adminData,
      password: DEFAULT_PASSWORD,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Create 3 regular users
  const userSeeds = [
    createUser({
      overrides: { email: "alice@taskhub.dev", name: "Alice Nguyen" },
    }),
    createUser({ overrides: { email: "bob@taskhub.dev", name: "Bob Tran" } }),
    createUser({ overrides: { email: "carol@taskhub.dev", name: "Carol Le" } }),
  ];

  const users = await Promise.all(
    userSeeds.map(async (u) =>
      prisma.user.create({
        data: {
          ...u,
          password: DEFAULT_PASSWORD,
        },
      }),
    ),
  );
  console.log(`✅ ${users.length} users created`);

  // 3. Seed 10–15 tasks per user (including admin)
  const allUsers = [admin, ...users];

  for (const user of allUsers) {
    const taskCount = Math.floor(Math.random() * 6) + 10; // 10–15
    const tasks = createTaskBatch(user.id, taskCount);

    await prisma.task.createMany({ data: tasks });
    console.log(`  📋 ${taskCount} tasks created for ${user.email}`);
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
