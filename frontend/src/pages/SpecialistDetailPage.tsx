import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient, extractErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import type { Schedule } from '../types'

export function SpecialistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingScheduleId, setBookingScheduleId] = useState<string | null>(null)

  const loadSchedules = () => {
    if (!id) return
    apiClient.get<Schedule[]>(`/specialists/${id}/schedules`).then(({ data }) => setSchedules(data))
  }

  useEffect(loadSchedules, [id])

  const handleBook = async (scheduleId: string) => {
    setError(null)
    setMessage(null)
    setBookingScheduleId(scheduleId)
    try {
      await apiClient.post('/bookings', { scheduleId, reason: '' })
      setMessage('Turno reservado con exito. Podes verlo en "Mis turnos".')
      loadSchedules()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBookingScheduleId(null)
    }
  }

  return (
    <div className="specialist-detail-page">
      <h1>Horarios disponibles</h1>

      {!isAuthenticated && <p>Necesitas iniciar sesion como paciente para reservar un turno.</p>}
      {message && (
        <p role="status" data-testid="booking-success">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error" data-testid="booking-error">
          {error}
        </p>
      )}

      <ul className="schedule-list" data-testid="schedule-list">
        {schedules.map((schedule) => (
          <li key={schedule.id} data-testid="schedule-item">
            {new Date(schedule.startsAt).toLocaleString()} - {new Date(schedule.endsAt).toLocaleTimeString()}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => handleBook(schedule.id)}
                disabled={bookingScheduleId === schedule.id}
                data-testid="book-button"
              >
                Reservar
              </button>
            )}
          </li>
        ))}
        {schedules.length === 0 && <p data-testid="schedule-empty">No hay horarios disponibles por el momento.</p>}
      </ul>
    </div>
  )
}
