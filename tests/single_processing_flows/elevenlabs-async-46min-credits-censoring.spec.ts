import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('ElevenLabs ASYNC processing - 46min file - credits and censoring', () => {
    test('46min file - credits and censoring', async ({ page }) => {
        // Set test timeout to 5 minutes (300 seconds) for long file processing
        test.setTimeout(300000);
        
        const helpers = new TestHelpers(page);
        const audioPage = helpers.audioProcessingPage;
        const isLiveMode = process.env.LIVE_MODE === 'true';

        console.log('🔍 LIVE_MODE environment variable:', process.env.LIVE_MODE);
        console.log('🔍 isLiveMode flag:', isLiveMode);

        await helpers.setupRealUserTest();

        // Conditionally setup mocks based on LIVE_MODE flag
        if (!isLiveMode) {
            console.log('📦 Setting up mocked APIs for elevenlabs-async 46min file');
            await helpers.apiMocks.mock46MinutesAudioFile();
            await helpers.apiMocks.mockUploadChunkAPI();
        } else {
            console.log('🌐 Using real backend APIs (no mocking)');
        }

        await audioPage.clickStartNow();
        await audioPage.uploadAudioFile(TestData.files.audio46Min);

        const understandButton = page.getByRole('button', { name: 'I understand' });
        await understandButton.click();

        await audioPage.fillCensorWord(TestData.censorWords.default);

        await page.waitForTimeout(isLiveMode ? 5000 : 2000);

        // Capture initial credits from UI
        const initialCreditsText = await audioPage.creditsButton.textContent();
        const initialCredits = parseFloat(
            initialCreditsText?.replace(/[^\d.]/g, '') || '0'
        );

        console.log('💰 Initial credits (raw text):', initialCreditsText);
        console.log('💰 Initial credits (parsed):', initialCredits);

        await audioPage.clickProcessButton();
        const statusResponsePromise = page.waitForResponse(
            res => res.url().includes('/status/') && res.ok(),
            { timeout: 180000 }
        );
        await statusResponsePromise;


        // Wait for status response to confirm processing completed

        // Wait for UI to update after processing
        await page.waitForTimeout(isLiveMode ? 5000 : 2000);

        // Verify credits based on LIVE_MODE
        const finalCreditsText = await audioPage.creditsButton.textContent();
        const finalCredits = parseFloat(
            finalCreditsText?.replace(/[^\d.]/g, '') || '0'
        );

        console.log('💰 Final credits (raw text):', finalCreditsText);
        console.log('💰 Final credits (parsed):', finalCredits);

        if (isLiveMode) {
            // LIVE_MODE: Expect credits deducted (46 minutes ~= 17.6)
            const expectedDeduction = 17.6; // Approximate for 46 minute file
            const actualDeduction = parseFloat((initialCredits - finalCredits).toFixed(3));
            console.log('✅ LIVE MODE - Expected deduction:', expectedDeduction);
            console.log('✅ LIVE MODE - Actual deduction:', actualDeduction);
            console.log('✅ LIVE MODE - Final credits:', finalCredits);

            // Allow for small variance in credit calculation
            expect(actualDeduction).toBeGreaterThanOrEqual(expectedDeduction - 0.1);
            expect(actualDeduction).toBeLessThanOrEqual(expectedDeduction + 0.1);
        } else {
            // MOCKED MODE: Expect credits to remain the same (no real deduction)
            console.log('✅ MOCKED MODE - Expected credits (same as initial):', initialCredits);
            console.log('✅ MOCKED MODE - Actual credits:', finalCredits);
            console.log('✅ MOCKED MODE - Difference:', initialCredits - finalCredits);
            expect(finalCredits).toBe(initialCredits);
        }

        // Validate Censored Words tab shows the censored word with correct timestamp
        await page.getByRole('tab', { name: 'Censored Words' }).click();
        await page.locator('table').scrollIntoViewIfNeeded();
        await expect(page.locator('table')).toContainText(TestData.censorWords.default);
        await expect(page.locator('table')).toContainText('00:01:29');
    });
});