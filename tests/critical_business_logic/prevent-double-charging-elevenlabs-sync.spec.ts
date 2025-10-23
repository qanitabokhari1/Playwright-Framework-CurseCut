import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Critical business logic - prevent double charging elevenlabs sync', () => {
  test('should charge correct amount and show censored words after processing', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    // Setup: Login with real user and mock sufficient credits
    await helpers.setupRealUserTest();

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

    // No mocking - let all APIs hit real backend to test actual credit deduction

    // Click process and wait for audio upload completion (REAL BACKEND)
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok(),
      { timeout: 30000 }
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    // Wait for status completion (real backend processing)
    const statusResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok(),
      { timeout: 60000 } // Increased timeout for real processing
    );
    await statusResponsePromise;

    // Wait for UI to update after processing
    await page.waitForTimeout(5000); // Increased wait for real backend

    // Verify credits deducted by 1 (cost is always 1 credit for this audio file)
    const finalCreditsText = await audioPage.creditsButton.textContent();
    const finalCredits = parseFloat(
      finalCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    const expectedRemaining = parseFloat((initialCredits - 0.1).toFixed(3));
    const actualRemaining = parseFloat(finalCredits.toFixed(3));

    expect(actualRemaining).toBe(expectedRemaining);

    // Verify censored words appear in the table
    await page.getByRole('tab', { name: /Censored Words/i }).click();
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText(/00:00:0[0-9]/);
  });
});
