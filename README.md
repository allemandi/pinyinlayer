# PinyinLayer

A minimalist reading tool for Chinese text. Paste text (or upload a PDF/DOCX),
and read it in a dual-pane layout with toggleable pinyin, HSK-level
filtering, tap-to-define popovers, and a personal vocab list. No backend, no
account, no login — everything runs client-side and saves to your browser.

**Just reading assistance, layered.**

## Features

- **Paste or upload** — drop in Chinese text directly, or upload a `.pdf` /
  `.docx` and it's extracted and cleaned automatically (paragraph breaks
  preserved, non-Chinese noise like page numbers stripped).
- **Toggleable pinyin** — shown above each character, on or off with one tap.
- **HSK-level filtering** — tell it which HSK levels you already know (1–6,
  or none) and pinyin only appears above words *harder* than that, so you're
  not spoon-fed romanization for words you've already learned.
- **Tap to define** — tap any character or phrase to see its CC-CEDICT
  definition and, on demand, an English translation of the full sentence.
- **Personal vocab list** — stamp (save) any word from a definition popover;
  review or remove them later from the vocab drawer. Persisted to
  `localStorage`.
- **Resizable dual-pane layout** — expand either pane to fill most of the
  screen (the other collapses to a thin strip, not gone — one tap restores
  it). Panes stack top/bottom on mobile.

## Tech stack

- **Vite** + **React 18**
- **Tailwind CSS v4** (via `@tailwindcss/vite`, CSS-based theme — see
  `src/index.css`)
- **pinyin-pro** for character-level pinyin
- **segmentit** for Chinese word/phrase segmentation (so taps target whole
  words, not single characters)
- **pdfjs-dist** / **mammoth** for PDF / DOCX text extraction
- A bundled, static **CC-CEDICT + HSK vocabulary** dataset (see
  `src/data/README.md`) — definitions and HSK levels work fully offline,
  no API key required
- **MyMemory** free translation API for on-demand sentence translation (no
  key required; swap `src/lib/translateSentence.js` for a different provider
  any time — every caller goes through that one function)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. That's it — no environment variables, no API
keys, no backend to stand up.

### Build for production

```bash
npm run build   # outputs to dist/
npm run preview # sanity-check the production build locally
```

### Regenerating the dictionary / HSK data

`src/data/dict.json` and `src/data/hskWords.json` are pre-built and checked
into the repo, so you never *need* to run this — but if you want to refresh
them:

```bash
npm run build:data
```

## Deploying to Netlify

This repo includes a `netlify.toml` already configured with:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback redirect (`/* → /index.html`)

To deploy: push this repo to GitHub, then in Netlify choose **Add new site →
Import an existing project**, pick the repo, and Netlify will pick up
`netlify.toml` automatically — no manual configuration needed.

## Project structure

```
src/
├── components/
│   ├── AppLayout.jsx          // Resizable dual-pane + mobile stack
│   ├── InputPanel.jsx         // Textarea + file upload
│   ├── Controls.jsx           // Pinyin toggle + HSK filter + vocab button
│   ├── ReaderView.jsx         // Cleaned text with pinyin overlay
│   ├── DefinitionPopover.jsx  // Tap char/phrase → definition + translation
│   └── VocabDrawer.jsx        // Slide-out saved words list
│
├── lib/
│   ├── cleanText.js           // Strip non-Chinese, keep paragraph breaks
│   ├── getPinyin.js           // Wraps pinyin-pro + segmentit
│   ├── lookupWord.js          // CC-CEDICT lookup
│   └── translateSentence.js   // Sentence translation API call
│
├── hooks/
│   ├── useLocalStorage.js     // Generic localStorage get/set
│   └── useVocab.js            // Add/remove/check saved words
│
└── data/
    ├── dict.json              // CC-CEDICT definitions, keyed by word
    └── hskWords.json          // word → HSK level (1–6)
```

## Design notes

The palette and type system lean into the reading-on-paper feel (warm
rice-paper background, a serif for the Chinese text, monospace for pinyin
captions) with one deliberate flourish: saving a word to your vocab list is
framed as *stamping* it, a nod to the red seal chops (印章) used to mark
manuscripts — see the `Stamp` icon and `seal` color token throughout.

## License

Code is MIT licensed (see `LICENSE`). Bundled dictionary data carries its
own upstream licenses — see `src/data/README.md`.
