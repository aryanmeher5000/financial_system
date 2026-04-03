import "dotenv/config";
import express from "express";
import { initMiddleware } from "./startup/middleware.setup";
import { initRoutes } from "./startup/route.setup";
import { initErrorHandler } from "./startup/errorHandling.setup";

const app = express();
const port = Number(process.env.PORT) || 3000;

initMiddleware(app);
initRoutes(app);
initErrorHandler(app);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
