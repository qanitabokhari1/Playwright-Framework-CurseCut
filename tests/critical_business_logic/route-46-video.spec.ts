import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser2', () => {
  test('auto-selects premium-yes for >45 min upload and leaves song-yes unselected (0 credits)', async ({
    page,
  }) => {
    const helpers = new TestHelpers(page);

    // Setup with sufficient credits
    await helpers.setupTestUser2();

    const audioPage = helpers.audioProcessingPage;

    // Enter workflow and upload a long file (>45 min)
    await audioPage.clickStartNow();
    await audioPage.uploadAudioFile(TestData.files.audio46Min);

    // If an informational dialog appears, acknowledge it
    const understandButton = page.getByRole('button', { name: 'I understand' });
    if (await understandButton.isVisible().catch(() => false)) {
      await understandButton.click();
    }

    // Validate: premium-yes auto-selected, song-yes not selected
    await expect(audioPage.premiumYesButton).toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });
    await expect(audioPage.songYesButton).not.toHaveClass(/bg-slate-900/, {
      timeout: 40000,
    });
  });
});
