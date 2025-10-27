import { test, expect } from '@playwright/test';


// test.describe('ElevenLabs SYNC processing - 30sec file - credits and censoring', () => {

// test('30sec file - credits and censoring - elevenlabs sync', async ({ page }) => {
//   // Mock the /audio endpoint to start a job (do not change status mock)
//   await page.route('**/audio', async route => {
//     await route.fulfill({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify({
//         message: 'Job started',
//         task_id: '6d22cbfc-60e5-4475-9ca3-3f71772ee2f9',
//         estimated_time: 9.768,
//         model: 'elevenlabs',
//         is_song: true,
//         is_premium: false,
//         using_premium_processing: true,
//       }),
//     });
//   });

//   // Mock the /audio endpoint to return a succeeded transcription with words
//   await page.route(
//     '**/status/6d22cbfc-60e5-4475-9ca3-3f71772ee2f9',
//     async route => {
//       await route.fulfill({
//         status: 200,
//         contentType: 'application/json',
//         body: JSON.stringify({
//             status: 'succeeded',
//             transcription: [
//               {
//                 word: 'Oh',
//                 start: 0.179,
//                 end: 0.379,
//               },
//               {
//                 word: 'my',
//                 start: 0.439,
//                 end: 0.6,
//               },
//               {
//                 word: 'lord',
//                 start: 0.68,
//                 end: 1.079,
//               },
//               {
//                 word: 'Arent',
//                 start: 1.799,
//                 end: 2.039,
//               },
//               {
//                 word: 'you',
//                 start: 2.059,
//                 end: 2.159,
//               },
//               {
//                 word: 'twats',
//                 start: 2.239,
//                 end: 2.62,
//               },
//               {
//                 word: 'lucky',
//                 start: 2.679,
//                 end: 2.919,
//               },
//               {
//                 word: 'that',
//                 start: 2.939,
//                 end: 3.059,
//               },
//               {
//                 word: 'I',
//                 start: 3.079,
//                 end: 3.179,
//               },
//               {
//                 word: 'showed',
//                 start: 3.279,
//                 end: 3.559,
//               },
//               {
//                 word: 'up',
//                 start: 3.619,
//                 end: 3.799,
//               },
//               {
//                 word: 'eh',
//                 start: 3.819,
//                 end: 4.139,
//               },
//               {
//                 word: 'Pardon',
//                 start: 4.199,
//                 end: 4.48,
//               },
//               {
//                 word: 'my',
//                 start: 4.519,
//                 end: 4.699,
//               },
//               {
//                 word: 'French',
//                 start: 4.739,
//                 end: 5.059,
//               },
//               {
//                 word: 'Fuck',
//                 start: 5.099,
//                 end: 5.319,
//               },
//               {
//                 word: 'those',
//                 start: 5.339,
//                 end: 5.559,
//               },
//               {
//                 word: 'fuckers',
//                 start: 5.619,
//                 end: 6.079,
//               },
//               {
//                 word: 'You',
//                 start: 6.139,
//                 end: 6.219,
//               },
//               {
//                 word: 'should',
//                 start: 6.219,
//                 end: 6.379,
//               },
//               {
//                 word: 'fuck',
//                 start: 6.46,
//                 end: 6.639,
//               },
//               {
//                 word: 'off',
//                 start: 6.679,
//                 end: 6.859,
//               },
//               {
//                 word: 'Hughie',
//                 start: 6.879,
//                 end: 7.179,
//               },
//               {
//                 word: 'Fucking',
//                 start: 7.379,
//                 end: 7.679,
//               },
//               {
//                 word: 'diabolical',
//                 start: 7.739,
//                 end: 8.599,
//               },
//               {
//                 word: 'We',
//                 start: 8.64,
//                 end: 8.719,
//               },
//               {
//                 word: 'dont',
//                 start: 8.72,
//                 end: 8.84,
//               },
//               {
//                 word: 'want',
//                 start: 8.859,
//                 end: 8.98,
//               },
//               {
//                 word: 'your',
//                 start: 9.02,
//                 end: 9.159,
//               },
//               {
//                 word: 'fucking',
//                 start: 9.22,
//                 end: 9.5,
//               },
//               {
//                 word: 'money',
//                 start: 9.579,
//                 end: 9.9,
//               },
//               {
//                 word: 'With',
//                 start: 9.94,
//                 end: 10.059,
//               },
//               {
//                 word: 'a',
//                 start: 10.1,
//                 end: 10.119,
//               },
//               {
//                 word: 'simple',
//                 start: 10.18,
//                 end: 10.5,
//               },
//               {
//                 word: 'fuck',
//                 start: 10.579,
//                 end: 10.779,
//               },
//               {
//                 word: 'you',
//                 start: 10.859,
//                 end: 10.94,
//               },
//               {
//                 word: 'would',
//                 start: 10.96,
//                 end: 11.099,
//               },
//               {
//                 word: 'suffice',
//                 start: 11.119,
//                 end: 11.659,
//               },
//               {
//                 word: 'Fucking',
//                 start: 11.699,
//                 end: 11.94,
//               },
//               {
//                 word: 'twats',
//                 start: 11.98,
//                 end: 12.5,
//               },
//               {
//                 word: 'That',
//                 start: 12.519,
//                 end: 12.619,
//               },
//               {
//                 word: 'is',
//                 start: 12.659,
//                 end: 12.739,
//               },
//               {
//                 word: 'a',
//                 start: 12.759,
//                 end: 12.859,
//               },
//               {
//                 word: 'cunt',
//                 start: 12.899,
//                 end: 13.139,
//               },
//               {
//                 word: 'move',
//                 start: 13.18,
//                 end: 13.36,
//               },
//               {
//                 word: 'Youre',
//                 start: 13.4,
//                 end: 13.48,
//               },
//               {
//                 word: 'the',
//                 start: 13.48,
//                 end: 13.56,
//               },
//               {
//                 word: 'most',
//                 start: 13.56,
//                 end: 13.72,
//               },
//               {
//                 word: 'wanted',
//                 start: 13.76,
//                 end: 14.02,
//               },
//               {
//                 word: 'cunts',
//                 start: 14.079,
//                 end: 14.319,
//               },
//               {
//                 word: 'in',
//                 start: 14.34,
//                 end: 14.42,
//               },
//               {
//                 word: 'the',
//                 start: 14.42,
//                 end: 14.519,
//               },
//               {
//                 word: 'country',
//                 start: 14.56,
//                 end: 15.0,
//               },
//               {
//                 word: 'Can',
//                 start: 15.0,
//                 end: 15.079,
//               },
//               {
//                 word: 'we',
//                 start: 15.079,
//                 end: 15.159,
//               },
//               {
//                 word: 'just',
//                 start: 15.22,
//                 end: 15.359,
//               },
//               {
//                 word: 'skip',
//                 start: 15.399,
//                 end: 15.599,
//               },
//               {
//                 word: 'to',
//                 start: 15.619,
//                 end: 15.739,
//               },
//               {
//                 word: 'the',
//                 start: 15.759,
//                 end: 15.899,
//               },
//               {
//                 word: 'part',
//                 start: 15.94,
//                 end: 16.158,
//               },
//               {
//                 word: 'where',
//                 start: 16.219,
//                 end: 16.34,
//               },
//               {
//                 word: 'you',
//                 start: 16.36,
//                 end: 16.459,
//               },
//               {
//                 word: 'laser',
//                 start: 16.5,
//                 end: 16.76,
//               },
//               {
//                 word: 'my',
//                 start: 16.799,
//                 end: 16.959,
//               },
//               {
//                 word: 'fucking',
//                 start: 17.0,
//                 end: 17.279,
//               },
//               {
//                 word: 'brains',
//                 start: 17.319,
//                 end: 17.579,
//               },
//               {
//                 word: 'out',
//                 start: 17.659,
//                 end: 17.879,
//               },
//               {
//                 word: 'Oh',
//                 start: 18.02,
//                 end: 18.219,
//               },
//               {
//                 word: 'fuck',
//                 start: 18.279,
//                 end: 18.5,
//               },
//               {
//                 word: 'me',
//                 start: 18.559,
//                 end: 18.7,
//               }
//             ],
//             file_url: null,
//             processing_type: 'browser',
//             words_to_censor: null,
//           }),
//       });
//     }
//   );

//   // --- Step 3: Navigate to the app ---
//   await page.goto('https://frontend-dev-39a5.up.railway.app/');

//   // --- Step 4: Perform login ---
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await page
//     .getByRole('textbox', { name: 'Email address' })
//     .fill('justsoharsh@gmail.com');
//   await page.getByRole('textbox', { name: 'Your Password' }).fill('greenday7');
//   await page.getByRole('button', { name: 'Sign in', exact: true }).click();

//   // --- Step 5: Verify credit balance ---
//   await expect(page.getByTestId('login-button')).toBeHidden();

//   // Start flow
//   await page
//     .locator('div')
//     .filter({ hasText: /^🪄Start now for free!$/ })
//     .locator('div')
//     .click();

//   // Upload test file
//   await page.setInputFiles(
//     '[data-testid="upload-input"]',
//     'fixtures/audio/short30Sec_cleaned.mp3'
//   );

//   // Select Song = Yes
//   await page.getByTestId('song-yes').click();
//   await page.getByTestId('premium-no').click();

//   // Enter exact match censor word using provided locator
//   await page.locator('textarea[placeholder*="only remove"]').click();
//   await page.locator('textarea[placeholder*="only remove"]').fill('fuck');
  
//   // Process the file
//   const audioResponsePromise = page.waitForResponse(
//     res => res.url().includes('/audio') && res.ok()
//   );
//   await page.getByTestId('process-button').click();
//   await audioResponsePromise;

//   // Validate Censored Words tab shows the censored word with correct timestamp
//   await page.getByRole('tab', { name: 'Censored Words' }).click();
//   await expect(page.locator('table')).toContainText('Fuck');
//   await expect(page.locator('table')).toContainText('00:00:05');
//   // await expect(page.locator('table')).toContainText('fuckers');
//   // await expect(page.locator('table')).toContainText('00:00:05');
//   await expect(page.locator('table')).toContainText('fuck');
//   await expect(page.locator('table')).toContainText('00:00:06');
//   // await expect(page.locator('table')).toContainText('Fucking');
//   // await expect(page.locator('table')).toContainText('00:00:07');
//   // await expect(page.locator('table')).toContainText('fucking');
//   // await expect(page.locator('table')).toContainText('00:00:09');
// });
// });



