import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Critical business logic - exact match censoring works', () => {
  test('deepgram', async ({ page }) => {
    const helpers = new TestHelpers(page);

    // Auth + credits and centralized censoring success mocks
    await helpers.setupSufficientCreditsTest();
    await helpers.setupMockingForTest('deepgram');

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureDeepgramWorkflow(TestData.censorWords.default);

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok()
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:01');
  });

  test('elevenlabs sync', async ({ page }) => {
    const helpers = new TestHelpers(page);

    await helpers.setupSufficientCreditsTest();
    await helpers.setupMockingForTest('elevenlabs-sync');

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureElevenLabsSyncWorkflow(
      TestData.censorWords.default
    );

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok()
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:01');
  });

  test('elevenlabs async', async ({ page }) => {
    const helpers = new TestHelpers(page);

    await helpers.setupSufficientCreditsTest();
    await helpers.setupMockingForTest('elevenlabs-async');

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureElevenLabsAsyncWorkflow(
      TestData.censorWords.default
    );

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok()
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await expect(page.locator('table')).toContainText('fuck', {
      timeout: 10000,
    });
    await expect(page.locator('table')).toContainText('00:00:01', {
      timeout: 10000,
    });
  });
});
