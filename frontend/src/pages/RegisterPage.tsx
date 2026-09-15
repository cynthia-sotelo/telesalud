import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient, extractErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import type { AuthResponse, Role, Specialty } from '../types'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('PATIENT')
  const [specialtyId, setSpecialtyId] = useState('')
  const [bio, setBio] = useState('')
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    apiClient.get<Specialty[]>('/specialties').then(({ data }) => setSpecialties(data))
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        fullName,
        role,
        specialtyId: role === 'SPECIALIST' ? specialtyId : null,
        bio: role === 'SPECIALIST' ? bio : null,
      })
      login(data)
      navigate('/especialistas')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit} data-testid="register-form">
        <label htmlFor="fullName">Nombre completo</label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          data-testid="register-fullname"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="register-email"
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-testid="register-password"
        />

        <label htmlFor="role">Quiero registrarme como</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          data-testid="register-role"
        >
          <option value="PATIENT">Paciente</option>
          <option value="SPECIALIST">Especialista</option>
        </select>

        {role === 'SPECIALIST' && (
          <>
            <label htmlFor="specialtyId">Especialidad</label>
            <select
              id="specialtyId"
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
              required
              data-testid="register-specialty"
            >
              <option value="">Seleccionar...</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label htmlFor="bio">Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} data-testid="register-bio" />
          </>
        )}

        {error && (
          <p role="alert" className="form-error" data-testid="register-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} data-testid="register-submit">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p>
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </div>
  )
}
