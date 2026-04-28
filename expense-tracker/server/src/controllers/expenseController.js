export function createExpenseController(expenseService) {
  return {
    create: async (req, res, next) => {
      try {
        const { expense, created, idempotent } = await expenseService.createExpense(req.body);
        res.status(created ? 201 : 200).json({ expense, idempotent });
      } catch (error) {
        next(error);
      }
    },

    list: async (req, res, next) => {
      try {
        const expenses = await expenseService.listExpenses(req.query);
        res.json({ expenses });
      } catch (error) {
        next(error);
      }
    },

    updatePinned: async (req, res, next) => {
      try {
        const expense = await expenseService.updatePinned(req.params.id, req.body.pinned);
        res.json({ expense });
      } catch (error) {
        next(error);
      }
    }
  };
}
