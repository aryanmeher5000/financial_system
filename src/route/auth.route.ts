import { Router } from "express";
import {
  logoutController,
  refreshAccessTokenController,
  signinController,
  updatePasswordController,
} from "../controller/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/signin", signinController);

router.patch("/updatePassword", authenticate(), updatePasswordController);

router.post("/refresh", refreshAccessTokenController);

router.post("/logout", authenticate(), logoutController);

export default router;
