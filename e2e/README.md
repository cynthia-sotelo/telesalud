# Tests E2E y de API con Playwright

Suite de Playwright + TypeScript sobre TeleSalud, en dos proyectos:

| Proyecto | Carpeta | Qué prueba | Usa navegador |
|---|---|---|---|
| `ui` | `tests/ui/` | Flujos de usuario en el navegador, con Page Objects | Sí (Chromium) |
| `api` | `tests/api/` | La API REST directamente, con el fixture `request` | No |

## Requisitos

El backend (`http://localhost:8081`) y el frontend (`http://localhost:5174`) tienen que estar corriendo, y la base tiene que tener las especialidades de [`qa/sql/seed-specialties.sql`](../qa/sql/seed-specialties.sql). Si falta algo, `support/global-setup.ts` corta la corrida con un mensaje claro antes de ejecutar ningún test.

## Cómo correrlo

```bash
cd e2e
npm install
npx playwright install chromium   # solo la primera vez

npm test              # todo
npm run test:api      # solo API
npm run test:ui       # solo UI
npm run test:headed   # UI viendo el navegador
npm run report        # abre el reporte HTML (trazas, capturas y video de lo que falló)
```

Las URLs se pueden cambiar con las variables `FRONTEND_URL` y `API_URL`.

## Estructura

```
pages/      Page Objects: una clase por pantalla, con sus locators y acciones
support/    api.ts (preparar datos por API), env.ts (URLs y UUID del seed), test-data.ts, global-setup.ts
tests/ui/   tests de interfaz
tests/api/  tests de API
```

## Criterios que sigue la suite

- **Los datos se preparan por API y solo el flujo bajo prueba va por la interfaz.** Es más rápido y no se rompe por una pantalla que no estamos probando.
- **Cada test crea sus propios datos con nombres o emails únicos.** La base acumula datos entre corridas, así que buscar por un nombre fijo puede devolver el dato de otra corrida.
- **Los locators salen de `data-testid`**, que el frontend expone justamente para esto.
- **Cada test de API indica a qué caso de `qa/test-cases/` corresponde.**
