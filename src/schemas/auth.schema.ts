import {z} from "zod";

export const userSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export type UserSigninSchema = z.infer<typeof userSigninSchema>


export const updateUserPasswordSchema = z.object({
    password: z.string().min(8),
}).strict();

export type UpdateUserPasswordSchema = z.infer<typeof updateUserPasswordSchema>;