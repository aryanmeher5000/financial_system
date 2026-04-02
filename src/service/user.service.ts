import { AuditAction, Role } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { createUserSchema, updateUserActiveSchema, updateUserRoleSchema } from "../schemas/user.schema";
import { AppError } from "../utils/appError";
import { hashPassword } from "../utils/password";

/** criterions
 * 1. query: search by name or emailid
 * 2. page: page number
 * 3. sort: for deciding ascending or descending
 */
export async function getUsersByCriteria(
  query: string | undefined = undefined,
  sort: "asc" | "desc" = "asc",
  page: number = 1,
) {
  const PAGE_SIZE = 10;
  const users = await prisma.user.findMany({
    where: {
      ...(query
        ? {
            OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
          }
        : undefined),
      deletedAt: null,
    },
    orderBy: { name: sort },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return users;
}

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      deletedAt: true,
    },
  });
  if (!user) throw new AppError("User with this ID does not exist", 404);

  return user;
}

export async function createUser(name: string, email: string, password: string, role: Role, adminId: number) {
  const { success, error } = createUserSchema.safeParse({ name, email, password, role });
  if (!success) throw new AppError(error.issues[0].message, 400);

  const userExists = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (userExists) throw new AppError("User with this email already exists", 400);

  const hashedPassword = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, password: hashedPassword, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entity: "User",
        entityId: newUser.id,
        userId: adminId,
      },
    });

    return newUser;
  });

  return user;
}

export async function deleteUser(userId: number, adminId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError("User with this ID does not exist", 404);
  if (!user.active) throw new AppError("User is already deactivated", 400);

  const deletedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { active: false, deletedAt: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        deletedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entity: "User",
        entityId: userId,
        userId: adminId,
        oldData: { active: true, deletedAt: null },
        newData: { active: false, deletedAt: updated.deletedAt },
      },
    });

    return updated;
  });

  return deletedUser;
}

export async function updateUserRole(userId: number, role: Role, adminId: number) {
  const { success, error } = updateUserRoleSchema.safeParse({ role });
  if (!success) throw new AppError(error.issues[0].message, 400);

  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError("User with this ID does not exist", 404);
  if (user.role === role) throw new AppError("User already has this role", 400);

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: "User",
        entityId: userId,
        userId: adminId,
        oldData: { role: user.role },
        newData: { role },
      },
    });

    return updated;
  });

  return updatedUser;
}

export async function updateUserAccountActivation(userId: number, active: boolean, adminId: number) {
  const { success, error } = updateUserActiveSchema.safeParse({ active });
  if (!success) throw new AppError(error.issues[0].message, 400);

  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError("User with this ID does not exist", 404);
  if (user.active === active) throw new AppError(`User is already ${active ? "activated" : "deactivated"}`, 400);

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: "User",
        entityId: userId,
        userId: adminId,
        oldData: { active: user.active },
        newData: { active },
      },
    });

    return updated;
  });

  return updatedUser;
}
