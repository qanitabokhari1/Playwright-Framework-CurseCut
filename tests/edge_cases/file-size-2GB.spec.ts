import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../helpers/testHelpers';

test.describe('testUser1', () => {
  test('Oversized file shows error and blocks processing', async ({ page }) => {
    const helpers = new TestHelpers(page);

    // Login as test user
    await helpers.setupTestUser1();

    const audioPage = helpers.audioProcessingPage;

    // Capture initial credits
    const initialCredits = await audioPage.getCreditsAmount();

    // Start flow and make other fields valid so file size is the only blocker
    await audioPage.clickStartNow();

    // Patch Blob.prototype.size to simulate >2GB only for a specific filename
    await page.evaluate(() => {
      const orig = Object.getOwnPropertyDescriptor(Blob.prototype, 'size');
      if (!orig || !orig.get) return;
      const originalGetter = orig.get;
      try {
        Object.defineProperty(Blob.prototype, 'size', {
          get: function (this: Blob & { name?: string }) {
            if (
              this &&
              typeof this.name === 'string' &&
              this.name === 'large-file.mp3'
            ) {
              // 2GB + 1 byte
              return 2 * 1024 * 1024 * 1024 + 1;
            }
            return originalGetter.call(this);
          },
          configurable: true,
        });
      } catch {
        // If redefining fails, continue; the test will simply skip the oversize path
      }
    });

    // Upload a small payload but with the filename we target in the patch
    const oversizedPayload = {
      name: 'large-file.mp3',
      mimeType: 'audio/mpeg',
      buffer: Buffer.from('dummy audio data'),
    };
    await audioPage.uploadAudioFile(oversizedPayload);

    // Verify the size error toast is shown
    await audioPage.expectFileTooLargeErrorVisible();

    // Verify user cannot proceed
    await audioPage.verifyProcessButtonDisabled();

    // Verify no credits deducted
    const finalCredits = await audioPage.getCreditsAmount();
    expect(finalCredits).toBe(initialCredits);
  });
});
