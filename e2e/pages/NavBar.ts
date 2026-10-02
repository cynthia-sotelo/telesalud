import type { Page, Locator } from '@playwright/test';

export class NavBar {
  readonly page: Page;
  readonly userName: Locator;
  readonly logoutButton: Locator;
  readonly myBookingsLink: Locator;
  readonly mySchedulesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userName = page.getByTestId('nav-user-name');
    this.logoutButton = page.getByTestId('nav-logout');
    this.myBookingsLink = page.getByTestId('nav-mis-turnos');
    this.mySchedulesLink = page.getByTestId('nav-mis-horarios');
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
