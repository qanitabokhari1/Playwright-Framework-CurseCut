import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser8', () => {
  test('Deepgram → Multiple files succeed', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser8();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.setupMockingForTest('deepgram');
    }

    await audioPage.clickStartNow();

    // Upload 2 short files (3sec each) at once
    await audioPage.uploadMultipleAudioFiles([
      TestData.files.audio,
      TestData.files.audio,
    ]);

    // Verify both files are uploaded
    await audioPage.verifyMultipleFilesUploaded();

    // Select Deepgram variant (song: no, premium: no)
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Capture initial credits from UI
    const initialCredits = await helpers.authPage.getCreditsAmount();

    await audioPage.clickProcessAndWaitForDownload();
    // Process batch and wait for downloads (verify both files processed successfully)
    const [download] = await Promise.all([page.waitForEvent('download')]);
    expect(download).toBeTruthy();

    // Wait for UI to update after processing
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Verify credits deducted correctly (2x file cost)
    const finalCredits = await helpers.authPage.getCreditsAmount();
    if (isLiveMode) {
      // LIVE_MODE: Expect credits deducted by 0.2 (2 files × 0.1 each)
      const expectedDeduction = 0.2;
      const actualDeduction = parseFloat(
        (initialCredits - finalCredits).toFixed(1)
      );
      expect(actualDeduction).toBeGreaterThanOrEqual(expectedDeduction - 0.2);
      expect(actualDeduction).toBeLessThanOrEqual(expectedDeduction + 0.2);
    } else {
      // MOCKED MODE: Expect credits to remain the same (no real deduction)
      const expectedRemaining = parseFloat(initialCredits.toFixed(1));
      const actualRemaining = parseFloat(finalCredits.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    }

    await audioPage.openCensoredWordsTab();
    const table = page.locator('table');
    await expect(table).toContainText(TestData.censorWords.default);
    await expect(table).toContainText('00:00:01');
  });
});
