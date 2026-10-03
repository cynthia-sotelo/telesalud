import { expect, type APIRequestContext } from '@playwright/test';
import { API_URL, SPECIALTY_CARDIOLOGIA_ID } from './env';
import { uniqueEmail } from './test-data';

export interface AuthResult {
  token: string;
  userId: string;
  fullName: string;
  role: 'PATIENT' | 'SPECIALIST';
}

/**
 * Prepara datos por API en vez de por la interfaz: es mucho mas rapido y no se rompe si
 * cambia una pantalla que no es la que estamos probando. Solo el flujo bajo prueba va por UI.
 * Se usan URLs absolutas (API_URL) para que sirva desde cualquier proyecto de Playwright.
 */
export async function registerSpecialistViaApi(
  request: APIRequestContext,
  fullName: string,
): Promise<AuthResult> {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: {
      fullName,
      email: uniqueEmail('especialista.pw'),
      password: 'password123',
      role: 'SPECIALIST',
      specialtyId: SPECIALTY_CARDIOLOGIA_ID,
      bio: 'Especialista creado por un test de Playwright',
    },
  });
  expect(response.status(), 'el registro del especialista deberia dar 201').toBe(201);
  return response.json();
}

export async function registerPatientViaApi(
  request: APIRequestContext,
  fullName = 'Paciente Playwright',
): Promise<AuthResult & { email: string; password: string }> {
  const email = uniqueEmail('paciente.pw');
  const password = 'password123';
  const response = await request.post(`${API_URL}/auth/register`, {
    data: { fullName, email, password, role: 'PATIENT' },
  });
  expect(response.status(), 'el registro del paciente deberia dar 201').toBe(201);
  // Devolvemos tambien email y password: un test de login por UI los necesita.
  return { ...(await response.json()), email, password };
}

/** Una franja de 30 minutos en el futuro, en el formato ISO que espera la API. */
export function futureWindowIso(minutesFromNow = 60): { startsAt: string; endsAt: string } {
  const start = new Date(Date.now() + minutesFromNow * 60_000);
  const end = new Date(start.getTime() + 30 * 60_000);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

export async function createBookingViaApi(
  request: APIRequestContext,
  patientToken: string,
  scheduleId: string,
): Promise<{ id: string }> {
  const response = await request.post(`${API_URL}/bookings`, {
    headers: { Authorization: `Bearer ${patientToken}` },
    data: { scheduleId, reason: 'turno creado por un test de Playwright' },
  });
  expect(response.status(), 'la reserva del turno deberia dar 201').toBe(201);
  return response.json();
}

export async function createScheduleViaApi(
  request: APIRequestContext,
  specialistToken: string,
): Promise<{ id: string }> {
  const response = await request.post(`${API_URL}/specialists/me/schedules`, {
    headers: { Authorization: `Bearer ${specialistToken}` },
    data: futureWindowIso(),
  });
  expect(response.status(), 'la creacion del horario deberia dar 201').toBe(201);
  return response.json();
}
