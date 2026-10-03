import { expect, test } from '@playwright/test';
import { registerPatientViaApi } from '../../support/api';

test('reservar un scheduleId inexistente devuelve 404', async ({ request }) => {
  const patient = await registerPatientViaApi(request);

  const response = await request.post('bookings', {
    headers: { Authorization: `Bearer ${patient.token}` },
    data: { scheduleId: '00000000-0000-0000-0000-000000000000', reason: 'test' },
  });

  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.message).toContain('Horario no encontrado');
});