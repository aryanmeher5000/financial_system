import { type Express } from "express";
import authRouter from "../route/auth.route";
import userRouter from "../route/user.route";
import transactionRouter from "../route/transaction.route";
import summaryRouter from "../route/summary.route";

export function initRoutes(app: Express) {
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/transaction", transactionRouter);
  app.use("/summary", summaryRouter);
}
