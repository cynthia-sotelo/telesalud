import type { Page } from '@playwright/test';
import type { AuthResult } from './api';

/**
 * Deja la pagina con la sesion ya iniciada, sin pasar por la pantalla de login.
 * Las claves son las que usa el frontend en localStorage (frontend/src/auth/AuthContext.tsx);
 * si alla cambian, hay que cambiarlas aca. Se usa en tests que NO prueban el login.
 */
export async function startSession(page: Page, auth: AuthResult): Promise<void> {
  await page.addInitScript(
    (session) => {
      for (const [key, value] of Object.entries(session)) localStorage.setItem(key, value);
    },
    {
      telesalud_token: auth.token,
      telesalud_user_id: auth.userId,
      telesalud_full_name: auth.fullName,
      telesalud_role: auth.role,
    },
  );
}
