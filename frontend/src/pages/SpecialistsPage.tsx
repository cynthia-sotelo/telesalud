import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
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

      {loading && <p>Cargando...</p>}

      <ul className="specialist-list" data-testid="specialist-list">
        {specialists.map((specialist) => (
          <li key={specialist.id} className="specialist-card" data-testid="specialist-card">
            <h2>{specialist.fullName}</h2>
            <p>{specialist.specialtyName}</p>
            {specialist.bio && <p>{specialist.bio}</p>}
            <Link to={`/especialistas/${specialist.id}`} data-testid="specialist-view-link">
              Ver disponibilidad
            </Link>
          </li>
        ))}
        {!loading && specialists.length === 0 && <p data-testid="specialist-empty">No hay especialistas para mostrar.</p>}
      </ul>
    </div>
  )
}
