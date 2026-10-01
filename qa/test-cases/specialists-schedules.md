# Especialidades, especialistas y horarios

Endpoints: `GET /api/specialties`, `GET /api/specialists`, `GET /api/specialists/{id}/schedules`, `POST /api/specialists/me/schedules`.

| ID | Título | Precondición | Pasos | Datos de prueba | Resultado esperado | Prioridad | Tipo | Cubierto por | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| TC-SPEC-01 | Listar especialidades sin autenticación | Existen especialidades cargadas | 1. GET `/specialties` sin token | — | 200, lista de especialidades (endpoint público) | Alta | Funcional | Manual navegador (dropdown de registro) | Passed |
| TC-SPEC-02 | Listar especialistas sin filtro | Existe al menos un especialista | 1. GET `/specialists` | — | 200, lista completa de especialistas | Alta | Funcional | Manual navegador | Passed |
| TC-SPEC-03 | Filtrar especialistas por especialidad válida | Existen especialistas de más de una especialidad | 1. GET `/specialists?specialtyId=<id-cardiologia>` | — | 200, solo especialistas de esa especialidad | Alta | Funcional | — | Not run |
| TC-SPEC-04 | Filtrar por especialidad sin especialistas asociados | La especialidad existe pero no tiene especialistas (hoy: Dermatologia, `58fb3f44-b097-11f1-9c8a-040e3cf001d8` — depende de que el seed no cambie y nadie registre un especialista ahi) | 1. GET `/specialists?specialtyId=<id-sin-especialistas>` | — | 200, lista vacía (no error) | Media | Borde | Postman: "Filtrar por especialidad sin especialistas (lista vacia)" | Passed (2026-10-01, Cynthia) — 200, `[]` |
| TC-SPEC-05 | Ver horarios disponibles de un especialista | El especialista tiene horarios libres y reservados | 1. GET `/specialists/{id}/schedules` | — | 200, solo horarios con `booked: false` | Alta | Funcional | Manual navegador (el horario reservado desaparece de la lista) | Passed |
| TC-SPEC-06 | Especialista crea un horario válido | Usuario autenticado con perfil de especialista | 1. POST `/specialists/me/schedules` con `startsAt < endsAt` | horario futuro de 30 min | 201, horario creado con `booked: false` | Alta | Funcional | Manual navegador (Dra Ana Perez) | Passed |
| TC-SPEC-07 | Crear horario con `endsAt` anterior o igual a `startsAt` | Usuario autenticado como especialista | 1. POST `/specialists/me/schedules` con `endsAt <= startsAt` | — | 400, "endsAt debe ser posterior a startsAt" | Media | Negativo | `ScheduleServiceImpl` valida esto; falta test unitario dedicado | Not run |
| TC-SPEC-08 | Un paciente intenta crear un horario | Usuario autenticado con rol PATIENT | 1. POST `/specialists/me/schedules` logueado como paciente | — | 404 ("no tiene perfil de especialista") — se prioriza no revelar detalles de otros usuarios antes que dar un 403 explícito | Media | Seguridad | — | Not run |
| TC-SPEC-09 | Crear horario sin autenticación | Ninguna | 1. POST `/specialists/me/schedules` sin token | — | 401/403 | Alta | Seguridad | — | Not run |
