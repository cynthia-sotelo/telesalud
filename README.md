# TeleSalud

[![CI](https://github.com/cynthia-sotelo/telesalud/actions/workflows/ci.yml/badge.svg)](https://github.com/cynthia-sotelo/telesalud/actions/workflows/ci.yml)

Aplicación web de telemedicina (MVP): conecta pacientes con especialistas médicos. Permite registrarse, buscar especialistas por especialidad, reservar turnos y dejar reseñas.

Este proyecto está inspirado en el dominio de una app de telemedicina construida como trabajo colaborativo grupal en [No Country](https://www.nocountry.tech/), pero es una **reconstrucción propia desde cero**: código, arquitectura y foco distintos. El objetivo principal de este repositorio es servir de base real y funcional para practicar y mostrar un proceso de QA completo, no replicar el proyecto original.

## Qué demuestra este repositorio (QA)

| Qué | Dónde | Estado |
|---|---|---|
| Plan de pruebas (STLC): alcance, estrategia, ambiente, riesgos | [`qa/test-plan.md`](qa/test-plan.md) | Hecho |
| **41 casos de prueba** por módulo, con resultado real y trazabilidad | [`qa/test-cases/`](qa/test-cases/) | Todos ejecutados, 0 pendientes |
| Colección Postman: **39 requests, 69 aserciones**, corre completa con Newman | [`qa/postman/`](qa/postman/) | Hecho |
| Scripts SQL de integridad de datos y datos de prueba | [`qa/sql/`](qa/sql/) | Hecho |
| Tests automatizados del backend: **22 tests** (JUnit, Mockito, MockMvc) | [`api/src/test/`](api/src/test/) | Hecho |
| Automatización con Playwright + TypeScript: **9 tests** de UI y de API, con Page Object | [`e2e/`](e2e/) | Hecho |
| Pipeline de CI con GitHub Actions: backend, frontend e integración (MySQL real + Newman + Playwright) | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Hecho |

### Bugs reales encontrados y corregidos

Encontrados probando la app (no inventados para la demo), cada uno con su causa raíz, su corrección y un test de regresión:

1. **CORS bloqueaba todo el frontend** (TC-SEC-01): el navegador rechazaba cada llamada a la API. Detectado en una prueba manual en el navegador, porque los tests con MockMvc no simulan un origen distinto.
2. **No se podía volver a reservar un horario después de cancelar el turno** (TC-BOOK-10): un constraint `UNIQUE` en la base hacía fallar la segunda reserva con un error sin manejar. Detectado explorando la base con SQL.
3. **Un JSON con un UUID o un valor de enum inválido devolvía un 403 vacío en vez de un 400** (TC-AUTH-12): Spring reenviaba internamente a `/error`, que no estaba permitido, y Spring Security lo bloqueaba escondiendo el error real.

El detalle de cada hallazgo está en [`qa/test-plan.md`](qa/test-plan.md) y en las tablas de [`qa/test-cases/`](qa/test-cases/).

## Funcionalidades (MVP)

- Registro y login de pacientes y especialistas (JWT)
- Búsqueda y listado de especialistas por especialidad
- Carga de horarios por parte del especialista
- Ver disponibilidad y reservar turnos
- Cancelar turnos propios
- Dejar reseña a un especialista tras un turno confirmado

Fuera de alcance por ahora (backlog, no implementado): pagos, subida de avatar/imágenes, login social, historia clínica, envío de emails.

## Stack

- **Backend**: Spring Boot 4, Java 21, Spring Security (JWT), Spring Data JPA, MySQL
- **Frontend**: React, TypeScript, Vite
- **QA**: JUnit + Mockito + MockMvc (H2 en memoria), Postman + Newman, Playwright + TypeScript, scripts SQL, GitHub Actions

## Requisitos

- Java 21
- Node.js 20+
- MySQL 8+ corriendo localmente (por ejemplo vía MySQL Workbench)

## Instalación y ejecución local

### 1. Base de datos

Con MySQL Workbench (o la herramienta que prefieras), crear un esquema vacío llamado `telesalud`. Las tablas las crea Hibernate automáticamente al levantar el backend.

Cargar las especialidades de prueba (necesarias para registrar especialistas y para la colección de Postman):

```bash
mysql --default-character-set=utf8mb4 -u root -p telesalud < qa/sql/seed-specialties.sql
```

### 2. Backend

Copiar `api/.env.example` a `api/.env` (o configurar esas mismas variables en tu IDE/entorno) con los datos de conexión a tu MySQL local y un `JWT_SECRET` propio.

Desde `api/`:

```bash
./mvnw spring-boot:run
```

El backend queda disponible en `http://localhost:8081`.

### 3. Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5174` (o el puerto que Vite elija si el 5174 está ocupado).

## Cómo correr las pruebas

**Tests del backend** (usan H2 en memoria, no necesitan MySQL):

```bash
cd api
./mvnw test
```

**Colección de Postman con Newman** (necesita el backend corriendo y las especialidades cargadas, ver el paso 1):

```bash
npx newman run qa/postman/TeleSalud.postman_collection.json -e qa/postman/TeleSalud.postman_environment.json
```

**Tests de Playwright** (UI y API). Necesitan el backend en `:8081`, el frontend en `:5174` y las especialidades cargadas (paso 1). Se corren desde la carpeta `e2e`:

```bash
cd e2e
npm install
npx playwright install chromium   # solo la primera vez
npm test
```

Más detalles en [`e2e/README.md`](e2e/README.md).

**Scripts SQL de validación de datos**:

```bash
mysql --default-character-set=utf8mb4 -u root -p telesalud < qa/sql/data-integrity-checks.sql
```

Cada consulta documenta el resultado esperado; en una base sana todas devuelven 0 filas.

## Integración continua

En cada push a `main` y en cada pull request, GitHub Actions corre tres jobs en paralelo sobre máquinas Linux limpias: los tests del backend, el lint y build del frontend, y una **integración completa** que levanta MySQL, el backend y el frontend, carga las especialidades de prueba y ejecuta la colección de Postman con Newman y la suite de Playwright. El reporte de Playwright se sube siempre como artefacto de la corrida. Ver [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
