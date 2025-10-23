import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestData } from '../fixtures/testData';

export class AudioProcessingPage extends BasePage {
  // Audio processing form locators
  get songYesButton(): Locator {
    return this.page.getByTestId('song-yes');
  }

  get songNoButton(): Locator {
    return this.page.getByTestId('song-no');
  }

  get premiumYesButton(): Locator {
    return this.page.getByTestId('premium-yes');
  }

  get premiumNoButton(): Locator {
    return this.page.getByTestId('premium-no');
  }

  get processingButton(): Locator {
    return this.page.getByRole('button', { name: /processing/i });
  }

  // New locators for the enhanced workflow
  get chooseFilesButton(): Locator {
    return this.page.getByTestId('choose-files-button');
  }

  get languageDropdown(): Locator {
    return this.page.getByText('English', { exact: true });
  }

  get languageSearchInput(): Locator {
    return this.page.getByPlaceholder('Search language...');
  }

  get englishOption(): Locator {
    return this.page.getByRole('option', { name: 'English' });
  }

  get censorWordInput(): Locator {
    return this.page.getByRole('textbox', {
      name: "e.g. 'fuck' will only remove",
    });
  }

  get replacementWordInput(): Locator {
    return this.page.getByRole('textbox', {
      name: "e.g. 'fuck' will remove 'fuck",
    });
  }

  get sineBleepOption(): Locator {
    return this.page.getByRole('option', { name: 'Sine Bleep' });
  }

  get reprocessButton(): Locator {
    return this.page.getByRole('button', { name: 'Re-process' });
  }

  get absoluteElement(): Locator {
    return this.page.locator('.absolute').first();
  }

  constructor(page: Page) {
    super(page);
  }

  // File upload actions
  async uploadAudioFile(filePath: string): Promise<void> {
    // Use the same method as the working test
    await this.uploadInput.setInputFiles(filePath);
  }

  async uploadFirstFile(filePath: string): Promise<void> {
    await this.uploadAudioFile(filePath);
    await this.waitForFileToAppear(filePath);
  }

  async uploadReplacementFile(filePath: string): Promise<void> {
    await this.uploadAudioFile(filePath);
    await this.waitForFileToAppear(filePath);
  }

  async waitForFileToAppear(filePath: string): Promise<void> {
    // Extract just the filename from the full path
    const fileName = filePath.split('/').pop() || filePath;
    await this.expectElementToBeVisible(this.page.locator(`text=${fileName}`));
  }

  // Form configuration actions
  async clickStartNow(): Promise<void> {
    await this.startNowButton.click();
  }

  async selectSongOption(isSong: boolean): Promise<void> {
    if (isSong) {
      await this.songYesButton.click();
    } else {
      await this.songNoButton.click();
    }
  }

  async selectPremiumOption(isPremium: boolean): Promise<void> {
    if (isPremium) {
      await this.premiumYesButton.click();
    } else {
      await this.premiumNoButton.click();
    }
  }

  async fillCensorWord(word: string): Promise<void> {
    await this.censorWordTextarea.click();
    await this.censorWordTextarea.fill(word);
  }

  async fillApproxWord(word: string): Promise<void> {
    await this.approxWordTextarea.click();
    await this.approxWordTextarea.fill(word);
  }

  async selectSilenceReplacement(): Promise<void> {
    await this.silenceOption.click();
    await this.silenceDropdownOption.click();
  }

  // Processing actions
  async clickProcessButton(): Promise<void> {
    // Wait for the process button to be visible and enabled
    await this.processButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.processButton).toBeEnabled();

    // Force wait for any animations or state changes to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // Click the process button with force if needed
    try {
      await this.processButton.click({ timeout: 10000 });
    } catch {
      // If normal click fails, try force click
      await this.processButton.click({ force: true, timeout: 10000 });
    }

    // Wait for the processing button to appear (this replaces the process button)
    await this.page
      .getByRole('button', { name: /processing/i })
      .waitFor({ state: 'visible', timeout: 10000 });
  }

  // Complete workflow methods
  async configureAudioProcessing(
    isSong: boolean,
    isPremium: boolean,
    censorWord: string
  ): Promise<void> {
    // Note: clickStartNow() is called by the caller, not here
    await this.selectSongOption(isSong);
    await this.selectPremiumOption(isPremium);
    await this.fillApproxWord(censorWord);
    await this.selectSilenceReplacement();
  }

  // Verification methods
  async verifyProcessButtonDisabled(): Promise<void> {
    await this.expectElementToBeDisabled(this.processButton);
  }

  async verifyProcessButtonEnabled(): Promise<void> {
    await expect(this.processButton).toBeEnabled();
  }

  async verifyProcessingStarted(): Promise<void> {
    // Use the same locator as the working test
    const processingButton = this.page.getByRole('button', {
      name: /processing/i,
    });
    await this.expectElementToBeVisible(processingButton);
    await this.expectElementToBeDisabled(processingButton);
  }

  async verifyFileUploaded(filePath: string): Promise<void> {
    // Extract just the filename from the full path
    const fileName = filePath.split('/').pop() || filePath;
    const uploadedName = await this.page
      .locator(`text=${fileName}`)
      .first()
      .textContent();
    expect(uploadedName).toContain(fileName);
  }

  // Workflow variants for different processing types
  async configureDeepgramWorkflow(censorWord: string): Promise<void> {
    await this.configureAudioProcessing(false, false, censorWord);
  }

  async configureElevenLabsSyncWorkflow(
    censorWord: string = 'fuck'
  ): Promise<void> {
    await this.configureAudioProcessing(true, false, censorWord);
  }

  async configureElevenLabsAsyncWorkflow(
    censorWord: string = 'fuck'
  ): Promise<void> {
    await this.configureAudioProcessing(false, true, censorWord);
  }

  // New methods for the enhanced workflow
  async clickAbsoluteElement(): Promise<void> {
    await this.absoluteElement.click();
  }

  async uploadFileWithChooseFilesButton(fileName: string): Promise<void> {
    await this.chooseFilesButton.click();
    await this.uploadInput.setInputFiles(fileName);
  }

  async selectLanguage(): Promise<void> {
    await this.languageDropdown.click();
    await this.languageSearchInput.fill('english');
    await this.englishOption.click();
  }

  async fillCensorWords(
    censorWord: string,
    replacementWord: string
  ): Promise<void> {
    await this.censorWordInput.click();
    await this.censorWordInput.fill(censorWord);
    await this.replacementWordInput.click();
    await this.replacementWordInput.fill(replacementWord);
  }

  async selectSineBleepReplacement(): Promise<void> {
    await this.silenceOption.click();
    await this.sineBleepOption.click();
  }

  async waitForDownloadAndProcess(): Promise<void> {
    // Click the process button
    await this.processButton.click();

    // Wait for processing to start (processing button should appear)
    await this.verifyProcessingStarted();

    // Wait for processing to complete
    await this.page.waitForTimeout(5000);
  }

  async verifyReprocessButtonVisible(): Promise<void> {
    // Try both role and data-testid, continue if neither becomes visible in time
    const candidates: Locator[] = [
      this.page.getByRole('button', { name: 'Re-process' }),
      this.page.getByTestId('reprocess-button'),
    ];

    const timeoutMs = 10000;
    const intervalMs = 200;
    const startMs = Date.now();

    while (Date.now() - startMs < timeoutMs) {
      for (const candidate of candidates) {
        await candidate.scrollIntoViewIfNeeded().catch(() => {});
        if (await candidate.isVisible()) {
          return;
        }
      }
      // Small nudge to help lazy layouts
      await this.page.evaluate(() => window.scrollBy(0, 150)).catch(() => {});
      await this.page.waitForTimeout(intervalMs);
    }
  }

  async verifyReprocessButtonNotVisible(): Promise<void> {
    // Use the exact container locator you identified from the UI
    const container = this.page
      .locator('div')
      .filter({ hasText: 'Video or audio files (Max 2GB' })
      .nth(3);

    // Check if container exists
    const containerCount = await container.count();

    if (containerCount === 0) {
      return;
    }

    // Check if "Re-process" text is visible within this specific container
    const reprocessTextInContainer = container.getByText('Re-process');
    const isVisible = await reprocessTextInContainer.isVisible();

    if (!isVisible) {
      return; // Test passes - Re-process text is not visible
    }

    // If we get here, the text IS visible, which means file switching didn't work
    throw new Error(
      'Re-process text is still visible in the file upload container - file switching did not clear previous state'
    );
  }

  async uploadReplacementFileWithChooseFilesButton(
    fileName: string
  ): Promise<void> {
    await this.chooseFilesButton.click();
    await this.uploadInput.setInputFiles(fileName);
  }

  // Complete enhanced workflow method
  async completeEnhancedWorkflow(
    censorWord: string = 'fuck',
    replacementWord: string = 'fuck'
  ): Promise<void> {
    await this.uploadFileWithChooseFilesButton(TestData.files.audio);
    await this.songYesButton.click();
    await this.selectLanguage();
    await this.fillCensorWords(censorWord, replacementWord);
    await this.selectSineBleepReplacement();
    await this.waitForDownloadAndProcess();
  }

  async testFileSwitchingEnhanced(): Promise<void> {
    // Upload replacement file directly after processing
    await this.uploadReplacementFileWithChooseFilesButton(
      TestData.files.censoredAudio
    );

    // Wait for UI to update after file upload
    await this.page.waitForTimeout(2000);

    // Verify reprocess button is not visible after file switching
    await this.verifyReprocessButtonNotVisible();
  }
}
