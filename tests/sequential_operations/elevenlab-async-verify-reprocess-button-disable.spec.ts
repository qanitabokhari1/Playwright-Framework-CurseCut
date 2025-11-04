import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
  test('ElevenLabs ASYNC → verify reprocess button disabled', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser2();

    if (!isLiveMode) {
      await helpers.setupMockingForTest('elevenlabs-async');
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    // ElevenLabs ASYNC: isSong=false, isPremium=true
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();

    await expect(page.getByTestId('reprocess-button')).toBeDisabled();
  });
});