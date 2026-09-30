import express from 'express';
import { Parser } from 'json2csv';
import cors from 'cors';
import { db } from './prisma/db.js';


const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Personal Finance Manager API is running'
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const categories = await db.orm.public.Category.all();

    res.json({
      message: 'Database connection successful', categories
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Database connection failed'
    });
  }
});
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.orm.public.Category.all();

    res.json(categories);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch categories'
    });
  }
});
app.post('/api/categories', async (req, res) => {
  try {
    const { name, color, type, isDefault } = req.body;

    const category = await db.orm.public.Category.create({
        name,
        color,
        type,
        isDefault: isDefault ?? false
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create category'
    });
  }
});


app.get('/api/transactions', async (req, res) => {
  try {
    const {
      type,
      categoryId,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    let query = db.orm.public.Transaction;

    if (type) {
      query = query.where({ type });
    }

    if (categoryId) {
      query = query.where({
        categoryId: Number(categoryId)
      });
    }

    let transactions = await query.all();

    if (fromDate) {
      const startDate = new Date(fromDate);

      transactions = transactions.filter((transaction) => {
        return new Date(transaction.date) >= startDate;
      });
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      transactions = transactions.filter((transaction) => {
        return new Date(transaction.date) <= endDate;
      });
    }

    if (search) {
      transactions = transactions.filter((transaction) => {
        return transaction.notes
          ?.toLowerCase()
          .includes(search.toLowerCase());
      });
    }

    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const paginatedTransactions = transactions.slice(
      startIndex,
      endIndex
    );

    res.json({
      page: pageNumber,
      limit: limitNumber,
      total: transactions.length,
      transactions: paginatedTransactions
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch transactions'
    });
  }
});


app.post('/api/transactions', async (req, res) => {
  try {
    const {
      amount,
      type,
      categoryId,
      date,
      notes,
      isRecurring
    } = req.body;

    const transaction = await db.orm.public.Transaction.create({
      amount,
      type,
      categoryId,
      date,
      notes,
      isRecurring: isRecurring ?? false
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create transaction'
    });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const transaction = await db.orm.public.Transaction
      .where({ id })
      .first();

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch transaction'
    });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      amount,
      type,
      categoryId,
      date,
      notes,
      isRecurring
    } = req.body;

    const transaction = await db.orm.public.Transaction
      .where({ id })
      .first();

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    const updatedTransaction = await db.orm.public.Transaction
      .where({ id })
      .update({
        amount,
        type,
        categoryId,
        date,
        notes,
        isRecurring
      });

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update transaction'
    });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const transaction = await db.orm.public.Transaction
      .where({ id })
      .first();

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    await db.orm.public.Transaction
      .where({ id })
      .delete();

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete transaction'
    });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const category = await db.orm.public.Category
    .where({ id })
    .first();

    if (!category) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    res.json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch category'
    });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, color, type, isDefault } = req.body;

    const category = await db.orm.public.Category
      .where({ id })
      .first();

    if (!category) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    const updatedCategory = await db.orm.public.Category
    .where({ id })
    .update({
      name,
      color,
      type,
      isDefault
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update category'
    });
  }
});
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const category = await db.orm.public.Category
      .where({ id })
      .first();

    if (!category) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    await db.orm.public.Category
      .where({ id })
      .delete();

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete category'
    });
  }
});

app.get('/api/budgets', async (req, res) => {
  try {
    const currentDate = new Date();

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const budgets = await db.orm.public.Budget
      .where({
        month,
        year
      })
      .all();

    res.json(budgets);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch budgets'
    });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const {
      categoryId,
      amount,
      month,
      year
    } = req.body;

    const budget = await db.orm.public.Budget.create({
      categoryId,
      amount,
      month,
      year
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create budget'
    });
  }
});

app.put('/api/budgets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      categoryId,
      amount,
      month,
      year
    } = req.body;

    const budget = await db.orm.public.Budget
      .where({ id })
      .first();

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    const updatedBudget = await db.orm.public.Budget
      .where({ id })
      .update({
        categoryId,
        amount,
        month,
        year
      });

    res.json(updatedBudget);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update budget'
    });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const budget = await db.orm.public.Budget
      .where({ id })
      .first();

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    await db.orm.public.Budget
      .where({ id })
      .delete();

    res.json({
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete budget'
    });
  }
});

app.get('/api/budgets/summary', async (req, res) => {
  try {
    const currentDate = new Date()

    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    const budgets = await db.orm.public.Budget
      .where({
        month,
        year
      })
      .all()

    const transactions = await db.orm.public.Transaction.all()

    const budgetDetails = budgets.map((budget) => {
      const spent = transactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date)

          return (
            transaction.categoryId === budget.categoryId &&
            transaction.type === 'expense' &&
            transactionDate.getMonth() + 1 === month &&
            transactionDate.getFullYear() === year
          )
        })
        .reduce((total, transaction) => {
          return total + Number(transaction.amount)
        }, 0)

      const percentage =
        budget.amount > 0
          ? Math.min((spent / Number(budget.amount)) * 100, 100)
          : 0

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        budgetAmount: Number(budget.amount),
        spent,
        percentage
      }
    })

    let totalBudget = 0

    for (const budget of budgets) {
      totalBudget += Number(budget.amount)
    }

    res.json({
      month,
      year,
      totalBudget,
      budgetCount: budgets.length,
      budgets: budgetDetails
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch budget summary'
    })
  }
})

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await db.orm.public.SavingsGoal.all();

    res.json(goals);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch savings goals'
    });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      savedAmount,
      deadline,
      completed
    } = req.body;

    const goal = await db.orm.public.SavingsGoal.create({
      name,
      targetAmount,
      savedAmount: savedAmount ?? 0,
      deadline,
      completed: completed ?? false
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create savings goal'
    });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      targetAmount,
      savedAmount,
      deadline,
      completed
    } = req.body;

    const goal = await db.orm.public.SavingsGoal
      .where({ id })
      .first();

    if (!goal) {
      return res.status(404).json({
        message: 'Savings goal not found'
      });
    }

    const updatedGoal = await db.orm.public.SavingsGoal
      .where({ id })
      .update({
        name,
        targetAmount,
        savedAmount,
        deadline,
        completed
      });

    res.json(updatedGoal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update savings goal'
    });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const goal = await db.orm.public.SavingsGoal
      .where({ id })
      .first();

    if (!goal) {
      return res.status(404).json({
        message: 'Savings goal not found'
      });
    }

    await db.orm.public.SavingsGoal
      .where({ id })
      .delete();

    res.json({
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete savings goal'
    });
  }
});

app.post('/api/goals/:id/contribute', async (req, res) => {
  try {
    const goalId = Number(req.params.id)
    const { amount, date, notes } = req.body

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than 0'
      })
    }

    const goal = await db.orm.public.SavingsGoal
      .where({ id: goalId })
      .first()

    if (!goal) {
      return res.status(404).json({
        message: 'Savings goal not found'
      })
    }

    const contribution = await db.orm.public.GoalContribution.create({
      goalId,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      notes: notes || null
    })

    const newSavedAmount =
      Number(goal.savedAmount) + Number(amount)

    const completed =
      newSavedAmount >= Number(goal.targetAmount)

    await db.orm.public.SavingsGoal
      .where({ id: goalId })
      .update({
        savedAmount: newSavedAmount,
        completed
      })

    res.status(201).json({
      message: 'Contribution added successfully',
      contribution,
      savedAmount: newSavedAmount,
      completed
    })
  } catch (error) {
    console.error('Contribution error:', error)

    res.status(500).json({
      message: 'Failed to add contribution'
    })
  }
})


app.get('/api/reports/monthly', async (req, res) => {
  try {
    const currentDate = new Date();

    const month = Number(req.query.month) || currentDate.getMonth() + 1;
    const year = Number(req.query.year) || currentDate.getFullYear();

    const transactions = await db.orm.public.Transaction.all();

    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);

      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();

      if (transactionMonth === month && transactionYear === year) {
        if (transaction.type === 'income') {
          totalIncome += Number(transaction.amount);
        }

        if (transaction.type === 'expense') {
          totalExpense += Number(transaction.amount);
        }
      }
    }

    const balance = totalIncome - totalExpense;

    res.json({
      month,
      year,
      totalIncome,
      totalExpense,
      balance
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to generate monthly report'
    });
  }
});

app.get('/api/reports/categories', async (req, res) => {
  try {
    const transactions = await db.orm.public.Transaction.all();

    const categoryTotals = {};

    for (const transaction of transactions) {
      const categoryId = transaction.categoryId;

      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          categoryId,
          income: 0,
          expense: 0
        };
      }

      if (transaction.type === 'income') {
        categoryTotals[categoryId].income += Number(transaction.amount);
      }

      if (transaction.type === 'expense') {
        categoryTotals[categoryId].expense += Number(transaction.amount);
      }
    }

    res.json(Object.values(categoryTotals));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to generate category report'
    });
  }
});

app.get('/api/reports/trend', async (req, res) => {
  try {
    const transactions = await db.orm.public.Transaction.all();

    const monthlyTotals = {};

    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);

      const month = transactionDate.getMonth() + 1;
      const year = transactionDate.getFullYear();

      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!monthlyTotals[key]) {
        monthlyTotals[key] = {
          month,
          year,
          income: 0,
          expense: 0
        };
      }

      if (transaction.type === 'income') {
        monthlyTotals[key].income += Number(transaction.amount);
      }

      if (transaction.type === 'expense') {
        monthlyTotals[key].expense += Number(transaction.amount);
      }
    }

    const trend = Object.values(monthlyTotals).map((item) => ({
      ...item,
      balance: item.income - item.expense
    }));

    res.json(trend);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to generate trend report'
    });
  }
});

app.get('/api/reports/export', async (req, res) => {
  try {
    const transactions = await db.orm.public.Transaction.all();

    const csvData = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date,
      notes: transaction.notes,
      isRecurring: transaction.isRecurring
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');

    res.send(csv);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to export transactions'
    });
  }
});

const PORT = 5000;

app.get('/api/recurring-transactions', async (req, res) => {
  try {
    const recurringTransactions =
      await db.orm.public.RecurringTransaction.all();

    res.json(recurringTransactions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch recurring transactions'
    });
  }
});

app.post('/api/recurring-transactions', async (req, res) => {
  try {
    const {
      amount,
      type,
      categoryId,
      frequency,
      nextDueDate,
      notes,
      active
    } = req.body;

    const recurringTransaction =
      await db.orm.public.RecurringTransaction.create({
        amount,
        type,
        categoryId,
        frequency,
        nextDueDate,
        notes,
        active: active ?? true
      });

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create recurring transaction'
    });
  }
});

app.delete('/api/recurring-transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const recurringTransaction =
      await db.orm.public.RecurringTransaction
        .where({ id })
        .first();

    if (!recurringTransaction) {
      return res.status(404).json({
        message: 'Recurring transaction not found'
      });
    }

    await db.orm.public.RecurringTransaction
      .where({ id })
      .delete();

    res.json({
      message: 'Recurring transaction deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete recurring transaction'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});