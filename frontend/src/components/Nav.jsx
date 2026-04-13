import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Nav({ dark, setDark }) {
  const { logout } = useAuth()

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>FitTrack</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <NavLink to="/" end style={({ isActive }) => ({
            padding: '0.5rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            background: isActive ? 'var(--accent-light)' : 'none',
            color: isActive ? 'var(--accent-text)' : 'var(--muted)',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
          })}>
            Dashboard
          </NavLink>
          <NavLink to="/workout" style={({ isActive }) => ({
            padding: '0.5rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            background: isActive ? 'var(--accent-light)' : 'none',
            color: isActive ? 'var(--accent-text)' : 'var(--muted)',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
          })}>
            Workout
          </NavLink>
          <NavLink to="/progress" style={({ isActive }) => ({
            padding: '0.5rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            background: isActive ? 'var(--accent-light)' : 'none',
            color: isActive ? 'var(--accent-text)' : 'var(--muted)',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
          })}>
            Progress
          </NavLink>
          <button
            onClick={() => setDark(d => !d)}
            style={{ color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem 0.625rem', fontSize: '0.875rem', cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={logout}
            style={{ color: 'var(--muted)', background: 'none', border: 'none', padding: '0.5rem 0.625rem', fontSize: '0.875rem', cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            Out
          </button>
        </div>
      </div>
    </nav>
  )
}