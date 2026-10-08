import { useState, type FormEvent } from 'react'
import { apiClient, extractErrorMessage } from '../api/client'
import { formatDay, formatRange } from '../format'
import type { Schedule } from '../types'

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Franja sugerida: dentro de una hora, de 30 minutos. Se calcula una sola vez al montar la
// pagina (inicializador de useState): llamar a Date.now() en el cuerpo del componente daria
// un valor distinto en cada render.
function defaultWindow(): { startsAt: string; endsAt: string } {
  const start = new Date(Date.now() + 60 * 60 * 1000)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  return { startsAt: toLocalInputValue(start), endsAt: toLocalInputValue(end) }
}

export function SpecialistSchedulePage() {
  const [defaults] = useState(defaultWindow)
  const [startsAt, setStartsAt] = useState(defaults.startsAt)
  const [endsAt, setEndsAt] = useState(defaults.endsAt)
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
      <p className="page-lead">Cargá franjas horarias para que los pacientes puedan reservar turnos con vos.</p>

      <form className="card" onSubmit={handleSubmit} data-testid="schedule-form">
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

      <h2 className="section-title">Horarios creados en esta sesión</h2>
      {created.length > 0 && (
        <ul className="schedule-list" data-testid="my-schedule-list">
          {created.map((schedule) => (
            <li key={schedule.id}>
              <div>
                <span className="slot-day">{formatDay(schedule.startsAt)}</span>
                <span className="slot-time">{formatRange(schedule.startsAt, schedule.endsAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {created.length === 0 && <p className="empty-state">Todavia no cargaste horarios.</p>}
    </div>
  )
}
