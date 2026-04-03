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
  category: z.string().min(1).optional(),

  type: z
    .string()
    .transform((val) => {
      if (!val) return undefined;
      const v = val.toUpperCase();
      return v === "INCOME" || v === "EXPENSE" ? v : undefined;
    })
    .optional(),

  dateFrom: z
    .any()
    .transform((val) => {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    })
    .optional(),

  dateTo: z
    .any()
    .transform((val) => {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    })
    .optional(),

  amountMin: z
    .any()
    .transform((val) => {
      const num = Number(val);
      return num > 0 ? num : undefined;
    })
    .optional(),

  amountMax: z
    .any()
    .transform((val) => {
      const num = Number(val);
      return num > 0 ? num : undefined;
    })
    .optional(),

  sortBy: z
    .string()
    .transform((val) => {
      const allowed = ["date", "amount", "createdAt"];
      return allowed.includes(val) ? val : "createdAt";
    })
    .default("createdAt"),

  sortOrder: z
    .string()
    .transform((val) => (val?.toLowerCase() === "desc" ? "desc" : "asc"))
    .default("asc"),

  page: z
    .any()
    .transform((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num > 0 ? num : 1;
    })
    .default(1),
});

export type GetTransactionsCriteriaSchema = z.infer<typeof getTransactionsCriteriaSchema>;
