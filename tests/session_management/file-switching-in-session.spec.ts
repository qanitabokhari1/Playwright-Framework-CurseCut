import { test } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Session Management', () => {
  test('File switching in same session - upload new file, verify previous state cleared', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    // Setup: Authenticate with real user and sufficient credits
    await helpers.setupRealUserTest();

    // Navigate to cut page
    const audioPage = helpers.audioProcessingPage;
    await audioPage.navigateTo(TestData.urls.cut);

    // Test steps: Complete enhanced workflow (first file upload and processing)
    await audioPage.uploadFileWithChooseFilesButton(TestData.files.audio);
    await audioPage.songYesButton.click();
    await audioPage.selectLanguage();
    await audioPage.fillCensorWords('fuck', 'fuck');
    await audioPage.selectSineBleepReplacement();
    await audioPage.waitForDownloadAndProcess();

    // Test file switching: Upload replacement file
    await audioPage.uploadReplacementFileWithChooseFilesButton(
      TestData.files.censoredAudio
    );

    // Wait for UI to update after file upload
    await page.waitForTimeout(2000);

    // Assertion: Verify reprocess button is not visible (state was cleared)
    await audioPage.verifyReprocessButtonNotVisible();
  });
});
