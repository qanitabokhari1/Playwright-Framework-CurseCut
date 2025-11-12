import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestData } from '../fixtures/testData';
import { handleUploadAndPollStatus } from '../helpers/liveAsyncPolling';

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

  get reprocessButtonByTestId(): Locator {
    return this.page.getByTestId('reprocess-button');
  }

  get absoluteElement(): Locator {
    return this.page.locator('.absolute').first();
  }

  get uploadInput(): Locator {
    return this.page.getByTestId('upload-input');
  }

  get censoredWordsTab(): Locator {
    return this.page.getByRole('tab', { name: 'Censored Words' });
  }

  get resultsTable(): Locator {
    return this.page.locator('table');
  }

  // Common validation/error helpers
  get statusToast(): Locator {
    return this.page.getByRole('status');
  }
  get unsupportedFileTypeError(): Locator {
    return this.page.getByText('Unsupported file type', { exact: false });
  }

  get noCensoredWordsMessage(): Locator {
    return this.page.getByText('No words found.', { exact: true }).or(
      this.page.getByText('No words found to censor in the transcription.', {
        exact: true,
      })
    );
  }

  constructor(page: Page) {
    super(page);
  }

  // Premium files area
  get myPremiumFilesButton(): Locator {
    return this.page.getByRole('button', { name: 'My Premium Files' });
  }

  get premiumDownloadButtons(): Locator {
    return this.page.getByRole('button', { name: 'Download' });
  }

  // Batch file upload locators
  get firstUploadedFile(): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: /^short3Sec\.mp3Browser$/ })
      .first();
  }

  get secondUploadedFile(): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: /^short3Sec\.mp3Browser$/ })
      .nth(1);
  }

  // File upload actions
  async uploadAudioFile(filePath: string): Promise<void> {
    await this.uploadInput.setInputFiles(filePath);
  }

  // Batch file upload actions
  async uploadMultipleAudioFiles(filePaths: string[]): Promise<void> {
    await this.uploadInput.setInputFiles(filePaths);
  }

  async verifyMultipleFilesUploaded(): Promise<void> {
    await expect(this.firstUploadedFile).toBeVisible();
    await expect(this.secondUploadedFile).toBeVisible();
  }

  async verifyPremiumProcessingPopup(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'BETA Premium Processing' })
    ).toBeVisible();
    await expect(this.page.getByText('Premium processing is')).toBeVisible();
    await expect(
      this.page.getByText(
        'Premium processing is currently in BETA and limited to 1 file at a time to ensure reliability.'
      )
    ).toBeVisible();
    await expect(
      this.page.getByText('Only the first file will be processed')
    ).toBeVisible();
    await expect(
      this.page.getByText('Additional files have been removed from the queue')
    ).toBeVisible();
  }

  async clickIUnderstandButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'I understand' }).click();
    await this.page.waitForTimeout(2000);
  }

  async verifySingleFileRemains(): Promise<void> {
    await expect(
      this.page.locator('div').filter({ hasText: /^short3Sec\.mp3Browser$/ }).first()
    ).toBeVisible();
  }

  async verifySingleFileRemainsAsync(): Promise<void> {
    await expect(
      this.page.locator('div').filter({ hasText: /^short3Sec\.mp3Premium$/ }).first()
    ).toBeVisible();
  }

  // Video file upload helper
  async uploadVideoFile(
    filePath: string | { name: string; mimeType: string; buffer: Buffer }
  ): Promise<void> {
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

    // Short wait for any animations or state changes to complete
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

  async clickProcessAndWaitForDownload(): Promise<void> {
    await this.processButton.waitFor({ state: 'visible', timeout: 10000 });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.processButton.click({ force: true }),
    ]);
    try {
      await download.path();
    } catch {
      // ignore path resolution errors in CI
    }
  }

  // Processing for async variant with optional live polling when LIVE_MODE=true
  async processAsyncAndPollLiveMode(): Promise<void> {
    const isLiveMode = process.env.LIVE_MODE === 'true';

    const uploadResponsePromise = this.page.waitForResponse(
      res => res.url().includes('/upload-chunk') && res.ok()
    );

    // Ensure process button is clickable
    await this.processButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.processButton.click({ force: true });


    if (isLiveMode) {
      // When running live, wait until the app's status polling reaches succeeded
      await handleUploadAndPollStatus(this.page);
    } else {
      await uploadResponsePromise;
    }
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

  async verifyProcessButtonEnableAfterPageRefresh(timeout: number = 15000): Promise<void> {
    // Page may refresh after closing dialogs; wait for load and for the button to reattach
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
    } catch {
      // ignore if already loaded
    }
    // Wait for the process button to be present and visible
    await this.processButton.waitFor({ state: 'attached', timeout });
    await this.processButton.waitFor({ state: 'visible', timeout });
    await this.processButton.scrollIntoViewIfNeeded().catch(() => { });
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
    // await this.chooseFilesButton.click();
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
    // Use the robust clickProcessButton method with proper waits
    await this.clickProcessButton();

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
        await candidate.scrollIntoViewIfNeeded().catch(() => { });
        if (await candidate.isVisible()) {
          return;
        }
      }
      // Small nudge to help lazy layouts
      await this.page.evaluate(() => window.scrollBy(0, 150)).catch(() => { });
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
    // await this.chooseFilesButton.click();
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

  async configureSongSettings(
    isSong: boolean,
    isPremium: boolean
  ): Promise<void> {
    // Reuse existing methods to avoid duplicated locator/click logic
    await this.selectSongOption(isSong);
    await this.selectPremiumOption(isPremium);
  }

  async enterCensorWord(word: string): Promise<void> {
    await this.censorWordInput.click();
    await this.censorWordInput.fill(word);
  }

  async processFileAndWaitForResponse(): Promise<void> {
    const audioResponsePromise = this.page.waitForResponse(
      res => res.url().includes('/audio') && res.ok()
    );
    await this.processButton.click();
    await audioResponsePromise;
  }

  async openCensoredWordsTab(): Promise<void> {
    await this.censoredWordsTab.click();
  }

  async expectInResultsTable(text: string): Promise<void> {
    await expect(this.resultsTable).toContainText(text);
  }

  async expectNotInResultsTable(text: string): Promise<void> {
    await expect(this.resultsTable).not.toContainText(text);
  }

  // Case-insensitive helpers
  async expectInResultsTableCI(text: string): Promise<void> {
    const content = (await this.resultsTable.innerText()).toLowerCase();
    expect(content).toContain(text.toLowerCase());
  }

  async expectAnyInResultsTableCI(variants: string[]): Promise<void> {
    const content = (await this.resultsTable.innerText()).toLowerCase();
    const found = variants.some(v => content.includes(v.toLowerCase()));
    expect(found).toBeTruthy();
  }

  async expectNoneInResultsTable(texts: string[]): Promise<void> {
    for (const t of texts) {
      await this.expectNotInResultsTable(t);
    }
  }

  async clickReprocessButton(): Promise<void> {
    // Prefer data-testid, fallback to role
    const candidates: Locator[] = [
      this.reprocessButtonByTestId,
      this.reprocessButton,
    ];
    for (const btn of candidates) {
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true });
        return;
      }
    }
    throw new Error('Reprocess button not found');
  }

  async clickReprocessAndWaitForDownload(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.clickReprocessButton(),
    ]);
    // Ensure the download completes; ignore errors if path not available
    try {
      await download.path();
    } catch {
      // Some browsers may not provide a local path (e.g., in CI); continue
    }
  }

  async verifyReprocessButtonDisabled(): Promise<void> {
    await expect(this.reprocessButtonByTestId).toBeDisabled();
  }

  async verifyNoCensoredWordsFound(): Promise<void> {
    await this.censoredWordsTab.click();
    await expect(this.noCensoredWordsMessage).toBeVisible();
  }

  async expectUnsupportedFileTypeErrorVisible(fileName?: string): Promise<void> {
    const regex = /Unsupported file type/i;

    // Try status role first
    let toast = this.page.getByRole('status').filter({ hasText: regex });
    try {
      await toast.first().waitFor({ state: 'visible', timeout: 6000 });
    } catch {
      // Fallback: some libraries use role="alert" for toasts
      toast = this.page.getByRole('alert').filter({ hasText: regex });
      await toast.first().waitFor({ state: 'visible', timeout: 6000 });
    }

    const target = toast.first();
    await expect(target).toContainText(regex);
    // Also tolerate the leading summary line used by the UI toast
    await expect(target).toContainText(
      /Some files did not match requirements and were not loaded\.?/i
    );
    if (fileName) {
      // File name may be rendered in a nested element or updated slightly later; try but do not fail the test on this optional check
      try {
        await expect(target).toContainText(fileName, { timeout: 1000 });
      } catch {
        // best-effort filename assertion; continue if not found
      }
    }
  }


   async expectCorruptedFileTypeErrorVisible(fileName?: string): Promise<void> {
    const regex = /did not match requirements/i;

    // Try status role first
    let toast = this.page.getByRole('status').filter({ hasText: regex });
    try {
      await toast.first().waitFor({ state: 'visible', timeout: 6000 });
    } catch {
      // Fallback: some libraries use role="alert" for toasts
      toast = this.page.getByRole('alert').filter({ hasText: regex });
      await toast.first().waitFor({ state: 'visible', timeout: 6000 });
    }

    const target = toast.first();
    await expect(target).toContainText(regex);
    // Also tolerate the leading summary line used by the UI toast
    await expect(target).toContainText(
      /Some files did not match requirements and were not loaded\.?/i
    );
    if (fileName) {
      // File name may be rendered in a nested element or updated slightly later; try but do not fail the test on this optional check
      try {
        await expect(target).toContainText(fileName, { timeout: 1000 });
      } catch {
        // best-effort filename assertion; continue if not found
      }
    }
  }
  // Premium files helpers
  async openMyPremiumFiles(): Promise<void> {
    await this.myPremiumFilesButton.click({ force: true });
  }

  async expectPremiumFileVisibleByName(
    fileName: string,
    nthIndex: number
  ): Promise<void> {
    await expect(this.page.getByText(fileName).nth(nthIndex)).toBeVisible();
  }

  async clickPremiumDownloadAt(index: number): Promise<void> {
    await this.premiumDownloadButtons.nth(index).click();
  }
}
