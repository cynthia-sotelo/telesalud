import { useEffect, useState } from 'react'
import { apiClient, extractErrorMessage } from '../api/client'
import { formatDay, formatRange, STATUS_LABELS } from '../format'
import type { Booking } from '../types'

const STARS = [1, 2, 3, 4, 5]

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({})
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  const loadBookings = () => {
    apiClient.get<Booking[]>('/bookings/me').then(({ data }) => setBookings(data))
  }

  useEffect(loadBookings, [])

  const handleCancel = async (id: string) => {
    setError(null)
    try {
      await apiClient.delete(`/bookings/${id}`)
      loadBookings()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const draftOf = (bookingId: string) => reviewDrafts[bookingId] ?? { rating: 5, comment: '' }

  const handleReviewChange = (bookingId: string, change: Partial<{ rating: number; comment: string }>) => {
    setReviewDrafts((prev) => ({ ...prev, [bookingId]: { ...draftOf(bookingId), ...change } }))
  }

  const handleReviewSubmit = async (bookingId: string) => {
    setError(null)
    const draft = draftOf(bookingId)
    try {
      await apiClient.post('/reviews', { bookingId, rating: draft.rating, comment: draft.comment })
      setReviewedIds((prev) => new Set(prev).add(bookingId))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const list = bookings ?? []

  return (
    <div className="my-bookings-page">
      <h1>Mis turnos</h1>
      <p className="page-lead">Tus reservas, con la opción de cancelar o dejar una reseña.</p>

      {error && (
        <p role="alert" className="form-error" data-testid="bookings-error">
          {error}
        </p>
      )}

      {list.length > 0 && (
        <ul className="booking-list plain-list" data-testid="booking-list">
          {list.map((booking) => {
            const draft = draftOf(booking.id)
            return (
              <li key={booking.id} className="booking-item" data-testid="booking-item">
                <div className="booking-head">
                  <div>
                    <h2>{booking.specialistName}</h2>
                    <p>
                      <span className="slot-day">{formatDay(booking.startsAt)}</span>
                      <span className="slot-time">{formatRange(booking.startsAt, booking.endsAt)}</span>
                    </p>
                  </div>
                  <span className="badge" data-status={booking.status} data-testid="booking-status">
                    {STATUS_LABELS[booking.status]}
                  </span>
                </div>

                {booking.status === 'CONFIRMED' && (
                  <div className="booking-actions">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleCancel(booking.id)}
                      data-testid="cancel-button"
                    >
                      Cancelar turno
                    </button>
                  </div>
                )}

                {booking.status === 'CONFIRMED' && !reviewedIds.has(booking.id) && (
                  <div className="review-form">
                    <fieldset>
                      <legend>Calificá la atención</legend>
                      <div className="stars" data-testid="review-rating">
                        {STARS.map((star) => (
                          <label key={star} className={star <= draft.rating ? 'is-on' : undefined}>
                            <input
                              type="radio"
                              name={`rating-${booking.id}`}
                              value={star}
                              checked={draft.rating === star}
                              onChange={() => handleReviewChange(booking.id, { rating: star })}
                              aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                            />
                            <span aria-hidden="true">★</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <label htmlFor={`comment-${booking.id}`}>Comentario</label>
                    <textarea
                      id={`comment-${booking.id}`}
                      placeholder="Contanos cómo fue tu experiencia"
                      value={draft.comment}
                      onChange={(e) => handleReviewChange(booking.id, { comment: e.target.value })}
                      data-testid="review-comment"
                    />
                    <button type="button" onClick={() => handleReviewSubmit(booking.id)} data-testid="review-submit">
                      Dejar reseña
                    </button>
                  </div>
                )}

                {reviewedIds.has(booking.id) && <p data-testid="review-thanks">¡Gracias por tu reseña!</p>}
              </li>
            )
          })}
        </ul>
      )}
      {bookings !== null && list.length === 0 && (
        <p className="empty-state" data-testid="bookings-empty">
          Todavia no reservaste ningun turno.
        </p>
      )}
    </div>
  )
}
