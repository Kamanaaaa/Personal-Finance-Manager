import { useEffect, useState } from 'react'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [type, setType] = useState('expense')
  const [editingId, setEditingId] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/categories'
      )

      if (!response.ok) {
        throw new Error('Failed to load categories')
      }

      const data = await response.json()

      setCategories(data)
      setLoading(false)
    } catch (error) {
      console.error(
        'Failed to fetch categories:',
        error
      )

      setError(
        'Failed to load categories. Please try again.'
      )

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Category name is required.')
      return
    }

    if (!type) {
      setError('Category type is required.')
      return
    }

    if (!color) {
      setError('Category color is required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const url = editingId
        ? `http://localhost:5000/api/categories/${editingId}`
        : 'http://localhost:5000/api/categories'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          color,
          type,
          isDefault: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to save category'
        )
      }

      setName('')
      setColor('#3b82f6')
      setType('expense')
      setEditingId(null)

      await fetchCategories()
    } catch (error) {
      console.error(
        'Failed to save category:',
        error
      )

      setError(
        error.message ||
          'Failed to save category. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(id)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/categories/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete category'
        )
      }

      setCategories(
        categories.filter(
          (category) => category.id !== id
        )
      )
    } catch (error) {
      console.error(
        'Failed to delete category:',
        error
      )

      setError(
        error.message ||
          'Failed to delete category. Please try again.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setName(category.name)
    setColor(category.color)
    setType(category.type)
    setError('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setColor('#3b82f6')
    setType('expense')
    setError('')
  }

  if (loading) {
    return <p>Loading categories...</p>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Categories
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId
            ? 'Edit Category'
            : 'Add Category'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap gap-4"
        >
          <div>
            <input
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={submitting}
              className="rounded border px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
            disabled={submitting}
            className="rounded border px-3 py-2 disabled:bg-gray-100"
          >
            <option value="expense">
              Expense
            </option>

            <option value="income">
              Income
            </option>
          </select>

          <input
            type="color"
            value={color}
            onChange={(event) =>
              setColor(event.target.value)
            }
            disabled={submitting}
            className="h-10 w-16 rounded border disabled:opacity-50"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? 'Saving...'
                : editingId
                  ? 'Update Category'
                  : 'Add Category'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Type
                </th>

                <th className="p-4 text-left">
                  Color
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {category.name}
                  </td>

                  <td className="p-4 capitalize">
                    {category.type}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border"
                        style={{
                          backgroundColor:
                            category.color,
                        }}
                      />

                      {category.color}
                    </div>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        handleDelete(category.id)
                      }
                      disabled={
                        deletingId === category.id ||
                        submitting
                      }
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === category.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>

                    <button
                      onClick={() =>
                        handleEdit(category)
                      }
                      disabled={
                        deletingId === category.id ||
                        submitting
                      }
                      className="ml-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Categories

