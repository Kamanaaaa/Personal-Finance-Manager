# Personal Finance Manager

A full-stack personal finance management application for tracking transactions, managing budgets, setting savings goals, and viewing financial reports.

## Features

* Add, edit, and delete transactions
* Filter and search transactions
* Manage income and expense categories
* Create and manage monthly budgets
* View budget spending progress
* Create savings goals
* Add contributions to savings goals
* Manage recurring transactions
* Automatic processing of recurring transactions
* Dashboard with financial summaries
* Monthly and category-based reports
* Transaction trend reports
* Export transactions as CSV
* Form validation
* Loading and error states

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Recharts
* React Hook Form

### Backend

* Node.js
* Express.js
* Prisma
* PostgreSQL
* CORS

## Database

The application uses PostgreSQL with Prisma.

Main database tables:

* `transactions`
* `categories`
* `budgets`
* `savings_goals`
* `goal_contributions`
* `recurring_transactions`

## Project Structure

```text
Personal-Finance-Manager/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── db.ts
│   │   └── ...
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── README.md
```

## Environment Setup

Create a `.env` file inside the `backend` folder.

Use your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:postgres0929@localhost:5432/personal_finance_manager"
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you created during installation.

Do not commit the `.env` file to GitHub.

## Installation

Clone or open the project and install dependencies.

### Backend

```bash
cd backend
npm install
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend

From the `backend` folder:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### Start the Frontend

From the `frontend` folder:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

## Main Pages

* Dashboard
* Transactions
* Add Transaction
* Edit Transaction
* Categories
* Budgets
* Savings Goals
* Reports
* Recurring Transactions

## API Overview

### Transactions

```text
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Categories

```text
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Budgets

```text
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
GET    /api/budgets/summary
```

### Savings Goals

```text
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
POST   /api/goals/:id/contribute
```

### Reports

```text
GET /api/reports/monthly
GET /api/reports/categories
GET /api/reports/trend
GET /api/reports/export
```

### Recurring Transactions

```text
GET    /api/recurring
POST   /api/recurring
PUT    /api/recurring/:id
DELETE /api/recurring/:id
```

## Recurring Transactions

The backend includes a background job that checks recurring transactions periodically.

When a recurring transaction becomes due, the system creates the corresponding transaction and calculates the next due date based on its frequency.

Supported frequencies include:

* Daily
* Weekly
* Monthly
* Yearly

## Validation and Error Handling

The application includes:

* Required field validation
* Amount validation
* Category validation
* Date validation
* Budget month/year validation
* Contribution amount validation
* API error handling
* Loading states
* Submission states
* Delete confirmation

## Future Improvements

Possible future improvements include:

* User authentication
* Multiple user accounts
* More advanced financial analytics
* Cloud deployment
* Database backups
* More detailed notification features

## License

This project was created as an academic project.

## Screenshots

### Dashboard

![Dashboard](screenshots/Dashboard.PNG)

### Transactions

![Transactions](screenshots/transactions.PNG)

### Budgets

![Budgets](screenshots/budgets.PNG)

### Savings Goals

![Savings Goals](screenshots/savings_goal.PNG)

### Reports

![Reports](screenshots/reports.png)

### Recurring Transactions

![Recurring Transactions](screenshots/recurringTransactions.png)
