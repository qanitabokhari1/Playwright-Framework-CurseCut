import { Locator } from '@playwright/test';

// Page object method return types
export type PageLocator = Locator;

// Element interaction types
export interface ElementInteraction {
  action: 'click' | 'fill' | 'select' | 'hover' | 'wait';
  locator: PageLocator;
  value?: string;
  timeout?: number;
}

// Wait conditions
export interface WaitCondition {
  condition:
    | 'visible'
    | 'hidden'
    | 'enabled'
    | 'disabled'
    | 'attached'
    | 'detached';
  locator: PageLocator;
  timeout?: number;
}

// Test step result
export interface TestStepResult {
  success: boolean;
  message?: string;
  screenshot?: string;
  error?: Error;
}
