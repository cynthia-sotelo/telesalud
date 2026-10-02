import type { Page, Locator } from '@playwright/test';

export class SpecialistDetailPage {
  readonly page: Page;
  readonly scheduleItems: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.scheduleItems = page.getByTestId('schedule-item');
    this.successMessage = page.getByTestId('booking-success');
    this.errorMessage = page.getByTestId('booking-error');
    this.emptyMessage = page.getByTestId('schedule-empty');
  }

  /** Reserva el primer horario disponible en la lista. */
  async bookFirstAvailable(): Promise<void> {
    await this.scheduleItems.first().getByTestId('book-button').click();
  }

  /** Reserva la franja cuyo texto contiene `label` (ej. la hora que acabamos de cargar). */
  async bookByLabel(label: string): Promise<void> {
    await this.scheduleItems.filter({ hasText: label }).first().getByTestId('book-button').click();
  }
}
