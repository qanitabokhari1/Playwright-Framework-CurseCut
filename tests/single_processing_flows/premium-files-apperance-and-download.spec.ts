import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';
test.describe('testUser4', () => {
  test('My Premium Files - appearance and download functionality', async ({
    page,
  }) => {
    // Use helpers and POM for auth and page actions
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';
    await helpers.setupTestUser4();

    // When not in LIVE_MODE, setup API mocks so premium files populate and download works deterministically
    if (!isLiveMode) {
      // Mock processing flow endpoints for premium (async) path and upload chunk
      await helpers.setupMockingForTest('elevenlabs-async');
      // Mock the processed files listing endpoint so "My Premium Files" shows an entry
      await helpers.apiMocks.mockProcessedFilesAPI();
    }

    // --- Step 6: Start processing flow ---
    await audioPage.clickStartNow();

    // Upload test file
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Select Song = No, Premium = Yes
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);

    // Enter censor word
    await audioPage.fillCensorWord(TestData.censorWords.default);

    // Start processing
    await audioPage.clickProcessButton();

    // Wait for backend response during processing
    const audioResponsePromise = page.waitForResponse(
      res => res.url().includes('/upload-chunk') && res.ok()
    );

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
