// Processing variant types
export type ProcessingVariant =
  | 'deepgram'
  | 'elevenlabs-sync'
  | 'elevenlabs-async';

// Test data types
export interface ProcessingConfig {
  isSong: boolean;
  isPremium: boolean;
  name: string;
}

// Processing status types
export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'failed';

// Processing options
export interface ProcessingOptions {
  variant: ProcessingVariant;
  censorWord: string;
  replacementType: 'silence' | 'beep' | 'custom';
}
