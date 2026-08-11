# PinyinLayer

Minimal Chinese reading assistance with pinyin, HSK filtering, tap-to-define lookup, and a saved vocab drawer.

## Quick start

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

## Notes

- Uses `src/data/dict.json` and `src/data/hskWords.js` for offline lookup.
- `src/utils` contains runtime helpers.
- Translation is handled by `src/utils/translateSentence.js`.

## License

MIT
