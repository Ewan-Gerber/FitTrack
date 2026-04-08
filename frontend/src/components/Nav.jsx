import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Nav({ dark, setDark }) {
  const { logout } = useAuth()

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-11">
        <span style={{ color: 'var(--accent)' }} className="font-bold text-sm tracking-tight">FitTrack</span>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive ? 'text-[var(--accent)] bg-[var(--accent-light)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`
          }>
            Dashboard
          </NavLink>
          <NavLink to="/workout" className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive ? 'text-[var(--accent)] bg-[var(--accent-light)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`
          }>
            Workout
          </NavLink>
          <NavLink to="/progress" className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive ? 'text-[var(--accent)] bg-[var(--accent-light)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`
          }>
            Progress
          </NavLink>
          <button
            onClick={() => setDark(d => !d)}
            style={{ color: 'var(--muted)' }}
            className="ml-1 px-2 py-1.5 text-xs hover:text-[var(--text)] transition"
            title="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={logout}
            style={{ color: 'var(--muted)' }}
            className="px-3 py-1.5 text-xs hover:text-[var(--text)] transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}