import { useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse } from '../types'
import { AuthContext, type AuthContextValue, type AuthState } from './context'

const STORAGE_KEYS = {
  token: 'telesalud_token',
  userId: 'telesalud_user_id',
  fullName: 'telesalud_full_name',
  role: 'telesalud_role',
} as const

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
