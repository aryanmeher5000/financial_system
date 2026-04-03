import { Router } from "express";
import {
  createTransactionController,
  deleteTransactionController,
  updateTransactionController,
} from "../controller/transaction.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authenticate("ADMIN"), createTransactionController);

router.patch("/:id", authenticate("ADMIN"), updateTransactionController);

router.delete("/:id", authenticate("ADMIN"), deleteTransactionController);
