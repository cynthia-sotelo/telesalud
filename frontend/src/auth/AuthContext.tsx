import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse } from '../types'

interface AuthState {
  token: string | null
  userId: string | null
  fullName: string | null
  role: AuthResponse['role'] | null
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
}

const STORAGE_KEYS = {
  token: 'telesalud_token',
  userId: 'telesalud_user_id',
  fullName: 'telesalud_full_name',
  role: 'telesalud_role',
} as const

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readInitialState(): AuthState {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    userId: localStorage.getItem(STORAGE_KEYS.userId),
    fullName: localStorage.getItem(STORAGE_KEYS.fullName),
    role: localStorage.getItem(STORAGE_KEYS.role) as AuthResponse['role'] | null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitialState)

  const login = (auth: AuthResponse) => {
    localStorage.setItem(STORAGE_KEYS.token, auth.token)
    localStorage.setItem(STORAGE_KEYS.userId, auth.userId)
    localStorage.setItem(STORAGE_KEYS.fullName, auth.fullName)
    localStorage.setItem(STORAGE_KEYS.role, auth.role)
    setState({ token: auth.token, userId: auth.userId, fullName: auth.fullName, role: auth.role })
  }

  const logout = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    setState({ token: null, userId: null, fullName: null, role: null })
  }

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, isAuthenticated: Boolean(state.token), login, logout }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return ctx
}
