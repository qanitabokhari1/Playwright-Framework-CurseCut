import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '@/fixtures/testData';
test.describe('No words found scenario - ElevenLabs SYNC with clean files', () => {
  test('No words found scenario - ElevenLabs SYNC with clean files', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;

    await helpers.setupSufficientCreditsTest();
    await helpers.apiMocks.mockNoFuckWord('elevenlabs-sync');

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.short3Sec_cleaned);
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();

    // Wait for processing and check for no censored words using POM locator
    await expect(audioPage.noCensoredWordsMessage).toBeVisible();
  });
});
