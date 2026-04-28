import { Op, UniqueConstraintError } from "sequelize";
import { Expense } from "../models/Expense.js";

function serializeExpense(expense) {
  const row = expense.toJSON ? expense.toJSON() : expense;

  return {
    id: row.id,
    request_id: row.requestId ?? row.request_id,
    amount: row.amount,
    currency: row.currency || "INR",
    category: row.category,
    description: row.description || "",
    date: row.date,
    pinned: Boolean(row.pinned),
    created_at: row.createdAt ?? row.created_at
  };
}

export class ExpenseRepository {
  async createIfNotExists(expense) {
    let record;
    let created;

    try {
      [record, created] = await Expense.findOrCreate({
        where: { requestId: expense.requestId },
        defaults: expense
      });
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }

      record = await Expense.findOne({ where: { requestId: expense.requestId } });
      created = false;
    }

    return {
      expense: serializeExpense(record),
      created
    };
  }

  async list({ category, sort = "date_desc" } = {}) {
    const order = sort === "date_asc" ? [["date", "ASC"], ["id", "ASC"]] : [["date", "DESC"], ["id", "DESC"]];
    const where = {};

    if (category) {
      where.category = { [Op.eq]: category };
    }

    const expenses = await Expense.findAll({ where, order });
    return expenses.map(serializeExpense);
  }

  async updatePinned(id, pinned) {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return null;
    }

    expense.pinned = pinned;
    await expense.save();

    return serializeExpense(expense);
  }
}
