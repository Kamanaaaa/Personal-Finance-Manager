import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'



function Dashboard() {
  const [report, setReport] = useState(null)
  const [trend, setTrend] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryNames, setCategoryNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/reports/monthly'),
      fetch('http://localhost:5000/api/reports/trend'),
      fetch('http://localhost:5000/api/reports/categories'),
      fetch('http://localhost:5000/api/categories'),
    ])
      .then(async ([monthlyResponse, trendResponse, categoriesResponse, categoryNamesResponse]) => {
        const monthlyData = await monthlyResponse.json()
        const trendData = await trendResponse.json()
        const categoriesData = await categoriesResponse.json()
        const categoryNamesData = await categoryNamesResponse.json()

        setReport(monthlyData)
        setTrend(trendData)
        setCategories(categoriesData)
        setCategoryNames(categoryNamesData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard data:', error)
        setError('Failed to load dashboard data. Please try again.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading dashboard...</p>
  }
  if (error) {
  return (
    <div className="rounded-lg bg-red-100 p-4 text-red-700">
      {error}
    </div>
  )
}

  const categoryChartData = categories.map((item) => {
  const category = categoryNames.find(
    (cat) => cat.id === item.categoryId
  )

  return {
    name: category ? category.name : `Category ${item.categoryId}`,
    expense: item.expense,
  }
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-gray-500">Income</h2>
              <p className="mt-2 text-2xl font-bold">
                Rs. {report.totalIncome}
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-gray-500">Expenses</h2>
              <p className="mt-2 text-2xl font-bold">
                Rs. {report.totalExpense}
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-gray-500">Balance</h2>
              <p className="mt-2 text-2xl font-bold">
                Rs. {report.balance}
              </p>
            </div>
          </div>

          {/* Income vs Expenses Chart */}
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              Income vs Expenses
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(month) => `Month ${month}`}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#22c55e"
                  />

                  <Bar
                    dataKey="expense"
                    name="Expenses"
                    fill="#ef4444"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Expenses by Category Chart */}
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">
               Expenses by Category
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

               <Bar
                dataKey="expense"
                name="Expenses"
                fill="#ef4444"
              />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  )
}

export default Dashboard