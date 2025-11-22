import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from the correct path
dotenv.config({ path: resolve(__dirname, '../.env') });

async function globalSetup(_config: FullConfig) {
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const isLocal = process.env.IS_LOCAL === 'true';
  const BASE_URL =
    (isLocal ? process.env.LOCAL_BASE_URL : process.env.BASE_URL) || '';
  // Verify test environment is ready
  await page.goto(BASE_URL);

  await browser.close();
}

export default globalSetup;
