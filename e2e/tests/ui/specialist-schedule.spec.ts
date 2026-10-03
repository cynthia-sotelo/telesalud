import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { SpecialistSchedulePage } from '../../pages/SpecialistSchedulePage';
import { registerSpecialistViaApi } from '../../support/api';

test.describe('Horarios del especialista (UI)', () => {
  test('un especialista agrega un horario usando la franja sugerida', async ({ page, request }) => {
    // Arrange: un especialista ya registrado (por API), que entra por la pantalla de login.
    const specialist = await registerSpecialistViaApi(request, `Dra Playwright Horario ${Date.now()}`);
    await new LoginPage(page).login(specialist.email, specialist.password);
    // Esperar a que el login termine antes de navegar: si no, el goto de abajo corta el login a
    // la mitad y la pagina protegida redirige de vuelta a /login.
    await expect(page).toHaveURL(/especialistas$/);

    // Act: abre "Mis horarios" y guarda la franja que la pagina propone por defecto.
    const schedules = new SpecialistSchedulePage(page);
    await schedules.goto();
    await expect(schedules.startsAtInput).not.toHaveValue('');
    await expect(schedules.endsAtInput).not.toHaveValue('');
    await schedules.submitButton.click();

    // Assert: el horario aparece en la lista de la sesion y no hubo error.
    await expect(schedules.scheduleListItems).toHaveCount(1);
    await expect(schedules.errorMessage).toHaveCount(0);
  });
});
