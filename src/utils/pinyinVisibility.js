import { getHskLevel } from './hsk.js';

export function shouldShowPinyin(pinyinVisible, hskFilter, token) {
  if (!pinyinVisible) return false;
  if (hskFilter === 'all') return true;

  const textToCheck = token.simpText || token.text;
  const level = getHskLevel(textToCheck);

  if (level !== undefined) {
    return level > hskFilter;
  }

  return true;
}
