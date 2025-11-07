import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser4', () => {
  test('Deepgram → Process Deepgram again (charged)', async ({ page }) => {
    const helpers = new TestHelpers(page);

    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await helpers.apiMocks.mock30SecFile();
    }

    // Login as test user 1
    await helpers.setupTestUser4();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await helpers.audioProcessingPage.clickStartNow();

    // Upload test file
    await helpers.audioProcessingPage.uploadAudioFile(
      TestData.files.audio30Sec
    );

    // Configure Deepgram (song: no, premium: no) and exact word
    await helpers.audioProcessingPage.selectSongOption(false);
    await helpers.audioProcessingPage.selectPremiumOption(false);
    await helpers.audioProcessingPage.fillCensorWord(
      TestData.censorWords.default
    );

    // Capture initial credits, then process
    const initialCredits = await helpers.authPage.getCreditsAmount();
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
    );
    await page.getByTestId('process-button').click();
    await audioResponsePromise;

    // Additionally wait for the download to start/complete (live may auto-download)
    try {
      const download = await page.waitForEvent('download', {
        timeout: isLiveMode ? 60000 : 10000,
      });
      try {
        await download.path();
      } catch {
        // Ignore if no local path is available (e.g., CI)
      }
    } catch {
      // No download occurred; acceptable for flows that only return JSON
    }

    // Verify censored words after first processing (exact-only)
    await helpers.audioProcessingPage.openCensoredWordsTab();
    for (const text of [
      'fuck',
      '00:00:05',
      'fuck',
      '00:00:06',
      'fuck',
      '00:00:10',
      'fuck',
      '00:00:18',
      'fuck',
      '00:00:21',
    ]) {
      await helpers.audioProcessingPage.expectInResultsTable(text);
    }
    await helpers.audioProcessingPage.expectNoneInResultsTable([
      'fucking',
      'fuckers',
      'fucked',
      'twats',
      'twat',
    ]);

    // Verify credits after first processing
    const creditsAfterFirst = await helpers.authPage.getCreditsAmount();
    if (isLiveMode) {
      const expectedRemaining = parseFloat((initialCredits - 0.1).toFixed(1));
      const actualRemaining = parseFloat(creditsAfterFirst.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    } else {
      const expectedRemaining = parseFloat(initialCredits.toFixed(1));
      const actualRemaining = parseFloat(creditsAfterFirst.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    }
    // Update approx words and process again (charged)
    await helpers.audioProcessingPage.fillApproxWord('fuck twats');
    const audioResponseAgain = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
    );
    await page.getByTestId('process-button').click();
    await audioResponseAgain;

    // Additionally wait for the download after second processing
    try {
      const download2 = await page.waitForEvent('download', {
        timeout: isLiveMode ? 60000 : 10000,
      });
      try {
        await download2.path();
      } catch {
        // Ignore if path not provided
      }
    } catch {
      // No download occurred; acceptable
    }

    // Validate expanded censored words and timestamps
    await helpers.audioProcessingPage.openCensoredWordsTab();
    for (const text of [
      'twats',
      '00:00:02',
      'fuck',
      '00:00:05',
      'fuckers',
      '00:00:05',
      'fucking',
      '00:00:07',
      'fucking',
      '00:00:09',
      'fuck',
      '00:00:10',
      'fucking',
      '00:00:11',
      'twats',
      '00:00:11',
      'fuck',
      '00:00:18',
      'fucking',
      '00:00:19',
      'fuck',
      '00:00:21',
      'fucking',
      '00:00:23',
      'fuck',
      '00:00:26',
      'fucking',
      '00:00:28',
    ]) {
      await helpers.audioProcessingPage.expectInResultsTable(text);
    }

    // Verify charged again on second processing
    const finalCredits = await helpers.authPage.getCreditsAmount();
    if (isLiveMode) {
      const expectedRemainingSecond = parseFloat(
        (creditsAfterFirst - 0.1).toFixed(1)
      );
      const actualRemainingSecond = parseFloat(finalCredits.toFixed(1));
      expect(actualRemainingSecond).toBe(expectedRemainingSecond);
    } else {
      const expectedRemaining = parseFloat(initialCredits.toFixed(1));
      const actualRemaining = parseFloat(finalCredits.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    }
  });
});
