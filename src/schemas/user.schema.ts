import {z} from "zod";

export const createUserSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
}).strict();

export type CreateUserSchema = z.infer<typeof createUserSchema>;


export const updateUserPasswordSchema = z.object({
    password: z.string().min(8),
}).strict();

export type UpdateUserPasswordSchema = z.infer<typeof updateUserPasswordSchema>;


export const updateUserRoleSchema = z.object({
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
}).strict();

export type UpdateUserRoleSchema = z.infer<typeof updateUserRoleSchema>;


export const updateUserActiveSchema = z.object({
    active: z.boolean(),
}).strict();

export type UpdateUserActiveSchema = z.infer<typeof updateUserActiveSchema>;