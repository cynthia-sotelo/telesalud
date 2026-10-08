import { expect, test, type Page } from '@playwright/test';
import { createBookingViaApi, createScheduleViaApi, registerPatientViaApi, registerSpecialistViaApi } from '../../support/api';
import { startSession } from '../../support/session';

// Pruebas de diseno responsivo: en un celular la pagina no debe obligar a scrollear de costado.
const MOBILE = { width: 390, height: 844 };

test.use({ viewport: MOBILE });

/** Cuanto se pasa el contenido del ancho visible (0 = entra justo, sin scroll horizontal). */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe('Diseno responsivo (celular 390px)', () => {
  const publicPages = [
    { name: 'Buscar especialistas', path: '/especialistas', ready: 'specialty-filter' },
    { name: 'Ingresar', path: '/login', ready: 'login-form' },
    { name: 'Crear cuenta', path: '/registro', ready: 'register-form' },
  ];

  for (const { name, path, ready } of publicPages) {
    test(`${name}: no hay scroll horizontal`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId(ready)).toBeVisible();
      expect(await horizontalOverflow(page)).toBe(0);
    });
  }

  test('Mis turnos: no hay scroll horizontal y el boton Cancelar es alcanzable', async ({ page, request }) => {
    const specialist = await registerSpecialistViaApi(request, `Dra Responsive ${Date.now()}`);
    const schedule = await createScheduleViaApi(request, specialist.token);
    const patient = await registerPatientViaApi(request);
    await createBookingViaApi(request, patient.token, schedule.id);
    await startSession(page, patient);

    await page.goto('/mis-turnos');
    await expect(page.getByTestId('booking-item')).toHaveCount(1);

    expect(await horizontalOverflow(page)).toBe(0);
    await expect(page.getByTestId('cancel-button')).toBeInViewport();
  });

  test('un nombre de especialista muy largo no rompe la tarjeta', async ({ page, request }) => {
    // Control: el peor caso para el layout es una palabra larguisima sin espacios.
    const longName = `Dra ${'Hiperlargo'.repeat(8)} ${Date.now()}`;
    await registerSpecialistViaApi(request, longName);

    await page.goto('/especialistas');
    await expect(page.getByTestId('specialist-card').filter({ hasText: longName })).toBeVisible();

    expect(await horizontalOverflow(page)).toBe(0);
  });
});
