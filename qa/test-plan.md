# Plan de Pruebas — TeleSalud

## 1. Introducción

Este documento define la estrategia, alcance y criterios de prueba para el MVP de **TeleSalud**, una aplicación de telemedicina que conecta pacientes con especialistas (registro/login, búsqueda de especialistas, reserva de turnos y reseñas).

El objetivo de este plan es validar que la lógica de negocio, la API REST y los flujos de usuario funcionan correctamente antes de considerar el sistema apto para un entorno de producción, siguiendo el ciclo de vida de pruebas de software (STLC).

## 2. Alcance

### 2.1 Dentro de alcance

| Módulo | Funcionalidad |
|---|---|
| Autenticación | Registro (paciente/especialista) y login con JWT |
| Especialidades / Especialistas | Listado público, búsqueda por especialidad |
| Horarios | Carga de disponibilidad por el especialista, listado de horarios libres |
| Turnos (Bookings) | Reserva, cancelación, listado de turnos propios |
| Reseñas | Creación y listado por especialista |
| Seguridad transversal | Autorización por rol, CORS, JWT |

### 2.2 Fuera de alcance (ver README del proyecto)

Pagos (Mercado Pago), subida de imágenes (Cloudinary), login social (Google OAuth), envío de emails, historia clínica. No se escriben casos de prueba para estas funcionalidades porque no están implementadas.

## 3. Estrategia de pruebas

Se aplican varios niveles de prueba, cada uno con una herramienta específica:

| Nivel | Herramienta | Ubicación | Qué valida |
|---|---|---|---|
| Unitaria | JUnit 5 + Mockito | `api/src/test/java/.../service/*Test.java` | Reglas de negocio de cada servicio aisladas de la base de datos |
| Integración | JUnit 5 + MockMvc + H2 | `api/src/test/java/.../controller/*Test.java` | Flujos completos HTTP → servicio → repositorio → base en memoria |
| Frontend unitario | Vitest + Testing Library | `frontend/src/**/*.test.tsx` | Componentes React críticos |
| API (manual + automatizada) | Postman / Newman | `qa/postman/` | Contratos de la API, códigos de estado, reglas de negocio vía HTTP real |
| Datos | Scripts SQL | `qa/sql/` | Integridad referencial y constraints a nivel de base de datos |
| Funcional manual | Casos de prueba documentados | `qa/test-cases/` | Flujos de usuario de punta a punta, casos borde |
| E2E automatizado *(planificado, en progreso)* | Playwright + TypeScript, con Page Object | `e2e/` | Camino feliz y casos borde en el navegador, contra la app real, más tests de API con el fixture `request` |
| E2E automatizado secundario *(planificado)* | Selenium + Java (JUnit) | `qa/selenium/` | 3-4 escenarios representativos, no la suite completa |

### 3.1 Tipos de prueba aplicados

- **Funcional**: cada caso de uso descripto en la sección de alcance.
- **Negativa / de borde**: inputs inválidos, reglas de negocio violadas (doble reserva, reseña duplicada, etc.), casos que representan la mayoría de los casos de prueba documentados a propósito — es donde suelen vivir los bugs reales.
- **Regresión**: toda la suite automatizada (unitaria + integración) corre en cada cambio vía CI.
- **Seguridad básica**: verificación de autorización por rol y configuración CORS (ver `qa/test-cases/security.md`).
- **Validación de datos**: constraints de base de datos que deben sostener las reglas de negocio incluso si la capa de aplicación tuviera un bug (defensa en profundidad).

## 4. Ambiente de pruebas

| Entorno | Backend | Base de datos | Frontend |
|---|---|---|---|
| Local (desarrollo/manual) | `./mvnw spring-boot:run` — puerto 8081 | MySQL 8 local (esquema `telesalud`) | `npm run dev` — puerto 5174 |
| Automatizado (tests JUnit) | Spring Boot embebido | H2 en memoria (perfil `test`) | — |
| CI (GitHub Actions) *(planificado)* | Spring Boot embebido | H2 (unit/integración) + MySQL como servicio del runner (E2E) | Build de Vite servido para Playwright |

No se usa Docker Desktop para el flujo principal (no disponible de forma estable en el entorno de desarrollo); MySQL corre como servicio nativo de Windows.

## 5. Criterios de entrada y salida

**Entrada** (para empezar a ejecutar una ronda de pruebas):
- El código compila (`mvnw compile`) y el frontend buildea (`npm run build`) sin errores.
- El esquema de base de datos existe y está accesible.

**Salida** (para considerar una ronda de pruebas completa):
- 100% de los tests unitarios e integración en verde.
- Todos los casos de prueba críticos (prioridad Alta) de `qa/test-cases/` ejecutados y con resultado `Passed`.
- Cero defectos abiertos de severidad Alta/Crítica sin triage.

## 6. Gestión de defectos

Este proyecto no usa Jira; los defectos se gestionan como **GitHub Issues** en el repositorio, con las etiquetas:

- `bug` — defecto confirmado, con pasos de reproducción, resultado esperado vs. obtenido, y (cuando aplica) el commit que lo corrige.
- `test-case` — casos de prueba documentados que aún no tienen automatización.
- `severity:alta` / `severity:media` / `severity:baja` — impacto del defecto.

Cada Issue de `bug` referencia el ID del caso de prueba de `qa/test-cases/` que lo detectó (trazabilidad).

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Condición de carrera en reserva de turnos (dos requests simultáneos sobre el mismo horario) | La regla "no doble reserva" la aplica `BookingServiceImpl` a nivel de aplicación (flag `Schedule.booked`), no un constraint `UNIQUE` de base de datos — ver el hallazgo de abajo sobre por qué. Ante una violación de integridad real (carrera exacta), `GlobalExceptionHandler` devuelve un 409 en vez de un 500 sin manejar. No cubierto por un test de concurrencia automatizado en este MVP — queda documentado como limitación conocida. |
| Zona horaria en horarios/turnos | Se usa `Instant` (UTC) en todo el backend; el frontend convierte a hora local del navegador para mostrar. |
| CORS mal configurado bloqueando el frontend real (bug ya encontrado una vez durante pruebas manuales) | Test de regresión automatizado (`CorsConfigurationTest`) que falla si se rompe la configuración. |

### 7.1 Bug real encontrado durante pruebas manuales/SQL (2026-09-14)

La primera versión de `Booking.schedule` era un `@OneToOne` con constraint `UNIQUE` en `schedule_id`, pensado para impedir la doble reserva. En la práctica esto rompía un flujo válido: **cancelar un turno y después volver a reservar ese mismo horario** fallaba con una `DataIntegrityViolationException` sin manejar (violación del constraint), porque la fila cancelada seguía ocupando el único lugar posible para ese `schedule_id`.

Encontrado explorando la base de datos con SQL directo (no lo detectaban los tests automatizados porque ninguno probaba "reservar → cancelar → reservar de nuevo"). Corregido cambiando la relación a `@ManyToOne` (un horario puede tener varias filas de `Booking` a lo largo del tiempo) y dejando la regla de negocio exclusivamente en la capa de aplicación. Se agregó:
- Test de regresión: `BookingFlowIntegrationTest.sePuedeReservarNuevamenteUnHorarioLuegoDeCancelarUnaReservaAnterior`.
- Query de validación de datos: sección 3 de `qa/sql/data-integrity-checks.sql`.
- Manejo genérico de `DataIntegrityViolationException` → 409 en `GlobalExceptionHandler`, como red de seguridad ante condiciones de carrera reales.

## 8. Entregables de este plan

- Este documento.
- Casos de prueba manuales por módulo (`qa/test-cases/`).
- Colección Postman + entorno (`qa/postman/`).
- Scripts de validación SQL (`qa/sql/`).
- Suite E2E con Playwright + TypeScript (`e2e/`) — *planificado, en progreso*.
- Suite chica con Selenium + Java (`qa/selenium/`) — *planificado*.
- Pipeline de CI que ejecuta todo lo anterior en cada push (`.github/workflows/`) — *planificado*.
