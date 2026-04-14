import { useState, useEffect, useRef } from 'react'
import client from '../api/client'

const SPLITS = ['Upper', 'Lower', 'Push', 'Pull', 'Cardio']

const MUSCLE_GROUPS = {
  Upper: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
  Lower: ['Quads', 'Hamstrings', 'Calves'],
  Push: ['Chest', 'Shoulders', 'Triceps'],
  Pull: ['Back', 'Biceps'],
  Cardio: ['Cardio'],
}

const BASE_EXERCISES = {
  Chest: ['Incline Flies', 'Flies', 'Incline Smith'],
  Back: ['Lat Pulldown', 'Machine Lat Pulldown', 'Rows'],
  Shoulders: ['Lateral Raises', 'Shoulder Press'],
  Triceps: ['Press Downs', 'Single Arm', 'Overhead'],
  Biceps: ['Preacher Curls Single Arm', 'Cable Curls', 'Single Cable Curl'],
  Quads: ['Hack Squat', 'Pendulum Squat', 'Leg Extensions'],
  Hamstrings: ['Romanian Deadlift', 'Hamstring Curls'],
  Calves: ['Standing Calf Raise', 'Seated Calf Raise'],
  Cardio: ['Padle', 'Tennis', 'Running'],
}

function getLastSession(split, group, history) {
  const result = {}
  const exercises = BASE_EXERCISES[group] || []
  exercises.forEach(exName => {
    for (const workout of history) {
      const found = workout.exercises.find(e => e.name === exName)
      if (found) {
        result[exName] = found.sets
        break
      }
    }
  })
  return Object.keys(result).length > 0 ? result : null
}

function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

const card = { background: 'var(--surface)', border: '1px solid var(--border)' }
const muted = { color: 'var(--muted)' }

export default function Workout() {
  const [split, setSplit] = useState('Upper')
  const [date, setDate] = useState(fmtDate(new Date()))
  const [groups, setGroups] = useState({})
  const [history, setHistory] = useState([])
  const [customExercises, setCustomExercises] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    client.get('/workouts/').then(r => setHistory(r.data))
    client.get('/exercises/').then(r => setCustomExercises(r.data))
  }, [])

  useEffect(() => {
    if (!editingId) {
      const initial = {}
      MUSCLE_GROUPS[split].forEach(g => {
        const base = BASE_EXERCISES[g] || []
        const custom = customExercises.filter(e => e.muscle_group === g).map(e => e.name)
        const all = [...new Set([...base, ...custom])]
        initial[g] = all.map(name => ({ name, sets: [] }))
      })
      setGroups(initial)
    }
  }, [split, editingId, customExercises])

  const addSet = (group, exIdx, weight, reps) => {
    setGroups(prev => ({
      ...prev,
      [group]: prev[group].map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { weight: parseFloat(weight), reps: parseInt(reps) }] } : ex
      )
    }))
  }

  const removeSet = (group, exIdx, setIdx) => {
    setGroups(prev => ({
      ...prev,
      [group]: prev[group].map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex
      )
    }))
  }

  const addCustomExercise = async (group, name) => {
    if (!name.trim()) return
    try {
      const res = await client.post('/exercises/', { name: name.trim(), muscle_group: group })
      setCustomExercises(prev => {
        const exists = prev.find(e => e.name === res.data.name && e.muscle_group === group)
        if (exists) return prev
        return [...prev, res.data]
      })
    } catch (err) {
      console.error('Failed to save custom exercise', err)
    }
    setGroups(prev => {
      const exists = prev[group]?.find(e => e.name === name.trim())
      if (exists) return prev
      return {
        ...prev,
        [group]: [...(prev[group] || []), { name: name.trim(), sets: [] }]
      }
    })
  }

  const saveWorkout = async () => {
    const allExercises = Object.values(groups).flat().filter(e => e.sets.length > 0)
    if (!allExercises.length) return
    setSaving(true)
    try {
      let res
      if (editingId) {
        res = await client.put(`/workouts/${editingId}`, { date, split, exercises: allExercises })
        setHistory(prev => prev.map(w => w.id === editingId ? res.data : w))
        setEditingId(null)
      } else {
        res = await client.post('/workouts/', { date, split, exercises: allExercises })
        setHistory(prev => [res.data, ...prev])
      }
      const reset = {}
      MUSCLE_GROUPS[split].forEach(g => {
        const base = BASE_EXERCISES[g] || []
        const custom = customExercises.filter(e => e.muscle_group === g).map(e => e.name)
        const all = [...new Set([...base, ...custom])]
        reset[g] = all.map(name => ({ name, sets: [] }))
      })
      setGroups(reset)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const editWorkout = (workout) => {
    setEditingId(workout.id)
    setDate(workout.date)
    setSplit(workout.split)
    const newGroups = {}
    MUSCLE_GROUPS[workout.split].forEach(g => {
      const base = BASE_EXERCISES[g] || []
      const custom = customExercises.filter(e => e.muscle_group === g).map(e => e.name)
      const all = [...new Set([...base, ...custom])]
      newGroups[g] = all.map(name => ({ name, sets: [] }))
    })
    workout.exercises.forEach(ex => {
      let placed = false
      MUSCLE_GROUPS[workout.split].forEach(g => {
        const idx = newGroups[g]?.findIndex(e => e.name === ex.name)
        if (idx >= 0) {
          newGroups[g][idx] = { name: ex.name, sets: ex.sets }
          placed = true
        }
      })
      if (!placed) {
        const firstGroup = MUSCLE_GROUPS[workout.split][0]
        if (newGroups[firstGroup]) {
          newGroups[firstGroup].push({ name: ex.name, sets: ex.sets })
        }
      }
    })
    setGroups(newGroups)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    const reset = {}
    MUSCLE_GROUPS[split].forEach(g => {
      const base = BASE_EXERCISES[g] || []
      const custom = customExercises.filter(e => e.muscle_group === g).map(e => e.name)
      const all = [...new Set([...base, ...custom])]
      reset[g] = all.map(name => ({ name, sets: [] }))
    })
    setGroups(reset)
  }

  const deleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout? This cannot be undone.')) return
    await client.delete(`/workouts/${id}`)
    setHistory(prev => prev.filter(w => w.id !== id))
  }

  const totalSets = Object.values(groups).flat().reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-wrap">

        {editingId && (
          <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-text)', fontSize: '0.875rem', fontWeight: 500 }}>Editing workout</span>
            <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'var(--accent-text)', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', minHeight: '44px' }}
          />
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {SPLITS.map(s => (
              <button
                key={s}
                onClick={() => setSplit(s)}
                style={split === s
                  ? { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', minHeight: '44px' }
                  : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', minHeight: '44px' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {MUSCLE_GROUPS[split].map((group, idx) => (
          <MuscleGroup
            key={group}
            group={group}
            exercises={groups[group] || []}
            onAddSet={(exIdx, w, r) => addSet(group, exIdx, w, r)}
            onRemoveSet={(exIdx, si) => removeSet(group, exIdx, si)}
            onAddExercise={(name) => addCustomExercise(group, name)}
            lastSession={getLastSession(split, group, history)}
            defaultOpen={idx === 0}
            customExercises={customExercises.filter(e => e.muscle_group === group)}
          />
        ))}

        <button
          onClick={saveWorkout}
          disabled={saving || totalSets === 0}
          style={{ background: editingId ? 'var(--green)' : 'var(--accent)', color: '#fff', width: '100%', border: 'none', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 500, cursor: totalSets === 0 ? 'not-allowed' : 'pointer', opacity: totalSets === 0 ? 0.4 : 1, marginBottom: '0.5rem', minHeight: '48px' }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : editingId ? `Update workout (${totalSets} sets)` : `Save workout${totalSets > 0 ? ` (${totalSets} sets)` : ''}`}
        </button>

        {editingId && (
          <button
            onClick={cancelEdit}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: '100%', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem', minHeight: '48px' }}
          >
            Cancel edit
          </button>
        )}

        {!editingId && <div style={{ marginBottom: '1.5rem' }} />}

        <div style={{ ...card, borderRadius: '0.75rem', padding: '1rem' }}>
          <h2 style={{ ...muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Workout history</h2>
          {history.length === 0 ? (
            <p style={{ ...muted, fontSize: '0.875rem', textAlign: 'center', padding: '0.75rem 0' }}>No workouts yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map(w => (
                <div key={w.id} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.625rem', borderRadius: '9999px' }}>{w.split}</span>
                      <span style={{ ...muted, fontSize: '0.8rem' }}>{new Date(w.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => editWorkout(w)} style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', minHeight: '36px', padding: '0 0.25rem' }}>Edit</button>
                      <button onClick={() => deleteWorkout(w.id)} style={{ fontSize: '0.8rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', minHeight: '36px', padding: '0 0.25rem' }}>Delete</button>
                    </div>
                  </div>
                  {w.exercises.map(e => (
                    <div key={e.id} style={{ fontSize: '0.8rem', marginTop: '0.25rem', marginLeft: '0.25rem' }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{e.name}</span>
                      <span style={muted}> {e.sets.map(s => `${s.weight}kg×${s.reps}`).join(', ')}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MuscleGroup({ group, exercises, onAddSet, onRemoveSet, onAddExercise, lastSession, defaultOpen}) {
  const [open, setOpen] = useState(defaultOpen)
  const [customEx, setCustomEx] = useState('')
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: '52px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '0.9375rem', fontWeight: 500 }}>{group}</span>
          {totalSets > 0 && (
            <span style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>{totalSets} sets</span>
          )}
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0 1rem 0.875rem' }}>
          {exercises.map((ex, ei) => (
            <ExerciseRow
              key={ei}
              exercise={ex}
              lastSets={lastSession?.[ex.name] || null}
              onAddSet={(w, r) => onAddSet(ei, w, r)}
              onRemoveSet={(si) => onRemoveSet(ei, si)}
            />
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
            <input
              type="text"
              placeholder="Add exercise..."
              value={customEx}
              onChange={e => setCustomEx(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onAddExercise(customEx); setCustomEx('') } }}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', flex: 1, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', minHeight: '44px' }}
            />
            <button
              onClick={() => { onAddExercise(customEx); setCustomEx('') }}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem', cursor: 'pointer', minHeight: '44px' }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseRow({ exercise, onAddSet, onRemoveSet, lastSets }) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [open, setOpen] = useState(false)
  const [timer, setTimer] = useState(null)
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(90)
  const intervalRef = useRef(null)

  const handleAdd = () => {
    if (!weight || !reps) return
    onAddSet(weight, reps)
    setWeight('')
    setReps('')
    startTimer(timerDuration)
  }

  const startTimer = (seconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimer(seconds)
    setTimerActive(true)
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setTimerActive(false)
          if (navigator.vibrate) navigator.vibrate([300, 100, 300])
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerActive(false)
    setTimer(null)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '0.625rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '44px' }}>
        <div>
          <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9375rem', textAlign: 'left', padding: '0' }}>
            {exercise.name}
            {exercise.sets.length > 0 && (
              <span style={{ color: 'var(--muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>{exercise.sets.length} set{exercise.sets.length > 1 ? 's' : ''}</span>
            )}
          </button>
          {lastSets && lastSets.length > 0 && exercise.sets.length === 0 && (
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.125rem' }}>
              Last: {lastSets.map(s => `${s.weight}kg×${s.reps}`).join(', ')}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {timerActive && timer !== null && (
            <button
              onClick={stopTimer}
              style={{ background: timer < 10 ? '#ef4444' : timer < 30 ? '#f59e0b' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.625rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', minHeight: '36px', minWidth: '56px' }}
            >
              {formatTime(timer)}
            </button>
          )}
          {!timerActive && timer === 0 && (
            <span style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: 500 }}>Rest done!</span>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 500, borderRadius: '0.5rem', padding: '0.375rem 0.75rem', minHeight: '36px', minWidth: '60px' }}
          >
            {open ? 'Done' : '+ Log'}
          </button>
        </div>
      </div>

      {exercise.sets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.375rem' }}>
          {exercise.sets.map((s, si) => (
            <span
              key={si}
              onClick={() => onRemoveSet(si)}
              style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '0.8125rem', padding: '0.375rem 0.625rem', borderRadius: '9999px', cursor: 'pointer', minHeight: '32px', display: 'flex', alignItems: 'center' }}
              title="Tap to remove"
            >
              {s.weight}kg×{s.reps}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div style={{ marginTop: '0.625rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <input
              type="number"
              placeholder={lastSets?.[0] ? `${lastSets[0].weight}` : 'kg'}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', width: '5.5rem', borderRadius: '0.5rem', padding: '0.625rem 0.5rem', fontSize: '1rem', minHeight: '44px' }}
            />
            <input
              type="number"
              placeholder={lastSets?.[0] ? `${lastSets[0].reps}` : 'reps'}
              value={reps}
              onChange={e => setReps(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', width: '5.5rem', borderRadius: '0.5rem', padding: '0.625rem 0.5rem', fontSize: '1rem', minHeight: '44px' }}
            />
            <button
              onClick={handleAdd}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.9375rem', cursor: 'pointer', minHeight: '44px' }}
            >
              + Set
            </button>
            {lastSets && lastSets.length > 0 && (
              <button
                onClick={() => {
                  lastSets.forEach(s => onAddSet(s.weight, s.reps))
                  startTimer(timerDuration)
                  setOpen(false)
                }}
                style={{ background: 'var(--green-light)', color: 'var(--green-text)', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '44px' }}
              >
                Repeat last
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Rest:</span>
            {[60, 90, 120].map(s => (
              <button
                key={s}
                onClick={() => setTimerDuration(s)}
                style={{ background: timerDuration === s ? 'var(--accent)' : 'var(--bg)', color: timerDuration === s ? '#fff' : 'var(--muted)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.25rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer', minHeight: '36px' }}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}