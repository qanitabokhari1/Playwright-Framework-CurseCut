import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('ElevenLabs SYNC processing - 30sec file - credits and censoring', () => {
  test('30sec file - credits and censoring - elevenlabs sync', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
    console.log('🔍 isLiveMode flag:', isLiveMode);

    // Setup authentication with sufficient credits
    await helpers.setupRealUserTest();

    // Setup mocking if not in live mode
    if (!isLiveMode) {
      console.log('📦 Setting up mocked APIs for elevenlabs-sync 30sec');
      await helpers.apiMocks.mockElevenLabsSync30SecFile();
    } else {
      console.log('🌐 Using real backend APIs (no mocking)');
    }

    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Capture initial credits
    const initialCreditsText = await audioPage.creditsButton.textContent();
    const initialCredits = parseFloat(
      initialCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    console.log('💰 Initial credits (raw text):', initialCreditsText);
    console.log('💰 Initial credits (parsed):', initialCredits);

    // Start flow
    await audioPage.clickStartNow();

    // Upload 30sec test file
    await audioPage.uploadAudioFile(TestData.files.audio30Sec);

    // Select Song = Yes
    await audioPage.selectSongOption(true);

    // Select Premium = No
    await audioPage.selectPremiumOption(false);

    // Enter exact match censor word
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Process the file
    const statusResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok(),
      { timeout: isLiveMode ? 60000 : 10000 }
    );
    await audioPage.clickProcessButton();
    await statusResponsePromise;

    // Wait for processing (longer timeout for live mode)
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Capture final credits
    const finalCreditsText = await audioPage.creditsButton.textContent();
    const finalCredits = parseFloat(
      finalCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    console.log('💰 Final credits (raw text):', finalCreditsText);
    console.log('💰 Final credits (parsed):', finalCredits);

    // Validate credit deduction based on mode
    if (isLiveMode) {
      const expectedCredits = parseFloat((initialCredits - 0.2).toFixed(3));
      const actualCredits = parseFloat(finalCredits.toFixed(3));
      console.log('✅ LIVE MODE - Expected credits:', expectedCredits);
      console.log('✅ LIVE MODE - Actual credits:', actualCredits);
      console.log('✅ LIVE MODE - Difference:', initialCredits - finalCredits);
      expect(actualCredits).toBe(expectedCredits);
    } else {
      // In mocked mode, credits should remain the same
      console.log('✅ MOCKED MODE - Expected credits (same as initial):', initialCredits);
      console.log('✅ MOCKED MODE - Actual credits:', finalCredits);
      console.log('✅ MOCKED MODE - Difference:', initialCredits - finalCredits);
      expect(finalCredits).toBe(initialCredits);
    }

    // Validate Censored Words tab shows the censored words with correct timestamps
    await page.getByRole('tab', { name: 'Censored Words' }).click();
    const table = page.locator('table');

    // Verify multiple instances of "fuck" and variations are censored
    await expect(table).toContainText('Fuck');
    await expect(table).toContainText('00:00:05');
    await expect(table).toContainText('fuck');
    await expect(table).toContainText('00:00:06');
    await expect(table).toContainText('fuck');
    await expect(table).toContainText('00:00:10');
    await expect(table).toContainText('Fuck');
    await expect(table).toContainText('00:00:18');
  });
});