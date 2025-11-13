import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
  test('should handle timeout error gracefully', async ({ page }) => {
    const helpers = new TestHelpers(page);

    // Setup authentication and credits
    await helpers.setupTestUser1();

    // Mock the /audio endpoint to start a job (inline mock for timeout testing)
    await page.route('**/audio', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Job started',
          task_id: '6d22cbfc-60e5-4475-9ca3-3f71772ee2f98',
          estimated_time: 9.768,
          model: 'elevenlabs',
          is_song: true,
          is_premium: false,
          using_premium_processing: true,
        }),
      });
    });

    // Mock the /status endpoint to return timeout error (LOCAL MOCK - no conflict)
    await page.route(
      '**/status/6d22cbfc-60e5-4475-9ca3-3f71772ee2f98',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            message: 'The read operation timed out',
          }),
        });
      }
    );

    const audioPage = helpers.audioProcessingPage;

    await page.waitForTimeout(7000);
    // Capture initial credits before starting processing to later verify refund
    const initialCredits = await audioPage.getCreditsAmount();

    // Click Start Now button (already on home page after login)
    await audioPage.clickStartNow();

    // Upload audio file
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Select song-yes and fill censor words
    await audioPage.songYesButton.click();
    await audioPage.fillCensorWords('fuck', 'uck'); // Fill both textboxes
    await audioPage.selectSineBleepReplacement();

    // Process the file and wait for timeout error
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok()
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    // Verify timeout error dialog appears
    await expect(page.getByText('Processing TimeoutWe')).toBeVisible();

    // Close the timeout dialog
    await page.getByTestId('timeout-dialog-close').click();

    // Verify credits restored to initial amount
    const creditsResponsePromise = page.waitForResponse(
      res => res.url().includes('/credits') && res.ok()
    );
    await creditsResponsePromise;

    await page.waitForTimeout(2000);
    const finalCredits = await audioPage.getCreditsAmount();
    expect(finalCredits).toBe(initialCredits);
  });
});
