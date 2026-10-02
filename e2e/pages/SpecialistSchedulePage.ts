import type { Page, Locator } from '@playwright/test';

export class SpecialistSchedulePage {
  readonly page: Page;
  readonly startsAtInput: Locator;
  readonly endsAtInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly scheduleListItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startsAtInput = page.getByTestId('schedule-starts-at');
    this.endsAtInput = page.getByTestId('schedule-ends-at');
    this.submitButton = page.getByTestId('schedule-submit');
    this.errorMessage = page.getByTestId('schedule-error');
    this.scheduleListItems = page.getByTestId('my-schedule-list').locator('li');
  }

  async goto(): Promise<void> {
    await this.page.goto('/mis-horarios');
  }

  async addSchedule(startsAt: string, endsAt: string): Promise<void> {
    await this.startsAtInput.fill(startsAt);
    await this.endsAtInput.fill(endsAt);
    await this.submitButton.click();
  }
}
