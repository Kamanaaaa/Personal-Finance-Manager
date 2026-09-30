import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h2 className="text-2xl font-bold mb-8">
        Personal Finance
      </h2>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/transactions"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Transactions
        </NavLink>

        <NavLink 
          to="/categories" 
          className="block px-4 py-2 rounded hover:bg-gray-700" 
        > 
           Categories 
        </NavLink>


        <NavLink
          to="/budgets"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Budgets
        </NavLink>

        <NavLink
          to="/savings-goals"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Savings Goals
        </NavLink>

        <NavLink
           to="/reports"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Reports
        </NavLink>

        <NavLink
  to="/recurring-transactions"
  className="block px-4 py-2 rounded hover:bg-gray-700"
>
  Recurring Transactions
</NavLink>






      </nav>
    </aside>
  )
}

export default Sidebar