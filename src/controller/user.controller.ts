import { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsersByCriteria,
  updateUserAccountActivation,
  updateUserRole,
} from "../service/user.service";
import { AppError } from "../utils/appError";

export async function getUsersByCriteriaController(req: Request, res: Response) {
  const { query, sort, page } = req.query;

  const users = await getUsersByCriteria(
    query as string | undefined,
    (sort as "asc" | "desc") ?? "asc",
    page ? parseInt(page as string) : 1,
  );

  res.status(200).json({ users });
}

export async function getUserByIdController(req: Request, res: Response) {
  const userId = parseInt(String(req.params.id));
  if (isNaN(userId)) throw new AppError("Invalid user ID", 400);
  const user = await getUserById(userId);
  res.status(200).json({ user });
}

export async function createUserController(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const user = await createUser(name, email, password, role);
  res.status(201).json({ user });
}

export async function deleteUserController(req: Request, res: Response) {
  const userId = parseInt(String(req.params.id));
  if (isNaN(userId)) throw new AppError("Invalid user ID", 400);
  const user = await deleteUser(userId);
  res.status(200).json({ user });
}

export async function updateUserRoleController(req: Request, res: Response) {
  const userId = parseInt(String(req.params.id));
  if (isNaN(userId)) throw new AppError("Invalid user ID", 400);
  const { role } = req.body;
  const user = await updateUserRole(userId, role);
  res.status(200).json({ user });
}

export async function updateUserAccountActivationController(req: Request, res: Response) {
  const userId = parseInt(String(req.params.id));
  if (isNaN(userId)) throw new AppError("Invalid user ID", 400);
  const { active } = req.body;
  const user = await updateUserAccountActivation(userId, active);
  res.status(200).json({ user });
}
