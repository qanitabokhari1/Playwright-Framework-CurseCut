import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestData } from '../fixtures/testData';

export class AuthPage extends BasePage {
  // Login form locators - use the same as working test
  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email address' });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Your Password' });
  }

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in', exact: true });
  }

  // Modal/dialog locators
  get loginModal(): Locator {
    return this.page
      .locator('[role="dialog"], .modal, [data-state="open"]')
      .first();
  }

  constructor(page: Page) {
    super(page);
  }

  // Page state verification
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  async isLoginButtonVisible(): Promise<boolean> {
    try {
      // Use the correct login button locator from BasePage
      await this.page
        .getByRole('button', { name: 'Log in' })
        .waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // Login actions
  async clickLoginButton(): Promise<void> {
    // Wait for the page to load and the login button to be visible
    await this.page.waitForLoadState('networkidle');
    await this.page
      .getByRole('button', { name: 'Log in' })
      .waitFor({ state: 'visible', timeout: 10000 });

    // Click the login button and wait for modal to appear
    await this.page.getByRole('button', { name: 'Log in' }).click();

    // Wait for the modal/dialog to appear
    try {
      await this.loginModal.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // If modal selector doesn't work, just wait a bit for animation
      await this.page.waitForTimeout(2000);
    }

    // Wait for form fields to be ready
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(password);
  }

  async clickSignIn(): Promise<void> {
    await this.signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.signInButton.click();
  }

  // Complete login flow
  async login(
    email: string = 'test@example.com',
    password: string = 'password'
  ): Promise<void> {
    try {
      // Wait for page to load completely
      await this.waitForPageLoad();

      // Check if login button is visible
      const isLoginButtonVisible = await this.isLoginButtonVisible();
      if (!isLoginButtonVisible) {
        throw new Error('Login button is not visible on the page');
      }

      await this.clickLoginButton();

      await this.fillEmail(email);

      await this.fillPassword(password);

      await this.clickSignIn();

      // Wait for login to complete
      await this.page.waitForLoadState('networkidle');
    } catch (error) {
      // Debug: Take a screenshot on failure
      try {
        await this.page.screenshot({
          path: 'login-failure.png',
          fullPage: true,
        });
      } catch {
        // Screenshot failed, continue with error
      }

      throw error;
    }
  }

  // Login with real user credentials
  async loginWithRealCredentials(): Promise<void> {
    await this.login(TestData.realUser.email, TestData.realUser.password);
  }

  // Login with test users
  async loginWithTestUser1(): Promise<void> {
    await this.login(TestData.testUser1.email, TestData.testUser1.password);
  }
  async loginWithTestUser2(): Promise<void> {
    await this.login(TestData.testUser2.email, TestData.testUser2.password);
  }
  async loginWithTestUser3(): Promise<void> {
    await this.login(TestData.testUser3.email, TestData.testUser3.password);
  }
  async loginWithTestUser4(): Promise<void> {
    await this.login(TestData.testUser4.email, TestData.testUser4.password);
  }
  async loginWithTestUser5(): Promise<void> {
    await this.login(TestData.testUser5.email, TestData.testUser5.password);
  }
  async loginWithTestUser6(): Promise<void> {
    await this.login(TestData.testUser6.email, TestData.testUser6.password);
  }
  async loginWithTestUser7(): Promise<void> {
    await this.login(TestData.testUser7.email, TestData.testUser7.password);
  }
  async loginWithTestUser8(): Promise<void> {
    await this.login(TestData.testUser8.email, TestData.testUser8.password);
  }

  // Verification methods
  async verifyLoggedIn(): Promise<void> {
    await this.expectElementToContainText(this.creditsButton, '0');
    await this.expectElementToBeHidden(this.loginButton);
  }

  async verifyCreditsBalance(credits: number): Promise<void> {
    await this.page.waitForTimeout(3000);
    await this.expectElementToContainText(
      this.creditsButton,
      credits.toString()
    );
  }
}
