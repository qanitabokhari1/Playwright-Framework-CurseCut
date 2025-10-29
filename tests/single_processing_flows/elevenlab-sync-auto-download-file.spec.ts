import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('ElevenLabs SYNC auto-download - file downloads automatically', () => {
  test('ElevenLabs SYNC auto-download - file downloads automatically', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';
    console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
    console.log('🔍 isLiveMode flag:', isLiveMode);

    // Ensure user is logged in (real backend flow)
    await helpers.setupRealUserTest();
    // Setup mocks unless LIVE_MODE is true
    if (!isLiveMode) {
      console.log(
        '📦 Setting up mocked APIs for elevenlabs-sync auto-download'
      );
      await helpers.setupMockingForTest('elevenlabs-sync');
    }

    // Start flow using POM
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Wait for download event that should be triggered by processing
    const pageInstance = audioPage.pageInstance;
    const [download] = await Promise.all([
      pageInstance.waitForEvent('download'),
      pageInstance.getByTestId('process-button').click(),
    ]);

    expect(download).toBeTruthy();
    console.log(
      '🎯 Download event triggered successfully:',
      download.suggestedFilename()
    );
  });
});
