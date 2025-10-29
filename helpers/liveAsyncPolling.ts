
import { Page } from '@playwright/test';
/**
 * Waits for /upload-chunk API to complete (is_complete: true), extracts task_id,
 * and polls /status/{task_id} until succeeded.
 *
 * @param {Page} page - Playwright Page instance
 * @param {string} baseUrl - e.g., 'https://backend-dev-692f.up.railway.app'
 * @param {number} interval - Poll interval in ms (default 3000)
 * @param {number} maxAttempts - Max attempts before timeout (default 60)
 * @returns {Promise<object>} The final successful response JSON
 */

export async function handleUploadAndPollStatus(page: Page, baseUrl: string, interval = 3000, maxAttempts = 60) {
  console.log('📡 Waiting for /upload-chunk API calls to complete...');

  // Wait for the FINAL upload-chunk response that has is_complete: true
  const uploadResponse = await page.waitForResponse(
    async (res) => {
      if (res.url().includes('/upload-chunk') && res.ok()) {
        const data = await res.json();
        console.log('📦 Upload-chunk response:', JSON.stringify(data, null, 2));
        
        // Check if this is the final chunk with task_id and is_complete: true
        if (data.task_id && data.is_complete === true) {
          console.log('✅ Final upload-chunk received with task_id:', data.task_id);
          return true;
        }
        
        console.log('⏳ Chunk uploaded, waiting for more chunks...');
        return false;
      }
      return false;
    },
    { timeout: 600000 }
  );

  const uploadData = await uploadResponse.json();
  console.log('✅ All chunks uploaded successfully!');

  const taskId = uploadData.task_id;
  if (!taskId) throw new Error('❌ No task_id found in final upload-chunk response.');

  // Check if upload-chunk already contains the final result (for sync responses)
  if (uploadData.status === 'succeeded' && uploadData.transcription) {
    console.log('✅ Upload-chunk already contains succeeded status with transcription!');
    return uploadData;
  }

  console.log(`🔁 Waiting for browser to poll /status/${taskId} until succeeded...`);

  // Wait for the BROWSER's status polling to complete (not making our own requests)
  // The frontend app will poll the status endpoint, we just wait for the successful response
  const statusResponse = await page.waitForResponse(
    res => res.url().includes(`/status/${taskId}`) && res.ok(),
    { timeout: 600000 } // Total timeout based on max attempts
  );

  const statusData = await statusResponse.json();
  console.log('📨 Initial status response:', JSON.stringify(statusData, null, 2));

  // If the first response isn't succeeded yet, keep waiting for more status responses
  if (statusData.status === 'succeeded') {
    console.log('✅ Task succeeded on first check!');
    return statusData;
  }

  // Keep waiting for status responses until we get succeeded
  console.log(`🔄 Status is "${statusData.status}", waiting for "succeeded"...`);
  
  const finalResponse = await page.waitForResponse(
    async (res) => {
      if (res.url().includes(`/status/${taskId}`) && res.ok()) {
        const data = await res.json();
        console.log('📨 Polling status response:', data.status);
        return data.status === 'succeeded';
      }
      return false;
    },
    { timeout: 600000 } // Remaining timeout
  );

  const finalData = await finalResponse.json();
  console.log('✅ Task succeeded!');
  return finalData;
}

