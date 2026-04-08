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
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-2xl p-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 style={{ color: 'var(--accent)' }} className="text-2xl font-bold tracking-tight">FitTrack</h1>
            <p style={{ color: 'var(--muted)' }} className="text-xs mt-0.5">Track your fitness journey</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            style={{ color: 'var(--muted)' }}
            className="text-lg"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 text-xs rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: 'var(--accent)' }}
            className="w-full text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Log in'}
          </button>
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
            className="w-full rounded-lg py-2 text-sm font-medium hover:bg-[var(--border)] transition disabled:opacity-50"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}