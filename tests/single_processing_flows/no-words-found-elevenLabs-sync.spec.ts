import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '@/fixtures/testData';
test.describe('testUser4', () => {
  test('No words found scenario - ElevenLabs SYNC with clean files', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';
    await helpers.setupTestUser4();
    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.apiMocks.mockNoFuckWord('elevenlabs-sync');
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.short3Sec_cleaned);
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();

    await page.waitForTimeout(isLiveMode ? 7000 : 2000);
    // Wait for processing and check for no censored words using POM locator
    await expect(audioPage.noCensoredWordsMessage).toBeVisible();
  });
});
