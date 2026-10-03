import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { registerPatientViaApi } from '../../support/api';

test('un login con contraseña incorrecta muestra un error y no inicia sesión', async ({ page, request }) => {
  // La cuenta existe (creada por API), así que lo que falla es solo la contraseña.
  const patient = await registerPatientViaApi(request);

  const login = new LoginPage(page);
  await login.login(patient.email, 'password-incorrecta');

  await expect(page).toHaveURL(/login$/);
  await expect(login.errorMessage).toContainText('Credenciales invalidas');

});
