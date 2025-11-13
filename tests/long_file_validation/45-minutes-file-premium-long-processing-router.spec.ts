import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';
import { handleUploadAndPollStatus } from '../../helpers/liveAsyncPolling';

test.describe('testUser3', () => {
  test('45+ minute file - premium long processing route', async ({ page }) => {
    // Set test timeout to 20 minutes (1200 seconds) for long file processing
    test.setTimeout(1200000);

    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser3();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.apiMocks.mock46MinutesAudioFile();
      // await helpers.apiMocks.mockUploadChunkAPI();
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio46Min);

    const understandButton = page.getByRole('button', { name: 'I understand' });
    await understandButton.click();

    await audioPage.fillCensorWord(TestData.censorWords.default);

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Trigger upload process
    await audioPage.clickProcessButton();

    // ✅ Wait for upload-chunk and poll for completion
    const finalData = await handleUploadAndPollStatus(page); // 5s interval, 120 attempts = 10 min max

    // Verify final status and structure
    expect(finalData.status).toBe('succeeded');
    expect(Array.isArray(finalData.transcription)).toBe(true);

    // Wait for download event that should be triggered by processing
    const pageInstance = audioPage.pageInstance;

    // Wait for a download event to occur
    await pageInstance.waitForEvent('download');

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Validate Censored Words tab shows the censored word with correct timestamp
    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await page.locator('table').scrollIntoViewIfNeeded();
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:01:29');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:21:05');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:22:48');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:26:46');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:31:38');
  });
});
