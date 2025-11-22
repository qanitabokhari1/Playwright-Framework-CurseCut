import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser2', () => {
  test('ElevenLabs SYNC → Reprocess (free) - verify button enabled', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;

    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await helpers.apiMocks.mock30SecFile();
    }

    // Login as test user 2
    await helpers.setupTestUser2();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await audioPage.clickStartNow();

    // Upload test file
    await audioPage.uploadAudioFile(TestData.files.audio30Sec);

    // Configure SYNC: song yes, premium no; exact word
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Process and wait for /audio
    await audioPage.clickProcessAndWaitForDownload();

    // Verify censored words
    await audioPage.openCensoredWordsTab();
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
      await audioPage.expectInResultsTable(text);
    }

    // Verify first processing does not include broader variants
    await audioPage.expectNoneInResultsTable([
      'fucking',
      'fuckers',
      'fucked',
      'twats',
      'twat',
    ]);

    const initialCredits = await helpers.authPage.getCreditsAmount();

    // Reprocess with approx words
    await audioPage.fillApproxWord('fuck twats');
    await audioPage.clickReprocessAndWaitForDownload();

    await audioPage.openCensoredWordsTab();
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
      await audioPage.expectInResultsTable(text);
    }

    const finalCredits = await helpers.authPage.getCreditsAmount();
    expect(finalCredits).toBe(initialCredits);
  });
});
