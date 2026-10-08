import { expect, test } from '@playwright/test';
import { NavBar } from '../../pages/NavBar';
import { registerPatientViaApi, registerSpecialistViaApi } from '../../support/api';
import { startSession } from '../../support/session';

test.describe('Barra de navegacion', () => {
  test('el boton "Salir" se distingue del fondo de la barra', async ({ page, request }) => {
    // Regresion: el boton tenia texto blanco sobre fondo blanco y nadie lo veia. axe-core
    // solo lo marcaba como "incompleto", asi que lo comprobamos de forma directa.
    await startSession(page, await registerPatientViaApi(request));
    await page.goto('/especialistas');
    const nav = new NavBar(page);
    await expect(nav.logoutButton).toBeVisible();

    const colors = await nav.logoutButton.evaluate((button) => {
      const barBackground = getComputedStyle(button.closest('nav')!).backgroundColor;
      const style = getComputedStyle(button);
      return { text: style.color, buttonBackground: style.backgroundColor, barBackground };
    });

    // El texto no puede ser del mismo color que lo que tiene detras (fondo propio o el de la barra).
    const behind = colors.buttonBackground === 'rgba(0, 0, 0, 0)' ? colors.barBackground : colors.buttonBackground;
    expect(colors.text, 'el texto de "Salir" no debe ser igual al fondo').not.toBe(behind);
  });

  test('la barra muestra enlaces distintos segun el rol', async ({ page, request }) => {
    await startSession(page, await registerSpecialistViaApi(request, `Dra Nav ${Date.now()}`));
    await page.goto('/especialistas');
    const nav = new NavBar(page);

    await expect(nav.mySchedulesLink).toBeVisible();
    await expect(nav.myBookingsLink).toHaveCount(0);
  });
});
