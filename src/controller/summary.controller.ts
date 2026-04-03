import { Request, Response } from "express";
import { generateSummary } from "../service/summary.service";
import { AppError } from "../utils/appError";

export async function generateSummaryController(req: Request, res: Response) {
  const { dateFrom, dateTo } = req.query;
  if (!dateFrom || !dateTo) throw new AppError("dateFrom and dateTo are required", 400);

  const parsedDateFrom = new Date(dateFrom as string);
  const parsedDateTo = new Date(dateTo as string);

  if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime()))
    throw new AppError("dateFrom and dateTo must be valid dates", 400);

  if (parsedDateFrom > parsedDateTo) throw new AppError("dateFrom must be before dateTo", 400);

  const summary = await generateSummary(parsedDateFrom, parsedDateTo);
  res.status(200).json({ data: summary });
}
