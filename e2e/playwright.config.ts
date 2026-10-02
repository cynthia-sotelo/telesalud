import { defineConfig, devices } from '@playwright/test';
import { API_URL, FRONTEND_URL } from './support/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  globalSetup: './support/global-setup.ts',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: FRONTEND_URL },
    },
    {
      name: 'api',
      testDir: './tests/api',
      // Ojo con la barra final: con baseURL "http://localhost:8081/api/" las rutas se
      // escriben SIN barra inicial ("specialists/me/schedules"). Con una barra inicial,
      // Playwright descarta el "/api" de la base y pega contra una ruta que no existe.
      use: { baseURL: `${API_URL}/` },
    },
  ],
});
