import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import DetectionView from './pages/DetectionView'
import HistoryView from './pages/HistoryView'

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-emerald-600 text-white'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
  }`

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        {/* Navigation */}
        <nav className="border-b border-slate-700 bg-slate-800 px-6 py-3">
          <div className="mx-auto flex max-w-5xl items-center gap-6">
            <span className="text-lg font-bold tracking-tight text-emerald-400">
              🔍 Detecto
            </span>
            <NavLink to="/" className={navLinkClass} end>
              Detection
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              History
            </NavLink>
          </div>
        </nav>

        {/* Page content */}
        <main className="mx-auto max-w-5xl px-6 py-8">
          <Routes>
            <Route path="/" element={<DetectionView />} />
            <Route path="/history" element={<HistoryView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
