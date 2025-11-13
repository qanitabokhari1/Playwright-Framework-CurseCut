import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser2', () => {
  test('Deepgram → Process ElevenLabs SYNC (variant switch)', async ({
    page,
  }) => {
    const h = new TestHelpers(page);

    // LIVE_MODE-aware mocking: use 30s dataset locally for predictable results
    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await h.apiMocks.mock30SecFile();
    }

    // Login
    await h.setupTestUser2();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await h.audioProcessingPage.clickStartNow();

    // Upload test file
    await h.audioProcessingPage.uploadAudioFile(TestData.files.audio30Sec);

    // Start with Deepgram-like settings (song: no, premium: no)
    await h.audioProcessingPage.selectSongOption(false);
    await h.audioProcessingPage.selectPremiumOption(false);
    await h.audioProcessingPage.fillCensorWord(TestData.censorWords.default);

    // Process and verify initial results
    const creditsBeforeFirst = await h.authPage.getCreditsAmount();
    await h.audioProcessingPage.clickProcessAndWaitForDownload();
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

    // Verify Deepgram credits based on LIVE_MODE (direct compare)
    if (isLiveMode) {
      const expectedAfterFirst = +(creditsBeforeFirst - 0.1).toFixed(3);
      const afterFirst = +(await h.authPage.getCreditsAmount()).toFixed(3);
      expect(afterFirst).toBe(expectedAfterFirst);
    } else {
      const afterFirst = +(await h.authPage.getCreditsAmount()).toFixed(3);
      expect(afterFirst).toBe(+creditsBeforeFirst.toFixed(3));
    }

    // Switch variant settings to ElevenLabs SYNC style
    await h.audioProcessingPage.selectSongOption(true);
    await h.audioProcessingPage.selectPremiumOption(false);
    await h.audioProcessingPage.fillApproxWord('fuck twat');

    // Trigger processing and wait for download event
    const creditsBeforeSecond = await h.authPage.getCreditsAmount();
    await h.audioProcessingPage.clickProcessAndWaitForDownload();

    await h.audioProcessingPage.openCensoredWordsTab();
    for (const text of [
      'twats',
      '00:00:02',
      'fuckers',
      '00:00:05',
      'fuck',
      '00:00:06',
      'fucking',
      '00:00:07',
      'fucking',
      '00:00:09',
      'fuck',
      '00:00:10',
      'fucking',
      '00:00:11',
    ]) {
      await h.audioProcessingPage.expectInResultsTable(text);
    }

    // Verify ElevenLabs SYNC credits based on LIVE_MODE (direct compare)
    if (isLiveMode) {
      const expectedAfterSecond = +(creditsBeforeSecond - 0.2).toFixed(3);
      const afterSecond = +(await h.authPage.getCreditsAmount()).toFixed(3);
      expect(afterSecond).toBe(expectedAfterSecond);
    } else {
      const afterSecond = +(await h.authPage.getCreditsAmount()).toFixed(3);
      expect(afterSecond).toBe(+creditsBeforeSecond.toFixed(3));
    }
  });
});
