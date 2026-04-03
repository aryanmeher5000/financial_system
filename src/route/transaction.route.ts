import { Router } from "express";
import {
  createTransactionController,
  deleteTransactionController,
  getTransactionByIdContoller,
  getTransactionsByCriteriaController,
  updateTransactionController,
} from "../controller/transaction.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate(), getTransactionsByCriteriaController);

router.get("/:id", authenticate(), getTransactionByIdContoller);

router.post("/", authenticate("ADMIN"), createTransactionController);

router.patch("/:id", authenticate("ADMIN"), updateTransactionController);

router.delete("/:id", authenticate("ADMIN"), deleteTransactionController);

export default router;
