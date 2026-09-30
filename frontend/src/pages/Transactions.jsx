import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then((response) => response.json())
      .then((data) => {
        setCategories(data)
      })
      .catch((error) => {
        console.error('Failed to fetch categories:', error)
      })
  }, [])

  useEffect(() => {
    setLoading(true)

    let url = `http://localhost:5000/api/transactions?limit=10&page=${page}`

    if (type) {
      url += `&type=${type}`
    }

    if (categoryId) {
      url += `&categoryId=${categoryId}`
    }

    if (fromDate) {
      url += `&fromDate=${fromDate}`
    }

    if (toDate) {
      url += `&toDate=${toDate}`
    }

    if (search) {
      url += `&search=${search}`
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data.transactions)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch transactions:', error)
        setError('Failed to load transactions. Please try again.')
        setLoading(false)
      })
  }, [type, categoryId, fromDate, toDate, search, page])
  useEffect(() => {
  setPage(1)
  }, [type, categoryId, fromDate, toDate, search])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>

        <Link
          to="/transactions/add"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Transaction
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 flex-wrap">
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Notes</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="p-4">
                    Rs. {transaction.amount}
                  </td>

                  <td className="p-4 capitalize">
                    {transaction.type}
                  </td>

                  <td className="p-4">
                    {transaction.categoryId}
                  </td>

                  <td className="p-4">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    {transaction.notes || '-'}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/transactions/edit/${transaction.id}`}
                      className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {page}
          </span>

          <button
            onClick={() => setPage(page + 1)}
           disabled={transactions.length < 10}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
           Next
          </button>
        </div>
      </>
    )}
    </div>
  )
}

export default Transactions

