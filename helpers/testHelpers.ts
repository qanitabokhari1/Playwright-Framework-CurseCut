import { Page } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { AudioProcessingPage } from '../pages/AudioProcessingPage';
import { ApiMocks } from './apiMocks';
import { TestData } from '../fixtures/testData';

export class TestHelpers {
  public authPage: AuthPage;
  public audioProcessingPage: AudioProcessingPage;
  public apiMocks: ApiMocks;

  constructor(page: Page) {
    this.authPage = new AuthPage(page);
    this.audioProcessingPage = new AudioProcessingPage(page);
    this.apiMocks = new ApiMocks(page);
  }

  /**
   * Complete authentication flow with specified credits
   */
  async authenticateWithCredits(credits: number): Promise<void> {
    await this.apiMocks.mockAuthenticationFlow(credits);
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.login(TestData.realUser.email, TestData.realUser.password);
    await this.authPage.verifyCreditsBalance(credits);
  }

  /**
   * Complete authentication flow with real user credentials
   */
  async authenticateWithRealUser(credits: number): Promise<void> {
    await this.apiMocks.mockAuthenticationFlow(credits);
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithRealCredentials();
    await this.authPage.verifyCreditsBalance(credits);
  }

  /**
   * Setup test with zero credits for insufficient credits tests (MOCKED)
   */
  async setupZeroCreditsTest(): Promise<void> {
    await this.authenticateWithCredits(TestData.credits.zero);
  }

  /**
   * Setup test with sufficient credits for processing tests (REAL BACKEND)
   */
  async setupSufficientCreditsTest(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.login(TestData.realUser.email, TestData.realUser.password);
  }

  /**
   * Setup test with real user credentials and sufficient credits (REAL BACKEND)
   */
  async setupRealUserTest(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithRealCredentials();
  }
}
