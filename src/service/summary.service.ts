import { Decimal } from "@prisma/client/runtime/client";
import { TransactionType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

/**
 * take in as input the datefrom and dateto and we can do a lot of things
 * 1. list total income + expense + net balance
 * 2. category wise totals
 * 3. frequent expenses top 5
 * 4. largest expenses top 5
 */
const round = (n: number) => parseFloat(n.toFixed(2));
const toNum = (d: Decimal) => round(d.toNumber());

export async function generateSummary(dateFrom: Date, dateTo: Date) {
  const data = await prisma.transaction.findMany({
    where: { isDeleted: false, date: { gte: dateFrom, lte: dateTo } },
    select: {
      id: true,
      amount: true,
      category: true,
      date: true,
      createdAt: true,
      type: true,
    },
  });

  if (!data.length) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      categoryTotals: {},
      frequentExpenses: [],
      largestExpenses: [],
      avgIncome: null,
      avgExpense: null,
      savingsRate: null,
      spendingByDayOfWeek: {},
      topSpendingCategory: null,
      transactionCount: { total: 0, income: 0, expense: 0 },
      message: "No transactions found for the given date range",
    };
  }

  const totalIncomeTransaction = data.filter((d) => d.type === TransactionType.INCOME);
  const totalExpenseTransaction = data.filter((d) => d.type === TransactionType.EXPENSE);

  const totalIncome = round(totalIncomeTransaction.reduce((acc, d) => acc + toNum(d.amount), 0));
  const totalExpense = round(totalExpenseTransaction.reduce((acc, d) => acc + toNum(d.amount), 0));
  const netBalance = round(totalIncome - totalExpense);

  // Category-wise totals
  const categoryTotals = Object.fromEntries(
    Object.entries(
      data.reduce<Record<string, number>>((acc, d) => {
        if (!d.category) return acc;
        acc[d.category] = (acc[d.category] ?? 0) + toNum(d.amount);
        return acc;
      }, {}),
    ).map(([k, v]) => [k, round(v)]),
  );

  // Top 5 most frequent expenses
  const frequentExpenses = totalExpenseTransaction.length
    ? Object.entries(
        totalExpenseTransaction.reduce<Record<string, number>>((acc, d) => {
          if (!d.category) return acc;
          acc[d.category] = (acc[d.category] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }))
    : [];

  // Top 5 largest expenses
  const largestExpenses = totalExpenseTransaction.length
    ? [...totalExpenseTransaction]
        .sort((a, b) => toNum(b.amount) - toNum(a.amount))
        .slice(0, 5)
        .map((d) => ({ ...d, amount: toNum(d.amount) }))
    : [];

  // Averages
  const avgIncome = totalIncomeTransaction.length ? round(totalIncome / totalIncomeTransaction.length) : null;
  const avgExpense = totalExpenseTransaction.length ? round(totalExpense / totalExpenseTransaction.length) : null;

  // Savings rate
  const savingsRate = totalIncome > 0 ? round(((totalIncome - totalExpense) / totalIncome) * 100) : null;

  // Spending by day of week
  const spendingByDayOfWeek = totalExpenseTransaction.reduce<Record<number, number>>((acc, d) => {
    const day = new Date(d.date).getDay();
    acc[day] = round((acc[day] ?? 0) + toNum(d.amount));
    return acc;
  }, {});

  // Top spending category
  const topSpendingCategory = Object.keys(categoryTotals).length
    ? (() => {
        const [category, amount] = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
        return { category, amount };
      })()
    : null;

  const transactionCount = {
    total: data.length,
    income: totalIncomeTransaction.length,
    expense: totalExpenseTransaction.length,
  };

  return {
    totalIncome,
    totalExpense,
    netBalance,
    categoryTotals,
    frequentExpenses,
    largestExpenses,
    avgIncome,
    avgExpense,
    savingsRate,
    spendingByDayOfWeek,
    topSpendingCategory,
    transactionCount,
  };
}
