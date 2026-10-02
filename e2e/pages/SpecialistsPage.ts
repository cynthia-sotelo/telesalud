import type { Page, Locator } from '@playwright/test';

export class SpecialistsPage {
  readonly page: Page;
  readonly specialtyFilter: Locator;
  readonly specialistCards: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.specialtyFilter = page.getByTestId('specialty-filter');
    this.specialistCards = page.getByTestId('specialist-card');
    this.emptyMessage = page.getByTestId('specialist-empty');
  }

  async goto(): Promise<void> {
    await this.page.goto('/especialistas');
  }

  async filterBySpecialty(specialtyName: string): Promise<void> {
    await this.specialtyFilter.selectOption({ label: specialtyName });
  }

  /** Va a la ficha de disponibilidad del primer especialista cuyo nombre contiene `fullName`. */
  async viewSpecialist(fullName: string): Promise<void> {
    const card = this.specialistCards.filter({ hasText: fullName }).first();
    await card.getByTestId('specialist-view-link').click();
  }
}
