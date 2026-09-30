import { useEffect, useState } from 'react'

function Budgets() {
  const currentDate = new Date()

  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())

  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      setError('')

      const [budgetsResponse, categoriesResponse] = await Promise.all([
        fetch('http://localhost:5000/api/budgets/summary'),
        fetch('http://localhost:5000/api/categories'),
      ])

      if (!budgetsResponse.ok) {
        throw new Error('Failed to load budgets')
      }

      if (!categoriesResponse.ok) {
        throw new Error('Failed to load categories')
      }

      const budgetsData = await budgetsResponse.json()
      const categoriesData = await categoriesResponse.json()

      setBudgets(budgetsData.budgets)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
      setError('Failed to load budgets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const getCategoryName = (id) => {
    const category = categories.find(
      (category) => category.id === id
    )

    return category ? category.name : `Category ${id}`
  }

  const resetForm = () => {
    setCategoryId('')
    setAmount('')
    setMonth(currentDate.getMonth() + 1)
    setYear(currentDate.getFullYear())
    setEditingId(null)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setFormError('')

    if (!categoryId) {
      setFormError('Please select a category.')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setFormError('Budget amount must be greater than 0.')
      return
    }

    if (!month || Number(month) < 1 || Number(month) > 12) {
      setFormError('Month must be between 1 and 12.')
      return
    }

    if (!year || Number(year) < 2000 || Number(year) > 2100) {
      setFormError('Please enter a valid year.')
      return
    }

    try {
      setSubmitting(true)

      const url = editingId
        ? `http://localhost:5000/api/budgets/${editingId}`
        : 'http://localhost:5000/api/budgets'

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: Number(categoryId),
          amount: Number(amount),
          month: Number(month),
          year: Number(year),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save budget')
      }

      resetForm()
      await fetchBudgets()
    } catch (error) {
      console.error('Failed to save budget:', error)
      setFormError('Failed to save budget. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (budget) => {
    setEditingId(budget.id)
    setCategoryId(String(budget.categoryId))
    setAmount(String(budget.budgetAmount))
    setMonth(currentDate.getMonth() + 1)
    setYear(currentDate.getFullYear())
    setFormError('')
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this budget?'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(id)
      setError('')

      const response = await fetch(
        `http://localhost:5000/api/budgets/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }

      if (editingId === id) {
        resetForm()
      }

      await fetchBudgets()
    } catch (error) {
      console.error('Failed to delete budget:', error)
      setError('Failed to delete budget. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <p>Loading budgets...</p>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Budgets</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? 'Edit Budget' : 'Add Budget'}
        </h2>

        {formError && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2"
              disabled={submitting}
            >
              <option value="">Select category</option>

              {categories
                .filter((category) => category.type === 'expense')
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Budget Amount
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter budget amount"
              className="w-full rounded-lg border border-gray-300 p-2"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Month
              </label>

              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Year
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? editingId
                  ? 'Updating...'
                  : 'Adding...'
                : editingId
                  ? 'Update Budget'
                  : 'Add Budget'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {budgets.length === 0 ? (
        <p>No budgets found for the current month.</p>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="rounded-lg bg-white p-6 shadow"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {getCategoryName(budget.categoryId)}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Rs. {budget.spent} spent of Rs.{' '}
                    {budget.budgetAmount}
                  </p>
                </div>

                <span className="font-semibold">
                  {Math.round(budget.percentage)}%
                </span>
              </div>

              <div className="mb-4 h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(budget.percentage, 100)}%`,
                  }}
                ></div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(budget)}
                  disabled={deletingId === budget.id}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(budget.id)}
                  disabled={deletingId === budget.id}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === budget.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Budgets