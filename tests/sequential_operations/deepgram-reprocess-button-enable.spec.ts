import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';
import { TestData } from '../../fixtures/testData';

test.describe('testUser1', () => {
  test('Deepgram → Reprocess (free) - verify button enabled', async ({
    page,
  }) => {
    const h = new TestHelpers(page);

    const isLiveMode = process.env.LIVE_MODE === 'true';
    if (!isLiveMode) {
      await h.apiMocks.mock30SecFile();
    }

    // Login as test user 1
    await h.setupTestUser1();
    await expect(page.getByTestId('login-button')).toBeHidden();

    // Start flow
    await h.audioProcessingPage.clickStartNow();

    // Upload test file
    await h.audioProcessingPage.uploadAudioFile(TestData.files.audio30Sec);

    // Configure Deepgram (song: no, premium: no) and exact word
    await h.audioProcessingPage.selectSongOption(false);
    await h.audioProcessingPage.selectPremiumOption(false);
    await h.audioProcessingPage.fillCensorWord(TestData.censorWords.default);

    // Process and wait for /audio response
    await h.audioProcessingPage.clickProcessAndWaitForDownload();

    // Verify censored words
    await h.audioProcessingPage.openCensoredWordsTab();
    // Case-insensitive checks for 'Fuck'/'fuck' alongside timestamps
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:05');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:06');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:10');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:18');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:21');

    // Verify first processing does not include broader variants
    await h.audioProcessingPage.expectNoneInResultsTable([
      'fucking',
      'fuckers',
      'fucked',
      'twats',
      'twat',
    ]);

    const initialCredits = await h.authPage.getCreditsAmount();

    // Reprocess with approx words
    await h.audioProcessingPage.fillApproxWord('fuck twats');
    await h.audioProcessingPage.clickReprocessAndWaitForDownload();

    await h.audioProcessingPage.openCensoredWordsTab();
    // Mixed case-insensitive checks for words and exact timestamp checks
    await h.audioProcessingPage.expectAnyInResultsTableCI([
      'twats',
      'Twats',
      'twat',
      'Twat',
    ]);
    await h.audioProcessingPage.expectInResultsTable('00:00:02');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:05');
    await h.audioProcessingPage.expectInResultsTable('fuckers');
    await h.audioProcessingPage.expectInResultsTable('00:00:05');
    await h.audioProcessingPage.expectInResultsTable('fucking');
    await h.audioProcessingPage.expectInResultsTable('00:00:07');
    await h.audioProcessingPage.expectInResultsTable('fucking');
    await h.audioProcessingPage.expectInResultsTable('00:00:09');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:10');
    await h.audioProcessingPage.expectInResultsTable('fucking');
    await h.audioProcessingPage.expectInResultsTable('00:00:11');
    await h.audioProcessingPage.expectAnyInResultsTableCI([
      'twats',
      'Twats',
      'twat',
      'Twat',
    ]);
    await h.audioProcessingPage.expectInResultsTable('00:00:11');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:18');
    await h.audioProcessingPage.expectInResultsTable('fucking');
    await h.audioProcessingPage.expectInResultsTable('00:00:19');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:21');
    await h.audioProcessingPage.expectInResultsTable('fucking');
    await h.audioProcessingPage.expectInResultsTable('00:00:23');
    await h.audioProcessingPage.expectAnyInResultsTableCI(['fuck', 'Fuck']);
    await h.audioProcessingPage.expectInResultsTable('00:00:26');
    await h.audioProcessingPage.expectInResultsTable('fucking');
    await h.audioProcessingPage.expectInResultsTable('00:00:28');

    const finalCredits = await h.authPage.getCreditsAmount();
    expect(finalCredits).toBe(initialCredits);
  });
});
