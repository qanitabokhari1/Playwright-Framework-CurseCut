import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';
test.describe('My Premium Files - appearance and download functionality', () => {
  test('My Premium Files - appearance and download functionality', async ({
    page,
  }) => {
    // Force live mode for this test
    const isLiveMode = true;
    console.log('🔍 isLiveMode flag:', isLiveMode);

    // Use helpers and POM for auth and page actions
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    await helpers.setupRealUserTest();

    // --- Step 6: Start processing flow ---
    await audioPage.clickStartNow();

    // Upload test file
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Select Song = No, Premium = Yes
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);

    // Enter censor word
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Wait for backend response during processing
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/upload-chunk') && res.ok()
    );

    // Start processing
    await audioPage.clickProcessButton();
    await audioResponsePromise;

    // Navigate to premium files section
    await page.waitForTimeout(3000);
    await audioPage.openMyPremiumFiles();

    // Verify the 1st file entry and its download button exist
    await audioPage.expectPremiumFileVisibleByName('short3Sec.mp3', 0);

    // Wait for browser download event when clicking the first Download button
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      (async () => await audioPage.clickPremiumDownloadAt(0))(),
    ]);

    expect(download).toBeTruthy();
  });
});
