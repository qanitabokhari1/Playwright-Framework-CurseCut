import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser4', () => {
  test('View All Words tab verification - comprehensive', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser4();

    if (!isLiveMode) {
      // Use the standard censoring success mock which includes the censored word
      await helpers.setupMockingForTest('elevenlabs-sync');
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessAndWaitForDownload();

    // Use the POM's page instance to interact with the View All Words tab and table
    const pageInstance = audioPage.pageInstance;
    await pageInstance.getByRole('tab', { name: 'View All Words' }).click();
    const table = pageInstance.locator('table');
    //actual response and mock response miss-match, if change it can affect other tests
    await expect(table).toContainText('Stupid');
    await expect(table).toContainText('00:00:00');
    await expect(table).toContainText('white');
    await expect(table).toContainText('00:00:00');
    await expect(table).toContainText('privileged');
    await expect(table).toContainText('00:00:01');
    await expect(table).toContainText('fuck');
    await expect(table).toContainText('00:00:00');
    await expect(table).toContainText('up');
  });
});
