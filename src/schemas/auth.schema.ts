import { z } from "zod";

export const userSigninSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
});

export type UserSigninSchema = z.infer<typeof userSigninSchema>;

export const updateUserPasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Current password is required")
      .min(8, "Current password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100, "New password is too long")
      ,
    confirmPassword: z
      .string()
      .min(8, "Please confirm your new password"),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The new passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password cannot be the same as your old password",
    path: ["newPassword"],
  });

export type UpdateUserPasswordSchema = z.infer<typeof updateUserPasswordSchema>;