import { createRequestHash } from "../utils/hashRequest.js";
import { validateExpensePayload } from "../utils/validation.js";

export class ExpenseService {
  constructor(expenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async createExpense(payload) {
    const validation = validateExpensePayload(payload);

    if (!validation.valid) {
      const error = new Error("Validation failed.");
      error.status = 400;
      error.details = validation.errors;
      throw error;
    }

    const requestId = String(payload.request_id || payload.requestId || "").trim() || createRequestHash(validation.data);

    if (requestId.length > 64) {
      const error = new Error("Validation failed.");
      error.status = 400;
      error.details = { request_id: "Request id must be 64 characters or less." };
      throw error;
    }

    const result = await this.expenseRepository.createIfNotExists({
      ...validation.data,
      requestId
    });

    return {
      ...result,
      idempotent: !result.created
    };
  }

  async listExpenses(query) {
    const category = String(query.category || "").trim();
    const sort = query.sort === "date_asc" ? "date_asc" : "date_desc";

    return this.expenseRepository.list({
      category: category || undefined,
      sort
    });
  }

  async updatePinned(id, pinned) {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0 || typeof pinned !== "boolean") {
      const error = new Error("Invalid pinned update.");
      error.status = 400;
      throw error;
    }

    const expense = await this.expenseRepository.updatePinned(numericId, pinned);

    if (!expense) {
      const error = new Error("Expense not found.");
      error.status = 404;
      throw error;
    }

    return expense;
  }
}
