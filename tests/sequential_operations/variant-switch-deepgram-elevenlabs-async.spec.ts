import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser5', () => {
  test('Deepgram → Process ElevenLabs ASYNC (variant switch)', async ({
    page,
  }) => {
    test.setTimeout(120000);
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    // Use shared API mocks in non-live mode
    if (!isLiveMode) {
      await helpers.apiMocks.mock30SecFile();
    }

    // Login and ensure session (use POM helpers)
    await helpers.setupTestUser5();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await audioPage.clickStartNow();

    // Upload test file
    await audioPage.uploadAudioFile(TestData.files.audio30Sec);

    // Select Song = No, Premium = No (Deepgram)
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(false);

    // Enter exact match censor word
    await audioPage.fillCensorWord('fuck');

    // Process the file (first processing - Deepgram)
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
    );
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    // Validate Censored Words tab shows the censored word with correct timestamp
    await audioPage.openCensoredWordsTab();
    for (const text of [
      'fuck',
      '00:00:05',
      'fuck',
      '00:00:06',
      'fuck',
      '00:00:10',
      'fuck',
      '00:00:18',
      'fuck',
      '00:00:21',
    ]) {
      await audioPage.expectInResultsTable(text);
    }

    // Switch to ElevenLabs ASYNC variant
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);
    await audioPage.fillApproxWord('fuck twats');
    await page.waitForTimeout(2000);

    // Capture initial credits from UI before second processing
    const initialCreditsText = await audioPage.creditsButton.textContent();
    const initialCredits = parseFloat(
      initialCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    // Second processing (ElevenLabs ASYNC with download)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      audioPage.clickProcessButton(),
    ]);

    // Assert that the download event fired successfully
    expect(download).toBeTruthy();

    // Wait for UI to update after processing
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Validate Censored Words tab shows the censored word with correct timestamp
    await audioPage.openCensoredWordsTab();
    for (const text of [
      'twats',
      '00:00:02',
      'Fuck',
      '00:00:05',
      'fuckers',
      '00:00:05',
      'fuck',
      '00:00:06',
      'Fucking',
      '00:00:07',
      'fucking',
      '00:00:09',
      'fuck',
      '00:00:10',
      'Fucking',
      '00:00:11',
      'twats',
      '00:00:11',
      'fucking',
      '00:00:17',
      'fuck',
      '00:00:18',
      'fucking',
      '00:00:19',
      'fuck',
      '00:00:21',
      'fucking',
      '00:00:23',
      'fucking',
      '00:00:23',
      'Fucking',
      '00:00:26',
      'fucking',
      '00:00:28',
    ]) {
      await audioPage.expectInResultsTable(text);
    }

    // Verify credits based on LIVE_MODE
    const finalCreditsText = await audioPage.creditsButton.textContent();
    const finalCredits = parseFloat(
      finalCreditsText?.replace(/[^\d.]/g, '') || '0'
    );

    if (isLiveMode) {
      // LIVE_MODE: Expect credits deducted by 0.2
      const expectedRemaining = parseFloat((initialCredits - 0.2).toFixed(3));
      const actualRemaining = parseFloat(finalCredits.toFixed(3));
      expect(actualRemaining).toBe(expectedRemaining);
    } else {
      // MOCKED MODE: Expect credits to remain the same (no real deduction)
      const expectedRemaining = parseFloat(initialCredits.toFixed(3));
      const actualRemaining = parseFloat(finalCredits.toFixed(3));
      expect(actualRemaining).toBe(expectedRemaining);
    }
  });
});
