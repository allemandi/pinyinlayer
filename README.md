# PinyinLayer

Minimal Chinese reading assistance with pinyin, HSK filtering, tap-to-define lookup, and a saved vocab drawer.

PinyinLayer is an elegant, responsive web application designed to help learners of Chinese read and comprehend texts with minimal friction.

## Key Features

- **Pinyin Assistance**: Toggle pinyin on/off at the click of a button.
- **HSK-Filtered Annotations**: Hide pinyin for common words up to a customized HSK level (1–6), allowing you to focus on learning and reading challenging characters.
- **Tap-to-Define Lookup**: Select any word/character to instantly fetch local definitions and pronunciations from the offline dictionary database.
- **Saved Vocabulary Drawer**: Highlight and stamp words to keep them saved locally in your vocabulary drawer for easy review.
- **Sentence Translation**: Get immediate translation support for full sentences on demand.

## Offline Processing & API Usage

PinyinLayer is designed with an **offline-first** architecture to ensure fast performance and maximum security:
- **Local Dictionary & HSK Checks**: All Chinese tokenization, segmentation, HSK filtering, and dictionary lookups are processed completely locally on your device.
- **External API Call**: When you click the *"Translate full sentence"* button in a definition popover, PinyinLayer makes an on-demand API query to the third-party **MyMemory Translation API** (`https://api.mymemory.translated.net`) to translate the text from Simplified Chinese to English. No API key is required.

## Data Privacy

Your privacy is a first-class citizen in PinyinLayer:
- **Zero Tracking**: There are no external tracking scripts, cookies, analytics platforms, or telemetry tools integrated.
- **Local Storage**: All entered Chinese texts, reading history, and saved vocabulary items are stored strictly in your browser's local sandbox (using HTML5 `LocalStorage`). No personal data or reading content is ever uploaded, shared, or sent to any server except for sentence-level translation requests that you explicitly trigger.

## Quick Start

### Installation

```bash
npm install
```

### Development Server

Start a local development server with hot-module replacement (HMR):

```bash
npm run dev
```

### Production Build

Compile and minify the application for production deployment:

```bash
npm run build
```

### Run Tests & Linters

Run the local suite of unit and syntax verification checks:

```bash
npm run lint
npm run test
```

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build
- `npm run lint` — syntax check JS/JSX files
- `npm run test` — run minimal local tests
- `npm run build:data` — regenerate static dictionary data from CC-CEDICT source files

## License & Copyright

Distributed under the MIT License.

&copy; 2026 allemandi. All rights reserved.
