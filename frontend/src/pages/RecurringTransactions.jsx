
import { useEffect, useState } from 'react'

function RecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [nextDueDate, setNextDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const fetchRecurringTransactions = async () => {
    setLoading(true)
    setError('')

    try {
      const [recurringResponse, categoriesResponse] =
        await Promise.all([
          fetch('http://localhost:5000/api/recurring-transactions'),
          fetch('http://localhost:5000/api/categories'),
        ])

      if (!recurringResponse.ok) {
        throw new Error('Failed to load recurring transactions')
      }

      if (!categoriesResponse.ok) {
        throw new Error('Failed to load categories')
      }

      const recurringData = await recurringResponse.json()
      const categoriesData = await categoriesResponse.json()

      setRecurringTransactions(recurringData)
      setCategories(categoriesData)
      setLoading(false)
    } catch (error) {
      console.error(
        'Failed to fetch recurring transactions:',
        error
      )

      setError(
        'Failed to load recurring transactions. Please try again.'
      )

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecurringTransactions()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than 0.')
      return
    }

    if (!categoryId) {
      setError('Please select a category.')
      return
    }

    if (!nextDueDate) {
      setError('Please select the next due date.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/recurring-transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Number(amount),
            type,
            categoryId: Number(categoryId),
            frequency,
            nextDueDate,
            notes: notes || null,
            active: true,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to create recurring transaction'
        )
      }

      setAmount('')
      setType('expense')
      setCategoryId('')
      setFrequency('monthly')
      setNextDueDate('')
      setNotes('')

      setSubmitting(false)

      fetchRecurringTransactions()
    } catch (error) {
      console.error(
        'Failed to create recurring transaction:',
        error
      )

      setError(
        error.message ||
          'Failed to create recurring transaction. Please try again.'
      )

      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this recurring transaction?'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(id)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/recurring-transactions/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete recurring transaction'
        )
      }

      setDeletingId(null)

      setRecurringTransactions(
        recurringTransactions.filter(
          (transaction) => transaction.id !== id
        )
      )
    } catch (error) {
      console.error(
        'Failed to delete recurring transaction:',
        error
      )

      setError(
        error.message ||
          'Failed to delete recurring transaction. Please try again.'
      )

      setDeletingId(null)
    }
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (category) => category.id === categoryId
    )

    return category
      ? category.name
      : `Category ${categoryId}`
  }

  if (loading) {
    return <p>Loading recurring transactions...</p>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Recurring Transactions
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Add Recurring Transaction */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          Add Recurring Transaction
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          />

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          >
            <option value="">Select Category</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <input
            type="date"
            value={nextDueDate}
            onChange={(event) => setNextDueDate(event.target.value)}
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          />

          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
          >
            {submitting
              ? 'Adding...'
              : 'Add Recurring Transaction'}
          </button>
        </form>
      </div>

      {/* Recurring Transactions List */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          Recurring Transactions
        </h2>

        {recurringTransactions.length === 0 ? (
          <p className="text-gray-500">
            No recurring transactions found.
          </p>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col justify-between gap-4 rounded border p-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="font-semibold">
                    Rs. {transaction.amount}
                  </p>

                  <p className="text-sm capitalize text-gray-500">
                    {transaction.type} •{' '}
                    {getCategoryName(transaction.categoryId)}
                  </p>

                  <p className="text-sm capitalize text-gray-500">
                    Frequency: {transaction.frequency}
                  </p>

                  <p className="text-sm text-gray-500">
                    Next due:{' '}
                    {new Date(
                      transaction.nextDueDate
                    ).toLocaleDateString()}
                  </p>

                  {transaction.notes && (
                    <p className="text-sm text-gray-500">
                      Notes: {transaction.notes}
                    </p>
                  )}

                  <p className="text-sm">
                    Status:{' '}
                    {transaction.active
                      ? 'Active'
                      : 'Inactive'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDelete(transaction.id)
                  }
                  disabled={deletingId === transaction.id}
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === transaction.id
                    ? 'Deleting...'
                    : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecurringTransactions

