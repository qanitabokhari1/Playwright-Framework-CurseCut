import { Page } from '@playwright/test';

export class ApiMocks {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // /**
  //  * Mock Supabase authentication API
  //  * COMMENTED OUT - Using actual backend API
  //  */
  // async mockSupabaseLogin(): Promise<void> {
  //   await this.page.route(
  //     '**/auth/v1/token?grant_type=password**',
  //     async route => {
  //       await route.fulfill({
  //         status: 200,
  //         contentType: 'application/json',
  //         body: JSON.stringify(TestData.apiResponses.login),
  //       });
  //     }
  //   );
  // }

  /**
   * Mock credits API with specified credit amount
   */
  async mockCreditsAPI(credits: number): Promise<void> {
    await this.page.route('**/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits }),
      });
    });
  }

  // /**
  //  * Mock processing API endpoints
  //  * COMMENTED OUT - Using actual backend API
  //  */
  // async mockProcessingAPI(
  //   variant: 'deepgram' | 'elevenlabs-sync' | 'elevenlabs-async'
  // ): Promise<void> {
  //   const endpoints = this.getProcessingEndpoints(variant);
  //
  //   for (const endpoint of endpoints) {
  //     await this.page.route(`**/${endpoint}**`, async route => {
  //       await route.fulfill({
  //         status: 200,
  //         contentType: 'application/json',
  //         body: JSON.stringify({
  //           success: true,
  //           message: `${variant} processing completed`,
  //           jobId: `mock-job-${Date.now()}`,
  //         }),
  //       });
  //     });
  //   }
  // }

  /**
   * Mock credits API only (authentication uses actual backend)
   */
  async mockAuthenticationFlow(credits: number): Promise<void> {
    await this.mockCreditsAPI(credits);
  }

  // /**
  //  * Get processing endpoints based on variant
  //  * COMMENTED OUT - Using actual backend API
  //  */
  // private getProcessingEndpoints(variant: string): string[] {
  //   const endpointMap: Record<string, string[]> = {
  //     deepgram: ['api/deepgram/process'],
  //     'elevenlabs-sync': ['api/elevenlabs/sync/process'],
  //     'elevenlabs-async': ['api/elevenlabs/async/process'],
  //   };
  //
  //   return endpointMap[variant] || [];
  // }

  // /**
  //  * Mock error responses for testing error scenarios
  //  * COMMENTED OUT - Using actual backend API
  //  */
  // async mockErrorResponse(
  //   endpoint: string,
  //   status: number = 500,
  //   message: string = 'Internal Server Error'
  // ): Promise<void> {
  //   await this.page.route(`**/${endpoint}**`, async route => {
  //     await route.fulfill({
  //       status,
  //       contentType: 'application/json',
  //       body: JSON.stringify({
  //         error: true,
  //         message,
  //         status,
  //       }),
  //     });
  //   });
  // }

  /**
   * Mock /audio job start and /status success response with fixed transcript
   */
  async mockCensoringSuccess(
    variant: 'deepgram' | 'elevenlabs-sync' | 'elevenlabs-async',
    taskId: string = '6d22cbfc-60e5-4475-9ca3-3f71772ee2f9'
  ): Promise<void> {
    const modelInfo = {
      deepgram: {
        model: 'deepgram',
        is_song: false,
        is_premium: false,
        using_premium_processing: false,
      },
      'elevenlabs-sync': {
        model: 'elevenlabs',
        is_song: true,
        is_premium: false,
        using_premium_processing: true,
      },
      'elevenlabs-async': {
        model: 'elevenlabs',
        is_song: false,
        is_premium: true,
        using_premium_processing: true,
      },
    }[variant];

    await this.page.route('**/audio', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Job started',
          task_id: taskId,
          estimated_time: 9.768,
          ...modelInfo,
        }),
      });
    });

    await this.page.route(`**/status/**`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'succeeded',
          transcription: [
            { word: 'Stupid', start: 0.019, end: 0.299 },
            { word: 'white', start: 0.36, end: 0.519 },
            { word: 'privileged', start: 0.639, end: 1.059 },
            { word: 'fuck', start: 1.339, end: 1.619 },
            { word: 'up', start: 1.759, end: 2.799 },
          ],
          file_url: null,
          processing_type: 'browser',
          words_to_censor: null,
        }),
      });
    });
  }

  async mockUploadChunkAPI() {
    await this.page.route('**/upload-chunk', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          task_id: 'eb760ef4-f734-4068-9d19-861a8e71f7e5',
          estimated_time: 401.1022041,
          upload_id: '1760998827958qln1ob0cc',
          message: 'File successfully uploaded and processing started',
          is_complete: true,
        }),
      });
    });
  }

  /**
   * Mock /audio job start and /status success response with a transcription
   * that does NOT include the explicit censored word 'fuck' (used for "no words found" tests)
   */
  async mockNoFuckWord(
    variant: 'deepgram' | 'elevenlabs-sync' | 'elevenlabs-async',
    taskId: string = '6d22cbfc-60e5-4475-9ca3-3f71772ee2f9'
  ): Promise<void> {
    const modelInfo = {
      deepgram: {
        model: 'deepgram',
        is_song: false,
        is_premium: false,
        using_premium_processing: false,
      },
      'elevenlabs-sync': {
        model: 'elevenlabs',
        is_song: true,
        is_premium: false,
        using_premium_processing: true,
      },
      'elevenlabs-async': {
        model: 'elevenlabs',
        is_song: false,
        is_premium: true,
        using_premium_processing: true,
      },
    }[variant];

    // Mock the /audio start job response
    await this.page.route('**/audio', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Job started',
          task_id: taskId,
          estimated_time: 9.768,
          ...modelInfo,
        }),
      });
    });

    // Mock the /status endpoint to return a succeeded transcription that
    // intentionally does NOT include the full word 'fuck' (so no censored words)
    await this.page.route(`**/status/**`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'succeeded',
          transcription: [
            { word: 'Stupid', start: 0.019, end: 0.299 },
            { word: 'white', start: 0.36, end: 0.519 },
            { word: 'privileged', start: 0.639, end: 1.059 },
            { word: 'f', start: 1.339, end: 1.619 },
            { word: 'up', start: 1.759, end: 2.799 },
          ],
          file_url: null,
          processing_type: 'browser',
          words_to_censor: null,
        }),
      });
    });
  }

  // async mockCostAPI(cost: number): Promise<void> {
  //   // COMMENTED OUT - Using actual backend API
  //   await this.page.route('**/cost', async route => {
  //     await route.fulfill({
  //       status: 200,
  //       contentType: 'application/json',
  //       body: JSON.stringify({ cost }),
  //     });
  //   });
  // }

  // async mockSubscriptionAPI(): Promise<void> {
  //   // COMMENTED OUT - Using actual backend API
  //   await this.page.route('**/subscription', async route => {
  //     await route.fulfill({
  //       status: 200,
  //       contentType: 'application/json',
  //       body: JSON.stringify({ subscription: 'null' }),
  //     });
  //   });
  // }
}
