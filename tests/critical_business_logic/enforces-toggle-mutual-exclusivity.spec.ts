import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
  test('mutually exclusive yes toggles and initial unselected state (0 credits)', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    // Auth
    await helpers.setupTestUser1();

    const audioPage = helpers.audioProcessingPage;

    // Enter workflow and upload using absolute fixture path
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio);

    // Initially neither "yes" has selected class
    await expect(audioPage.songYesButton).not.toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });
    await expect(audioPage.premiumYesButton).not.toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });

    // Select song-yes -> only song-yes selected
    await audioPage.songYesButton.click();
    await expect(audioPage.songYesButton).toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });
    await expect(audioPage.premiumYesButton).not.toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });

    // Select premium-yes -> premium-yes selected, song-yes unselected
    await audioPage.premiumYesButton.click();
    await expect(audioPage.premiumYesButton).toHaveClass(/bg-slate-900/);
    await expect(audioPage.songYesButton).not.toHaveClass(/bg-slate-900/);

    // Select song-yes again -> song-yes selected, premium-yes unselected
    await audioPage.songYesButton.click();
    await expect(audioPage.songYesButton).toHaveClass(/bg-slate-900/);
    await expect(audioPage.premiumYesButton).not.toHaveClass(/bg-slate-900/);
  });
});
