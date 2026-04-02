import { z } from "zod";

export const createTransactionSchema = z.object({
    amount: z.number()
        .positive({ message: "Amount must be a positive number" }),
    type: z.enum(["INCOME", "EXPENSE"], {
        message: "Type must be either INCOME or EXPENSE",
    }),
    category: z.string()
        .min(3, { message: "Category must be at least 3 characters long" }),
    description: z.string()
        .optional(),
    date: z.date({ message: "Invalid date" }),
}).strict();

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;


export const updateTransactionSchema = createTransactionSchema.partial().strict();

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;