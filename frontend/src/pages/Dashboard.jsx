import { useState, useEffect } from 'react'
import client from '../api/client'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates() {
  const today = new Date()
  const day = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

const card = { background: 'var(--surface)', border: '1px solid var(--border)' }
const muted = { color: 'var(--muted)' }
const accent = { color: 'var(--accent)' }

export default function Dashboard() {
  const [days, setDays] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [stepsInput, setStepsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const today = fmtDate(new Date())

  useEffect(() => {
    client.get('/days/').then(r => setDays(r.data))
    client.get('/workouts/').then(r => setWorkouts(r.data))
  }, [])

  const todayData = days.find(d => d.date === today)
  const week = getWeekDates()

  const stepStreak = () => {
    let streak = 0
    const d = new Date()
    while (true) {
      const k = fmtDate(d)
      const found = days.find(x => x.date === k)
      if (found && found.steps >= 8000) {
        streak++
        d.setDate(d.getDate() - 1)
      } else break
    }
    return streak
  }

  const saveSteps = async () => {
    if (!stepsInput) return
    setSaving(true)
    try {
      const res = await client.post('/days/', { date: today, steps: parseInt(stepsInput) })
      setDays(prev => [...prev.filter(d => d.date !== today), res.data])
      setStepsInput('')
    } finally {
      setSaving(false)
    }
  }

  const gymDates = new Set(workouts.map(w => w.date))

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-wrap">

        <div style={{ marginBottom: '1rem' }}>
          <p style={muted} className="text-xs">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { val: stepStreak(), label: 'Step streak' },
            { val: `${week.filter(d => days.find(x => x.date === fmtDate(d) && x.steps >= 8000)).length}/7`, label: 'Steps this week' },
            { val: week.filter(d => gymDates.has(fmtDate(d))).length, label: 'Gym sessions' },
          ].map(({ val, label }) => (
            <div key={label} style={{ ...card, borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ ...accent, fontSize: '1.5rem', fontWeight: 700 }}>{val}</div>
              <div style={{ ...muted, fontSize: '0.7rem', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.75rem' }}>
          <h2 style={{ ...muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>This week</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {week.map((d, i) => {
              const k = fmtDate(d)
              const dayData = days.find(x => x.date === k)
              const hasSteps = dayData && dayData.steps >= 8000
              const hasGym = gymDates.has(k)
              const isToday = k === today
              return (
                <div key={k} style={{
                  border: isToday ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: hasSteps && hasGym ? 'var(--accent-light)' : hasSteps ? 'var(--green-light)' : 'var(--bg)',
                  borderRadius: '0.5rem', padding: '0.375rem', textAlign: 'center'
                }}>
                  <div style={{ ...muted, fontSize: '0.65rem', fontWeight: 500 }}>{DAYS[i]}</div>
                  <div style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600 }}>{d.getDate()}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.125rem', marginTop: '0.25rem' }}>
                    {hasSteps && <div style={{ background: 'var(--green)', width: '0.375rem', height: '0.375rem', borderRadius: '50%' }}></div>}
                    {hasGym && <div style={{ background: 'var(--accent)', width: '0.375rem', height: '0.375rem', borderRadius: '50%' }}></div>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
            <span style={{ ...muted, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ background: 'var(--green)', display: 'inline-block', width: '0.5rem', height: '0.5rem', borderRadius: '50%' }}></span>8k steps
            </span>
            <span style={{ ...muted, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ background: 'var(--accent)', display: 'inline-block', width: '0.5rem', height: '0.5rem', borderRadius: '50%' }}></span>Gym
            </span>
          </div>
        </div>

        <div style={{ ...card, borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.75rem' }}>
          <h2 style={{ ...muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Log today's steps</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              placeholder={todayData ? `Current: ${todayData.steps.toLocaleString()}` : 'e.g. 8500'}
              value={stepsInput}
              onChange={e => setStepsInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveSteps()}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', flex: 1, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
            <button
              onClick={saveSteps}
              disabled={saving}
              style={{ background: 'var(--accent)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {todayData && (
            <p style={{ color: 'var(--green)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {todayData.steps >= 8000 ? `✓ Goal reached — ${todayData.steps.toLocaleString()} steps` : `${todayData.steps.toLocaleString()} steps — ${(8000 - todayData.steps).toLocaleString()} to go`}
            </p>
          )}
        </div>

        <div style={{ ...card, borderRadius: '0.75rem', padding: '1rem' }}>
          <h2 style={{ ...muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Recent workouts</h2>
          {workouts.length === 0 ? (
            <p style={{ ...muted, fontSize: '0.875rem', textAlign: 'center', padding: '0.75rem 0' }}>No workouts logged yet</p>
          ) : (
            <div>
              {workouts.slice(0, 5).map((w, i) => (
                <div key={w.id} style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div>
                    <span style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '0.7rem', fontWeight: 500, padding: '0.125rem 0.5rem', borderRadius: '9999px', marginRight: '0.5rem' }}>{w.split}</span>
                    <span style={{ ...muted, fontSize: '0.75rem' }}>{w.exercises.map(e => e.name).join(', ')}</span>
                  </div>
                  <span style={{ ...muted, fontSize: '0.75rem' }}>{new Date(w.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}