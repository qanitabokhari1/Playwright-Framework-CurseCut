import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser2', () => {
  test('should charge correct amount and show censored words after processing', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const isLiveMode = process.env.LIVE_MODE === 'true';

    // Setup: Login with test user 2 who has sufficient credits
    await helpers.setupTestUser2();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.setupMockingForTest('elevenlabs-sync');
    }

    const audioPage = helpers.audioProcessingPage;

    // Click Start Now button (already on home page after login)
    await audioPage.clickStartNow();

    // Upload audio file
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Select song-yes and enter exact match censor word
    await audioPage.songYesButton.click();
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Capture initial credits from UI
    const initialCreditsText = await audioPage.creditsButton.textContent();
    const initialCredits = parseFloat(
      initialCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    // Click process and wait for audio upload completion
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok(),
      { timeout: isLiveMode ? 180000 : 10000 }
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    // Wait for status completion
    const statusResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok(),
      { timeout: isLiveMode ? 180000 : 10000 }
    );
    await statusResponsePromise;

    const download = await page.waitForEvent('download');
    expect(download).toBeTruthy();

    // Verify credits based on LIVE_MODE
    const finalCreditsText = await audioPage.creditsButton.textContent();
    const finalCredits = parseFloat(
      finalCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    if (isLiveMode) {
      // LIVE_MODE: Expect credits deducted by 0.1
      const expectedRemaining = parseFloat((initialCredits - 0.1).toFixed(1));
      const actualRemaining = parseFloat(finalCredits.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    } else {
      // MOCKED MODE: Expect credits to remain the same (no real deduction)
      const expectedRemaining = parseFloat(initialCredits.toFixed(1));
      const actualRemaining = parseFloat(finalCredits.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    }

    // Verify censored words appear in the table
    await page.getByRole('tab', { name: /Censored Words/i }).click();
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText(/00:00:0[0-9]/);
  });
});
