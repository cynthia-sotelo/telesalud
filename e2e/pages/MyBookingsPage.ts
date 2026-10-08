import type { Page, Locator } from '@playwright/test';

export class MyBookingsPage {
  readonly page: Page;
  readonly bookingItems: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookingItems = page.getByTestId('booking-item');
    this.emptyMessage = page.getByTestId('bookings-empty');
    this.errorMessage = page.getByTestId('bookings-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/mis-turnos');
  }

  /** El primer turno de la lista (en una cuenta nueva, el unico). */
  get firstBooking(): Locator {
    return this.bookingItems.first();
  }

  statusOf(booking: Locator): Locator {
    return booking.getByTestId('booking-status');
  }

  async cancel(booking: Locator): Promise<void> {
    await booking.getByTestId('cancel-button').click();
  }

  async leaveReview(booking: Locator, rating: number, comment: string): Promise<void> {
    // Las estrellas son radios con nombre accesible ("4 estrellas"); se elige por rol, como lo haria un usuario.
    await booking.getByRole('radio', { name: new RegExp(`^${rating} estrellas?$`) }).check();
    await booking.getByTestId('review-comment').fill(comment);
    await booking.getByTestId('review-submit').click();
  }

  reviewThanks(booking: Locator): Locator {
    return booking.getByTestId('review-thanks');
  }
}
