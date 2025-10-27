import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('Deepgram processing - 3sec file - credits and censoring', () => {
  test('3sec file - credits and censoring', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;

    await helpers.setupSufficientCreditsTest();
    await helpers.setupMockingForTest('deepgram');

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    const statusResponsePromise = page.waitForResponse(
      res => res.url().includes('/status/') && res.ok()
    );
    await audioPage.clickProcessButton();
    await statusResponsePromise;

    await page.getByRole('tab', { name: 'Censored Words' }).click();
    await page.locator('table').scrollIntoViewIfNeeded();
    await expect(page.locator('table')).toContainText(
      TestData.censorWords.default
    );
    await expect(page.locator('table')).toContainText('00:00:01');
  });
});