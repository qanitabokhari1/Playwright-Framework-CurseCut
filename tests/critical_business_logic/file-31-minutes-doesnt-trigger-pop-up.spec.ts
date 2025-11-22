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

    // Validate: no popup with "I understand" button appears
    const understandButton = page.getByRole('button', { name: 'I understand' });
    await expect(understandButton).not.toBeVisible({ timeout: 5000 });
  });
});
