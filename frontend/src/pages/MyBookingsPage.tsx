import { useEffect, useState } from 'react'
import { apiClient, extractErrorMessage } from '../api/client'
import type { Booking } from '../types'

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
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

  const handleReviewChange = (bookingId: string, field: 'rating' | 'comment', value: string) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        rating: field === 'rating' ? Number(value) : (prev[bookingId]?.rating ?? 5),
        comment: field === 'comment' ? value : (prev[bookingId]?.comment ?? ''),
      },
    }))
  }

  const handleReviewSubmit = async (bookingId: string) => {
    setError(null)
    const draft = reviewDrafts[bookingId] ?? { rating: 5, comment: '' }
    try {
      await apiClient.post('/reviews', { bookingId, rating: draft.rating, comment: draft.comment })
      setReviewedIds((prev) => new Set(prev).add(bookingId))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="my-bookings-page">
      <h1>Mis turnos</h1>

      {error && (
        <p role="alert" className="form-error" data-testid="bookings-error">
          {error}
        </p>
      )}

      <ul className="booking-list" data-testid="booking-list">
        {bookings.map((booking) => (
          <li key={booking.id} data-testid="booking-item">
            <p>
              {booking.specialistName} - {new Date(booking.startsAt).toLocaleString()} -{' '}
              <span data-testid="booking-status">{booking.status}</span>
            </p>

            {booking.status === 'CONFIRMED' && (
              <button type="button" onClick={() => handleCancel(booking.id)} data-testid="cancel-button">
                Cancelar
              </button>
            )}

            {booking.status === 'CONFIRMED' && !reviewedIds.has(booking.id) && (
              <div className="review-form">
                <label htmlFor={`rating-${booking.id}`}>Calificacion (1-5)</label>
                <input
                  id={`rating-${booking.id}`}
                  type="number"
                  min={1}
                  max={5}
                  value={reviewDrafts[booking.id]?.rating ?? 5}
                  onChange={(e) => handleReviewChange(booking.id, 'rating', e.target.value)}
                  data-testid="review-rating"
                />
                <textarea
                  placeholder="Comentario"
                  value={reviewDrafts[booking.id]?.comment ?? ''}
                  onChange={(e) => handleReviewChange(booking.id, 'comment', e.target.value)}
                  data-testid="review-comment"
                />
                <button type="button" onClick={() => handleReviewSubmit(booking.id)} data-testid="review-submit">
                  Dejar reseña
                </button>
              </div>
            )}

            {reviewedIds.has(booking.id) && <p data-testid="review-thanks">¡Gracias por tu reseña!</p>}
          </li>
        ))}
        {bookings.length === 0 && <p data-testid="bookings-empty">Todavia no reservaste ningun turno.</p>}
      </ul>
    </div>
  )
}
