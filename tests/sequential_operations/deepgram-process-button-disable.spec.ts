import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser3', () => {
  test('Deepgram → Reprocess (free) - verify button enabled', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser3();

    if (!isLiveMode) {
      await helpers.setupMockingForTest('deepgram');
    }

    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);
    await audioPage.selectSongOption(false);
    await audioPage.selectPremiumOption(false);
    await audioPage.fillCensorWord(TestData.censorWords.default);

    await audioPage.clickProcessButton();
   

    // Verify reprocess button enabled (align with example style)
    await expect(page.getByTestId('reprocess-button')).toBeEnabled();
    
    // {await page.waitForTimeout(3000);}
    await expect(page.getByText('Cost: Free')).toBeVisible();

  });
});
