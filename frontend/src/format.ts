import type { BookingStatus } from './types'

const LOCALE = 'es-AR'

const dayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false })

/** "miércoles, 7 de octubre" */
export function formatDay(iso: string): string {
  return dayFormat.format(new Date(iso))
}

/** "14:30" */
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso))
}

/** "14:30 a 15:00 hs" */
export function formatRange(startsAt: string, endsAt: string): string {
  return `${formatTime(startsAt)} a ${formatTime(endsAt)} hs`
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

/** "AB" a partir de "Dra Ana Benitez" (ignora el tratamiento Dr/Dra). */
export function initials(fullName: string): string {
  const parts = fullName
    .split(/\s+/)
    .filter((p) => p && !/^dra?\.?$/i.test(p))
  return (parts[0]?.[0] ?? '?').concat(parts[1]?.[0] ?? '').toUpperCase()
}
