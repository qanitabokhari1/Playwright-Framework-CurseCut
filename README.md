# Playwright E2E Framework – CurseCut Audio/Video Censoring

TypeScript Playwright end-to-end framework using the Page Object Model to test an audio/video censoring web app across Deepgram and ElevenLabs (sync/async) flows. The suite supports deterministic API mocking by default and can switch to live backend testing with a single flag.

## Project structure

```
.
├── fixtures/
│   ├── audio/                         # MP3 test assets (short3Sec.mp3, censored_audio.mp3, 46MinuteLong.mp3, ...)
│   ├── videos/                        # MP4 test assets (short3Sec.mp4, short30Sec.mp4, short60Sec.mp4, ...)
│   └── testData.ts                    # Centralized test constants (files, users, URLs, words)
├── helpers/
│   ├── apiMocks.ts                    # Route-level API mocks (credits, upload-chunk, status, processed files, variants)
│   ├── liveAsyncPolling.ts            # Live async helper: wait for /upload-chunk final part, then poll /status until succeeded
│   └── testHelpers.ts                 # High-level helpers (auth, mocking setup, flows)
├── pages/
│   ├── BasePage.ts                    # Common locators/actions + lightweight auth/credits mocks
│   ├── AuthPage.ts                    # Login flow (form interactions + real creds)
│   └── AudioProcessingPage.ts         # Processing UI, premium files helpers
├── test-setup/
│   ├── global-setup.ts                # Loads env
│   ├── global-teardown.ts             # Cleanup hook
│   └── page-setup.ts                  # Scenario-specific setup helpers
├── tests/
│   ├── critical_business_logic/       # Core behaviors (toggles, charging, timeouts, video)
│   │   ├── approximate-match-censoring-works.spec.ts
│   │   ├── exact-match-censoring-works.spec.ts
│   │   ├── enforces-toggle-mutual-exclusivity.spec.ts
│   │   ├── elevenlabs-sync-timeout-error.spec.ts
│   │   ├── route-46-video.spec.ts
│   │   └── prevent-double-charging-elevenlabs-sync.spec.ts
│   ├── session_management/            # Credits, prevention, switching
│   │   ├── credits-0-deepgram.spec.ts
│   │   ├── credits-0-elevenlabs-async.spec.ts
│   │   ├── credits-0-elevenlabs-sync.spec.ts
│   │   ├── file-switching-in-session.spec.ts
│   │   └── prevent-double-processing.spec.ts
│   ├── sequential_operations/         # Multi-step flows (reprocess, variant switch; LIVE_MODE-aware)
│   │   ├── deepgram-process-deepgram-again-charged.spec.ts
│   │   ├── deepgram-reprocess-button-enable.spec.ts
│   │   ├── elevenlab-async-verify-reprocess-button-disable.spec.ts
│   │   ├── elevenlab-sync-reprocess-button-enable.spec.ts
│   │   ├── elevenlabs-sync-process-elevenlabs-sync-again.spec.ts
│   │   ├── variant-switch-deepgram-elevenlabs-async.spec.ts
│   │   ├── variant-switch-deepgram-elevenlabs-sync.spec.ts
│   │   ├── variant-switch-elevenlabs-sync-deepgram.spec.ts
│   │   └── variant-switch-elevenlabs-sync-to-elevenlabs-async.spec.ts
│   └── single_processing_flows/       # Variant-specific flows and UI verifications
│       ├── censored-words-tab-multiple-words-verification.spec.ts
│       ├── deepgram-3Sec-credits-censoring.spec.ts
│       ├── deepgram-auto-download-file.spec.ts
│       ├── elevenlab-async-auto-download-file.spec.ts
│       ├── elevenlab-sync-auto-download-file.spec.ts
│       ├── elevenlabs-async-46min-credits-censoring.spec.ts
│       ├── elevenlabs-sync-30Sec-credits-censoring.spec.ts
│       ├── no-words-found-deepgram.spec.ts
│       ├── no-words-found-elevenLabs-sync.spec.ts
│       ├── no-words-found-elevenlabs-async.spec.ts
│       ├── premium-files-apperance-and-download.spec.ts
│       ├── processing-tags-browser-vs-premium.spec.ts
│       └── view-all-words-tab-verification.spec.ts
├── type/                              # TS types used across the suite
│   ├── api.ts
│   ├── index.ts
│   ├── pageObject.ts
│   ├── processing.ts
│   ├── testConfig.ts
│   └── user.ts
├── playwright-report/                 # HTML report output
├── test-results/                      # JSON/JUnit outputs
├── playwright.config.ts               # Base URL, reporters, timeouts, projects
├── eslint.config.js                   # ESLint + Prettier config
├── tsconfig.json                      # TS strict config + path aliases
└── package.json                       # Scripts and dependencies
```

## Environment configuration

Create a `.env` file at the repository root:

```
# Backend base URL for the app under test
BASE_URL=https://frontend-dev-39a5.up.railway.app

# Real user credentials (used by real login flow)
TEST_USER_EMAIL=your-email@example.com
TEST_USER_PASSWORD=your-password

# Mocking vs live backend
# false => use Playwright route mocks (default)
# true  => hit the real backend services
LIVE_MODE=false
```

Notes

- `playwright.config.ts` loads `.env` from the repo root. `BASE_URL` defaults to `http://localhost:3000` if not set.
- `fixtures/testData.ts` includes hardcoded URLs/files; navigation uses `AuthPage.navigateTo(TestData.urls.base)`.

## Installation and scripts

```
npm ci                         # install deps
npm run test:install           # install Playwright browsers

# Run all tests (mocked APIs – default)
npm test

# Run against live backend
npm run test:live

# Headed / UI / Debug
npm run test:headed
npm run test:ui
npm run test:debug

# Reports
npm run test:report            # opens HTML report

# Quality
npm run lint
npm run lint:fix
npm run format
npm run format:check
npx tsc --noEmit
```

## Mocking vs live mode

- `LIVE_MODE=false` (default): deterministic tests via route mocks
  - `TestHelpers.setupMockingForTest(variant)` wires core mocks per variant
    - `ApiMocks.mockCensoringSuccess(variant)` – mocks `/audio` job start and `/status` success with a transcript
    - For async variant, also calls `ApiMocks.mockUploadChunkAPI()` to satisfy `/upload-chunk`
  - Credits are mocked via `ApiMocks.mockAuthenticationFlow(credits)` during auth setup
  - Premium listing can be mocked via `ApiMocks.mockProcessedFilesAPI()` so “My Premium Files” shows entries

- `LIVE_MODE=true`: real backend
  - No route intercepts for processing; timeouts may be higher in some specs
  - Real login is performed using `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`
  - For ElevenLabs async live runs, `helpers/liveAsyncPolling.ts` provides `handleUploadAndPollStatus(page)` to wait on the app’s own polling

Additional targeted mocks available in `helpers/apiMocks.ts`

- `mockProcessedFilesAPI()` – return a list for “My Premium Files” (drives appearance + download event)
- `mockNoFuckWord(variant)` – status without the explicit word (for “no words found” checks)
- `mock30SecFile()` – longer transcript fixture for sync
- `mock46MinutesAudioFile()` – very long transcript fixture (video/long-audio route)

Commented-out (not used by default)

- `mockSupabaseLogin`, `mockProcessingAPI`, `mockErrorResponse`, `mockCostAPI`, `mockSubscriptionAPI` are present but disabled since the suite hits the real auth/processing by default and only mocks what’s needed for determinism.

## Key page objects and helpers

- `BasePage`
  - Common locators: `creditsButton`, `loginButton`, `processButton`, `uploadInput`, `startNowButton`
  - Utilities: navigation and expectation helpers
  - Lightweight mocks: `mockSupabaseLogin()`, `mockCreditsAPI()` (used rarely; prefer `ApiMocks`)

- `AuthPage`
  - `login()` and `loginWithRealCredentials()` use the real auth form
  - `verifyCreditsBalance()` for post-login UI state

- `AudioProcessingPage`
  - Form interactions: song/premium toggles, censor words, replacements
  - Processing: `clickStartNow()`, `clickProcessButton()`, `verifyProcessingStarted()`
  - Premium files: `openMyPremiumFiles()`, `expectPremiumFileVisibleByName()`, `clickPremiumDownloadAt()`

- `TestHelpers`
  - Auth setup: `setupZeroCreditsTest()`, `setupSufficientCreditsTest()`, `setupRealUserTest()`
  - Mocking: `setupMockingForTest('deepgram'|'elevenlabs-sync'|'elevenlabs-async')`
  - Composes page objects for concise tests

- `liveAsyncPolling`
  - `handleUploadAndPollStatus(page)` – waits for final `/upload-chunk` and subsequent `/status/{taskId}` success when running live async flows

## Example: Premium files – appearance and download (mocked)

Scenario (when `LIVE_MODE=false`)

1. Call `helpers.setupMockingForTest('elevenlabs-async')` so `/upload-chunk` and `/status` are mocked
2. Call `helpers.apiMocks.mockProcessedFilesAPI()` so the “My Premium Files” list is populated
3. Click “My Premium Files”, verify `short3Sec.mp3` appears, click “Download” and assert a browser download event fires

This flow is implemented in `tests/single_processing_flows/premium-files-apperance-and-download.spec.ts` and will also work against the live backend by running `npm run test:live` (in live mode it will rely on real data instead of the mocked list).

## Tests overview

Folders

- `critical_business_logic/` – approximate/exact matching, toggle exclusivity, timeout handling, charging, video route
- `session_management/` – credits=0 states, file switching, double processing prevention
- `single_processing_flows/` – per-variant flows, word tabs, premium list/download, tags
- `sequential_operations/` – multi-step flows (reprocess + variant switch) with LIVE_MODE-aware credit checks and download/response-based waits

 

Reports

- HTML: `playwright-report/index.html`
- JSON: `test-results/results.json`
- JUnit: `test-results/results.xml`

## Adding tests

1. Create or extend a page object under `pages/`
2. Add/adjust constants in `fixtures/testData.ts`
3. Reuse `TestHelpers` for auth and mocking (`setupMockingForTest(...)`)
4. For mocked runs add explicit mocks as needed (e.g., `mockProcessedFilesAPI()`)
5. Place the spec under the appropriate folder in `tests/`
6. Keep tests independent and parallel-safe; avoid test order coupling

## Troubleshooting

- Login fails in CI/headless: ensure `BASE_URL`, `TEST_USER_EMAIL`, and `TEST_USER_PASSWORD` are set and the site is reachable from the runner.
- Timeouts in live mode: increase test timeouts or rely on mocks by switching `LIVE_MODE=false`.
- Selectors flaky after UI changes: update `pages/*` locators rather than inlining in tests.
- Prettier/ESLint issues: run `npm run lint:fix` and `npm run format`.

## Tech stack

- Playwright `@playwright/test` with Chromium project
- TypeScript with strict config and path aliases
- ESLint + Prettier
- Dotenv for configuration
