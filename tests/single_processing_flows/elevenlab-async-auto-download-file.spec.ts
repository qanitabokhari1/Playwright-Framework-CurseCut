import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser3', () => {
  test('ElevenLabs ASYNC auto-download - file downloads automatically', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    // Ensure user is logged in (real backend flow)
    await helpers.setupTestUser3();
    // Setup mocks unless LIVE_MODE is true
    if (!isLiveMode) {
      await helpers.setupMockingForTest('elevenlabs-async');
    }

    // Start flow using POM
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Wait for download event that should be triggered by processing
    const pageInstance = audioPage.pageInstance;
    const [download] = await Promise.all([
      pageInstance.waitForEvent('download'),
      audioPage.clickProcessButton(),
    ]);

    expect(download).toBeTruthy();
  });
});
