// One-time / re-runnable data-build script (not shipped to the browser).
// Merges CC-CEDICT (definitions) with the Complete HSK Vocabulary dataset
// (HSK levels) into two lean static JSON files consumed by the app:
//   src/data/dict.json      -> { "word": [{ t?, p, d:[...] }, ...] }
//   src/data/hskWords.json  -> { "word": 1..6 }
//
// Run with: npm run build:data
//
// Sources (redistribution permitted with attribution — see src/data/README.md):
//   https://github.com/matt-tingen/cedict-json          (CC-CEDICT as JSON, npm dep)
//   https://github.com/drkameleon/complete-hsk-vocabulary (fetched at build time)
import { writeFileSync } from 'node:fs';
import cedict from '../node_modules/cedict-json/cedict.json' with { type: 'json' };

const HSK_URL =
  'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.min.json';

console.log('Fetching HSK level data...');
const hsk = await fetch(HSK_URL).then((res) => res.json());

// --- HSK level lookup: pick the lowest (earliest-learned) 1-6 level found ---
const levelOf = {};
for (const entry of hsk) {
  const nums = (entry.l || [])
    .map((code) => parseInt(code.slice(1), 10))
    .filter((n) => n >= 1 && n <= 6);
  if (!nums.length) continue;
  const best = Math.min(...nums);
  const word = entry.s;
  if (levelOf[word] === undefined || best < levelOf[word]) levelOf[word] = best;
}

// --- Dictionary: group CC-CEDICT senses by simplified headword ---
const dict = {};
for (const e of cedict) {
  const word = e.simplified;
  if (!word) continue;
  const sense = { p: e.pinyin, d: e.english };
  if (e.traditional && e.traditional !== word) sense.t = e.traditional;
  (dict[word] ||= []).push(sense);
}

// Cap senses per word to keep the payload lean.
for (const word of Object.keys(dict)) {
  if (dict[word].length > 3) dict[word] = dict[word].slice(0, 3);
}

writeFileSync('src/data/dict.json', JSON.stringify(dict));
writeFileSync('src/data/hskWords.json', JSON.stringify(levelOf));

console.log('dict entries:', Object.keys(dict).length);
console.log('hsk-leveled words:', Object.keys(levelOf).length);
