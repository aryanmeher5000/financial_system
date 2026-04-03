import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Role, TransactionType, AuditAction } from "../src/generated/prisma/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ... rest of your seed stays exactly the same

async function main() {
  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPass = process.env.ADMIN_PASSWORD!;
  const analystPass = process.env.ANALYST_PASSWORD!;
  const viewerPass = process.env.VIEWER_PASSWORD!;

  const [admin, analyst, viewer] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash(adminPass, 10),
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Analyst User",
        email: "analyst@example.com",
        password: await bcrypt.hash(analystPass, 10),
        role: Role.ANALYST,
      },
    }),
    prisma.user.create({
      data: {
        name: "Viewer User",
        email: "viewer@example.com",
        password: await bcrypt.hash(viewerPass, 10),
        role: Role.VIEWER,
      },
    }),
  ]);

  console.log("✅ Users seeded");

  // ─── Transactions ─────────────────────────────────────────────────────────

  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        amount: 5000.0,
        type: TransactionType.INCOME,
        category: "Salary",
        description: "Monthly salary",
        date: new Date("2024-01-01"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 200.0,
        type: TransactionType.EXPENSE,
        category: "Food",
        description: "Grocery shopping",
        date: new Date("2024-01-03"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 100.0,
        type: TransactionType.EXPENSE,
        category: "Transport",
        description: "Monthly bus pass",
        date: new Date("2024-01-05"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 3000.0,
        type: TransactionType.INCOME,
        category: "Freelance",
        description: "Web development project",
        date: new Date("2024-01-07"),
        userId: analyst.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 150.0,
        type: TransactionType.EXPENSE,
        category: "Utilities",
        description: "Electricity bill",
        date: new Date("2024-01-08"),
        userId: analyst.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 80.0,
        type: TransactionType.EXPENSE,
        category: "Food",
        description: "Restaurant dinner",
        date: new Date("2024-01-10"),
        userId: analyst.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 1200.0,
        type: TransactionType.INCOME,
        category: "Part-time",
        description: "Part time job income",
        date: new Date("2024-01-12"),
        userId: viewer.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 300.0,
        type: TransactionType.EXPENSE,
        category: "Rent",
        description: "Monthly rent",
        date: new Date("2024-01-13"),
        userId: viewer.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 50.0,
        type: TransactionType.EXPENSE,
        category: "Entertainment",
        description: "Netflix and Spotify",
        date: new Date("2024-01-14"),
        userId: viewer.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 2000.0,
        type: TransactionType.INCOME,
        category: "Bonus",
        description: "Performance bonus",
        date: new Date("2024-01-15"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 400.0,
        type: TransactionType.EXPENSE,
        category: "Shopping",
        description: "Clothes and accessories",
        date: new Date("2024-01-16"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 60.0,
        type: TransactionType.EXPENSE,
        category: "Health",
        description: "Pharmacy",
        date: new Date("2024-01-17"),
        userId: analyst.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 500.0,
        type: TransactionType.INCOME,
        category: "Investment",
        description: "Dividend income",
        date: new Date("2024-01-18"),
        userId: analyst.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 120.0,
        type: TransactionType.EXPENSE,
        category: "Transport",
        description: "Fuel expenses",
        date: new Date("2024-01-19"),
        userId: viewer.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 250.0,
        type: TransactionType.EXPENSE,
        category: "Utilities",
        description: "Internet and phone bill",
        date: new Date("2024-01-20"),
        userId: viewer.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 1500.0,
        type: TransactionType.INCOME,
        category: "Freelance",
        description: "Logo design project",
        date: new Date("2024-01-21"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 90.0,
        type: TransactionType.EXPENSE,
        category: "Food",
        description: "Weekly groceries",
        date: new Date("2024-01-22"),
        userId: admin.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 700.0,
        type: TransactionType.EXPENSE,
        category: "Rent",
        description: "Office space rent",
        date: new Date("2024-01-23"),
        userId: analyst.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 350.0,
        type: TransactionType.INCOME,
        category: "Part-time",
        description: "Tutoring income",
        date: new Date("2024-01-24"),
        userId: viewer.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 45.0,
        type: TransactionType.EXPENSE,
        category: "Entertainment",
        description: "Movie tickets",
        date: new Date("2024-01-25"),
        userId: viewer.id,
      },
    }),
  ]);

  console.log("✅ Transactions seeded");

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  await Promise.all(
    transactions.map((transaction) =>
      prisma.auditLog.create({
        data: {
          action: AuditAction.CREATE,
          entity: "Transaction",
          entityId: transaction.id,
          userId: transaction.userId,
          oldData: {},
          newData: {
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            userId: transaction.userId,
          },
        },
      }),
    ),
  );

  console.log("✅ Audit logs seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
