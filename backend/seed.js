import { db } from './prisma/db.ts';

const defaultCategories = [
  {
    name: 'Food',
    color: '#FF6B6B',
    type: 'expense',
    isDefault: true
  },
  {
    name: 'Transport',
    color: '#4ECDC4',
    type: 'expense',
    isDefault: true
  },
  {
    name: 'Shopping',
    color: '#45B7D1',
    type: 'expense',
    isDefault: true
  },
  {
    name: 'Bills',
    color: '#FFA07A',
    type: 'expense',
    isDefault: true
  },
  {
    name: 'Entertainment',
    color: '#9B59B6',
    type: 'expense',
    isDefault: true
  },
  {
    name: 'Salary',
    color: '#2ECC71',
    type: 'income',
    isDefault: true
  }
];

async function seed() {
  for (const category of defaultCategories) {
    const existingCategory = await db.orm.public.Category
      .where({
        name: category.name,
        type: category.type
      })
      .first();

    if (!existingCategory) {
      await db.orm.public.Category.create(category);
    }
  }

  console.log('Default categories seeded successfully');
}

seed();