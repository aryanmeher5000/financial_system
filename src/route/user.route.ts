import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersByCriteriaController,
  updateUserAccountActivationController,
  updateUserRoleController,
} from "../controller/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate("ADMIN"), getUsersByCriteriaController);

router.get("/:id", authenticate("ADMIN"), getUserByIdController);

router.post("/", authenticate("ADMIN"), createUserController);

router.delete("/:id", authenticate("ADMIN"), deleteUserController);

router.patch("/:id/role", authenticate("ADMIN"), updateUserRoleController);

router.patch("/:id/status", authenticate("ADMIN"), updateUserAccountActivationController);

export default router;
