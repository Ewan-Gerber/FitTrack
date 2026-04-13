import { useState } from 'react'
import { useAuth } from '../AuthContext'
import client from '../api/client'

export default function Login({ dark, setDark }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)
      const res = await client.post('/auth/login', form)
      login(res.data.access_token)
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await client.post('/auth/register', { email, password })
      login(res.data.access_token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: '100%', maxWidth: '420px', borderRadius: '1rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--accent)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>FitTrack</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Track your fitness journey</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            style={{ color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '0.875rem', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '1rem', width: '100%', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '1rem', width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.625rem', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1, width: '100%' }}
          >
            {loading ? 'Loading...' : 'Log in'}
          </button>
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{ background: 'none', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.875rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.5 : 1, width: '100%' }}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}