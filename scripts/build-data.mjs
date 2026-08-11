// One-time / re-runnable data-build script (not shipped to the browser).
// Merges CC-CEDICT (definitions) with the Complete HSK Vocabulary dataset
// (HSK levels) into two lean static JSON files consumed by the app:
//   src/data/dict.json      -> { "word": [{ t?, p, d:[...] }] }
//   src/data/hskWords.json  -> { "word": 1..6 }
//
// The dictionary is trimmed to HSK vocabulary only — enough for quick
// "how is this pronounced, what does it mean" scanning without shipping
// the full 120k-entry CC-CEDICT payload.
//
// Run with: npm run build:data
import { writeFileSync } from 'node:fs';
import cedict from '../node_modules/cedict-json/cedict.json' with { type: 'json' };

const HSK_URL =
  'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.min.json';

console.log('Fetching HSK level data...');
const hsk = await fetch(HSK_URL).then((res) => res.json());

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

// Keep HSK headwords plus any single character that appears in the HSK lists.
const keepWords = new Set(Object.keys(levelOf));
for (const word of Object.keys(levelOf)) {
  for (const char of word) keepWords.add(char);
}

const dict = {};
for (const e of cedict) {
  const word = e.simplified;
  if (!word || !keepWords.has(word)) continue;

  const english = Array.isArray(e.english) ? e.english[0] : e.english.split(/;\s*/)[0];
  const sense = { p: e.pinyin, d: [english] };
  if (e.traditional && e.traditional !== word) sense.t = e.traditional;
  (dict[word] ||= []).push(sense);
}

for (const word of Object.keys(dict)) {
  dict[word] = dict[word].slice(0, 1);
}

writeFileSync('src/data/dict.json', JSON.stringify(dict));
writeFileSync('src/data/hskWords.json', JSON.stringify(levelOf));

console.log('dict entries:', Object.keys(dict).length);
console.log('hsk-leveled words:', Object.keys(levelOf).length);
