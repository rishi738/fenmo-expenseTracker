import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { ExpenseRepository } from "./repositories/expenseRepository.js";
import { createExpenseRouter } from "./routes/expenses.js";
import { ExpenseService } from "./services/expenseService.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

export function createApp({ expenseRepository = new ExpenseRepository() } = {}) {
  const app = express();
  const expenseService = new ExpenseService(expenseRepository);

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins }));
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/expenses", createExpenseRouter(expenseService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
