import { hashPassword, comparePasswords } from "../utils/password";
import { TokenPayload, createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { updateUserPasswordSchema, userSigninSchema } from "../schemas/auth.schema";
import { AppError } from "../utils/appError";

export async function validateUserSignin(email: string, password: string) {
  const { success, error } = userSigninSchema.safeParse({ email, password });
  if (!success) throw new AppError(error.issues[0].message, 400);

  const user = await prisma.user.findUnique({
    where: { email, isDeleted: false },
    select: {
      id: true,
      password: true,
      role: true,
      tokenVersion: true,
      active: true,
    },
  });
  if (!user) throw new AppError("Invalid credentials", 401);

  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  if (!user.active) throw new AppError("User account was deactivated", 403);

  const tokenPayload: TokenPayload = {
    sub: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const [accessToken, refreshToken] = await Promise.all([createAccessToken(tokenPayload), createRefreshToken(tokenPayload)]);

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) throw new AppError("Refresh token not found", 401);

  const payload = await verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub, isDeleted: false },
    select: {
      id: true,
      role: true,
      tokenVersion: true,
      active: true,
    },
  });
  if (!user) throw new AppError("User not found", 401);
  if (!user.active) throw new AppError("User account was deactivated", 403);

  // token version mismatch means the user has logged out or password was changed
  if (user.tokenVersion !== payload.tokenVersion) throw new AppError("Invalid token, login again!", 401);

  const tokenPayload: TokenPayload = {
    sub: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  const accessToken = await createAccessToken(tokenPayload);

  return { accessToken };
}

export async function updatePassword(userId: number, oldPassword: string, newPassword: string) {
  const { success, error } = updateUserPasswordSchema.safeParse({ oldPassword, newPassword });
  if (!success) throw new AppError(error.issues[0].message, 400);

  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: {
      id: true,
      password: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);

  const isPasswordValid = await comparePasswords(oldPassword, user.password);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
      tokenVersion: { increment: 1 },
    },
  });
}

export async function logoutUser(userId: number) {
  await prisma.user.update({
    where: { id: userId, isDeleted: false },
    data: { tokenVersion: { increment: 1 } },
  });
}
