import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser4', () => {
  test('browser tag verification (data attribute)', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;

    await helpers.setupTestUser4();

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(true);

    await expect(
      audioPage.pageInstance.getByText('Premium', { exact: true })
    ).toBeVisible();
  });
  test('premium tag verification (data attribute)', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;

    await helpers.setupRealUserTest();

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(true);
    await audioPage.selectPremiumOption(false);

    await expect(
      audioPage.pageInstance.getByText('Browser', { exact: true })
    ).toBeVisible();
  });
});
