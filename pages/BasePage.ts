import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Getter for accessing page in helper classes
  get pageInstance(): Page {
    return this.page;
  }

  // Common locators
  get creditsButton(): Locator {
    // Use the same locator as the working test
    return this.page.getByTestId('credits-button');
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Log in' });
  }

  get processButton(): Locator {
    // Use data-testid to avoid strict mode ambiguity with "Re-process"
    return this.page.getByTestId('process-button');
  }

  get uploadInput(): Locator {
    // Use the same locator as the working test
    return this.page.locator('[data-testid="upload-input"]');
  }

  get startNowButton(): Locator {
    // Use the same locator as the working test - be more specific to avoid multiple matches
    return this.page
      .locator('div')
      .filter({ hasText: /^🪄Start now for free!$/ })
      .locator('div');
  }

  get censorWordTextarea(): Locator {
    // Use the same locator as the working test
    return this.page.locator('textarea[placeholder*="only remove"]');
  }
  get approxWordTextarea(): Locator {
    // Use the same locator as the working test
    return this.page.locator('textarea[placeholder*="will remove"]');
  }

  get silenceOption(): Locator {
    return this.page.getByText('Silence', { exact: true });
  }

  get silenceDropdownOption(): Locator {
    return this.page.getByRole('option', { name: 'Silence' });
  }

  // Common actions
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitForElement(
    locator: Locator,
    timeout: number = 5000
  ): Promise<void> {
    await locator.waitFor({ timeout });
  }

  async expectElementToBeVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectElementToBeHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  async expectElementToBeDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  async expectElementToContainText(
    locator: Locator,
    text: string
  ): Promise<void> {
    await expect(locator).toContainText(text);
  }

  // Credits helpers
  async waitForCreditsButtonVisible(timeout: number = 10000): Promise<void> {
    await this.creditsButton.waitFor({ state: 'visible', timeout });
  }

  async expectCreditsRestoredTo(
    expected: number,
    timeout: number = 40000
  ): Promise<void> {
    // Ensure the credits button is present before polling
    await this.waitForCreditsButtonVisible(timeout);

    await expect
      .poll(
        async () => {
          try {
            return await this.getCreditsAmount();
          } catch {
            return -1; // transient during refresh
          }
        },
        { timeout }
      )
      .toBe(expected);
  }

  // Common API mocking methods
  async mockSupabaseLogin(): Promise<void> {
    await this.page.route(
      '**/auth/v1/token?grant_type=password**',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'test-user',
              email: 'test@example.com',
            },
          }),
        });
      }
    );
  }

  async mockCreditsAPI(credits: number): Promise<void> {
    await this.page.route('**/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits }),
      });
    });
  }

  // Parse numeric credits from the credits button
  async getCreditsAmount(): Promise<number> {
    const text = await this.creditsButton.textContent();
    const value = parseFloat(text?.replace(/[^\d.]/g, '') ?? '0');
    return Number.isFinite(value) ? value : 0;
  }
}
