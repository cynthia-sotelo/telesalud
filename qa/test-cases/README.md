# Casos de prueba manuales

Casos de prueba funcionales del MVP de TeleSalud, organizados por módulo. Formato de cada tabla:

- **ID**: identificador único, referenciado desde Issues de bugs y desde los tests automatizados que lo cubren.
- **Prioridad**: Alta / Media / Baja — impacto en el negocio si falla.
- **Tipo**: Funcional (camino feliz) / Negativo (input inválido) / Borde (regla de negocio límite) / Seguridad.
- **Cubierto por automatización**: referencia al test JUnit/Postman/Cypress que automatiza este caso, si existe. "—" significa que hoy es 100% manual.
- **Resultado**: `Passed` / `Failed` / `Blocked` / `Not run` — se actualiza en cada ronda de ejecución manual.

Módulos:
- [auth.md](auth.md) — Registro y login
- [specialists-schedules.md](specialists-schedules.md) — Especialidades, especialistas y horarios
- [bookings.md](bookings.md) — Reserva y cancelación de turnos
- [reviews.md](reviews.md) — Reseñas
- [security.md](security.md) — Autorización por rol y CORS

## Última ronda de ejecución

**2026-09-14** — Ejecución manual exploratoria contra MySQL local real (no H2), navegador real, flujo completo especialista→horario→paciente→reserva→reseña→cancelación. Encontrado y corregido `TC-SEC-01` (CORS bloqueaba todo el frontend). Detalle de resultados en cada tabla de módulo.
