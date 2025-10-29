import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('No words found scenario - ElevenLabs ASYNC with clean files', () => {
  test('No words found scenario - ElevenLabs ASYNC with clean files', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
    console.log('🔍 isLiveMode flag:', isLiveMode);

     await helpers.setupRealUserTest();
    
    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.apiMocks.mockNoFuckWord('elevenlabs-async');
      await helpers.apiMocks.mockUploadChunkAPI();
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.short3Sec_cleaned);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);
    // Wait for processing and check for no censored words using POM locator
    await expect(audioPage.noCensoredWordsMessage).toBeVisible();
  });
});