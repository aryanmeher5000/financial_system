import { Prisma } from "../generated/prisma/client";
import { AuditAction, TransactionType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { createTransactionSchema, updateTransactionSchema } from "../schemas/transaction.schema";
import { AppError } from "../utils/appError";

/** criterions
 * 1. category
 * 2. date
 * 3. sort
 * 4. page
 * 5. amount range
 * type
 */
const PAGE_SIZE = 10;
export async function getTransactionsByCriteria(
  category: string | undefined = undefined,
  type: TransactionType | undefined = undefined,
  dateFrom: Date | undefined = undefined,
  dateTo: Date | undefined = undefined,
  amountMin: number | undefined = undefined,
  amountMax: number | undefined = undefined,
  sortBy: "date" | "amount" | "createdAt" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  page: number = 1,
) {
  const where: Prisma.TransactionWhereInput = {
    isDeleted: false,
    ...(category && { category }),
    ...(type && { type }),
    ...((dateFrom || dateTo) && {
      date: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    }),
    ...((amountMin || amountMax) && {
      amount: {
        ...(amountMin && { gte: amountMin }),
        ...(amountMax && { lte: amountMax }),
      },
    }),
  };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        amount: true,
        category: true,
        type: true,
        description: true,
        date: true,
        createdAt: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getTransactionById(transactionId: number) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId, isDeleted: false },
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      description: true,
      date: true,
      createdAt: true,
    },
  });
  if (transaction) throw new AppError("Transaction not found", 404);

  return transaction;
}

export async function getCategories() {}

export async function createTransaction(
  amount: number,
  category: string,
  type: TransactionType,
  description: string | undefined,
  date: Date,
  adminId: number,
) {
  const { success, error } = createTransactionSchema.safeParse({ amount, category, type, description, date });
  if (!success) throw new AppError(error.issues[0].message, 400);

  // trimming and lowercasing so categories duplication can be avoided
  const transaction = await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: { amount, category: category.trim().toLowerCase(), type, description, date, userId: adminId },
      select: {
        id: true,
        amount: true,
        category: true,
        type: true,
        description: true,
        date: true,
        createdAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entity: "Transaction",
        entityId: newTransaction.id,
        userId: adminId,
        oldData: {},
        newData: { amount, category, type, description, date },
      },
    });

    return newTransaction;
  });

  return transaction;
}

export async function updateTransaction(
  transactionId: number,
  adminId: number,
  amount?: number,
  type?: TransactionType,
  category?: string,
  description?: string,
  date?: Date,
) {
  const {
    success,
    error,
    data: parsed,
  } = updateTransactionSchema.safeParse({
    amount,
    type,
    category,
    description,
    date,
  });
  if (!success) throw new AppError(error.issues[0].message, 400);

  const data = Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== undefined));
  if (Object.keys(data).length === 0) throw new AppError("No fields to update", 400);

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId, isDeleted: false },
  });
  if (!transaction) throw new AppError("Transaction not found", 404);

  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id: transactionId, isDeleted: false },
      data,
      select: { id: true, amount: true, category: true, type: true, description: true, date: true, createdAt: true },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: "Transaction",
        entityId: transactionId,
        userId: adminId,
        oldData: Object.fromEntries(Object.keys(data).map((key) => [key, transaction[key as keyof typeof transaction]])),
        newData: data,
      },
    });

    return updated;
  });

  return updatedTransaction;
}

export async function deleteTransaction(transactionId: number, adminId: number) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId, isDeleted: false } });
  if (!transaction) throw new AppError("Transaction not found", 404);

  const deletedTransaction = await prisma.$transaction(async (tx) => {
    const deleted = await tx.transaction.update({
      where: { id: transactionId, isDeleted: false },
      data: { isDeleted: true },
      select: {
        id: true,
        amount: true,
        category: true,
        type: true,
        description: true,
        date: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entity: "Transaction",
        entityId: transactionId,
        userId: adminId,
        oldData: { isDeleted: false },
        newData: { isDeleted: true },
      },
    });

    return deleted;
  });

  return deletedTransaction;
}
