import { Request, Response, Router } from "express";
import { logoutController, signinController, updatePasswordController } from "../controller/auth.controller";
import { refreshAccessToken } from "../service/auth.service";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/signin", signinController);

router.patch("/updatePassword", authenticate, updatePasswordController);

router.post("/refresh", authenticate, refreshAccessToken);

router.post("/logout", authenticate, logoutController);
