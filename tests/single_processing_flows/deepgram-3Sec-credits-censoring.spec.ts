import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Deepgram processing - 3sec file - credits and censoring', () => {
  test('3sec file - credits and censoring', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupRealUserTest();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.setupMockingForTest('deepgram');
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Capture initial credits from UI
    const initialCreditsText = await audioPage.creditsButton.textContent();
    const initialCredits = parseFloat(
      initialCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    const statusResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok(),
      { timeout: isLiveMode ? 60000 : 10000 }
    );
    await audioPage.clickProcessButton();
    await statusResponsePromise;

    // Wait for UI to update after processing
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Verify credits based on LIVE_MODE
    const finalCreditsText = await audioPage.creditsButton.textContent();
    const finalCredits = parseFloat(
      finalCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    if (isLiveMode) {
      // LIVE_MODE: Expect credits deducted by 0.1
      const expectedRemaining = parseFloat((initialCredits - 0.1).toFixed(3));
      const actualRemaining = parseFloat(finalCredits.toFixed(3));
      expect(actualRemaining).toBe(expectedRemaining);
    } else {
      // MOCKED MODE: Expect credits to remain the same (no real deduction)
      expect(finalCredits).toBe(initialCredits);
    }

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await page.locator('table').scrollIntoViewIfNeeded();
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:00:01');
  });
});
