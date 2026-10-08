import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
import { initials } from '../format'
import type { Specialist, Specialty } from '../types'

export function SpecialistsPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [specialtyId, setSpecialtyId] = useState('')
  // Se guarda junto con la especialidad a la que corresponde: asi "cargando" se deduce de
  // comparar ambas, sin tener que llamar a setState de forma sincrona dentro del efecto.
  const [loaded, setLoaded] = useState<{ specialtyId: string; list: Specialist[] } | null>(null)

  useEffect(() => {
    apiClient.get<Specialty[]>('/specialties').then(({ data }) => setSpecialties(data))
  }, [])

  useEffect(() => {
    // "cancelled" descarta la respuesta de un filtro viejo si el usuario cambio de especialidad
    // antes de que llegara (si no, una respuesta lenta pisaria a la mas nueva).
    let cancelled = false
    apiClient
      .get<Specialist[]>('/specialists', { params: specialtyId ? { specialtyId } : {} })
      .then(({ data }) => {
        if (!cancelled) setLoaded({ specialtyId, list: data })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ specialtyId, list: [] })
      })
    return () => {
      cancelled = true
    }
  }, [specialtyId])

  const specialists = loaded?.list ?? []
  const loading = loaded?.specialtyId !== specialtyId

  return (
    <div className="specialists-page">
      <h1>Buscar especialistas</h1>
      <p className="page-lead">Elegí un profesional y reservá tu turno online.</p>

      <div className="filter-bar">
        <label htmlFor="specialtyFilter">Filtrar por especialidad</label>
        <select
          id="specialtyFilter"
          value={specialtyId}
          onChange={(e) => setSpecialtyId(e.target.value)}
          data-testid="specialty-filter"
        >
          <option value="">Todas</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p role="status">Cargando...</p>}

      {specialists.length > 0 && (
        <ul className="specialist-list" data-testid="specialist-list">
          {specialists.map((specialist) => (
            <li key={specialist.id} className="specialist-card" data-testid="specialist-card">
              <div className="specialist-head">
                <span className="avatar" aria-hidden="true">
                  {initials(specialist.fullName)}
                </span>
                <div>
                  <h2>{specialist.fullName}</h2>
                  <span className="pill" data-testid="specialist-specialty">
                    {specialist.specialtyName}
                  </span>
                </div>
              </div>
              {specialist.bio && <p>{specialist.bio}</p>}
              <Link
                to={`/especialistas/${specialist.id}`}
                className="button-link"
                data-testid="specialist-view-link"
              >
                Ver disponibilidad
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!loading && specialists.length === 0 && (
        <p className="empty-state" data-testid="specialist-empty">
          No hay especialistas para mostrar.
        </p>
      )}
    </div>
  )
}
