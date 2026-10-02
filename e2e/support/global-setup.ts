// Chequeo previo a correr la suite: si el backend o el frontend no estan
// levantados, Playwright igual intenta correr cada test y falla con
// timeouts confusos ("locator not found", "ECONNREFUSED" enterrado en la
// traza). Este check corta ahi mismo con un mensaje claro.
import { API_URL, FRONTEND_URL } from './env';

async function ping(name: string, url: string): Promise<void> {
  try {
    await fetch(url, { method: 'GET' });
  } catch {
    throw new Error(
      `\n\nNo se pudo conectar a ${name} en ${url}.\n` +
        'Levanta el backend (cd api && ./mvnw spring-boot:run) y el frontend ' +
        '(cd frontend && npm run dev) antes de correr la suite E2E. ' +
        'Ver README.md.\n',
    );
  }
}

export default async function globalSetup(): Promise<void> {
  await ping('el frontend', FRONTEND_URL);
  await ping('la API', `${API_URL}/specialties`);
}
