import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser8', () => {
  test('ElevenLabs SYNC → Multiple files blocked', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser8();

    // Conditionally setup mocks based on LIVE_MODE flag
    if (!isLiveMode) {
      await helpers.setupMockingForTest('elevenlabs-sync');
    }

    await audioPage.clickStartNow();

    // Upload 2 short files (3sec each) at once
    await audioPage.uploadMultipleAudioFiles([
      TestData.files.audio,
      TestData.files.audio,
    ]);

    // Verify both files are uploaded initially
    await audioPage.verifyMultipleFilesUploaded();

    // Select ElevenLabs SYNC variant (song: yes, premium: no)
    await audioPage.selectSongOption(true);

    // Verify popup appears with correct content
    await audioPage.verifyPremiumProcessingPopup();

    // Click "I understand" button
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent?.includes('I understand')
      );
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => button.click(), 100);
      }
    });

    await audioPage.selectPremiumOption(false);

    // Verify ONLY the first file remains (second file removed)
    await audioPage.verifySingleFileRemains();

    // Add censor word
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Capture initial credits (should show cost for ONLY first file)
    const initialCredits = await helpers.authPage.getCreditsAmount();

    // Process file and wait for single download (only first file processed)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      audioPage.clickProcessButton(),
    ]);

    // Verify only one download was triggered
    expect(download).toBeTruthy();

    // Wait for UI to update after processing
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    // Verify credits deducted correctly (only for first file, not batch total)
    const finalCredits = await helpers.authPage.getCreditsAmount();
    if (isLiveMode) {
      // LIVE_MODE: Expect credits deducted by 0.2 (only 1 file × 0.2)
      const expectedDeduction = 0.1;
      const actualDeduction = parseFloat(
        (initialCredits - finalCredits).toFixed(1)
      );
      expect(actualDeduction).toBeGreaterThanOrEqual(expectedDeduction - 0.1);
      expect(actualDeduction).toBeLessThanOrEqual(expectedDeduction + 0.1);
    } else {
      // MOCKED MODE: Expect credits to remain the same (no real deduction)
      const expectedRemaining = parseFloat(initialCredits.toFixed(1));
      const actualRemaining = parseFloat(finalCredits.toFixed(1));
      expect(actualRemaining).toBe(expectedRemaining);
    }

    // Verify only first file appears in results
    await audioPage.openCensoredWordsTab();
    const table = page.locator('table');
    await expect(table).toContainText(TestData.censorWords.default);
    await expect(table).toContainText('00:00:01');
  });
});
