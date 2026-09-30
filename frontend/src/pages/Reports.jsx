
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function Reports() {
  const [report, setReport] = useState(null)
  const [trend, setTrend] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryNames, setCategoryNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')

    Promise.all([
      fetch('http://localhost:5000/api/reports/monthly'),
      fetch('http://localhost:5000/api/reports/trend'),
      fetch('http://localhost:5000/api/reports/categories'),
      fetch('http://localhost:5000/api/categories'),
    ])
      .then(
        async ([
          monthlyResponse,
          trendResponse,
          categoriesResponse,
          categoryNamesResponse,
        ]) => {
          if (!monthlyResponse.ok) {
            throw new Error('Failed to load monthly report')
          }

          if (!trendResponse.ok) {
            throw new Error('Failed to load report trend')
          }

          if (!categoriesResponse.ok) {
            throw new Error('Failed to load category report')
          }

          if (!categoryNamesResponse.ok) {
            throw new Error('Failed to load categories')
          }

          const monthlyData = await monthlyResponse.json()
          const trendData = await trendResponse.json()
          const categoriesData = await categoriesResponse.json()
          const categoryNamesData = await categoryNamesResponse.json()

          setReport(monthlyData)
          setTrend(trendData)
          setCategories(categoriesData)
          setCategoryNames(categoryNamesData)
          setLoading(false)
        }
      )
      .catch((error) => {
        console.error('Failed to fetch reports:', error)
        setError('Failed to load reports. Please try again.')
        setLoading(false)
      })
  }, [])

  const handleExport = async () => {
  setExporting(true)
  setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/reports/export'
      )

      if (!response.ok) {
        throw new Error('Failed to export transactions')
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'transactions.csv'

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to export transactions:', error)
        setError('Failed to export transactions. Please try again.')
      } finally {
        setExporting(false)
      }
    }

  if (loading) {
    return <p>Loading reports...</p>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-gray-500">Total Income</h2>

              <p className="mt-2 text-2xl font-bold">
                Rs. {report.totalIncome}
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-gray-500">Total Expenses</h2>

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

          {/* Income vs Expenses */}
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

          {/* Monthly Trend */}
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              Monthly Trend
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="month"
                    tickFormatter={(month) => `Month ${month}`}
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#22c55e"
                  />

                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#ef4444"
                  />

                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke="#3b82f6"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses by Category */}
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

export default Reports