# PinyinLayer

Minimalist Chinese reading assistance with layered pinyin annotations, HSK filtering, tap-to-define dictionary lookups, audio speech synthesis, and customizable vocabulary decks.

## Key Features

- **Pinyin Assistance**: Toggle pinyin annotations on and off.
- **HSK-Filtered Annotations**: Hide pinyin for common words up to a customized HSK level (1–6).
- **Tap-to-Define Offline Lookup**: Select any Chinese word or character to instantly view CC-CEDICT dictionary definitions and pronunciations.
- **Audio Speech Synthesis**: Native browser text-to-speech audio pronunciation (`window.speechSynthesis`) for source text, reader paragraphs, individual vocabulary words, and flashcards.
- **Saved Vocabulary Decks**: Organize, copy, move, and share vocabulary decks stored locally.
- **Sentence Translation (On Demand)**: Optional sentence-level translation support via public API.

## 100% Offline Core Functionality & Privacy

- **100% Offline Core**: Chinese text segmentation, Pinyin annotations, CC-CEDICT dictionary lookups, HSK difficulty filtering, PDF/DOCX document extraction, Web Speech audio synthesis, and vocabulary flashcard sessions run **100% offline** inside your browser without external server dependencies.
- **Private Storage**: Saved vocabulary lists and user preferences are stored completely locally inside your browser's `LocalStorage`.
- **Online Translation (On Demand)**: Clicking the explicit **"Translate full sentence (online)"** button inside a definition popover sends the selected sentence to the MyMemory Translation API on demand when online.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build
- `npm run lint` — syntax check JS/JSX files
- `npm run test` — run local unit tests
- `npm run build:data` — regenerate static dictionary data

## License

MIT
