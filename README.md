# PinyinLayer

Minimal Chinese reading assistance with pinyin, HSK filtering, tap-to-define lookup, and a saved vocab drawer.

## Key Features

- **Pinyin Assistance**: Toggle pinyin on/off.
- **HSK-Filtered Annotations**: Hide pinyin for common words up to a customized HSK level (1–6).
- **Tap-to-Define Lookup**: Select any word/character to instantly fetch definitions and pronunciations.
- **Saved Vocabulary Drawer**: Stamp words to keep them saved locally.
- **Sentence Translation**: Immediate translation support for full sentences on demand.

## Offline Lookups, Private Lists, & Optional Online Translation

- **Local Lookup**: Dictionary lookups and HSK word list checks run entirely offline inside your browser.
- **Private Lists**: Saved vocabulary lists are stored inside your browser's `LocalStorage`.
- **Online Translation**: The “Translate full sentence” option in the popover sends your sentence to the public MyMemory Translation API to fetch a translation on demand.

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
- `npm run test` — run minimal local tests
- `npm run build:data` — regenerate static dictionary data

## License

MIT
