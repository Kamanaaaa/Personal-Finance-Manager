import { useEffect, useState } from 'react'

function SavingsGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionError, setContributionError] = useState('')
  const [contributingId, setContributingId] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError('')

    fetch('http://localhost:5000/api/goals')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load savings goals')
        }

        return response.json()
      })
      .then((data) => {
        setGoals(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch savings goals:', error)
        setError('Failed to load savings goals. Please try again.')
        setLoading(false)
      })
  }, [])

  const handleContribute = async (goalId) => {
    setContributionError('')

    if (!contributionAmount) {
      setContributionError('Please enter a contribution amount.')
      return
    }

    if (Number(contributionAmount) <= 0) {
      setContributionError(
        'Contribution amount must be greater than 0.'
      )
      return
    }

    const goal = goals.find((goal) => goal.id === goalId)

    if (!goal) {
      setContributionError('Savings goal not found.')
      return
    }

    if (goal.completed) {
      setContributionError(
        'This savings goal is already completed.'
      )
      return
    }

    setContributingId(goalId)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/goals/${goalId}/contribute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Number(contributionAmount),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Contribution failed')
      }

      setContributionAmount('')

      setGoals(
        goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                savedAmount: data.savedAmount,
                completed: data.completed,
              }
            : goal
        )
      )
    } catch (error) {
      console.error('Failed to add contribution:', error)
      setError(
        error.message ||
          'Failed to add contribution. Please try again.'
      )
    } finally {
      setContributingId(null)
    }
  }

  if (loading) {
    return <p>Loading savings goals...</p>
  }

  if (error && goals.length === 0) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Savings Goals</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {contributionError && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {contributionError}
        </div>
      )}

      {goals.length === 0 ? (
        <p>No savings goals found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? (goal.savedAmount / goal.targetAmount) * 100
                : 0

            return (
              <div
                key={goal.id}
                className="rounded-lg bg-white p-6 shadow"
              >
                <h2 className="text-xl font-bold">
                  {goal.name}
                </h2>

                <p className="mt-2 text-gray-500">
                  Saved: Rs. {goal.savedAmount}
                </p>

                <p className="text-gray-500">
                  Target: Rs. {goal.targetAmount}
                </p>

                {goal.deadline && (
                  <p className="text-gray-500">
                    Deadline:{' '}
                    {new Date(
                      goal.deadline
                    ).toLocaleDateString()}
                  </p>
                )}

                <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {Math.round(progress)}% completed
                </p>

                {goal.completed ? (
                  <p className="mt-4 rounded-lg bg-green-100 p-3 text-center font-medium text-green-700">
                    Goal completed 🎉
                  </p>
                ) : (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                        value={contributingId === goal.id
                          ? contributionAmount
                          : contributionAmount}
                        onChange={(e) => {
                          setContributionAmount(e.target.value)
                          setContributionError('')
                        }}
                        disabled={contributingId === goal.id}
                        className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleContribute(goal.id)
                        }
                        disabled={contributingId === goal.id}
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {contributingId === goal.id
                          ? 'Adding...'
                          : 'Contribute'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SavingsGoals

