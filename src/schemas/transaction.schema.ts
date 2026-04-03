import { z } from "zod";

export const createTransactionSchema = z
  .object({
    amount: z.number().positive({ message: "Amount must be a positive number" }),
    type: z.enum(["INCOME", "EXPENSE"], {
      message: "Type must be either INCOME or EXPENSE",
    }),
    category: z.string().min(3, { message: "Category must be at least 3 characters long" }),
    description: z.string().optional(),
    date: z.date({ message: "Invalid date" }),
  })
  .strict();

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial().strict();

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;

export const getTransactionsCriteriaSchema = z.object({
  category: z.string().min(1, { message: "Category must be at least 1 character long" }).optional(),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Type must be either INCOME or EXPENSE" }).optional(),
  dateFrom: z.coerce.date({ message: "Invalid dateFrom" }).optional(),
  dateTo: z.coerce.date({ message: "Invalid dateTo" }).optional(),
  amountMin: z.coerce
    .number({ message: "amountMin must be a number" })
    .positive({ message: "amountMin must be a positive number" })
    .optional(),
  amountMax: z.coerce
    .number({ message: "amountMax must be a number" })
    .positive({ message: "amountMax must be a positive number" })
    .optional(),
  sortBy: z
    .enum(["date", "amount", "createdAt"], { message: "sortBy must be one of: date, amount, createdAt" })
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"], { message: "sortOrder must be either asc or desc" }).default("desc"),
  page: z.coerce
    .number({ message: "Page must be a number" })
    .int({ message: "Page must be an integer" })
    .positive({ message: "Page must be a positive number" })
    .default(1),
});

export type GetTransactionsCriteriaSchema = z.infer<typeof getTransactionsCriteriaSchema>;
