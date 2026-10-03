import { expect, test } from '@playwright/test';
import {
  createBookingViaApi,
  createScheduleViaApi,
  registerPatientViaApi,
  registerSpecialistViaApi,
} from '../../support/api';

// Equivale al caso TC-REV-05 de qa/test-cases/reviews.md: analisis de valores limite.
// El rating valido va de 1 a 5; probamos los valores justo afuera de cada limite:
// 0 (debajo del minimo) y 6 (encima del maximo).
const invalidRatings = [0, 6];

// Un bucle crea un test por cada valor, en vez de copiar y pegar el mismo test dos veces.
for (const rating of invalidRatings) {
  test(`una reseña con rating ${rating} es rechazada con 400`, async ({ request }) => {
    // Arrange: un turno confirmado propio (la precondicion del caso). Cada test arma sus
    // propios datos, asi no dependen entre si ni del orden en que corran.
    const specialist = await registerSpecialistViaApi(request, `Dra Playwright Rating ${rating}`);
    const schedule = await createScheduleViaApi(request, specialist.token);
    const patient = await registerPatientViaApi(request);
    const booking = await createBookingViaApi(request, patient.token, schedule.id);

    // Act
    const response = await request.post('reviews', {
      headers: { Authorization: `Bearer ${patient.token}` },
      data: { bookingId: booking.id, rating, comment: 'rating fuera de rango' },
    });

    // Assert: 400 y que el motivo sea el rating (y no, por ejemplo, un turno ya reseñado).
    // Solo se busca la palabra "rating" y no el texto completo del mensaje: ese texto lo arma
    // el validador segun el idioma de la maquina donde corre el backend.
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('rating');
  });
}
