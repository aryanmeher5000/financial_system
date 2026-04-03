import { Request, Response } from "express";
import { getTransactionsCriteriaSchema } from "../schemas/transaction.schema";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactionsByCriteria,
  updateTransaction,
} from "../service/transaction.service";
import { AppError } from "../utils/appError";
import extractId from "../utils/extractId";

export async function getTransactionsByCriteriaController(req: Request, res: Response) {
  const { success, error, data } = getTransactionsCriteriaSchema.safeParse(req.query);
  if (!success) throw new AppError(error.issues[0].message, 400);

  const result = await getTransactionsByCriteria(
    data.category,
    data.type,
    data.dateFrom,
    data.dateTo,
    data.amountMin,
    data.amountMax,
    data.sortBy,
    data.sortOrder,
    data.page,
  );

  res.status(200).json({ data: result });
}

export async function getTransactionByIdContoller(req: Request, res: Response) {
  const transactionId = extractId("transaction", req.params.id);
  const transaction = await getTransactionById(transactionId);
  res.status(200).json({ data: { transaction } });
}

export async function createTransactionController(req: Request, res: Response) {
  const { amount, category, type, description, date } = req.body;
  const userId = req.user.sub;
  const transaction = await createTransaction(amount, category, type, description, new Date(date), userId);
  res.status(201).json({ data: { transaction } });
}

export async function updateTransactionController(req: Request, res: Response) {
  const transactionId = extractId("transaction", req.params.id);
  const adminId = req.user.sub;
  const { amount, type, category, description, date } = req.body;
  const transaction = await updateTransaction(transactionId, adminId, amount, type, category, description, date);
  res.status(200).json({ data: { transaction } });
}

export async function deleteTransactionController(req: Request, res: Response) {
  const transactionId = extractId("transaction", req.params.id);
  const adminId = req.user.sub;
  const transaction = await deleteTransaction(transactionId, adminId);
  res.status(200).json({ data: { transaction } });
}
