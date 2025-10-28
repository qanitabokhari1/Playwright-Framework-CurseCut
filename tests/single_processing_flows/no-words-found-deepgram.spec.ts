import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('No words found scenario - Deepgram with clean files', () => {
  test('No words found scenario - Deepgram with clean files', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
    console.log('🔍 isLiveMode flag:', isLiveMode);

    await helpers.setupSufficientCreditsTest();

    if (!isLiveMode) {
      await helpers.apiMocks.mockNoFuckWord('deepgram');
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.short3Sec_cleaned);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();

    // Wait for processing and check for no censored words using POM locator
    await expect(audioPage.noCensoredWordsMessage).toBeVisible();
  });
});
