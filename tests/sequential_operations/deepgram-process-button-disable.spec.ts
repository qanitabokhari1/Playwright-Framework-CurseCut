import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
  test('Deepgram → Reprocess (free) - verify button enabled', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await helpers.apiMocks.mock30SecFile();
    }

    // Login as test user 1
    await helpers.setupTestUser1();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await helpers.audioProcessingPage.clickStartNow();

    // Upload test file
    await helpers.audioProcessingPage.uploadAudioFile(TestData.files.audio30Sec);

    // Configure Deepgram (song: no, premium: no) and exact word
    await helpers.audioProcessingPage.selectSongOption(false);
    await helpers.audioProcessingPage.selectPremiumOption(false);
    await helpers.audioProcessingPage.fillCensorWord(TestData.censorWords.default);

    // Process and wait for /audio response
    await helpers.audioProcessingPage.processFileAndWaitForResponse();

    // Verify censored words
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

    // Verify first processing does not include broader variants
    await helpers.audioProcessingPage.expectNoneInResultsTable([
      'fucking',
      'fuckers',
      'fucked',
      'twats',
      'twat',
    ]);

    const initialCredits = await helpers.authPage.getCreditsAmount();

    // Reprocess with approx words
    await helpers.audioProcessingPage.fillApproxWord('fuck twats');
    await helpers.audioProcessingPage.clickReprocessAndWaitForDownload();

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

    const finalCredits = await helpers.authPage.getCreditsAmount();
    expect(finalCredits).toBe(initialCredits);
  });
});