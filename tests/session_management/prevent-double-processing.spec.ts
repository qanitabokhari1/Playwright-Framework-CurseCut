import { test } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Session Management - prevent double processing', () => {
  test('deepgram', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const isLiveMode = process.env.LIVE_MODE === 'true';

    console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
    console.log('🔍 isLiveMode flag:', isLiveMode);

    // Setup: Authenticate with sufficient credits
    await helpers.setupSufficientCreditsTest();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      console.log('📦 Setting up mocked APIs for deepgram');
      await helpers.setupMockingForTest('deepgram');
    } else {
      console.log('🌐 Using real backend APIs (no mocking)');
    }

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

    // Trigger processing
    await audioPage.clickProcessButton();

    // Assertion: Verify processing started and button is disabled
    await audioPage.verifyProcessingStarted();
  });

  test('elevenlabs sync', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const isLiveMode = process.env.LIVE_MODE === 'true';

    console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
    console.log('🔍 isLiveMode flag:', isLiveMode);

    // Setup: Authenticate with sufficient credits
    await helpers.setupSufficientCreditsTest();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      console.log('📦 Setting up mocked APIs for elevenlabs-sync');
      await helpers.setupMockingForTest('elevenlabs-sync');
    } else {
      console.log('🌐 Using real backend APIs (no mocking)');
    }

    // Test steps: Complete audio processing workflow
    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Configure for ElevenLabs Sync variant (song, not premium)
    const config = TestData.processingVariants['elevenlabs-sync'];
    await audioPage.configureAudioProcessing(
      config.isSong,
      config.isPremium,
      TestData.censorWords.default
    );

    // Trigger processing
    await audioPage.clickProcessButton();

    // Assertion: Verify processing started and button is disabled
    await audioPage.verifyProcessingStarted();
  });

  test('elevenlabs async', async ({ page }) => {
    const helpers = new TestHelpers(page);

    // Setup: Authenticate with sufficient credits
    await helpers.setupSufficientCreditsTest();
    await helpers.setupMockingForTest('elevenlabs-async');

    // Test steps: Complete audio processing workflow
    const audioPage = helpers.audioProcessingPage;
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Configure for ElevenLabs Async variant (not song, premium)
    const config = TestData.processingVariants['elevenlabs-async'];
    await audioPage.configureAudioProcessing(
      config.isSong,
      config.isPremium,
      TestData.censorWords.default
    );

    // Trigger processing
    await audioPage.clickProcessButton();

    // Assertion: Verify processing started and button is disabled
    await audioPage.verifyProcessingStarted();
  });
});
