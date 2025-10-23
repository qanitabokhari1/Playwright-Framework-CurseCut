# E2E Test Suite - Audio Processing Platform

This test suite implements the Page Object Model pattern for comprehensive end-to-end testing of an audio processing platform with AI-powered censoring capabilities. The platform supports multiple processing variants including Deepgram and ElevenLabs (sync/async) for audio censoring workflows.

## 📁 Project Structure

```
e2e-full/
├── fixtures/
│   ├── audio/                   # Audio test files (mp3)
│   │   ├── audio.mp3
│   │   ├── censored_audio.mp3
│   │   ├── short3Sec.mp3
│   │   └── 46MinuteLong.mp3
│   ├── videos/                  # Video test files (mp4)
│   │   ├── short3Sec.mp4
│   │   ├── short30Sec.mp4
│   │   └── short60Sec.mp4
│   └── testData.ts              # Test data constants and configurations
├── helpers/
│   ├── apiMocks.ts              # API mocking utilities (auth, credits, cost, processing)
│   └── testHelpers.ts           # High-level test helper methods
├── pages/
│   ├── BasePage.ts              # Base page object with common functionality
│   ├── AuthPage.ts              # Authentication page object
│   └── AudioProcessingPage.ts   # Audio processing page object
├── test-setup/
│   ├── global-setup.ts          # Global test setup
│   ├── global-teardown.ts       # Global test teardown
│   └── page-setup.ts            # Page-specific setup utilities
├── tests/
│   ├── critical_business_logic/ # Core business functionality tests (5 tests)
│   │   ├── approximate-match-censoring-works.spec.ts
│   │   ├── exact-match-censoring-works.spec.ts
│   │   ├── enforces-toggle-mutual-exclusivity.spec.ts
│   │   ├── elevenlabs-sync-timeout-error.spec.ts
│   │   └── route-46-video.spec.ts
│   └── session_management/      # Session and credit management tests (5 tests)
│       ├── credits-0-deepgram.spec.ts
│       ├── credits-0-elevenlabs-sync.spec.ts
│       ├── credits-0-elevenlabs-async.spec.ts
│       ├── file-switching-in-session.spec.ts
│       └── prevent-double-processing.spec.ts
├── type/
│   ├── index.ts                 # Re-exports all types
│   ├── testConfig.ts            # Test configuration types
│   ├── processing.ts            # Processing variant types
│   ├── user.ts                  # User credential types
│   ├── api.ts                   # API response types
│   └── pageObject.ts            # Page object types
├── playwright.config.ts         # Playwright configuration
├── eslint.config.js            # ESLint configuration
├── package.json                 # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🧩 Page Objects

### BasePage

- Common functionality shared across all pages
- API mocking methods (`mockSupabaseLogin`, `mockCreditsAPI`)
- Common locators (`creditsButton`, `loginButton`, `processButton`, `uploadInput`, `startNowButton`)
- Utility methods for element interactions and expectations
- Navigation and element waiting methods

### AuthPage

- Login form interactions (`emailInput`, `passwordInput`, `signInButton`)
- Authentication flow management (`login`, `loginWithRealCredentials`)
- User verification methods (`verifyLoggedIn`, `verifyCreditsBalance`)
- Modal/dialog handling for login forms
- Page state verification and error handling

### AudioProcessingPage

- File upload functionality (`uploadAudioFile`, `uploadFirstFile`, `uploadReplacementFile`)
- Audio processing configuration for all variants (Deepgram, ElevenLabs sync/async)
- Form interactions (`configureDeepgramWorkflow`, `configureElevenLabsSyncWorkflow`, `configureElevenLabsAsyncWorkflow`)
- Processing workflow management (`clickProcessButton`, `verifyProcessingStarted`)
- Enhanced workflow methods for new UI features
- File switching and reprocessing verification

## 🔧 Helper Classes

### TestHelpers

- High-level test scenarios and workflow orchestration
- Authentication setup methods (`setupZeroCreditsTest`, `setupSufficientCreditsTest`, `setupRealUserTest`)
- Complete workflow orchestration (`completeAudioProcessingWorkflow`)
- Test-specific helper methods (`testInsufficientCredits`, `testDoubleProcessingPrevention`, `testFileSwitching`)
- Centralized test setup and teardown utilities

### ApiMocks

- Comprehensive API endpoint mocking (`mockSupabaseLogin`, `mockCreditsAPI`, `mockCostAPI`, `mockSubscriptionAPI`)
- Authentication flow mocking (`mockAuthenticationFlow`)
- Processing API mocking for all variants (`mockProcessingAPI`, `mockCensoringSuccess`)
- Error response simulation (`mockErrorResponse`)
- Dynamic cost API mocking and upload chunk handling (`mockUploadChunkAPI`)

## 📊 Test Data

### TestData

Centralized test data including:

- **User credentials**: Test user (`test@example.com`) and real user (`dummy2@gmail.com`) credentials
- **Credit scenarios**: Zero credits (0) and sufficient credits (100) for testing different states
- **File paths**: Audio files (`short3Sec.mp3`, `censored_audio.mp3`, `46MinuteLong.mp3`) with absolute paths
- **API responses**: Login response structure with mock tokens and user data
- **URLs**: Base URL configuration with environment variable support
- **Processing variants**: Configuration for Deepgram, ElevenLabs sync, and ElevenLabs async workflows
- **Censor words**: Default (`fuck`), approximate (`fuc`), and test words for different scenarios

## 🚀 Test Cases

The test suite includes comprehensive testing across two main categories with **10 total tests**:

### Critical Business Logic Tests (5 tests)

1. **Approximate Match Censoring Works** - Tests AI-powered approximate word matching for censoring across all three processing variants (Deepgram, ElevenLabs sync, ElevenLabs async)
2. **Exact Match Censoring Works** - Tests exact word matching for censoring across all three processing variants
3. **Enforces Toggle Mutual Exclusivity** - Tests UI toggle behavior and state management
4. **ElevenLabs Sync Timeout Error** - Tests error handling for timeout scenarios
5. **Route 46 Video** - Tests video processing functionality

### Session Management Tests (5 tests)

1. **Process button disabled when user has insufficient credits - Deepgram** - Tests credit validation for Deepgram variant
2. **Process button disabled when user has insufficient credits - ElevenLabs SYNC** - Tests credit validation for ElevenLabs sync variant
3. **Process button disabled when user has insufficient credits - ElevenLabs ASYNC** - Tests credit validation for ElevenLabs async variant
4. **File switching in same session** - Tests uploading new file and verifying previous state is cleared
5. **Prevent double processing** - Tests that process button is disabled after processing begins across all variants

## 🏃‍♂️ Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npx playwright test tests/session_management/
npx playwright test tests/critical_business_logic/

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run tests with debug mode
npm run test:debug

# Generate test report
npm run test:report

# Install Playwright browsers
npm run test:install

# Code generation
npm run test:codegen

# Update snapshots
npm run test:update-snapshots

# Lint and format and type
npm run lint
npm run lint:fix
npm run format
npm run format:check
npx tsc --noEmit
```

## 📝 Key Features

- **Audio/video Processing Focus**: Specialized testing for AI-powered audio/video censoring platform
- **Multi-Provider Support**: Tests Deepgram and ElevenLabs (sync/async) processing variants
- **Credit Management**: Comprehensive testing of credit-based processing restrictions
- **File Handling**: Support for both audio (MP3) and video (MP4) file processing
- **Cost API Integration**: Dynamic cost mocking for processing fee calculations
- **Maintainable**: Page objects encapsulate page-specific logic with comprehensive locators
- **Reusable**: Common functionality is centralized in base classes and helper methods
- **Type-safe**: Full TypeScript support with proper type definitions and path aliases
- **Scalable**: Easy to add new pages and test scenarios with modular architecture
- **Parallel execution**: Tests can run in parallel for faster execution
- **API mocking**: Comprehensive mocking for reliable test execution including Supabase auth
- **Error Handling**: Tests timeout scenarios and error recovery
- **Session Management**: Tests file switching and double-processing prevention
- **Environment Configuration**: Support for different environments via environment variables
- **Enhanced UI Testing**: Support for both legacy and enhanced UI workflows
- **Comprehensive Reporting**: HTML, JSON, and JUnit test reports

## 🔄 Adding New Tests

1. Create new page objects in `pages/` directory extending `BasePage`
2. Add test data to `fixtures/testData.ts` following the existing structure
3. Create helper methods in `helpers/testHelpers.ts` for reusable workflows
4. Add API mocking methods in `helpers/apiMocks.ts` for new endpoints
5. Write test cases in `tests/` directory following the existing naming convention
6. Add type definitions in `type/` directory if necessary
7. Update this README with new test descriptions

## 🎯 Best Practices

- Use descriptive test names that clearly indicate what is being tested
- Keep page objects focused on single responsibility with clear method names
- Leverage helper methods for common workflows to reduce code duplication
- Mock external dependencies appropriately using the `ApiMocks` class
- Use proper TypeScript types for better maintainability and IDE support
- Follow the existing folder structure for consistency
- Use data-testid attributes for reliable element selection
- Implement proper error handling and timeout management
- Write tests that are independent and can run in parallel
- Use environment variables for configuration flexibility

## 🛠️ Technical Stack

### Dependencies

- **@playwright/test**: ^1.56.1 - Main testing framework
- **playwright**: ^1.56.1 - Browser automation
- **typescript**: ^5.0.0 - Type safety and modern JavaScript features
- **dotenv**: ^17.2.3 - Environment variable management

### Development Dependencies

- **@eslint/js**: ^9.38.0 - ESLint JavaScript configuration
- **@typescript-eslint/eslint-plugin**: ^8.46.1 - TypeScript ESLint rules
- **@typescript-eslint/parser**: ^8.46.1 - TypeScript parser for ESLint
- **eslint**: ^9.38.0 - Code linting
- **eslint-config-prettier**: ^10.1.8 - Prettier integration for ESLint
- **eslint-plugin-prettier**: ^5.5.4 - Prettier as ESLint rule
- **prettier**: ^3.6.2 - Code formatting
- **@types/node**: ^20.0.0 - Node.js type definitions

### Configuration

- **Playwright Config**: Supports Chromium browser, parallel execution, HTML/JSON/JUnit reporting
- **TypeScript Config**: ES2020 target, strict mode, path aliases for clean imports
- **ESLint Config**: TypeScript-aware linting with Prettier integration
- **Environment Support**: Configurable base URL and CI/CD optimizations

### Browser Support

- **Primary**: Chromium (Desktop Chrome)
- **Optional**: Firefox and WebKit (commented out for faster execution)
- **Mobile**: Mobile Chrome and Safari (commented out, available for activation)
