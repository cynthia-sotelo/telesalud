# TeleSalud

Aplicación web de telemedicina (MVP): conecta pacientes con especialistas médicos. Permite registrarse, buscar especialistas por especialidad, reservar turnos y dejar reseñas.

Este proyecto está inspirado en el dominio de una app de telemedicina construida como trabajo colaborativo grupal en [No Country](https://www.nocountry.tech/), pero es una **reconstrucción propia desde cero**: código, arquitectura y foco distintos. El objetivo principal de este repositorio es servir de base real y funcional para practicar y mostrar un proceso de QA completo (manual + automatizado), no replicar el proyecto original.

## Funcionalidades (MVP)

- Registro y login de pacientes y especialistas (JWT)
- Búsqueda y listado de especialistas por especialidad
- Ver disponibilidad y reservar turnos
- Cancelar turnos propios
- Dejar reseña a un especialista tras un turno confirmado

Fuera de alcance por ahora (backlog, no implementado): pagos, subida de avatar/imágenes, login social, historia clínica, envío de emails.

## Stack

- **Backend**: Spring Boot 4, Java 21, Spring Security (JWT), Spring Data JPA, MySQL
- **Frontend**: React, TypeScript, Vite
- **Testing**: JUnit + Mockito (backend), Vitest + React Testing Library (frontend), Cypress (E2E), Selenium + Java (E2E), Postman/Newman (API), scripts SQL (validación de datos)
- **CI**: GitHub Actions

## Requisitos

- Java 21
- Node.js 20+
- MySQL 8+ corriendo localmente (por ejemplo vía MySQL Workbench)

## Instalación y ejecución local

### 1. Base de datos

Con MySQL Workbench (o la herramienta que prefieras), crear un esquema vacío llamado `telesalud`. Las tablas las crea Hibernate automáticamente al levantar el backend.

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

## Tests

**Backend** (usa H2 en memoria, no necesita MySQL):

```bash
cd api
./mvnw test
```

**Frontend**:

```bash
cd frontend
npm test
```

**QA**: ver la carpeta [`qa/`](qa/) para el plan de pruebas, casos de prueba manuales, colección Postman y scripts SQL de validación. La suite E2E vive en [`cypress/`](cypress/) y [`qa/selenium/`](qa/selenium/).

## Licencia

MIT.
