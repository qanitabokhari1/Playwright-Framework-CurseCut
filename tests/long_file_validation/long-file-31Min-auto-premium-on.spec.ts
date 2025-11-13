import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';
import { handleUploadAndPollStatus } from '../../helpers/liveAsyncPolling';

test.describe('testUser5', () => {
  test('31min file - credits and censoring', async ({ page }) => {
    // Set test timeout to 20 minutes (1200 seconds) for long file processing
    test.setTimeout(1200000);

    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser5();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.apiMocks.mock31MinutesAudioFile();
    }

    await audioPage.clickStartNow();
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

    // Capture initial credits from UI
    const initialCreditsText = await audioPage.creditsButton.textContent();
    const initialCredits = parseFloat(
      initialCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

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

    // Verify credits
    const finalCreditsText = await audioPage.creditsButton.textContent();
    const finalCredits = parseFloat(
      finalCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    if (isLiveMode) {
      // LIVE_MODE: Expect credits deducted (31 minutes = 12.917)
      const expectedDeduction = 12.917; // Exact for 31 minute file
      const actualDeduction = parseFloat(
        (initialCredits - finalCredits).toFixed(3)
      );
      // Allow for small variance in credit calculation (±0.2 credits)
      expect(actualDeduction).toBeGreaterThanOrEqual(expectedDeduction - 0.2);
      expect(actualDeduction).toBeLessThanOrEqual(expectedDeduction + 0.2);
    } else {
      // MOCKED MODE: Expect credits to remain the same (no real deduction)
      expect(finalCredits).toBe(initialCredits);
    }

    // Validate Censored Words tab shows the censored word with correct timestamp
    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await page.locator('table').scrollIntoViewIfNeeded();
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:00:18');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:08:45');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:09:34');
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:12:04');

    await audioPage.openMyPremiumFiles();

    // Verify the 1st file entry and its download button exist
    await audioPage.expectPremiumFileVisibleByName('31MinuteLong.mp3', 0);
  });
});
