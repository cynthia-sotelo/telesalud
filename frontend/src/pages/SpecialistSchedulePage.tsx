import { useState, type FormEvent } from 'react'
import { apiClient, extractErrorMessage } from '../api/client'
import type { Schedule } from '../types'

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function SpecialistSchedulePage() {
  const defaultStart = new Date(Date.now() + 60 * 60 * 1000)
  const defaultEnd = new Date(defaultStart.getTime() + 30 * 60 * 1000)

  const [startsAt, setStartsAt] = useState(toLocalInputValue(defaultStart))
  const [endsAt, setEndsAt] = useState(toLocalInputValue(defaultEnd))
  const [created, setCreated] = useState<Schedule[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await apiClient.post<Schedule>('/specialists/me/schedules', {
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      })
      setCreated((prev) => [...prev, data])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="specialist-schedule-page">
      <h1>Mis horarios</h1>
      <p>Cargá franjas horarias para que los pacientes puedan reservar turnos con vos.</p>

      <form onSubmit={handleSubmit} data-testid="schedule-form">
        <label htmlFor="startsAt">Desde</label>
        <input
          id="startsAt"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
          data-testid="schedule-starts-at"
        />

        <label htmlFor="endsAt">Hasta</label>
        <input
          id="endsAt"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          required
          data-testid="schedule-ends-at"
        />

        {error && (
          <p role="alert" className="form-error" data-testid="schedule-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} data-testid="schedule-submit">
          {loading ? 'Guardando...' : 'Agregar horario'}
        </button>
      </form>

      <h2>Horarios creados en esta sesión</h2>
      <ul className="schedule-list" data-testid="my-schedule-list">
        {created.map((schedule) => (
          <li key={schedule.id}>
            {new Date(schedule.startsAt).toLocaleString()} - {new Date(schedule.endsAt).toLocaleTimeString()}
          </li>
        ))}
        {created.length === 0 && <p>Todavia no cargaste horarios.</p>}
      </ul>
    </div>
  )
}
