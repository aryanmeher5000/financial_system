import { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsersByCriteria,
  updateUserAccountActivation,
  updateUserRole,
} from "../service/user.service";
import extractId from "../utils/extractId";
import { getUsersByCriteriaSchema } from "../schemas/user.schema";
import { AppError } from "../utils/appError";

export async function getUsersByCriteriaController(req: Request, res: Response) {
  const { success, error, data } = getUsersByCriteriaSchema.safeParse(req.query);
  if (!success) throw new AppError(error.issues[0].message, 400);

  const users = await getUsersByCriteria(data.query, data.sortOrder, data.page);
  res.status(200).json({ users });
}

export async function getUserByIdController(req: Request, res: Response) {
  const userId = extractId("user", req.params.id);
  const user = await getUserById(userId);
  res.status(200).json({ user });
}

export async function createUserController(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const user = await createUser(name, email, password, role, req.user.sub);
  res.status(201).json({ user });
}

export async function deleteUserController(req: Request, res: Response) {
  const userId = extractId("user", req.params.id);
  const user = await deleteUser(userId, req.user.sub);
  res.status(200).json({ user });
}

export async function updateUserRoleController(req: Request, res: Response) {
  const userId = extractId("user", req.params.id);
  const { role } = req.body;
  const user = await updateUserRole(userId, role, req.user.sub);
  res.status(200).json({ user });
}

export async function updateUserAccountActivationController(req: Request, res: Response) {
  const userId = extractId("user", req.params.id);
  const { active } = req.body;
  const user = await updateUserAccountActivation(userId, active, req.user.sub);
  res.status(200).json({ user });
}
