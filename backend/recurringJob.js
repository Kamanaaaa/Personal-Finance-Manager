import { db } from './prisma/db.ts';

async function processRecurringTransactions() {
  try {
    const now = new Date();

    const recurringTransactions =
      await db.orm.public.RecurringTransaction.all();

    for (const recurring of recurringTransactions) {
      const dueDate = new Date(recurring.nextDueDate);

      if (recurring.active && dueDate <= now) {
        await db.orm.public.Transaction.create({
          amount: recurring.amount,
          type: recurring.type,
          categoryId: recurring.categoryId,
          date: recurring.nextDueDate,
          notes: recurring.notes,
          isRecurring: true
        });

        let nextDueDate = new Date(recurring.nextDueDate);

        if (recurring.frequency === 'daily') {
          nextDueDate.setDate(nextDueDate.getDate() + 1);
        }

        if (recurring.frequency === 'weekly') {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        }

        if (recurring.frequency === 'monthly') {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        if (recurring.frequency === 'yearly') {
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        }

        await db.orm.public.RecurringTransaction
          .where({ id: recurring.id })
          .update({
            nextDueDate
          });

        console.log(
          `Recurring transaction processed: ${recurring.id}`
        );
      }
    }
  } catch (error) {
    console.error('Recurring transaction job failed:', error);
  }
}

setInterval(() => {
  processRecurringTransactions();
}, 60 * 1000);

processRecurringTransactions();