import Budgets from './pages/Budgets'
import SavingsGoals from './pages/SavingsGoals'
import AddTransaction from './pages/AddTransaction'
import EditTransaction from './pages/EditTransaction'
import Categories from './pages/Categories'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'

import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import NotFound from './pages/NotFound'

import Reports from './pages/Reports'
import RecurringTransactions from './pages/RecurringTransactions'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
          <Route path="/transactions/add" element={<AddTransaction />} />
          <Route path="/transactions/edit/:id" element={<EditTransaction />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/recurring-transactions" element={<RecurringTransactions />}/>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App