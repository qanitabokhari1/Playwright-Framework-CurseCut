import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
    test('Unsupported file format shows validation and blocks processing', async ({ page }) => {
        const helpers = new TestHelpers(page);

        // Login as test user
        await helpers.setupTestUser1();

        const audioPage = helpers.audioProcessingPage;

        await page.waitForTimeout(5000);
        // Capture initial credits to verify no deduction after invalid uploads
        const initialCredits = await audioPage.getCreditsAmount();

        // Start flow
        await audioPage.clickStartNow();

        // Attempt 1: Upload unsupported .txt file
        await audioPage.uploadAudioFile(TestData.unsupportedFiles.txt);
        await audioPage.expectUnsupportedFileTypeErrorVisible('profile.txt');


        // Attempt 2: Upload unsupported .pdf file
        await audioPage.uploadAudioFile(TestData.unsupportedFiles.pdf);
        await audioPage.expectUnsupportedFileTypeErrorVisible('details.pdf');

        // Verify user cannot proceed (process button remains disabled)
        await audioPage.verifyProcessButtonDisabled();

        // Verify no credits deducted
        const finalCredits = await audioPage.getCreditsAmount();
        expect(finalCredits).toBe(initialCredits);
    });
});
