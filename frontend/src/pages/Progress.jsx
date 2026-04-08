import { useState, useEffect } from 'react'
import client from '../api/client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts'

const card = { background: 'var(--surface)', border: '1px solid var(--border)' }
const muted = { color: 'var(--muted)' }

export default function Progress() {
  const [workouts, setWorkouts] = useState([])
  const [days, setDays] = useState([])
  const [selectedEx, setSelectedEx] = useState(null)

  useEffect(() => {
    client.get('/workouts/').then(r => setWorkouts(r.data))
    client.get('/days/').then(r => setDays(r.data))
  }, [])

  const getExerciseMap = () => {
    const map = {}
    workouts.forEach(w => {
      w.exercises.forEach(e => {
        if (!map[e.name]) map[e.name] = []
        const max = Math.max(...e.sets.map(s => s.weight))
        map[e.name].push({ date: w.date, maxWeight: max })
      })
    })
    Object.keys(map).forEach(k => map[k].sort((a, b) => a.date.localeCompare(b.date)))
    return map
  }

  const exMap = getExerciseMap()
  const exNames = Object.keys(exMap).sort()

  const stepData = () => {
    const last14 = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const k = d.toISOString().split('T')[0]
      const found = days.find(x => x.date === k)
      last14.push({
        date: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        steps: found ? found.steps : 0
      })
    }
    return last14
  }

  const selectedData = selectedEx ? exMap[selectedEx].map(d => ({
    date: new Date(d.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
    weight: d.maxWeight
  })) : []

  const best = selectedData.length ? Math.max(...selectedData.map(d => d.weight)) : 0

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-wrap">

        <div style={{ ...card, borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ ...muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Exercise progress</h2>
          {exNames.length === 0 ? (
            <p style={{ ...muted, fontSize: '0.875rem', textAlign: 'center', padding: '0.75rem 0' }}>Log some workouts first</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                {exNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedEx(name)}
                    style={selectedEx === name
                      ? { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }
                      : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }
                    }
                  >
                    {name}
                  </button>
                ))}
              </div>
              {selectedEx && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500 }}>{selectedEx}</span>
                    <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 500 }}>Best: {best}kg</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={selectedData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} unit="kg" />
                      <Tooltip
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                        formatter={v => [`${v}kg`, 'Max weight']}
                      />
                      <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4, fill: 'var(--accent)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </>
          )}
        </div>

        <div style={{ ...card, borderRadius: '0.75rem', padding: '1rem' }}>
          <h2 style={{ ...muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Steps — last 14 days</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stepData()}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={v => [v.toLocaleString(), 'Steps']}
              />
              <ReferenceLine y={8000} stroke="var(--green)" strokeDasharray="4 4" />
              <Bar dataKey="steps" radius={[3, 3, 0, 0]}>
                {stepData().map((entry, i) => (
                  <Cell key={i} fill={entry.steps >= 8000 ? 'var(--accent)' : 'var(--border)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ ...muted, fontSize: '0.7rem', marginTop: '0.5rem' }}>Dashed line = 8,000 step goal. Teal bars = goal reached.</p>
        </div>

      </div>
    </div>
  )
}