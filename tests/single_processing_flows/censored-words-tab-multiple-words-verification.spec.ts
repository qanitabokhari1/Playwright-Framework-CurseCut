import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser3', () => {
  test('censored Words tab verification - multiple words', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser3();

    if (!isLiveMode) {
      // Use the 30-second file mock that includes multiple censored words
      await helpers.apiMocks.mock30SecFile();
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio30Sec);
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();

    // Use the page instance for censored words verification
    const pageInstance = audioPage.pageInstance;
    await pageInstance.getByRole('tab', { name: 'Censored Words' }).click();

    // Verify multiple censored words are listed with timestamps
    const table = pageInstance.locator('table');
    await table.scrollIntoViewIfNeeded();

    // Verify exact matches for "fuck" variations
    await expect(page.locator('table')).toContainText('Fuck');
    await expect(page.locator('table')).toContainText('00:00:05');
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:06');
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:10');
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:18');
    await expect(page.locator('table')).toContainText('fuck');
    await expect(page.locator('table')).toContainText('00:00:21');
  });
});
