import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser3', () => {
  test('ElevenLabs SYNC → Process ElevenLabs ASYNC (variant switch)', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    // LIVE_MODE-aware mocking: use 30s dataset locally for predictable results
    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await helpers.apiMocks.mock30SecFile();
      await helpers.apiMocks.mock30SecFileAsyncFlow();
    }

    // Setup authentication with real user
    await helpers.setupTestUser4();

    // Start processing flow
    await helpers.audioProcessingPage.clickStartNow();
    await helpers.audioProcessingPage.uploadAudioFile(
      TestData.files.audio30Sec
    );

    // Configure ElevenLabs sync processing (Song=Yes, Premium=No)
    await helpers.audioProcessingPage.selectSongOption(true);
    await helpers.audioProcessingPage.selectPremiumOption(false);
    await helpers.audioProcessingPage.fillCensorWord('fuck');

    // Process the file and wait for completion
    const creditsBeforeFirst = await helpers.authPage.getCreditsAmount();
    await helpers.audioProcessingPage.processFileAndWaitForResponse();

    // Validate Censored Words tab shows the censored words
    await helpers.audioProcessingPage.openCensoredWordsTab();
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
      await helpers.audioProcessingPage.expectInResultsTable(text);
    }

    // Verify ElevenLabs SYNC credits based on LIVE_MODE
    if (isLiveMode) {
      const expectedDeduction = 0.2;
      const afterFirst = await helpers.authPage.getCreditsAmount();
      const actualDeduction = +(creditsBeforeFirst - afterFirst).toFixed(3);
      expect(actualDeduction).toBeGreaterThanOrEqual(expectedDeduction - 0.2);
      expect(actualDeduction).toBeLessThanOrEqual(expectedDeduction + 0.2);
    } else {
      const afterFirst = +(await helpers.authPage.getCreditsAmount()).toFixed(
        3
      );
      expect(afterFirst).toBe(+creditsBeforeFirst.toFixed(3));
    }

    // Switch to ElevenLabs async processing (Song=No, Premium=Yes)
    await helpers.audioProcessingPage.selectSongOption(false);
    await helpers.audioProcessingPage.selectPremiumOption(true);
    await helpers.audioProcessingPage.fillApproxWord('fuck twats');

    // Wait for UI to update
    await page.waitForTimeout(5000);

    // Capture credits before second processing
    const creditsBeforeSecond = await helpers.authPage.getCreditsAmount();

    // Process with async variant and wait for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      helpers.audioProcessingPage.processButton.click({ force: true }),
    ]);

    // Verify download was triggered
    expect(download).toBeTruthy();
    // Validate Censored Words tab shows all censored words from async processing
    await helpers.audioProcessingPage.openCensoredWordsTab();
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
      await helpers.audioProcessingPage.expectInResultsTable(text);
    }
    // Verify ElevenLabs ASYNC credits based on LIVE_MODE
    if (isLiveMode) {
      const expectedDeduction = 0.2;
      const afterSecond = await helpers.authPage.getCreditsAmount();
      const actualDeduction = +(creditsBeforeSecond - afterSecond).toFixed(3);
      expect(actualDeduction).toBeGreaterThanOrEqual(expectedDeduction - 0.2);
      expect(actualDeduction).toBeLessThanOrEqual(expectedDeduction + 0.2);
    } else {
      const afterSecond = +(await helpers.authPage.getCreditsAmount()).toFixed(
        3
      );
      expect(afterSecond).toBe(+creditsBeforeSecond.toFixed(3));
    }
  });
});
