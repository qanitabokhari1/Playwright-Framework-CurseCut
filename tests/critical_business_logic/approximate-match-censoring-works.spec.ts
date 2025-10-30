import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';
import { handleUploadAndPollStatus } from '../../helpers/liveAsyncPolling';

test.describe('Critical business logic - approximate match censoring works', () => {
  test('deepgram', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const isLiveMode = process.env.LIVE_MODE === 'true';


    // Auth + credits and centralized censoring success mocks
    await helpers.setupSufficientCreditsTest();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.setupMockingForTest('deepgram');
    } 

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureDeepgramWorkflow(TestData.censorWords.approx);

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok(),
      { timeout: isLiveMode ? 60000 : 10000 }
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    await page.getByRole('tab', { name: 'Censored Words' }).click();

    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:01');
  });

  test('elevenlabs sync', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const isLiveMode = process.env.LIVE_MODE === 'true';


    await helpers.setupSufficientCreditsTest();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.setupMockingForTest('elevenlabs-sync');
    } else {
    }

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureElevenLabsSyncWorkflow('fuc');

    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok(),
      { timeout: isLiveMode ? 60000 : 10000 }
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:01');
  });

  test('elevenlabs async', async ({ page }) => {

    test.setTimeout(300000);
    
    const helpers = new TestHelpers(page);
    const isLiveMode = process.env.LIVE_MODE === 'true';


    await helpers.setupSufficientCreditsTest();

    if (!isLiveMode) {
      await helpers.setupMockingForTest('elevenlabs-async');
    } else {
    }

    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.configureElevenLabsAsyncWorkflow('fuc');

    // Trigger upload process
    await audioPage.clickProcessButton();

    // ✅ Poll the backend for completion
    const baseUrl = 'https://backend-dev-692f.up.railway.app';
    const finalData = await handleUploadAndPollStatus(page, baseUrl);

    // Verify final status and structure
    expect(finalData.status).toBe('succeeded');
    expect(Array.isArray(finalData.transcription)).toBe(true);

    // Continue UI verification
    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await expect(page.locator('table')).toContainText('fuck', { timeout: 10000 });
    await expect(page.locator('table')).toContainText('00:00:01', { timeout: 10000 });
  });
});
