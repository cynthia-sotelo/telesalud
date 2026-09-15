export type Role = 'PATIENT' | 'SPECIALIST'

export interface AuthResponse {
  token: string
  userId: string
  fullName: string
  role: Role
}

export interface Specialty {
  id: string
  name: string
}

export interface Specialist {
  id: string
  fullName: string
  email: string
  specialtyName: string
  bio: string | null
}

export interface Schedule {
  id: string
  startsAt: string
  endsAt: string
  booked: boolean
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Booking {
  id: string
  scheduleId: string
  specialistName: string
  startsAt: string
  endsAt: string
  reason: string | null
  status: BookingStatus
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
}
