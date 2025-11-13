import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const TestData = {
  // User credentials
  testUser1: {
    email: process.env.TEST_USER_1_EMAIL || '',
    password: process.env.TEST_USER_1_PASSWORD || '',
    id: 'test-user-1',
  },
  testUser2: {
    email: process.env.TEST_USER_2_EMAIL || '',
    password: process.env.TEST_USER_2_PASSWORD || '',
    id: 'test-user-2',
  },
  testUser3: {
    email: process.env.TEST_USER_3_EMAIL || '',
    password: process.env.TEST_USER_3_PASSWORD || '',
    id: 'test-user-3',
  },
  testUser4: {
    email: process.env.TEST_USER_4_EMAIL || '',
    password: process.env.TEST_USER_4_PASSWORD || '',
    id: 'test-user-4',
  },
  testUser5: {
    email: process.env.TEST_USER_5_EMAIL || '',
    password: process.env.TEST_USER_5_PASSWORD || '',
    id: 'test-user-5',
  },

  // Real user credentials for testing
  realUser: {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
    id: 'real-test-user',
  },

  // Credit scenarios
  credits: {
    zero: 0,
    sufficient: 100,
  },

  // File paths - using absolute paths for Playwright
  files: {
    audio: path.resolve(__dirname, 'audio/short3Sec.mp3'),
    audio30Sec: path.resolve(__dirname, 'audio/short30Sec.mp3'),
    censoredAudio: path.resolve(__dirname, 'audio/censored_audio.mp3'),
    audio46Min: path.resolve(__dirname, 'audio/46MinuteLong.mp3'),
    audio31Min: path.resolve(__dirname, 'audio/31MinuteLong.mp3'),
    short3Sec_cleaned: path.resolve(__dirname, 'audio/short3Sec_cleaned.mp3'),
    short30Sec_cleaned: path.resolve(__dirname, 'audio/short30Sec_cleaned.mp3'),
    corrupfile: path.resolve(__dirname, 'audio/corrupt_file.mp3'),
  },
  unsupportedFiles: {
    txt: path.resolve(__dirname, 'unsupported_files/profile.txt'),
    pdf: path.resolve(__dirname, 'unsupported_files/details.pdf'),
  },
  videoFiles: {
    video: path.resolve(__dirname, 'videos/short3Sec.mp4'),
    video30Sec: path.resolve(__dirname, 'videos/short30Sec.mp4'),
  },

  // Censor words
  censorWords: {
    default: 'fuck',
    approx: 'fuc',
    test: 'test',
  },

  // API responses
  apiResponses: {
    login: {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user',
        email: 'test@example.com',
      },
    },
  },

  // URLs
  urls: {
    base: 'https://frontend-dev-39a5.up.railway.app',
    cut: 'https://frontend-dev-39a5.up.railway.app/cut',
    localBase: 'http://localhost:3000',
    localCut: 'http://localhost:3000/cut',
  },

  // Processing variants
  processingVariants: {
    deepgram: {
      isSong: false,
      isPremium: false,
      name: 'Deepgram',
    },
    'elevenlabs-sync': {
      isSong: true,
      isPremium: false,
      name: 'ElevenLabs SYNC',
    },
    'elevenlabs-async': {
      isSong: false,
      isPremium: true,
      name: 'ElevenLabs ASYNC',
    },
  },
} as const;

export type TestDataType = typeof TestData;
