import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Critical business logic - approximate match censoring works', () => {
  test('deepgram', async ({ page }) => {
    const helpers = new TestHelpers(page);

    // Auth + credits and centralized censoring success mocks
    await helpers.setupSufficientCreditsTest();
    await helpers.apiMocks.mockCensoringSuccess('deepgram');

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureDeepgramWorkflow(TestData.censorWords.approx);

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
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
    await helpers.apiMocks.mockCensoringSuccess('elevenlabs-sync');

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureElevenLabsSyncWorkflow('fuc');

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
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
    await helpers.apiMocks.mockCensoringSuccess('elevenlabs-async');
    await helpers.apiMocks.mockUploadChunkAPI();

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureElevenLabsAsyncWorkflow('fuc');

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/upload-chunk') && res.ok()
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:01');
  });
});
