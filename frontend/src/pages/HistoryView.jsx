import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function formatTs(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryView() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(`${API_BASE}/history/`)
      setRecords(data)
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Clear all detection history? This cannot be undone.')) return
    await axios.delete(`${API_BASE}/history/reset`)
    setRecords([])
  }

  useEffect(() => { fetchHistory() }, [])

  const chartData = [...records].reverse().map((r) => ({
    time: formatTs(r.timestamp),
    people: r.person_count,
    confidence: +(r.average_confidence * 100).toFixed(1),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History View</h1>
          <p className="mt-1 text-sm text-slate-400">
            Past detection records ({records.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchHistory}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">
            Refresh
          </button>
          <button onClick={handleReset}
            className="rounded-lg bg-red-800 px-3 py-2 text-sm hover:bg-red-700">
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="mb-3 text-sm font-medium text-slate-300">People Detected Over Time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Line type="monotone" dataKey="people" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
