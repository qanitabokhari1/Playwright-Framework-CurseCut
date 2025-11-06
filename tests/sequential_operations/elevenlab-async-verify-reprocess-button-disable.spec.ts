import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser3', () => {
  test('ElevenLabs ASYNC → verify reprocess button disabled', async ({
    page,
  }) => {
    const h = new TestHelpers(page);

    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await h.apiMocks.mock30SecFileAsyncFlow();
    }

    // Login as test user 3
    await h.setupTestUser3();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await h.audioProcessingPage.clickStartNow();

    // Upload test file
    await h.audioProcessingPage.uploadAudioFile(TestData.files.audio30Sec);

    // Configure ASYNC: song no, premium yes; exact word
    await h.audioProcessingPage.selectSongOption(false);
    await h.audioProcessingPage.selectPremiumOption(true);
    await h.audioProcessingPage.fillCensorWord(TestData.censorWords.default);

    // Process the file (with live polling when LIVE_MODE=true)
    await h.audioProcessingPage.processAsyncAndPollLiveMode();

    // Validate Censored Words tab shows the censored word with correct timestamp
    await h.audioProcessingPage.openCensoredWordsTab();
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
      await h.audioProcessingPage.expectInResultsTable(text);
    }

    // Verify first processing does not include broader variants
    await h.audioProcessingPage.expectNoneInResultsTable([
      'fucking',
      'fuckers',
      'fucked',
      'twats',
      'twat',
    ]);

    // Validate Reprocess button is disabled and Process button is enabled
    await h.audioProcessingPage.verifyReprocessButtonDisabled();
  });
});
