import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser2', () => {
  test('ElevenLabs SYNC → Process ElevenLabs SYNC again (charged)', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    // Setup user and mocks
    await helpers.setupTestUser2();
    if (!isLiveMode) {
      await helpers.apiMocks.mock30SecFile();
    }

    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await audioPage.clickStartNow();

    // Upload test file
    await audioPage.uploadAudioFile(TestData.files.audio30Sec);

    // Configure ElevenLabs SYNC (song: yes, premium: no) and exact word
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Credits before first processing
    const initialCredits = await helpers.authPage.getCreditsAmount();
      console.log(`Initial credits: ${initialCredits}`);

    // Process and wait (single-processing pattern: wait for /status/)
      const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
    );
    console.log(`Initial credits: ${initialCredits}`);
    await page.getByTestId('process-button').click();
    await audioResponsePromise;
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Verify censored words (exact only)
    await audioPage.openCensoredWordsTab();
    for (const text of [
      'Fuck',
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
      await audioPage.expectInResultsTable(text);
    }

    // Update approx words and process again (charged)
    await audioPage.fillApproxWord('fuck twats');

    // Verify credits after first processing
    const creditsAfterFirst = await helpers.authPage.getCreditsAmount();
    if (isLiveMode) {
      const expectedRemaining = parseFloat((initialCredits - 0.2).toFixed(3));
      const actualRemaining = parseFloat(creditsAfterFirst.toFixed(3));
      expect(actualRemaining).toBe(expectedRemaining);
    } else {
      const expectedRemaining = parseFloat(initialCredits.toFixed(3));
      const actualRemaining = parseFloat(creditsAfterFirst.toFixed(3));
      expect(actualRemaining).toBe(expectedRemaining);
    }
    console.log(`Credits after first processing: ${creditsAfterFirst}`);

    // Second processing (same pattern)
      const audioResponseAgain = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
    );
    console.log(`Initial credits: ${initialCredits}`);
    await page.getByTestId('process-button').click();
    await audioResponseAgain;
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Validate expanded censored words and timestamps
    await audioPage.openCensoredWordsTab();
    for (const text of [
      'twats',
      '00:00:02',
      'Fuck',
      '00:00:05',
      'fuckers',
      '00:00:05',
      'fuck',
      '00:00:06',
      'Fucking',
      '00:00:07',
      'fucking',
      '00:00:09',
      'fuck',
      '00:00:10',
      'Fucking',
      '00:00:11',
      'twats',
      '00:00:11',
      'fucking',
      '00:00:17',
      'fuck',
      '00:00:18',
      'fucking',
      '00:00:19',
      'fuck',
      '00:00:21',
      'fucking',
      '00:00:23',
      'fucking',
      '00:00:23',
      'Fucking',
      '00:00:26',
      'fucking',
      '00:00:28',
    ]) {
      await audioPage.expectInResultsTable(text);
    }

    // Credits after second processing
    const finalCredits = await helpers.authPage.getCreditsAmount();
    if (isLiveMode) {
      const expectedRemainingSecond = parseFloat(
        (creditsAfterFirst - 0.2).toFixed(3)
      );
      const actualRemainingSecond = parseFloat(finalCredits.toFixed(3));
      expect(actualRemainingSecond).toBe(expectedRemainingSecond);
    } else {
      const expectedRemaining = parseFloat(initialCredits.toFixed(3));
      const actualRemaining = parseFloat(finalCredits.toFixed(3));
      expect(actualRemaining).toBe(expectedRemaining);
    }
    console.log(`Final credits: ${finalCredits}`);
  
  });
});