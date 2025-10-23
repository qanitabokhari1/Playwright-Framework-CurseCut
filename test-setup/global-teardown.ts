import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  // Add any global cleanup logic here
  // For example: cleaning up test data, resetting database state, etc.
}

export default globalTeardown;
