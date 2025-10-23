// Test configuration types
export interface TestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Test environment configuration
export interface TestEnvironment {
  isCI: boolean;
  isHeadless: boolean;
  browser: string;
  viewport: {
    width: number;
    height: number;
  };
}
