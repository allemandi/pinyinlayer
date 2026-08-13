import hskWords from '../data/hskWords.js';

export function shouldShowPinyin(pinyinVisible, hskFilter, token) {
  if (!pinyinVisible) return false;
  if (hskFilter === 'all') return true;

  const textToCheck = token.simpText || token.text;
  const level = hskWords[textToCheck];
  if (level !== undefined) return level > hskFilter;

  const charsToCheck = token.simpChars || token.chars;
  const charLevels = charsToCheck.map((c) => hskWords[c]).filter((l) => l !== undefined);
  return charLevels.length ? Math.min(...charLevels) > hskFilter : true;
}
