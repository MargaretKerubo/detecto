import { Clock, Percent, Users } from 'lucide-react'

/**
 * StatsPanel
 * Displays the three key metrics for a single detection run:
 *   - Total people detected
 *   - Average confidence score
 *   - Inference time in milliseconds
 */
function StatCard({ icon: Icon, label, value, colour }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-4">
      <div className={`rounded-lg p-2 ${colour}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default function StatsPanel({ personCount, avgConfidence, inferenceTimeMs }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        icon={Users}
        label="People Detected"
        value={personCount ?? '—'}
        colour="bg-emerald-900/50 text-emerald-400"
      />
      <StatCard
        icon={Percent}
        label="Avg. Confidence"
        value={avgConfidence != null ? `${(avgConfidence * 100).toFixed(1)}%` : '—'}
        colour="bg-blue-900/50 text-blue-400"
      />
      <StatCard
        icon={Clock}
        label="Inference Time"
        value={inferenceTimeMs != null ? `${inferenceTimeMs.toFixed(0)} ms` : '—'}
        colour="bg-violet-900/50 text-violet-400"
      />
    </div>
  )
}
