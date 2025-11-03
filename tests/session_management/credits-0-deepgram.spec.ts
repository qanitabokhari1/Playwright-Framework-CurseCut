import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser2', () => {
  test('Process button disabled when user has insufficient credits - Deepgram', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    // Setup: Authenticate with zero credits
    await helpers.setupZeroCreditsTest();

    // Test steps: Complete audio processing workflow
    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Configure for Deepgram variant (not song, not premium)
    const config = TestData.processingVariants['deepgram'];
    await audioPage.configureAudioProcessing(
      config.isSong,
      config.isPremium,
      TestData.censorWords.default
    );

    // Assertion: Verify process button is disabled due to insufficient credits
    await expect(audioPage.processButton).toBeDisabled();
  });
});
