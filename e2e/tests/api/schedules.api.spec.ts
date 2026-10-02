import { expect, test } from '@playwright/test';
import { createScheduleViaApi, futureWindowIso, registerSpecialistViaApi } from '../../support/api';

// El proyecto "api" de playwright.config.ts tiene como baseURL ".../api/", por eso las
// rutas de abajo van SIN barra inicial: "specialists/..." y no "/specialists/...".

test.describe('Horarios del especialista (API)', () => {
  // Equivale al caso TC-SPEC-06 de qa/test-cases/specialists-schedules.md
  test('un especialista autenticado crea un horario libre', async ({ request }) => {
    const specialist = await registerSpecialistViaApi(request, 'Dra Playwright API');

    const response = await request.post('specialists/me/schedules', {
      headers: { Authorization: `Bearer ${specialist.token}` },
      data: futureWindowIso(),
    });

    expect(response.status()).toBe(201);
    const schedule = await response.json();
    expect(schedule.booked).toBe(false);
  });

  // Equivale al caso TC-SPEC-09
  test('crear un horario sin token es rechazado', async ({ request }) => {
    const response = await request.post('specialists/me/schedules', { data: futureWindowIso() });

    expect([401, 403]).toContain(response.status());
  });

  // Reusa el helper de preparacion de datos para comprobar un efecto real (TC-BOOK-09 en miniatura):
  // un horario recien creado aparece en la lista publica de horarios libres del especialista.
  test('el horario creado aparece en la lista publica de horarios libres', async ({ request }) => {
    // Nombre unico por corrida: la base acumula especialistas de corridas anteriores y buscar
    // por un nombre fijo podria devolver a uno viejo, con otros horarios.
    const name = `Dra Playwright Lista ${Date.now()}`;
    const specialist = await registerSpecialistViaApi(request, name);
    const schedule = await createScheduleViaApi(request, specialist.token);

    const specialists = await (await request.get('specialists')).json();
    const me = specialists.find((s: { fullName: string }) => s.fullName === name);
    expect(me, 'el especialista deberia figurar en la lista publica').toBeDefined();

    const available = await (await request.get(`specialists/${me.id}/schedules`)).json();
    expect(available.map((s: { id: string }) => s.id)).toContain(schedule.id);
  });
});
