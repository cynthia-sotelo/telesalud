import { expect, test } from '@playwright/test';
import { MyBookingsPage } from '../../pages/MyBookingsPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { SpecialistDetailPage } from '../../pages/SpecialistDetailPage';
import { SpecialistsPage } from '../../pages/SpecialistsPage';
import { createScheduleViaApi, registerSpecialistViaApi } from '../../support/api';
import { uniqueEmail } from '../../support/test-data';

test.describe('Reserva de turnos (UI)', () => {
  test('un paciente reserva un turno y lo ve confirmado en "Mis turnos"', async ({ page, request }) => {
    // Arrange: un especialista con UN horario libre, preparado por API.
    // El nombre es unico para encontrar a ESTE especialista entre todos los de la lista.
    const specialistName = `Dra Playwright ${Date.now()}`;
    const specialist = await registerSpecialistViaApi(request, specialistName);
    await createScheduleViaApi(request, specialist.token);

    // Act: el flujo que realmente probamos, por la interfaz.
    const register = new RegisterPage(page);
    await register.registerAsPatient({
      fullName: 'Paciente Playwright',
      email: uniqueEmail('paciente.ui'),
      password: 'password123',
    });
    await expect(page).toHaveURL(/\/especialistas$/);

    await new SpecialistsPage(page).viewSpecialist(specialistName);

    const detail = new SpecialistDetailPage(page);
    await detail.bookFirstAvailable();
    await expect(detail.successMessage).toBeVisible();

    // Assert: el turno aparece en "Mis turnos", confirmado y con el especialista correcto.
    const bookings = new MyBookingsPage(page);
    await bookings.goto();
    await expect(bookings.bookingItems).toHaveCount(1);
    await expect(bookings.statusOf(bookings.firstBooking)).toHaveText('CONFIRMED');
    await expect(bookings.firstBooking).toContainText(specialistName);
  });
});
