import { z } from "zod";

export const createTransactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(["INCOME", "EXPENSE"]),
    category: z.string().min(3),
    description: z.string().optional(),
    date: z.date(),
}).strict();

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;


export const updateTransactionSchema = createTransactionSchema.partial().strict();

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;