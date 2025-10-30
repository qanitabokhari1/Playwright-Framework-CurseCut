
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

  // Wait for the FINAL upload-chunk response that has is_complete: true
  const uploadResponse = await page.waitForResponse(
    async (res) => {
      if (res.url().includes('/upload-chunk') && res.ok()) {
        const data = await res.json();
        
        // Check if this is the final chunk with task_id and is_complete: true
        if (data.task_id && data.is_complete === true) {
          return true;
        }
        
        return false;
      }
      return false;
    },
    { timeout: 600000 }
  );

  const uploadData = await uploadResponse.json();

  const taskId = uploadData.task_id;
  if (!taskId) throw new Error('❌ No task_id found in final upload-chunk response.');

  // Check if upload-chunk already contains the final result (for sync responses)
  if (uploadData.status === 'succeeded' && uploadData.transcription) {
    return uploadData;
  }


  // Wait for the BROWSER's status polling to complete (not making our own requests)
  // The frontend app will poll the status endpoint, we just wait for the successful response
  const statusResponse = await page.waitForResponse(
    res => res.url().includes(`/status/${taskId}`) && res.ok(),
    { timeout: 600000 } // Total timeout based on max attempts
  );

  const statusData = await statusResponse.json();

  // If the first response isn't succeeded yet, keep waiting for more status responses
  if (statusData.status === 'succeeded') {
    return statusData;
  }

  // Keep waiting for status responses until we get succeeded
  
  const finalResponse = await page.waitForResponse(
    async (res) => {
      if (res.url().includes(`/status/${taskId}`) && res.ok()) {
        const data = await res.json();
        return data.status === 'succeeded';
      }
      return false;
    },
    { timeout: 600000 } // Remaining timeout
  );

  const finalData = await finalResponse.json();
  return finalData;
}

