import { Request, Response } from "express";
import { validateUserSignin, updatePassword, logoutUser, refreshAccessToken } from "../service/auth.service";

export async function signinController(req: Request, res: Response) {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await validateUserSignin(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ accessToken });
}

export async function refreshAccessTokenController(req: Request, res: Response) {
  const { refreshToken } = req.cookies;
  const { accessToken } = await refreshAccessToken(refreshToken);
  res.status(200).json({ accessToken });
}

export async function updatePasswordController(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.sub;
  await updatePassword(userId, oldPassword, newPassword);
  res.status(200).json({ message: "Password updated successfully" });
}

export async function logoutController(req: Request, res: Response) {
  const userId = req.user.sub;
  await logoutUser(userId);
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
}
