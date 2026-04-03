import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { generateSummaryController } from "../controller/summary.controller";

const router = Router();

router.get("/", authenticate("ANALYST"), generateSummaryController);
