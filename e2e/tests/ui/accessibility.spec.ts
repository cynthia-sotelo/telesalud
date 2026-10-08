import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import {
  createBookingViaApi,
  createScheduleViaApi,
  findSpecialistId,
  registerPatientViaApi,
  registerSpecialistViaApi,
} from '../../support/api';
import { startSession } from '../../support/session';

// Accesibilidad automatizada con axe-core, contra el estandar WCAG 2.x nivel A y AA.
// Falla solo con problemas "serious" o "critical" (contraste insuficiente, campos sin
// etiqueta, etc.). axe detecta una parte de los problemas de accesibilidad, no todos:
// no reemplaza una revision manual (navegar con teclado, lector de pantalla).

interface Scenario {
  name: string;
  /** Deja la pagina lista para escanear: datos, sesion, navegacion y espera a que cargue. */
  open: (page: Page, request: APIRequestContext) => Promise<void>;
}

const scenarios: Scenario[] = [
  {
    name: 'Buscar especialistas (publica)',
    open: async (page, request) => {
      await registerSpecialistViaApi(request, `Dra Accesibilidad ${Date.now()}`);
      await page.goto('/especialistas');
      await expect(page.getByTestId('specialist-card').first()).toBeVisible();
    },
  },
  {
    name: 'Ingresar',
    open: async (page) => {
      await page.goto('/login');
      await expect(page.getByTestId('login-form')).toBeVisible();
    },
  },
  {
    name: 'Crear cuenta (paciente)',
    open: async (page) => {
      await page.goto('/registro');
      await expect(page.getByTestId('register-form')).toBeVisible();
    },
  },
  {
    name: 'Crear cuenta (especialista)',
    open: async (page) => {
      await page.goto('/registro');
      await page.getByTestId('register-role').selectOption('SPECIALIST');
      await expect(page.getByTestId('register-specialty')).toBeVisible();
    },
  },
  {
    name: 'Horarios de un especialista',
    open: async (page, request) => {
      const name = `Dra Accesibilidad Detalle ${Date.now()}`;
      const specialist = await registerSpecialistViaApi(request, name);
      await createScheduleViaApi(request, specialist.token);
      await startSession(page, await registerPatientViaApi(request));
      await page.goto(`/especialistas/${await findSpecialistId(request, name)}`);
      await expect(page.getByTestId('schedule-item').first()).toBeVisible();
    },
  },
  {
    name: 'Mis turnos',
    open: async (page, request) => {
      const specialist = await registerSpecialistViaApi(request, `Dra Accesibilidad Turnos ${Date.now()}`);
      const schedule = await createScheduleViaApi(request, specialist.token);
      const patient = await registerPatientViaApi(request);
      await createBookingViaApi(request, patient.token, schedule.id);
      await startSession(page, patient);
      await page.goto('/mis-turnos');
      await expect(page.getByTestId('booking-item').first()).toBeVisible();
    },
  },
  {
    name: 'Mis horarios (especialista)',
    open: async (page, request) => {
      await startSession(page, await registerSpecialistViaApi(request, `Dra Accesibilidad Horarios ${Date.now()}`));
      await page.goto('/mis-horarios');
      await expect(page.getByTestId('schedule-form')).toBeVisible();
    },
  },
];

for (const scenario of scenarios) {
  test(`${scenario.name}: sin violaciones graves de accesibilidad`, async ({ page, request }) => {
    await scenario.open(page, request);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elemento/s)`);

    // Si falla, la lista dice QUE regla se rompio y en cuantos elementos.
    expect(serious, `violaciones en "${scenario.name}"`).toEqual([]);
  });
}
