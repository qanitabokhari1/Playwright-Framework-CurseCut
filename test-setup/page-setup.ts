import { Page } from '@playwright/test';
import { TestHelpers } from '../helpers/testHelpers';

export class PageSetup {
  private testHelpers: TestHelpers;

  constructor(page: Page) {
    this.testHelpers = new TestHelpers(page);
  }

  /**
   * Setup page for authentication tests
   */
  async setupForAuthTest(credits: number = 0): Promise<void> {
    await this.testHelpers.authenticateWithCredits(credits);
  }

  /**
   * Setup page for audio processing tests
   */
  async setupForAudioProcessingTest(credits: number = 100): Promise<void> {
    await this.testHelpers.authenticateWithCredits(credits);
  }

  /**
   * Setup page for file switching tests
   */
  async setupForFileSwitchingTest(): Promise<void> {
    await this.testHelpers.setupSufficientCreditsTest();
    await this.testHelpers.audioProcessingPage.navigateTo('/cut');
  }

  /**
   * Setup page for double processing prevention tests
   */
  async setupForDoubleProcessingTest(): Promise<void> {
    await this.testHelpers.setupSufficientCreditsTest();
  }

  /**
   * Reset page state for new test
   */
  async resetPageState(): Promise<void> {
    // Clear any existing routes
    await this.testHelpers.audioProcessingPage.pageInstance.unrouteAll();
  }
}
