import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"], {
      message: "Role must be one of: ADMIN, ANALYST, or VIEWER",
    }),
  })
  .strict();

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const updateUserRoleSchema = z
  .object({
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"], {
      message: "Role must be one of: ADMIN, ANALYST, or VIEWER",
    }),
  })
  .strict();

export type UpdateUserRoleSchema = z.infer<typeof updateUserRoleSchema>;

export const updateUserActiveSchema = z
  .object({
    active: z.boolean({ message: "Active must be a boolean value" }),
  })
  .strict();

export type UpdateUserActiveSchema = z.infer<typeof updateUserActiveSchema>;

export const getUsersByCriteriaSchema = z.object({
  query: z.string().min(1),
  sortOrder: z.enum(["asc", "desc"], { message: "sortOrder must be either asc or desc" }).default("desc"),
  page: z.coerce
    .number({ message: "Page must be a number" })
    .int({ message: "Page must be an integer" })
    .positive({ message: "Page must be a positive number" })
    .default(1),
});
