import type { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly specialtySelect: Locator;
  readonly bioInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.getByTestId('register-fullname');
    this.emailInput = page.getByTestId('register-email');
    this.passwordInput = page.getByTestId('register-password');
    this.roleSelect = page.getByTestId('register-role');
    this.specialtySelect = page.getByTestId('register-specialty');
    this.bioInput = page.getByTestId('register-bio');
    this.submitButton = page.getByTestId('register-submit');
    this.errorMessage = page.getByTestId('register-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/registro');
  }

  async registerAsPatient(data: { fullName: string; email: string; password: string }): Promise<void> {
    await this.goto();
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    // El rol ya arranca en "Paciente" por defecto, no hace falta tocarlo.
    await this.submitButton.click();
  }

  async registerAsSpecialist(data: {
    fullName: string;
    email: string;
    password: string;
    specialtyName: string;
    bio?: string;
  }): Promise<void> {
    await this.goto();
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.roleSelect.selectOption('SPECIALIST');
    // El select de especialidad se llena via fetch async al elegir el rol;
    // esperamos a que tenga mas de la opcion "Seleccionar..." antes de elegir.
    await this.specialtySelect.getByRole('option').nth(1).waitFor();
    await this.specialtySelect.selectOption({ label: data.specialtyName });
    if (data.bio) await this.bioInput.fill(data.bio);
    await this.submitButton.click();
  }
}
