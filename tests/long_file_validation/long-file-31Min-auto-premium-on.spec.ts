import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';
import { handleUploadAndPollStatus } from '../../helpers/liveAsyncPolling';

test.describe('testUser2', () => {
  test('45+ minute file → premium long processing route', async ({ page }) => {
    // Set test timeout to 20 minutes for long file processing
    test.setTimeout(3000000);

    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser2();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.apiMocks.mock31MinutesAudioFile();
    //   await helpers.apiMocks.mockUploadChunkAPI();
    }

    await audioPage.clickStartNow();

    // Upload 31MinuteLong.mp3
    await audioPage.uploadAudioFile(TestData.files.audio31Min);

    const understandButton = page.getByRole('button', { name: 'I understand' });
    await understandButton.click();
    // Validate: premium-yes auto-selected, song-yes not selected
    await expect(audioPage.premiumYesButton).toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });
    await expect(audioPage.songYesButton).not.toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });
    
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Trigger upload process and verify routes to /upload-chunk endpoint (not /audio)
    const uploadChunkPromise = page.waitForResponse(
      res => res.url().includes('/upload-chunk') && res.ok()
    );

    await audioPage.clickProcessButton();

    // Verify routes to /upload-chunk endpoint (not /audio)
    const uploadChunkResponse = await uploadChunkPromise;
    expect(uploadChunkResponse.url()).toContain('/upload-chunk');
    console.log('✅ Routes to /upload-chunk endpoint (not /audio)');

    // Wait for upload-chunk and poll for completion
    const finalData = await handleUploadAndPollStatus(page);

    // Verify task_id returned
    expect(finalData.task_id).toBeDefined();
    expect(typeof finalData.task_id).toBe('string');
    console.log(`✅ Task ID returned: ${finalData.task_id}`);

    // Verify estimated_time > 0
    expect(finalData.estimated_time).toBeGreaterThan(0);
    console.log(`✅ Estimated time > 0: ${finalData.estimated_time}`);

    // Verify processing completes successfully
    expect(finalData.status).toBe('succeeded');
    expect(Array.isArray(finalData.transcription)).toBe(true);
    console.log('✅ Processing completes successfully');

    // Wait for download event
    await audioPage.pageInstance.waitForEvent('download');

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Verify censored words detected correctly
    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await page.locator('table').scrollIntoViewIfNeeded();

    // Verify specific censored words and timestamps
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:01:29');
    await expect(page.locator('table')).toContainText('00:21:05');
    await expect(page.locator('table')).toContainText('00:22:48');
    await expect(page.locator('table')).toContainText('00:26:46');
    await expect(page.locator('table')).toContainText('00:31:38');

    console.log('✅ Censored words detected correctly');
  });
});
