# Casos de prueba manuales

Casos de prueba funcionales del MVP de TeleSalud, organizados por módulo. Formato de cada tabla:

- **ID**: identificador único, referenciado desde Issues de bugs y desde los tests automatizados que lo cubren.
- **Prioridad**: Alta / Media / Baja — impacto en el negocio si falla.
- **Tipo**: Funcional (camino feliz) / Negativo (input inválido) / Borde (regla de negocio límite) / Seguridad.
- **Cubierto por automatización**: referencia al test JUnit/Postman que automatiza este caso, si existe. Los casos que se ejecutaron primero a mano en Postman quedaron como requests permanentes de la colección en `qa/postman/`.
- **Resultado**: `Passed` / `Failed` / `Blocked` / `Not run` — se actualiza en cada ronda de ejecución manual.

Módulos:
- [auth.md](auth.md) — Registro y login
- [specialists-schedules.md](specialists-schedules.md) — Especialidades, especialistas y horarios
- [bookings.md](bookings.md) — Reserva y cancelación de turnos
- [reviews.md](reviews.md) — Reseñas
- [security.md](security.md) — Autorización por rol y CORS

## Rondas de ejecución

**2026-09-30 a 2026-10-02 (Cynthia)** — Se ejecutaron todos los casos que estaban en `Not run`, uno por uno en Postman contra MySQL local real. **Estado actual: 0 casos en `Not run`**, todos en `Passed` (los dos que fallaron en su momento figuran como `Failed → Fixed`). Cada caso nuevo quedó como request permanente de la colección, que corre completa con Newman: 39 requests, 69 aserciones, 0 fallos. Bugs encontrados en esta ronda:

- **TC-AUTH-12** — un UUID o enum mal formado en el body devolvía un 403 vacío en vez de un 400 (faltaba un `@ExceptionHandler` y `/error` no estaba en `permitAll`). Corregido.
- **Dependencias entre tests** — dos veces un cambio hecho para fortalecer un test le rompió la precondición a otro (TC-SPEC-03 sobre TC-SPEC-04). Se resolvió separando los datos de cada caso.
- **Falsos positivos de Postman** — el 201 sin autenticación de TC-SPEC-09 era un header `Authorization` suelto en la pestaña Headers, no un bug de seguridad.

**2026-09-14** — Ejecución manual exploratoria contra MySQL local real (no H2), navegador real, flujo completo especialista→horario→paciente→reserva→reseña→cancelación. Encontrado y corregido `TC-SEC-01` (CORS bloqueaba todo el frontend). Detalle de resultados en cada tabla de módulo.
