import hskWords from '../data/hskWords.js';

export function shouldShowPinyin(pinyinVisible, hskFilter, token) {
  if (!pinyinVisible) return false;
  if (hskFilter === 'all') return true;

  const level = hskWords[token.text];
  if (level !== undefined) return level > hskFilter;

  const charLevels = token.chars.map((c) => hskWords[c]).filter((l) => l !== undefined);
  return charLevels.length ? Math.min(...charLevels) > hskFilter : true;
}
