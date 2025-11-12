import { test } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
    test('Process button disabled when file uploaded but no censor words', async ({ page }) => {
        const helpers = new TestHelpers(page);

        // Login as test user
        await helpers.setupTestUser1();

        const audioPage = helpers.audioProcessingPage;

        // Open processing flow and set basic options
        await audioPage.clickStartNow();

        // 1) Upload file, but do NOT enter censor words
        await helpers.audioProcessingPage.uploadAudioFile(
            TestData.files.audio
        );

        await audioPage.selectSongOption(false); // Deepgram-style (non-song)
        await audioPage.selectPremiumOption(false); // Non-premium

        // 1) Verify: process button should be disabled
        await audioPage.verifyProcessButtonDisabled();
    });

    test('Process button disabled when censor words entered but no file', async ({ page }) => {
        const helpers = new TestHelpers(page);

        // Login as test user
        await helpers.setupTestUser1();

        const audioPage = helpers.audioProcessingPage;

        // Open processing flow and set basic options
        await audioPage.clickStartNow();


        // 2) Enter censor words, but do NOT upload file
        await audioPage.fillCensorWord(TestData.censorWords.default);

        // 2) Verify: process button should be disabled
        await audioPage.verifyProcessButtonDisabled();
    });

    test('Process button enabled when both file and censor words provided', async ({ page }) => {
        const helpers = new TestHelpers(page);

        // Login as test user
        await helpers.setupTestUser1();

        const audioPage = helpers.audioProcessingPage;

        // Open processing flow and set basic options
        await audioPage.clickStartNow();

        // 1) Upload file, but do NOT enter censor words
        await helpers.audioProcessingPage.uploadAudioFile(
            TestData.files.audio
        );

        await audioPage.selectPremiumOption(false); // Non-premium
        await audioPage.selectSongOption(false); // Deepgram-style (non-song)

        await audioPage.fillCensorWord(TestData.censorWords.default);

        // 3) Verify: process button should be enabled
        await audioPage.verifyProcessButtonEnabled();
    });
});


