import { Router } from "express";
import { createExpenseController } from "../controllers/expenseController.js";

export function createExpenseRouter(expenseService) {
  const router = Router();
  const controller = createExpenseController(expenseService);

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.patch("/:id/pin", controller.updatePinned);

  return router;
}
