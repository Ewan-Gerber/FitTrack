import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Nav({ dark, setDark }) {
  const { logout } = useAuth()

  const linkStyle = (isActive) => ({
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    background: isActive ? 'var(--accent-light)' : 'none',
    color: isActive ? 'var(--accent-text)' : 'var(--muted)',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  })

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', marginRight: '0.5rem', flexShrink: 0 }}>FitTrack</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>Dashboard</NavLink>
          <NavLink to="/workout" style={({ isActive }) => linkStyle(isActive)}>Workout</NavLink>
          <NavLink to="/progress" style={({ isActive }) => linkStyle(isActive)}>Progress</NavLink>
          <button
            onClick={() => setDark(d => !d)}
            style={{ color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', fontSize: '0.875rem', cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={logout}
            style={{ color: 'var(--muted)', background: 'none', border: 'none', padding: '0.375rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            Out
          </button>
        </div>
      </div>
    </nav>
  )
}