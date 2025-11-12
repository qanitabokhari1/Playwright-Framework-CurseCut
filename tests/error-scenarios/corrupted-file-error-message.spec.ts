import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser11', () => {
  test('Corrupted file → error message', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const audioPage = helpers.audioProcessingPage;
    const isLiveMode = process.env.LIVE_MODE === 'true';

    await helpers.setupTestUser1();

    await audioPage.clickStartNow();

    // Capture initial credits before upload attempt
    await page.waitForTimeout(isLiveMode ? 5000 : 2000);

    const initialCredits = await helpers.authPage.getCreditsAmount();
    console.log(`Initial credits: ${initialCredits}`);

    // Upload corrupted file
    await audioPage.uploadAudioFile(TestData.files.corrupfile);

    // Verify error message appears
   await audioPage.expectCorruptedFileTypeErrorVisible('corrupt_file.mp3');

    // Verify user cannot proceed with processing (process button should be disabled)
    await audioPage.verifyProcessButtonDisabled();

    // Verify no credits deducted
    const finalCredits = await helpers.authPage.getCreditsAmount();
    console.log(`Final credits: ${finalCredits}`);
    
    const expectedRemaining = parseFloat(initialCredits.toFixed(1));
    const actualRemaining = parseFloat(finalCredits.toFixed(1));
    expect(actualRemaining).toBe(expectedRemaining);
    
    console.log('✅ No credits deducted for corrupted file');
  });
});