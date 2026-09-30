
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

function EditTransaction() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
      type: '',
      categoryId: '',
      date: '',
      notes: '',
      isRecurring: false,
    },
  })

  useEffect(() => {
    const loadTransaction = async () => {
      setLoading(true)
      setError('')

      try {
        const [categoriesResponse, transactionResponse] =
          await Promise.all([
            fetch('http://localhost:5000/api/categories'),
            fetch(
              `http://localhost:5000/api/transactions/${id}`
            ),
          ])

        if (!categoriesResponse.ok) {
          throw new Error('Failed to load categories')
        }

        if (!transactionResponse.ok) {
          throw new Error('Failed to load transaction')
        }

        const categoriesData =
          await categoriesResponse.json()

        const transactionData =
          await transactionResponse.json()

        setCategories(categoriesData)

        reset({
          amount: transactionData.amount,
          type: transactionData.type,
          categoryId: transactionData.categoryId,
          date: new Date(transactionData.date)
            .toISOString()
            .slice(0, 16),
          notes: transactionData.notes || '',
          isRecurring:
            transactionData.isRecurring || false,
        })

        setLoading(false)
      } catch (error) {
        console.error(
          'Failed to load edit page:',
          error
        )

        setError(
          'Failed to load transaction. Please try again.'
        )

        setLoading(false)
      }
    }

    loadTransaction()
  }, [id, reset])

  const onSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Number(data.amount),
            type: data.type,
            categoryId: Number(data.categoryId),
            date: data.date,
            notes: data.notes || null,
            isRecurring: data.isRecurring || false,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Failed to update transaction'
        )
      }

      alert('Transaction updated successfully!')

      navigate('/transactions')
    } catch (error) {
      console.error(
        'Failed to update transaction:',
        error
      )

      setError(
        error.message ||
          'Failed to update transaction. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p>Loading transaction...</p>
  }

  if (error && categories.length === 0) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Edit Transaction
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <div>
          <label className="mb-1 block">
            Amount
          </label>

          <input
            type="number"
            step="0.01"
            min="0.01"
            disabled={submitting}
            {...register('amount', {
              required: 'Amount is required',
              min: {
                value: 0.01,
                message:
                  'Amount must be greater than 0',
              },
            })}
            className="w-full rounded border p-2 disabled:bg-gray-100"
          />

          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block">
            Type
          </label>

          <select
            disabled={submitting}
            {...register('type', {
              required: 'Type is required',
            })}
            className="w-full rounded border p-2 disabled:bg-gray-100"
          >
            <option value="">
              Select type
            </option>

            <option value="income">
              Income
            </option>

            <option value="expense">
              Expense
            </option>
          </select>

          {errors.type && (
            <p className="mt-1 text-sm text-red-500">
              {errors.type.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block">
            Category
          </label>

          <select
            disabled={submitting}
            {...register('categoryId', {
              required:
                'Category is required',
            })}
            className="w-full rounded border p-2 disabled:bg-gray-100"
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block">
            Date
          </label>

          <input
            type="datetime-local"
            disabled={submitting}
            {...register('date', {
              required: 'Date is required',
            })}
            className="w-full rounded border p-2 disabled:bg-gray-100"
          />

          {errors.date && (
            <p className="mt-1 text-sm text-red-500">
              {errors.date.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block">
            Notes
          </label>

          <textarea
            disabled={submitting}
            {...register('notes')}
            className="w-full rounded border p-2 disabled:bg-gray-100"
            rows="3"
            placeholder="Optional notes"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled={submitting}
            {...register('isRecurring')}
          />

          <label>
            Recurring transaction
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? 'Saving...'
              : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/transactions')
            }
            disabled={submitting}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditTransaction

