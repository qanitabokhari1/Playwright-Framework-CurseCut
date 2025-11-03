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
    await this.authPage.login(
      TestData.realUser.email,
      TestData.realUser.password
    );
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
    await this.authPage.login(
      TestData.realUser.email,
      TestData.realUser.password
    );
  }

  /**
   * Setup test with real user credentials and sufficient credits (REAL BACKEND)
   */
  async setupRealUserTest(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithRealCredentials();
  }
  async setupTestUser1(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithTestUser1();
  }

  async setupTestUser2(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithTestUser2();
  }

  async setupTestUser3(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithTestUser3();
  }

  async setupTestUser4(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithTestUser4();
  }

  async setupTestUser5(): Promise<void> {
    await this.authPage.navigateTo(TestData.urls.base);
    await this.authPage.loginWithTestUser5();
  }

  /**
   * Setup API mocking based on LIVE_MODE environment variable
   * If LIVE_MODE=true, skip mocking and use real APIs
   * If LIVE_MODE=false (default), setup mocks for the specified variant
   */
  async setupMockingForTest(
    variant: 'deepgram' | 'elevenlabs-sync' | 'elevenlabs-async'
  ): Promise<void> {
    const isLiveMode = process.env.LIVE_MODE === 'true';

    if (!isLiveMode) {
      await this.apiMocks.mockCensoringSuccess(variant);
      if (variant === 'elevenlabs-async') {
        await this.apiMocks.mockUploadChunkAPI();
      }
    }
  }
}
