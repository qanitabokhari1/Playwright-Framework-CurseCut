import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup(_config: FullConfig) {
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  // Verify test environment is ready
  await page.goto(BASE_URL);

  await browser.close();
}

export default globalSetup;
