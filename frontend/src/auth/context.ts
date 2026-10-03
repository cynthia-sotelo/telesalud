import { createContext } from 'react'
import type { AuthResponse } from '../types'

export interface AuthState {
  token: string | null
  userId: string | null
  fullName: string | null
  role: AuthResponse['role'] | null
}

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
